const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get all products for admin (all shops)
// @route   GET /api/admin/products
// @access  Private (Admin, Moderator, Shop Owners)
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  console.log('🔍 getAllProductsAdmin called');
  console.log('   User:', req.user.email, 'Role:', req.user.role, 'Shop:', req.user.shop);
  console.log('   Query params:', req.query);
  
  const { 
    page = 1, 
    limit = 20, 
    status, 
    shop, 
    search,
    isOCOP,
    approvalStatus 
  } = req.query;
  
  const skip = (page - 1) * limit;
  const query = {};

  // 🔒 Shop owners can only see their own products
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin' || req.user.role === 'shop_staff') {
    if (!req.user.shop) {
      return res.status(403).json({
        success: false,
        message: 'Shop not found for this user'
      });
    }
    query.shop = req.user.shop;
  } else if (shop) {
    // Admin/moderator can filter by specific shop
    query.shop = shop;
  }

  if (status) query.status = status;
  if (isOCOP !== undefined) query.isOCOP = isOCOP === 'true';
  if (approvalStatus) query['approvalStatus.status'] = approvalStatus;
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  console.log('   MongoDB query:', JSON.stringify(query));

  const products = await Product.find(query)
    .populate('shop', 'name')
    .populate('category', 'name')
    .populate('createdBy', 'name email')
    .populate('approvalStatus.reviewedBy', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  console.log('   Results: Found', products.length, 'products, Total:', total);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: totalPages,
    currentPage: parseInt(page),
    data: products
  });
});

// @desc    Approve/reject product
// @route   PATCH /api/admin/products/:id/approve
// @access  Private (Admin, Moderator)
const approveProduct = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be approved or rejected', 400);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Update approval status
  product.approvalStatus = {
    status,
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    notes
  };

  // Update product status based on approval
  if (status === 'approved') {
    product.status = 'active';
  } else {
    product.status = 'rejected';
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${status}`,
    data: product
  });
});

// @desc    Verify OCOP certificate
// @route   PATCH /api/admin/products/:id/verify-ocop
// @access  Private (Admin, Moderator)
const verifyOCOP = asyncHandler(async (req, res) => {
  const { certificateId, verified, notes } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const certificate = product.certificates.id(certificateId);
  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  certificate.verified = verified;
  certificate.verifiedBy = req.user._id;
  certificate.verifiedAt = new Date();
  
  if (notes) {
    certificate.notes = notes;
  }

  // If all certificates are verified, mark product as OCOP verified
  const allVerified = product.certificates.every(cert => cert.verified);
  if (allVerified && product.certificates.length > 0) {
    product.producerVerified = true;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'OCOP certificate verification updated',
    data: product
  });
});

// @desc    Update product status (admin override)
// @route   PATCH /api/admin/products/:id/status
// @access  Private (Admin, Shop Owners for their products)
const updateProductStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['draft', 'pending_review', 'active', 'rejected', 'inactive', 'out_of_stock', 'discontinued'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // 🔒 Shop owners can only update their own products
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin' || req.user.role === 'shop_staff') {
    if (product.shop.toString() !== req.user.shop.toString()) {
      throw new AppError('You can only update products from your own shop', 403);
    }
  }

  product.status = status;
  await product.save();
  await product.populate('shop', 'name');

  res.status(200).json({
    success: true,
    message: `Product status updated to ${status}`,
    data: product
  });
});

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin, Shop Owners for their products)
const deleteProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // 🔒 Shop owners can only delete their own products
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin' || req.user.role === 'shop_staff') {
    if (product.shop.toString() !== req.user.shop.toString()) {
      throw new AppError('You can only delete products from your own shop', 403);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get products pending approval
// @route   GET /api/admin/products/pending
// @access  Private (Admin, Moderator)
const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $or: [
      { status: 'pending_review' },
      { 'approvalStatus.status': 'pending' }
    ]
  })
    .populate('shop', 'name')
    .populate('category', 'name')
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Toggle product featured status
// @route   PATCH /api/admin/products/:id/featured
// @access  Private (Admin, Shop Owners for their products)
const toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // 🔒 Shop owners can only update their own products
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin' || req.user.role === 'shop_staff') {
    if (product.shop.toString() !== req.user.shop.toString()) {
      throw new AppError('You can only update products from your own shop', 403);
    }
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`,
    data: product
  });
});

// @desc    Bulk update products
// @route   PATCH /api/admin/products/bulk-update
// @access  Private (Admin)
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Product IDs array is required', 400);
  }

  if (!updates || typeof updates !== 'object') {
    throw new AppError('Updates object is required', 400);
  }

  // Only allow certain fields to be bulk updated
  const allowedFields = ['status', 'isFeatured', 'isOCOP'];
  const updateData = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = updates[key];
    }
  });

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: updateData }
  );

  res.status(200).json({
    success: true,
    message: `Updated ${result.modifiedCount} products`,
    data: result
  });
});

// @desc    Get product statistics
// @route   GET /api/admin/products/stats
// @access  Private (Admin)
const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ status: 'active' });
  const pendingProducts = await Product.countDocuments({ status: 'pending_review' });
  const rejectedProducts = await Product.countDocuments({ status: 'rejected' });
  const ocopProducts = await Product.countDocuments({ isOCOP: true });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });
  const outOfStock = await Product.countDocuments({ stock: 0 });

  // Products by shop
  const productsByShop = await Product.aggregate([
    {
      $group: {
        _id: '$shop',
        count: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        avgRating: { $avg: '$rating.average' }
      }
    },
    {
      $lookup: {
        from: 'shops',
        localField: '_id',
        foreignField: '_id',
        as: 'shop'
      }
    },
    { $unwind: '$shop' },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Top categories
  const topCategories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalProducts,
        activeProducts,
        pendingProducts,
        rejectedProducts,
        ocopProducts,
        featuredProducts,
        outOfStock
      },
      productsByShop,
      topCategories
    }
  });
});

module.exports = {
  getAllProductsAdmin,
  approveProduct,
  verifyOCOP,
  updateProductStatus,
  deleteProductAdmin,
  getPendingProducts,
  toggleFeatured,
  bulkUpdateProducts,
  getProductStats
};
