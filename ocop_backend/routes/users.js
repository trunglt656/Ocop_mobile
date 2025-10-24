const express = require('express');
const { param } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// All user routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required')
];

// User management routes (Admin only)
router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', userIdValidation, handleValidationErrors, getUser);
router.put('/:id', userIdValidation, handleValidationErrors, updateUser);
router.delete('/:id', userIdValidation, handleValidationErrors, deleteUser);

module.exports = router;
