const database = require('../config/database');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await database.all(`
      SELECT e.*, m.employee_name as manager_name 
      FROM employees e 
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      ORDER BY e.employee_name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await database.get(`
      SELECT e.*, m.employee_name as manager_name 
      FROM employees e 
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      WHERE e.employee_id = ?
    `, [id]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSubordinates = async (req, res) => {
  try {
    const { id } = req.params;
    const subordinates = await database.all(
      'SELECT * FROM employees WHERE manager_id = ? ORDER BY employee_name',
      [id]
    );
    res.json(subordinates);
  } catch (error) {
    console.error('Get subordinates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { employee_id, employee_name, employee_email, department, branch, manager_id } = req.body;

    // Check if employee_id already exists
    const existing = await database.get('SELECT employee_id FROM employees WHERE employee_id = ?', [employee_id]);
    if (existing) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await database.get('SELECT employee_id FROM employees WHERE employee_email = ?', [employee_email]);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // If manager_id is provided, verify it exists
    if (manager_id) {
      const manager = await database.get('SELECT employee_id FROM employees WHERE employee_id = ?', [manager_id]);
      if (!manager) {
        return res.status(400).json({ error: 'Manager not found' });
      }
    }

    await database.run(
      'INSERT INTO employees (employee_id, employee_name, employee_email, department, branch, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, employee_name, employee_email, department, branch, manager_id || null]
    );

    const newEmployee = await database.get('SELECT * FROM employees WHERE employee_id = ?', [employee_id]);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_name, employee_email, department, branch, manager_id } = req.body;

    // Check if employee exists
    const existing = await database.get('SELECT * FROM employees WHERE employee_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is being changed and if new email already exists
    if (employee_email !== existing.employee_email) {
      const existingEmail = await database.get(
        'SELECT employee_id FROM employees WHERE employee_email = ? AND employee_id != ?',
        [employee_email, id]
      );
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // If manager_id is provided, verify it exists and is not self-referencing
    if (manager_id) {
      if (manager_id === id) {
        return res.status(400).json({ error: 'Employee cannot be their own manager' });
      }
      const manager = await database.get('SELECT employee_id FROM employees WHERE employee_id = ?', [manager_id]);
      if (!manager) {
        return res.status(400).json({ error: 'Manager not found' });
      }
    }

    await database.run(
      'UPDATE employees SET employee_name = ?, employee_email = ?, department = ?, branch = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?',
      [employee_name, employee_email, department, branch, manager_id || null, id]
    );

    const updatedEmployee = await database.get('SELECT * FROM employees WHERE employee_id = ?', [id]);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const existing = await database.get('SELECT * FROM employees WHERE employee_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if employee is referenced as a manager
    const hasSubordinates = await database.get('SELECT COUNT(*) as count FROM employees WHERE manager_id = ?', [id]);
    if (hasSubordinates.count > 0) {
      return res.status(400).json({ error: 'Cannot delete employee who is a manager of other employees' });
    }

    // Check if employee owns any systems
    const ownsSystems = await database.get('SELECT COUNT(*) as count FROM systems WHERE owner_id = ?', [id]);
    if (ownsSystems.count > 0) {
      return res.status(400).json({ error: 'Cannot delete employee who owns systems' });
    }

    // Check if employee has any requests
    const hasRequests = await database.get(
      'SELECT COUNT(*) as count FROM requests WHERE employee_id = ? OR manager_id = ?',
      [id, id]
    );
    if (hasRequests.count > 0) {
      return res.status(400).json({ error: 'Cannot delete employee who has associated requests' });
    }

    await database.run('DELETE FROM employees WHERE employee_id = ?', [id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getSubordinates,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

// Made with Bob
