const database = require('../config/database');

// Helper function to generate request ID
const generateRequestId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `REQ-${year}${month}${day}-${random}`;
};

const getAllRequests = async (req, res) => {
  try {
    const { status, employee_id, manager_id } = req.query;
    
    let query = `
      SELECT r.*, 
             e.employee_name, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name,
             (SELECT COUNT(*) FROM request_items WHERE request_id = r.request_id) as items_count
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (employee_id) {
      query += ' AND r.employee_id = ?';
      params.push(employee_id);
    }

    if (manager_id) {
      query += ' AND r.manager_id = ?';
      params.push(manager_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const requests = await database.all(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [id]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get request items
    const items = await database.all(`
      SELECT ri.*, s.system_name, r.role_name, r.security_level
      FROM request_items ri
      JOIN systems s ON ri.system_id = s.system_id
      JOIN roles r ON ri.role_id = r.role_id
      WHERE ri.request_id = ?
      ORDER BY ri.sequence_number
    `, [id]);

    res.json({ ...request, items });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRequest = async (req, res) => {
  try {
    const { request_description, employee_id, items } = req.body;
    const manager_id = req.user.employee_id;

    // Verify employee exists
    const employee = await database.get('SELECT * FROM employees WHERE employee_id = ?', [employee_id]);
    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Verify manager exists
    const manager = await database.get('SELECT * FROM employees WHERE employee_id = ?', [manager_id]);
    if (!manager) {
      return res.status(400).json({ error: 'Manager not found' });
    }

    // Generate unique request ID
    let request_id = generateRequestId();
    let existing = await database.get('SELECT request_id FROM requests WHERE request_id = ?', [request_id]);
    while (existing) {
      request_id = generateRequestId();
      existing = await database.get('SELECT request_id FROM requests WHERE request_id = ?', [request_id]);
    }

    // Verify all systems and roles exist
    for (const item of items) {
      const system = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [item.system_id]);
      if (!system) {
        return res.status(400).json({ error: `System ${item.system_id} not found` });
      }

      const role = await database.get('SELECT role_id FROM roles WHERE role_id = ? AND system_id = ?', [item.role_id, item.system_id]);
      if (!role) {
        return res.status(400).json({ error: `Role ${item.role_id} not found for system ${item.system_id}` });
      }
    }

    // Create request
    await database.run(
      'INSERT INTO requests (request_id, request_description, employee_id, manager_id, status) VALUES (?, ?, ?, ?, ?)',
      [request_id, request_description, employee_id, manager_id, 'Draft']
    );

    // Create request items
    for (let i = 0; i < items.length; i++) {
      await database.run(
        'INSERT INTO request_items (request_id, system_id, role_id, business_justification, sequence_number) VALUES (?, ?, ?, ?, ?)',
        [request_id, items[i].system_id, items[i].role_id, items[i].business_justification, i + 1]
      );
    }

    // Fetch and return the created request with items
    const newRequest = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [request_id]);

    const requestItems = await database.all(`
      SELECT ri.*, s.system_name, r.role_name, r.security_level
      FROM request_items ri
      JOIN systems s ON ri.system_id = s.system_id
      JOIN roles r ON ri.role_id = r.role_id
      WHERE ri.request_id = ?
      ORDER BY ri.sequence_number
    `, [request_id]);

    res.status(201).json({ ...newRequest, items: requestItems });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { request_description, employee_id, items } = req.body;

    // Check if request exists
    const existing = await database.get('SELECT * FROM requests WHERE request_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow updates if status is Draft
    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft requests can be updated' });
    }

    // Verify employee exists
    const employee = await database.get('SELECT * FROM employees WHERE employee_id = ?', [employee_id]);
    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Verify all systems and roles exist
    for (const item of items) {
      const system = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [item.system_id]);
      if (!system) {
        return res.status(400).json({ error: `System ${item.system_id} not found` });
      }

      const role = await database.get('SELECT role_id FROM roles WHERE role_id = ? AND system_id = ?', [item.role_id, item.system_id]);
      if (!role) {
        return res.status(400).json({ error: `Role ${item.role_id} not found for system ${item.system_id}` });
      }
    }

    // Update request
    await database.run(
      'UPDATE requests SET request_description = ?, employee_id = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?',
      [request_description, employee_id, id]
    );

    // Delete existing items and create new ones
    await database.run('DELETE FROM request_items WHERE request_id = ?', [id]);

    for (let i = 0; i < items.length; i++) {
      await database.run(
        'INSERT INTO request_items (request_id, system_id, role_id, business_justification, sequence_number) VALUES (?, ?, ?, ?, ?)',
        [id, items[i].system_id, items[i].role_id, items[i].business_justification, i + 1]
      );
    }

    // Fetch and return the updated request with items
    const updatedRequest = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [id]);

    const requestItems = await database.all(`
      SELECT ri.*, s.system_name, r.role_name, r.security_level
      FROM request_items ri
      JOIN systems s ON ri.system_id = s.system_id
      JOIN roles r ON ri.role_id = r.role_id
      WHERE ri.request_id = ?
      ORDER BY ri.sequence_number
    `, [id]);

    res.json({ ...updatedRequest, items: requestItems });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const existing = await database.get('SELECT * FROM requests WHERE request_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow deletion if status is Draft
    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft requests can be deleted' });
    }

    // Delete request (items will be cascade deleted)
    await database.run('DELETE FROM requests WHERE request_id = ?', [id]);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const existing = await database.get('SELECT * FROM requests WHERE request_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow submission if status is Draft
    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft requests can be submitted' });
    }

    // Update status to Submitted
    await database.run(
      'UPDATE requests SET status = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?',
      ['Submitted', id]
    );

    const updatedRequest = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [id]);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.employee_id;

    // Check if request exists
    const existing = await database.get('SELECT * FROM requests WHERE request_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow approval if status is Submitted
    if (existing.status !== 'Submitted') {
      return res.status(400).json({ error: 'Only submitted requests can be approved' });
    }

    // Update status to Approved
    await database.run(
      'UPDATE requests SET status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?',
      ['Approved', approved_by, id]
    );

    const updatedRequest = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [id]);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.employee_id;

    // Check if request exists
    const existing = await database.get('SELECT * FROM requests WHERE request_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow rejection if status is Submitted
    if (existing.status !== 'Submitted') {
      return res.status(400).json({ error: 'Only submitted requests can be rejected' });
    }

    // Update status to Rejected
    await database.run(
      'UPDATE requests SET status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?',
      ['Rejected', approved_by, id]
    );

    const updatedRequest = await database.get(`
      SELECT r.*, 
             e.employee_name, e.employee_email, e.department as employee_department, e.branch as employee_branch,
             m.employee_name as manager_name, m.employee_email as manager_email
      FROM requests r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN employees m ON r.manager_id = m.employee_id
      WHERE r.request_id = ?
    `, [id]);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  submitRequest,
  approveRequest,
  rejectRequest
};

// Made with Bob
