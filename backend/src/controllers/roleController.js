const database = require('../config/database');

const getAllRoles = async (req, res) => {
  try {
    const roles = await database.all(`
      SELECT r.*, s.system_name 
      FROM roles r 
      JOIN systems s ON r.system_id = s.system_id
      ORDER BY s.system_name, r.role_name
    `);
    res.json(roles);
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await database.get(`
      SELECT r.*, s.system_name 
      FROM roles r 
      JOIN systems s ON r.system_id = s.system_id
      WHERE r.role_id = ?
    `, [id]);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRolesBySystem = async (req, res) => {
  try {
    const { systemId } = req.params;
    
    // Verify system exists
    const system = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [systemId]);
    if (!system) {
      return res.status(404).json({ error: 'System not found' });
    }

    const roles = await database.all(
      'SELECT * FROM roles WHERE system_id = ? ORDER BY role_name',
      [systemId]
    );
    res.json(roles);
  } catch (error) {
    console.error('Get roles by system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRole = async (req, res) => {
  try {
    const { role_id, role_name, system_id, description, security_level } = req.body;

    // Check if role_id already exists
    const existing = await database.get('SELECT role_id FROM roles WHERE role_id = ?', [role_id]);
    if (existing) {
      return res.status(400).json({ error: 'Role ID already exists' });
    }

    // Verify system exists
    const system = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [system_id]);
    if (!system) {
      return res.status(400).json({ error: 'System not found' });
    }

    // Check if role_name already exists for this system
    const existingRole = await database.get(
      'SELECT role_id FROM roles WHERE role_name = ? AND system_id = ?',
      [role_name, system_id]
    );
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists for this system' });
    }

    await database.run(
      'INSERT INTO roles (role_id, role_name, system_id, description, security_level) VALUES (?, ?, ?, ?, ?)',
      [role_id, role_name, system_id, description || null, security_level]
    );

    const newRole = await database.get(`
      SELECT r.*, s.system_name 
      FROM roles r 
      JOIN systems s ON r.system_id = s.system_id
      WHERE r.role_id = ?
    `, [role_id]);
    
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, system_id, description, security_level } = req.body;

    // Check if role exists
    const existing = await database.get('SELECT * FROM roles WHERE role_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Verify system exists
    const system = await database.get('SELECT system_id FROM systems WHERE system_id = ?', [system_id]);
    if (!system) {
      return res.status(400).json({ error: 'System not found' });
    }

    // Check if role_name already exists for this system (excluding current role)
    const existingRole = await database.get(
      'SELECT role_id FROM roles WHERE role_name = ? AND system_id = ? AND role_id != ?',
      [role_name, system_id, id]
    );
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists for this system' });
    }

    await database.run(
      'UPDATE roles SET role_name = ?, system_id = ?, description = ?, security_level = ?, updated_at = CURRENT_TIMESTAMP WHERE role_id = ?',
      [role_name, system_id, description || null, security_level, id]
    );

    const updatedRole = await database.get(`
      SELECT r.*, s.system_name 
      FROM roles r 
      JOIN systems s ON r.system_id = s.system_id
      WHERE r.role_id = ?
    `, [id]);
    
    res.json(updatedRole);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existing = await database.get('SELECT * FROM roles WHERE role_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if role is referenced in requests
    const inRequests = await database.get('SELECT COUNT(*) as count FROM request_items WHERE role_id = ?', [id]);
    if (inRequests.count > 0) {
      return res.status(400).json({ error: 'Cannot delete role that is referenced in requests' });
    }

    await database.run('DELETE FROM roles WHERE role_id = ?', [id]);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  getRolesBySystem,
  createRole,
  updateRole,
  deleteRole
};

// Made with Bob
