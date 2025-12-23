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

  console.log('🛠️ adminLogin called with email:', email);
  try {
    const fs = require('fs');
    fs.mkdirSync(require('path').join(__dirname, '..', 'logs'), { recursive: true });
    fs.appendFileSync(require('path').join(__dirname, '..', 'logs', 'admin_login.log'), `${new Date().toISOString()} - adminLogin called with email: ${email}\n`);
  } catch (e) {
    // ignore logging errors
  }
  // Check if user exists and is admin
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  console.log('🛠️ user lookup result:', !!user, user && { _id: user._id, email: user.email, role: user.role });
  try {
    const fs = require('fs');
    fs.appendFileSync(require('path').join(__dirname, '..', 'logs', 'admin_login.log'), `${new Date().toISOString()} - user lookup: ${!!user} ${user ? user._id : ''}\n`);
  } catch (e) {}

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active first
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Tự động cấp quyền cho user có shop
  const Shop = require('../models/Shop');
  const userShop = await Shop.findOne({ owner: user._id });
  
  if (userShop && user.role === 'user') {
    // User có shop nhưng chưa có role phù hợp -> tự động nâng cấp
    user.role = 'shop_owner';
    user.shop = userShop._id;
    user.shopRole = 'owner';
    await user.save();
    console.log(`✅ Auto-upgraded user ${user.email} to shop_owner`);
  }

  // Allow admin, moderator, shop roles, and users with shops to login
  const allowedRoles = ['admin', 'moderator', 'shop_owner', 'shop_admin', 'shop_staff'];
  if (!allowedRoles.includes(user.role)) {
    // Nếu không có role phù hợp, kiểm tra xem có phải shop member không
    if (!userShop) {
      throw new AppError('Access denied. Admin or shop management privileges required.', 403);
    }
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  console.log('🛠️ password check result:', isPasswordValid);
  try { require('fs').appendFileSync(require('path').join(__dirname, '..', 'logs', 'admin_login.log'), `${new Date().toISOString()} - password valid: ${isPasswordValid}\n`); } catch (e) {}
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  // Populate shop info trước khi trả về
  await user.populate('shop', 'name slug logo');

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
  // If shop_owner or shop_admin, return stats limited to their shop
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin') {
    const Product = require('../models/Product');
    const Order = require('../models/Order');

    const shopId = req.user.shop;
    const totalProducts = await Product.countDocuments({ shop: shopId });
    // Orders that contain at least one item from this shop
    const shopProductIds = (await Product.find({ shop: shopId }).select('_id')).map(p => p._id);
    const totalOrders = await Order.countDocuments({ 'items.productId': { $in: shopProductIds } });
    const orders = await Order.find({ 'items.productId': { $in: shopProductIds } }).sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders: orders,
        // limited order stats
        orderStats: {
          pending: await Order.countDocuments({ status: 'pending', 'items.productId': { $in: shopProductIds } }),
          confirmed: await Order.countDocuments({ status: 'confirmed', 'items.productId': { $in: shopProductIds } }),
          processing: await Order.countDocuments({ status: 'processing', 'items.productId': { $in: shopProductIds } }),
          shipped: await Order.countDocuments({ status: 'shipped', 'items.productId': { $in: shopProductIds } }),
          delivered: await Order.countDocuments({ status: 'delivered', 'items.productId': { $in: shopProductIds } }),
          cancelled: await Order.countDocuments({ status: 'cancelled', 'items.productId': { $in: shopProductIds } })
        },
        productStats: {
          active: await Product.countDocuments({ status: 'active', shop: shopId }),
          inactive: await Product.countDocuments({ status: 'inactive', shop: shopId }),
          outOfStock: await Product.countDocuments({ stock: 0, shop: shopId }),
          featured: await Product.countDocuments({ isFeatured: true, shop: shopId }),
          ocop: await Product.countDocuments({ isOCOP: true, shop: shopId })
        }
      }
    });
  }

  // Platform admin: full stats
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
