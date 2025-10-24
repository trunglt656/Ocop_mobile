const express = require('express');
const { body } = require('express-validator');
const { adminLogin, getMe, getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// Validation rules
const adminLoginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', adminLoginValidation, handleValidationErrors, adminLogin);

// @route   GET /api/admin/me
// @desc    Get current admin user
// @access  Private (Admin only)
router.get('/me', protect, getMe);

// @route   GET /api/admin/dashboard/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard/stats', protect, getDashboardStats);

module.exports = router;
