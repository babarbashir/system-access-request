const database = require('../config/database');

const getAllSystems = async (req, res) => {
  try {
    const systems = await database.all(`
      SELECT s.*, e.employee_name as owner_name 
      FROM systems s 
      JOIN employees e ON s.owner_id = e.employee_id
      ORDER BY s.system_name
    `);
    res.json(systems);
  } catch (error) {
    console.error('Get all systems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSystemById = async (req, res) => {
  try {
    const { id } = req.params;
    const system = await database.get(`
      SELECT s.*, e.employee_name as owner_name 
      FROM systems s 
      JOIN employees e ON s.owner_id = e.employee_id
      WHERE s.system_id = ?
    `, [id]);

    if (!system) {
      return res.status(404).json({ error: 'System not found' });
    }

    res.json(system);
  } catch (error) {
    console.error('Get system by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSystem = async (req, res) => {
  try {
    const { system_id, system_name, description, business_function, owner_id } = req.body;

    // Check if system_id already exists
    const existing = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [system_id]);
    if (existing) {
      return res.status(400).json({ error: 'System ID already exists' });
    }

    // Check if system_name already exists
    const existingName = await database.get('SELECT system_id FROM systems WHERE system_name = ?', [system_name]);
    if (existingName) {
      return res.status(400).json({ error: 'System name already exists' });
    }

    // Verify owner exists
    const owner = await database.get('SELECT employee_id FROM employees WHERE employee_id = ?', [owner_id]);
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    await database.run(
      'INSERT INTO systems (system_id, system_name, description, business_function, owner_id) VALUES (?, ?, ?, ?, ?)',
      [system_id, system_name, description || null, business_function, owner_id]
    );

    const newSystem = await database.get(`
      SELECT s.*, e.employee_name as owner_name 
      FROM systems s 
      JOIN employees e ON s.owner_id = e.employee_id
      WHERE s.system_id = ?
    `, [system_id]);
    
    res.status(201).json(newSystem);
  } catch (error) {
    console.error('Create system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { system_name, description, business_function, owner_id } = req.body;

    // Check if system exists
    const existing = await database.get('SELECT * FROM systems WHERE system_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'System not found' });
    }

    // Check if system_name is being changed and if new name already exists
    if (system_name !== existing.system_name) {
      const existingName = await database.get(
        'SELECT system_id FROM systems WHERE system_name = ? AND system_id != ?',
        [system_name, id]
      );
      if (existingName) {
        return res.status(400).json({ error: 'System name already exists' });
      }
    }

    // Verify owner exists
    const owner = await database.get('SELECT employee_id FROM employees WHERE employee_id = ?', [owner_id]);
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    await database.run(
      'UPDATE systems SET system_name = ?, description = ?, business_function = ?, owner_id = ?, updated_at = CURRENT_TIMESTAMP WHERE system_id = ?',
      [system_name, description || null, business_function, owner_id, id]
    );

    const updatedSystem = await database.get(`
      SELECT s.*, e.employee_name as owner_name 
      FROM systems s 
      JOIN employees e ON s.owner_id = e.employee_id
      WHERE s.system_id = ?
    `, [id]);
    
    res.json(updatedSystem);
  } catch (error) {
    console.error('Update system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteSystem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if system exists
    const existing = await database.get('SELECT * FROM systems WHERE system_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'System not found' });
    }

    // Check if system has roles (will be cascade deleted)
    const hasRoles = await database.get('SELECT COUNT(*) as count FROM roles WHERE system_id = ?', [id]);
    if (hasRoles.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete system with ${hasRoles.count} associated role(s). Delete roles first.` 
      });
    }

    // Check if system is referenced in requests
    const inRequests = await database.get('SELECT COUNT(*) as count FROM request_items WHERE system_id = ?', [id]);
    if (inRequests.count > 0) {
      return res.status(400).json({ error: 'Cannot delete system that is referenced in requests' });
    }

    await database.run('DELETE FROM systems WHERE system_id = ?', [id]);
    res.json({ message: 'System deleted successfully' });
  } catch (error) {
    console.error('Delete system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem
};

// Made with Bob
