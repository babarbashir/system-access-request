const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  getSubordinates,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { employeeValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.get('/:id/subordinates', getSubordinates);
router.post('/', employeeValidation, validate, createEmployee);
router.put('/:id', employeeValidation, validate, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;

// Made with Bob
