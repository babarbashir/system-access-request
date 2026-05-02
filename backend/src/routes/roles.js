const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  getRolesBySystem,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');
const { roleValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.get('/system/:systemId', getRolesBySystem);
router.post('/', roleValidation, validate, createRole);
router.put('/:id', roleValidation, validate, updateRole);
router.delete('/:id', deleteRole);

module.exports = router;

// Made with Bob
