const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public (but only for admin users)
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and is admin
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      user,
      token,
      refreshToken: token // Using same token for simplicity
    }
  });
});

// @desc    Get current admin user
// @route   GET /api/admin/me
// @access  Private (Admin only)
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts from database
  const totalUsers = await User.countDocuments();
  const totalProducts = await require('../models/Product').countDocuments();
  const totalOrders = await require('../models/Order').countDocuments();
  const totalCategories = await require('../models/Category').countDocuments();

  // Calculate revenue (sum of all order totals)
  const orders = await require('../models/Order').find();
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // Get recent orders
  const recentOrders = await require('../models/Order')
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      orderStats: {
        pending: await require('../models/Order').countDocuments({ status: 'pending' }),
        confirmed: await require('../models/Order').countDocuments({ status: 'confirmed' }),
        processing: await require('../models/Order').countDocuments({ status: 'processing' }),
        shipped: await require('../models/Order').countDocuments({ status: 'shipped' }),
        delivered: await require('../models/Order').countDocuments({ status: 'delivered' }),
        cancelled: await require('../models/Order').countDocuments({ status: 'cancelled' })
      },
      productStats: {
        active: await require('../models/Product').countDocuments({ status: 'active' }),
        inactive: await require('../models/Product').countDocuments({ status: 'inactive' }),
        outOfStock: await require('../models/Product').countDocuments({ stock: 0 }),
        featured: await require('../models/Product').countDocuments({ isFeatured: true }),
        ocop: await require('../models/Product').countDocuments({ isOCOP: true })
      }
    }
  });
});

module.exports = {
  adminLogin,
  getMe,
  getDashboardStats
};
