const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { asyncHandler, AppError } = require('../middleware/error');
const { paginateResults } = require('../utils/helpers');

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const orders = await Order.getUserOrders(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    sort: '-createdAt'
  });

  const totalCount = await Order.countDocuments({
    user: req.user._id,
    ...(status && { orderStatus: status })
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if order belongs to user or user is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this order', 403);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  // Get user's cart
  const cart = await Cart.getUserCart(req.user._id);

  if (cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Check stock availability
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
  }

  // Get shipping address
  let address;
  if (shippingAddress) {
    address = shippingAddress;
  } else {
    address = await Address.getDefaultAddress(req.user._id);
    if (!address) {
      throw new AppError('Shipping address is required', 400);
    }
  }

  // Create order items from cart
  const orderItems = cart.items.map(item => ({
    product: item.product,
    name: item.product.name,
    image: item.product.images[0]?.url || '',
    price: item.price,
    discount: item.discount,
    quantity: item.quantity,
    total: (item.price * (1 - item.discount / 100)) * item.quantity
  }));

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k VND
  const total = subtotal + shippingFee;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: {
      name: address.name,
      phone: address.phone,
      address: address.address,
      ward: address.ward,
      district: address.district,
      province: address.province,
      postalCode: address.postalCode,
      instructions: address.instructions
    },
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    subtotal,
    shippingFee,
    discount: cart.discountAmount,
    total,
    notes
  });

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, totalSold: item.quantity }
    });
  }

  // Clear cart after successful order
  await cart.clearCart();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSold: -item.quantity }
    });
  }

  // Cancel order
  await order.cancelOrder(reason);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const stats = await Order.getOrderStats(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );

  // Get total counts by status
  const statusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        total: { $sum: '$total' }
      }
    }
  ]);

  // Get recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      statusBreakdown: stats,
      statusCounts,
      recentOrders,
      summary: {
        totalOrders: statusCounts.reduce((sum, status) => sum + status.count, 0),
        totalRevenue: statusCounts.reduce((sum, status) => sum + status.total, 0)
      }
    }
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.updateStatus(status, notes);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, sort = '-createdAt' } = req.query;

  const { query: orderQuery } = paginateResults(Order, {
    ...(status && { orderStatus: status })
  }, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: 'user'
  });

  const orders = await orderQuery;
  const totalCount = await Order.countDocuments({
    ...(status && { orderStatus: status })
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: orders
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getOrderStats,
  updateOrderStatus,
  getAllOrders
};
