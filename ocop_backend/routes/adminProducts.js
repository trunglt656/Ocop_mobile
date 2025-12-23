const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission, canVerifyOCOP } = require('../middleware/permissions');
const {
  getAllProductsAdmin,
  approveProduct,
  verifyOCOP,
  updateProductStatus,
  deleteProductAdmin,
  getPendingProducts,
  toggleFeatured,
  bulkUpdateProducts,
  getProductStats
} = require('../controllers/adminProductController');

const router = express.Router();

// All routes require authentication
// Shop owners, shop admins, shop staff can access their own products
// Admin and moderator can access all products
router.use(protect);
router.use(authorize('admin', 'moderator', 'shop_owner', 'shop_admin', 'shop_staff'));

// @route   GET /api/admin/products
// @desc    Get all products (filtered by shop for shop roles)
// @access  Admin, Moderator, Shop Owners, Shop Admins, Shop Staff
router.get('/', getAllProductsAdmin);

// @route   GET /api/admin/products/pending
// @desc    Get products pending approval
// @access  Admin, Moderator, Shop Owners
router.get('/pending', authorize('admin', 'moderator', 'shop_owner'), getPendingProducts);

// @route   GET /api/admin/products/stats
// @desc    Get product statistics
// @access  Admin only
router.get('/stats', authorize('admin'), getProductStats);

// @route   PATCH /api/admin/products/:id/approve
// @desc    Approve or reject product
router.patch('/:id/approve', checkPermission('products', 'approve'), approveProduct);

// @route   PATCH /api/admin/products/:id/verify-ocop
// @desc    Verify OCOP certificate
router.patch('/:id/verify-ocop', canVerifyOCOP, verifyOCOP);

// @route   PATCH /api/admin/products/:id/status
// @desc    Update product status (admin override)
router.patch('/:id/status', authorize('admin'), updateProductStatus);

// @route   PATCH /api/admin/products/:id/featured
// @desc    Toggle featured status
router.patch('/:id/featured', authorize('admin'), toggleFeatured);

// @route   PATCH /api/admin/products/bulk-update
// @desc    Bulk update products
router.patch('/bulk-update', authorize('admin'), bulkUpdateProducts);

// @route   DELETE /api/admin/products/:id
// @desc    Delete product (admin only)
router.delete('/:id', authorize('admin'), checkPermission('products', 'delete'), deleteProductAdmin);

module.exports = router;
