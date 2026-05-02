const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await database.get(
      'SELECT u.*, e.employee_name, e.employee_email, e.department FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    await database.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        employee_name: user.employee_name,
        email: user.employee_email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // We can optionally log the logout event here
  res.json({ message: 'Logged out successfully' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await database.get(
      'SELECT u.id, u.employee_id, u.username, u.role, e.employee_name, e.employee_email, e.department, e.branch FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      employee_id: user.employee_id,
      username: user.username,
      employee_name: user.employee_name,
      email: user.employee_email,
      department: user.department,
      branch: user.branch,
      role: user.role
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { login, logout, getCurrentUser };

// Made with Bob
