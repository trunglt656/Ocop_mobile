const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler, AppError } = require('../middleware/error');
const { paginateResults } = require('../utils/helpers');

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    featured,
    status
  } = req.query;

  let query = {};
  
  // Only filter by status if explicitly provided
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by featured
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
  }

  // Search functionality
  let products;
  if (search) {
    products = await Product.search(search, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort
    });
  } else {
    const { query: productQuery } = paginateResults(Product, query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'category', select: 'name' },
        { path: 'createdBy', select: 'name email' }
      ]
    });
    products = await productQuery;
  }

  // Get total count for pagination
  const totalCount = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name description');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const products = await Product.getByCategory(req.params.categoryId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort
  });

  const totalCount = await Product.countDocuments({
    category: req.params.categoryId,
    status: 'active'
  });

  res.status(200).json({
    success: true,
    category,
    count: products.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: products
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Add user to product (for admin tracking)
  req.body.createdBy = req.user._id;
  // If shop_owner or shop_admin, ensure product is created for their own shop
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin') {
    if (!req.user.shop) throw new AppError('Shop affiliation required for shop user', 403);
    req.body.shop = req.user.shop;
  }

  const product = await Product.create(req.body);

  // Update category product count
  await Category.findByIdAndUpdate(
    product.category,
    { $inc: { productCount: 1 } }
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // If shop_owner or shop_admin, only allow update if product belongs to their shop
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin') {
    if (!req.user.shop) {
      throw new AppError('Shop affiliation required', 403);
    }
    // If product has a shop, it must match user's shop
    if (product.shop && product.shop.toString() !== req.user.shop.toString()) {
      throw new AppError('Not authorized to update this product', 403);
    }
    // If product doesn't have a shop, assign user's shop
    if (!product.shop) {
      req.body.shop = req.user.shop;
    }
  }

  // Check if category is being changed
  const categoryChanged = req.body.category && req.body.category !== product.category.toString();

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name');

  // Update category product counts if category changed
  if (categoryChanged) {
    await Category.findByIdAndUpdate(
      product.category._id,
      { $inc: { productCount: 1 } }
    );
    // Decrease count for old category
    await Category.findByIdAndUpdate(
      req.body.oldCategory || product.category._id,
      { $inc: { productCount: -1 } }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // If shop_owner or shop_admin, only allow delete if product belongs to their shop
  if (req.user.role === 'shop_owner' || req.user.role === 'shop_admin') {
    if (!req.user.shop) {
      throw new AppError('Shop affiliation required', 403);
    }
    // If product has a shop, it must match user's shop
    if (product.shop && product.shop.toString() !== req.user.shop.toString()) {
      throw new AppError('Not authorized to delete this product', 403);
    }
  }

  // Update category product count
  await Category.findByIdAndUpdate(
    product.category,
    { $inc: { productCount: -1 } }
  );

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({
    isFeatured: true,
    status: 'active'
  })
  .populate('category', 'name')
  .sort('-rating.average -totalSold')
  .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get OCOP products
// @route   GET /api/products/ocp
// @access  Public
const getOCOPProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, level, sort = '-createdAt' } = req.query;

  let query = { isOCOP: true, status: 'active' };

  if (level) {
    query.ocopLevel = level;
  }

  const { query: productQuery } = paginateResults(Product, query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: 'category'
  });

  const products = await productQuery;
  const totalCount = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: products
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const products = await Product.search(q, {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sort
  });

  const totalCount = await Product.countDocuments({
    status: 'active',
    $text: { $search: q }
  });

  res.status(200).json({
    success: true,
    query: q,
    count: products.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: products
  });
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        featuredCount: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        },
        ocopCount: {
          $sum: { $cond: ['$isOCOP', 1, 0] }
        }
      }
    }
  ]);

  const categoryStats = await Product.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
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
    {
      $project: {
        categoryName: { $arrayElemAt: ['$category.name', 0] },
        count: 1,
        averagePrice: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      general: stats[0] || {},
      byCategory: categoryStats
    }
  });
});

// @desc    Add certificate document to a product (Admin only)
// @route   POST /api/products/:id/certificates
// @access  Private/Admin
const addCertificate = asyncHandler(async (req, res) => {
  const { authority, number, issuedDate, expiryDate, notes } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!req.file) {
    throw new AppError('Certificate file is required', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const cert = {
    authority: authority || '',
    number: number || '',
    issuedDate: issuedDate ? new Date(issuedDate) : undefined,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    notes: notes || '',
    file: {
      url: fileUrl,
      filename: req.file.filename
    },
    verified: false
  };

  product.certificates = product.certificates || [];
  product.certificates.push(cert);

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Certificate added to product',
    data: product.certificates[product.certificates.length - 1]
  });
});

// @desc    Verify a product certificate (Admin only)
// @route   PUT /api/products/:id/certificates/:certId/verify
// @access  Private/Admin
const verifyCertificate = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const cert = product.certificates.id(req.params.certId);
  if (!cert) {
    throw new AppError('Certificate not found', 404);
  }

  cert.verified = true;
  cert.verifiedBy = req.user._id;
  cert.verifiedAt = new Date();

  // Optionally mark producerVerified at product level
  product.producerVerified = true;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Certificate verified',
    data: cert
  });
});

module.exports = {
  getProducts,
  getProduct,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getOCOPProducts,
  searchProducts,
  getProductStats
  ,addCertificate,
  verifyCertificate
};
