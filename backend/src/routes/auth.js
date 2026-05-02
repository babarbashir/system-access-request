const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { loginValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/login', loginValidation, validate, login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;

// Made with Bob
