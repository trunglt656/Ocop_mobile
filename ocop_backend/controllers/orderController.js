const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const mongoose = require('mongoose');
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
  console.log('Create order request body:', req.body);
  console.log('isDirectBuy flag:', req.body.isDirectBuy);
  console.log('directItems:', req.body.items);
  const { shippingAddress, paymentMethod, notes, items: directItems, isDirectBuy } = req.body;

  let orderItems = [];
  let cart = null;

  // Handle direct buy (single product purchase)
  if (isDirectBuy && directItems && directItems.length > 0) {
    console.log('Processing direct buy order');
    // Validate and prepare direct buy items
    for (const item of directItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`Product not found: ${item.product}`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }
      
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images[0] ? product.images[0].url : '',
        price: item.price,
        discount: product.discount || 0,
        quantity: item.quantity,
        total: item.price * item.quantity
      });
    }
  } else {
    // Normal cart-based order
    console.log('Processing cart-based order');
    cart = await Cart.getUserCart(req.user._id);

    if (cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Basic stock availability check (quick fail)
    for (const item of cart.items) {
      const prodStock = item.product && item.product.stock !== undefined ? item.product.stock : (await Product.findById(item.product)).stock;
      if (prodStock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name || item.product}`, 400);
      }
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

  // Create order items from cart (extract product ID properly) - only if not direct buy
  if (!isDirectBuy && cart) {
    orderItems = cart.items.map(item => {
      const productId = item.product._id || item.product;
      const productData = item.product._id ? item.product : null;
      
      return {
        product: productId,
        name: productData ? productData.name : 'Product',
        image: productData && productData.images && productData.images[0] ? productData.images[0].url : '',
        price: item.price,
        discount: item.discount,
        quantity: item.quantity,
        total: (item.price * (1 - item.discount / 100)) * item.quantity
      };
    });
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k VND
  const discount = (cart && cart.discountAmount) || 0;
  const total = subtotal - discount + shippingFee;

  // Use mongoose transaction if available to perform stock decrement + order creation atomically
  let order;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    
    // Decrement each product stock atomically
    for (const item of orderItems) {
      const productId = item.product;
      const updated = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, totalSold: item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        throw new AppError(`Insufficient stock for ${item.name}`, 400);
      }
    }

    // Create the order within the transaction
    const created = await Order.create([{
      orderNumber: `OCOP${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
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
      discount,
      total,
      notes
    }], { session });

    order = created[0];

    // Clear cart only if not direct buy
    console.log('Before clearing cart - isDirectBuy:', isDirectBuy, 'cart exists:', !!cart);
    if (!isDirectBuy && cart) {
      console.log('Clearing cart for normal order');
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      cart.discountAmount = 0;
      cart.finalPrice = 0;
      await cart.save({ session, validateBeforeSave: false });
    } else {
      console.log('Skipping cart clear - Direct buy or no cart');
    }

    // Commit transaction
    await session.commitTransaction();
    console.log('✅ Order created successfully with transaction');

  } catch (err) {
    // Abort transaction if error
    if (session) {
      try {
        await session.abortTransaction();
        console.log('🔄 Transaction aborted due to error');
      } catch (abortErr) {
        console.error('Error aborting transaction:', abortErr.message);
      }
    }

    console.log('Transaction failed, using fallback approach:', err.message);

    // Fallback: try per-item atomic updates and revert if failure
    const updatedProducts = [];
    try {
      for (const item of orderItems) {
        const productId = item.product;
        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, totalSold: item.quantity } },
          { new: true }
        );

        if (!updated) {
          throw new AppError(`Insufficient stock for ${item.name}`, 400);
        }

        updatedProducts.push({ id: productId, qty: item.quantity });
      }

      // Create order (non-transactional)
      order = await Order.create({
        orderNumber: `OCOP${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
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
        discount: (cart && cart.discountAmount) || 0,
        total,
        notes
      });

      // Clear cart only if not direct buy
      console.log('Fallback: Before clearing cart - isDirectBuy:', isDirectBuy, 'cart exists:', !!cart);
      if (!isDirectBuy && cart) {
        console.log('Fallback: Clearing cart for normal order');
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        cart.discountAmount = 0;
        cart.finalPrice = 0;
        await cart.save({ validateBeforeSave: false });
      } else {
        console.log('Fallback: Skipping cart clear - Direct buy or no cart');
      }
    } catch (fallbackErr) {
      // revert any product updates done in fallback
      if (updatedProducts.length > 0) {
        for (const p of updatedProducts) {
          try {
            await Product.findByIdAndUpdate(p.id, { $inc: { stock: p.qty, totalSold: -p.qty } });
          } catch (revertErr) {
            console.error('Failed to revert product stock for', p.id, revertErr.message);
          }
        }
      }

      throw fallbackErr;
    }
  } finally {
    // Always clean up session
    if (session) {
      try {
        await session.endSession();
        console.log('🔒 Session ended successfully');
      } catch (sessionErr) {
        console.error('⚠️ Error ending session:', sessionErr.message);
        // Don't throw here, order was already created or error already thrown
      }
    }
  }

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
  const { status, trackingNumber, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update tracking number if provided
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.updateStatus(status, notes);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Update payment status (Admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
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
  updatePaymentStatus,
  getAllOrders
};
