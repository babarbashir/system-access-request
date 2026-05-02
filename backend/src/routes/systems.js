const express = require('express');
const router = express.Router();
const {
  getAllSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem
} = require('../controllers/systemController');
const { systemValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllSystems);
router.get('/:id', getSystemById);
router.post('/', systemValidation, validate, createSystem);
router.put('/:id', systemValidation, validate, updateSystem);
router.delete('/:id', deleteSystem);

module.exports = router;

// Made with Bob
