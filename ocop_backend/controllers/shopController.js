const Shop = require('../models/Shop');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};
  
  // Public users only see active/approved shops
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    if (req.query.status) query.status = req.query.status;
  } else {
    query.status = { $in: ['active', 'approved'] };
  }
  
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { address: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const total = await Shop.countDocuments(query);
  const shops = await Shop.find(query)
    .populate('owner', 'name email phone avatar')
    .populate('admins', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: shops,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get my shop (current user's shop)
// @route   GET /api/shops/my-shop
// @access  Private
const getMyShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id })
    .populate('owner', 'name email phone avatar')
    .populate('admins', 'name email phone avatar')
    .populate('staff', 'name email phone avatar');

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Bạn chưa có shop nào'
    });
  }

  res.status(200).json({
    success: true,
    data: shop
  });
});

// @desc    Get shop by id
// @route   GET /api/shops/:id
// @access  Public
const getShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id)
    .populate('owner', 'name email phone avatar')
    .populate('admins', 'name email phone avatar');
  
  if (!shop) throw new AppError('Shop not found', 404);
  res.status(200).json({ success: true, data: shop });
});

// @desc    Create shop
// @route   POST /api/shops
// @access  Private (platform admin)
const createShop = asyncHandler(async (req, res) => {
  // Only platform admin allowed here (routes will protect/authorize)
  const shop = await Shop.create(req.body);
  res.status(201).json({ success: true, data: shop });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (platform admin or shop owner)
const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new AppError('Shop not found', 404);

  // Allow owner or platform admin
  if (req.user.role !== 'admin' && (!shop.owner || shop.owner.toString() !== req.user._id.toString())) {
    throw new AppError('Not authorized to update this shop', 403);
  }

  Object.assign(shop, req.body);
  await shop.save();

  res.status(200).json({ success: true, data: shop });
});

// @desc    Add admin to shop
// @route   POST /api/shops/:id/admins
// @access  Private (platform admin or shop owner)
const addShopAdmin = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new AppError('Shop not found', 404);

  if (req.user.role !== 'admin' && (!shop.owner || shop.owner.toString() !== req.user._id.toString())) {
    throw new AppError('Not authorized to manage admins for this shop', 403);
  }

  const { userId } = req.body;
  if (!userId) throw new AppError('userId is required', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Make user a shop_admin and assign shop
  user.role = 'shop_admin';
  user.shop = shop._id;
  await user.save();

  shop.admins = shop.admins || [];
  if (!shop.admins.find(a => a.toString() === user._id.toString())) {
    shop.admins.push(user._id);
    await shop.save();
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Remove admin from shop
// @route   DELETE /api/shops/:id/admins/:userId
// @access  Private (platform admin or shop owner)
const removeShopAdmin = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new AppError('Shop not found', 404);

  if (req.user.role !== 'admin' && (!shop.owner || shop.owner.toString() !== req.user._id.toString())) {
    throw new AppError('Not authorized to manage admins for this shop', 403);
  }

  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Remove admin role and shop affiliation
  if (user.role === 'shop_admin' && user.shop && user.shop.toString() === shop._id.toString()) {
    user.role = 'user';
    user.shop = undefined;
    await user.save();
  }

  shop.admins = (shop.admins || []).filter(a => a.toString() !== userId.toString());
  await shop.save();

  res.status(200).json({ success: true, message: 'Admin removed' });
});

