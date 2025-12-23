const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { checkShopAccess, checkOrderAccess } = require('../middleware/permissions');
const {
  getShopOrders,
  getShopOrder,
  updateOrderStatus,
  getShopOrderStats,
  cancelOrder,
  addOrderNote
} = require('../controllers/shopOrderController');

const router = express.Router();

// All routes require authentication and shop role
router.use(protect);
router.use(authorize('shop_owner', 'shop_admin', 'shop_staff', 'admin'));

// Check shop access for non-admin users
const shopAccessMiddleware = checkShopAccess(['shop_owner', 'shop_admin', 'shop_staff']);

// @route   GET /api/shop/orders
// @desc    Get shop orders (orders with shop's products)
router.get('/', shopAccessMiddleware, getShopOrders);

// @route   GET /api/shop/orders/stats
// @desc    Get shop order statistics
router.get('/stats', authorize('shop_owner', 'shop_admin', 'admin'), shopAccessMiddleware, getShopOrderStats);

// @route   GET /api/shop/orders/:id
// @desc    Get single shop order
router.get('/:id', shopAccessMiddleware, getShopOrder);

// @route   PATCH /api/shop/orders/:id/status
// @desc    Update order status
router.patch('/:id/status', shopAccessMiddleware, updateOrderStatus);

// @route   PATCH /api/shop/orders/:id/cancel
// @desc    Cancel order
router.patch('/:id/cancel', authorize('shop_owner', 'shop_admin', 'admin'), shopAccessMiddleware, cancelOrder);

// @route   POST /api/shop/orders/:id/notes
// @desc    Add note to order
router.post('/:id/notes', shopAccessMiddleware, addOrderNote);

module.exports = router;
