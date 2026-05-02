const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  submitRequest,
  approveRequest,
  rejectRequest
} = require('../controllers/requestController');
const { requestValidation, validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.post('/', requestValidation, validate, createRequest);
router.put('/:id', requestValidation, validate, updateRequest);
router.delete('/:id', deleteRequest);
router.post('/:id/submit', submitRequest);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);

module.exports = router;

// Made with Bob
