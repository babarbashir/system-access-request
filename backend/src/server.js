const express = require('express');
const cors = require('cors');
const database = require('./config/database');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const systemRoutes = require('./routes/systems');
const roleRoutes = require('./routes/roles');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/requests', requestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    console.log('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log('\nAvailable endpoints:');
      console.log('  POST   /api/auth/login');
      console.log('  POST   /api/auth/logout');
      console.log('  GET    /api/auth/me');
      console.log('  GET    /api/employees');
      console.log('  GET    /api/systems');
      console.log('  GET    /api/roles');
      console.log('  GET    /api/requests');
      console.log('\nPress Ctrl+C to stop the server');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});

startServer();

module.exports = app;

// Made with Bob
