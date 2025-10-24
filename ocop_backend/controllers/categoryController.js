const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/error');
const { paginateResults } = require('../utils/helpers');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { parentOnly, includeProducts } = req.query;

  let query = {};
  if (parentOnly === 'true') {
    query.parentCategory = null;
  }

  const categories = await Category.find(query)
    .sort({ sortOrder: 1, name: 1 });

  if (includeProducts === 'true') {
    for (let category of categories) {
      const productCount = await Product.countDocuments({
        category: category._id,
        status: 'active'
      });
      category._doc.productCount = productCount;
    }
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.getCategoryTree();

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Get product count
  const productCount = await Product.countDocuments({
    category: req.params.id,
    status: 'active'
  });

  category._doc.productCount = productCount;

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    throw new AppError('Cannot delete category with existing products', 400);
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parentCategory: req.params.id });
  if (subcategoryCount > 0) {
    throw new AppError('Cannot delete category with subcategories', 400);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category products
// @route   GET /api/categories/:id/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const products = await Product.getByCategory(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort
  });

  const totalCount = await Product.countDocuments({
    category: req.params.id,
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

// @desc    Get popular categories
// @route   GET /api/categories/popular
// @access  Public
const getPopularCategories = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  // Get categories with most products
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    {
      $match: {
        isActive: true,
        productCount: { $gt: 0 }
      }
    },
    {
      $sort: { productCount: -1 }
    },
    {
      $limit: parseInt(limit)
    },
    {
      $project: {
        products: 0
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

module.exports = {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  getPopularCategories
};
