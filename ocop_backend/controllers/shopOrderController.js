const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get shop orders (orders containing shop's products)
// @route   GET /api/shop/orders
// @access  Private (Shop owner, admin, staff)
const getShopOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  // Get shop's product IDs
  const shopProducts = await Product.find({ shop: req.userShop }).select('_id');
  const shopProductIds = shopProducts.map(p => p._id);

  // Build query
  const query = {
    'items.product': { $in: shopProductIds }
  };

  if (status) {
    query.orderStatus = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price shop')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  // Filter items to only show shop's products
  const filteredOrders = orders.map(order => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => 
      item.product && shopProductIds.some(id => id.toString() === item.product._id.toString())
    );
    
    // Recalculate subtotal for shop's items only
    orderObj.shopSubtotal = orderObj.items.reduce((sum, item) => sum + item.total, 0);
    
    return orderObj;
  });

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: filteredOrders.length,
    total,
    pages: Math.ceil(total / limit),
    data: filteredOrders
  });
});

// @desc    Get single order for shop
// @route   GET /api/shop/orders/:id
// @access  Private (Shop owner, admin, staff)
const getShopOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price shop');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Get shop's product IDs
  const shopProducts = await Product.find({ shop: req.userShop }).select('_id');
  const shopProductIds = shopProducts.map(p => p._id.toString());

  // Check if order contains shop's products
  const hasShopProducts = order.items.some(item => 
    item.product && shopProductIds.includes(item.product._id.toString())
  );

  if (!hasShopProducts) {
    throw new AppError('This order does not contain your shop\'s products', 403);
  }

  // Filter to show only shop's products
  const orderObj = order.toObject();
  orderObj.items = orderObj.items.filter(item => 
    item.product && shopProductIds.includes(item.product._id.toString())
  );
  orderObj.shopSubtotal = orderObj.items.reduce((sum, item) => sum + item.total, 0);

  res.status(200).json({
    success: true,
    data: orderObj
  });
});

// @desc    Update order status (shop perspective)
// @route   PATCH /api/shop/orders/:id/status
// @access  Private (Shop owner, admin, staff)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes, trackingNumber } = req.body;

  const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await Order.findById(req.params.id)
    .populate('items.product', 'shop');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order contains shop's products
  const hasShopProducts = order.items.some(item => 
    item.product && item.product.shop && 
    item.product.shop.toString() === req.userShop.toString()
  );

  if (!hasShopProducts) {
    throw new AppError('This order does not contain your shop\'s products', 403);
  }

  // Status transition validation
  const allowedTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': [],
    'refunded': []
  };

  if (!allowedTransitions[order.orderStatus]?.includes(status)) {
    throw new AppError(
      `Cannot change order from ${order.orderStatus} to ${status}`, 
      400
    );
  }

  // Update order
  order.orderStatus = status;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (notes) {
    order.notes = (order.notes ? order.notes + '\n' : '') + 
      `[${new Date().toISOString()}] ${status}: ${notes}`;
  }

  if (status === 'shipped' && !order.estimatedDelivery) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days
    order.estimatedDelivery = deliveryDate;
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid'; // Mark as paid when delivered (COD)
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order
  });
});

// @desc    Get shop order statistics
// @route   GET /api/shop/orders/stats
// @access  Private (Shop owner, admin)
const getShopOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Get shop's product IDs
  const shopProducts = await Product.find({ shop: req.userShop }).select('_id');
  const shopProductIds = shopProducts.map(p => p._id);

  // Build date query
  const dateQuery = {};
  if (startDate || endDate) {
    dateQuery.createdAt = {};
    if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
    if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
  }

  // Get all orders with shop products
  const orders = await Order.find({
    'items.product': { $in: shopProductIds },
    ...dateQuery
  }).populate('items.product', 'shop price');

  // Calculate statistics
  let totalOrders = 0;
  let totalRevenue = 0;
  const statusCounts = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  orders.forEach(order => {
    totalOrders++;
    
    // Count by status
    if (statusCounts[order.orderStatus] !== undefined) {
      statusCounts[order.orderStatus]++;
    }

    // Calculate revenue from shop's products only
    order.items.forEach(item => {
      if (item.product && shopProductIds.some(id => 
        id.toString() === item.product._id.toString()
      )) {
        totalRevenue += item.total;
      }
    });
  });

  // Average order value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Products performance
  const productPerformance = await Order.aggregate([
    { $match: { 'items.product': { $in: shopProductIds } } },
    { $unwind: '$items' },
    { $match: { 'items.product': { $in: shopProductIds } } },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        statusCounts
      },
      topProducts: productPerformance
    }
  });
});

// @desc    Cancel order (before processing)
// @route   PATCH /api/shop/orders/:id/cancel
// @access  Private (Shop owner, admin)
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('items.product', 'shop');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order contains shop's products
  const hasShopProducts = order.items.some(item => 
    item.product && item.product.shop && 
    item.product.shop.toString() === req.userShop.toString()
  );

  if (!hasShopProducts) {
    throw new AppError('This order does not contain your shop\'s products', 403);
  }

  // Can only cancel pending or confirmed orders
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new AppError('Can only cancel pending or confirmed orders', 400);
  }

  order.orderStatus = 'cancelled';
  order.notes = (order.notes ? order.notes + '\n' : '') + 
    `[${new Date().toISOString()}] Cancelled by shop: ${reason || 'No reason provided'}`;

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Add note to order
// @route   POST /api/shop/orders/:id/notes
// @access  Private (Shop owner, admin, staff)
const addOrderNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  if (!note) {
    throw new AppError('Note is required', 400);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.notes = (order.notes ? order.notes + '\n' : '') + 
    `[${new Date().toISOString()}] ${req.user.name}: ${note}`;

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Note added successfully',
    data: order
  });
});

module.exports = {
  getShopOrders,
  getShopOrder,
  updateOrderStatus,
  getShopOrderStats,
  cancelOrder,
  addOrderNote
};