// @desc    Toggle shop status
// @route   PATCH /api/shops/:id/toggle-status
// @access  Private (platform admin only)
const toggleShopStatus = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new AppError('Shop not found', 404);

  shop.isActive = !shop.isActive;
  await shop.save();

  res.status(200).json({ 
    success: true, 
    data: shop,
    message: `Shop ${shop.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (platform admin only)
const deleteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new AppError('Shop not found', 404);

  await shop.deleteOne();

  res.status(200).json({ 
    success: true, 
    message: 'Shop deleted successfully'
  });
});

// @desc    Register new shop
// @route   POST /api/shops/register
// @access  Private (Authenticated users)
const registerShop = asyncHandler(async (req, res) => {
  const { name, contact, address, description, logo, banner } = req.body;

  // Check if user already owns a shop
  const existingShop = await Shop.findOne({ owner: req.user._id });
  if (existingShop) {
    throw new AppError('You already own a shop', 400);
  }

  // Create shop
  const shop = await Shop.create({
    name,
    owner: req.user._id,
    contact,
    address,
    description,
    logo,
    banner,
    status: 'pending' // Requires admin approval
  });

  res.status(201).json({
    success: true,
    message: 'Shop registration submitted. Awaiting approval.',
    data: shop
  });
});

// @desc    Approve/reject shop (Admin/Moderator only)
// @route   PATCH /api/shops/:id/approve
// @access  Private (Admin, Moderator)
const approveShop = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be approved or rejected', 400);
  }

  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  if (shop.status !== 'pending') {
    throw new AppError('Only pending shops can be approved/rejected', 400);
  }

  shop.status = status === 'approved' ? 'active' : 'rejected';
  shop.approvedBy = req.user._id;
  shop.approvedAt = new Date();
  
  if (status === 'rejected') {
    shop.rejectionReason = notes;
  }

  await shop.save();

  // If approved, update user role to shop_owner
  if (status === 'approved') {
    await User.findByIdAndUpdate(shop.owner, {
      role: 'shop_owner',
      shop: shop._id,
      shopRole: 'owner'
    });
  }

  res.status(200).json({
    success: true,
    message: `Shop ${status}`,
    data: shop
  });
});

// @desc    Add staff to shop
// @route   POST /api/shops/:id/staff
// @access  Private (Shop owner)
const addShopStaff = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!['shop_admin', 'shop_staff'].includes(role)) {
    throw new AppError('Invalid role. Must be shop_admin or shop_staff', 400);
  }

  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user already has a shop
  if (user.shop) {
    throw new AppError('User is already affiliated with a shop', 400);
  }

  // Add to shop's staff/admin array
  if (role === 'shop_admin') {
    if (!shop.admins.includes(userId)) {
      shop.admins.push(userId);
    }
  } else {
    if (!shop.staff) shop.staff = [];
    if (!shop.staff.includes(userId)) {
      shop.staff.push(userId);
    }
  }

  await shop.save();

  // Update user
  user.role = role;
  user.shop = shop._id;
  user.shopRole = role === 'shop_admin' ? 'admin' : 'staff';
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Staff member added successfully',
    data: { shop, user }
  });
});

// @desc    Remove staff from shop
// @route   DELETE /api/shops/:id/staff/:userId
// @access  Private (Shop owner)
const removeShopStaff = asyncHandler(async (req, res) => {
  const { id: shopId, userId } = req.params;

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove from shop arrays
  shop.admins = shop.admins.filter(id => id.toString() !== userId);
  if (shop.staff) {
    shop.staff = shop.staff.filter(id => id.toString() !== userId);
  }
  await shop.save();

  // Reset user role
  user.role = 'user';
  user.shop = null;
  user.shopRole = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Staff member removed successfully'
  });
});

// @desc    Get shop dashboard stats
// @route   GET /api/shops/:id/dashboard
// @access  Private (Shop owner, admin, staff)
const getShopDashboard = asyncHandler(async (req, res) => {
  const shopId = req.params.id;
  const Product = require('../models/Product');
  const Order = require('../models/Order');

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  // Get products
  const totalProducts = await Product.countDocuments({ shop: shopId });
  const activeProducts = await Product.countDocuments({ shop: shopId, status: 'active' });
  const outOfStockProducts = await Product.countDocuments({ shop: shopId, stock: 0 });

  // Get shop's product IDs
  const shopProducts = await Product.find({ shop: shopId }).select('_id');
  const shopProductIds = shopProducts.map(p => p._id);

  // Get orders containing shop products
  const orders = await Order.find({
    'items.product': { $in: shopProductIds }
  }).populate('user', 'name email');

  const totalOrders = orders.length;
  
  // Calculate revenue from items of this shop only
  let totalRevenue = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      // Get product ID (could be string or object if populated)
      const productId = typeof item.product === 'object' && item.product._id 
        ? item.product._id.toString() 
        : item.product.toString();
      
      // Only count items from this shop
      if (shopProductIds.some(id => id.toString() === productId)) {
        // Use item.total if available, otherwise calculate from price * quantity
        if (item.total) {
          totalRevenue += item.total;
        } else {
          const itemPrice = item.price || 0;
          const itemQuantity = item.quantity || 0;
          const itemDiscount = item.discount || 0;
          const itemRevenue = itemPrice * itemQuantity * (1 - itemDiscount / 100);
          totalRevenue += itemRevenue;
        }
      }
    });
  });

  // Order stats
  const orderStats = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  orders.forEach(order => {
    if (orderStats[order.orderStatus] !== undefined) {
      orderStats[order.orderStatus]++;
    }
  });

  // Recent orders
  const recentOrders = orders
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: {
      shop,
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalOrders,
        totalRevenue,
        orderStats
      },
      recentOrders
    }
  });
});

// @desc    Verify shop documents (Admin/Moderator)
// @route   PATCH /api/shops/:id/verify-document
// @access  Private (Admin, Moderator)
const verifyShopDocument = asyncHandler(async (req, res) => {
  const { documentId, verified, notes } = req.body;

  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  const document = shop.verificationDocuments.id(documentId);
  if (!document) {
    throw new AppError('Document not found', 404);
  }

  document.verified = verified;
  document.verifiedBy = req.user._id;
  document.verifiedAt = new Date();
  document.notes = notes;

  await shop.save();

  res.status(200).json({
    success: true,
    message: 'Document verification updated',
    data: shop
  });
});

// @desc    Upload shop verification document
// @route   POST /api/shops/:id/documents
// @access  Private (Shop owner)
const uploadShopDocument = asyncHandler(async (req, res) => {
  const { type, url, filename } = req.body;

  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  shop.verificationDocuments.push({
    type,
    url,
    filename,
    verified: false
  });

  await shop.save();

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: shop
  });
});

module.exports = {
  getShops,
  getMyShop,
  getShop,
  createShop,
  updateShop,
  addShopAdmin,
  removeShopAdmin,
  toggleShopStatus,
  deleteShop,
  registerShop,
  approveShop,
  addShopStaff,
  removeShopStaff,
  getShopDashboard,
  verifyShopDocument,
  uploadShopDocument
};
