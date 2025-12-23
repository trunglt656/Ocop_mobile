const express = require('express');
const { body, query, param } = require('express-validator');
const {
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
} = require('../controllers/productController');
const { addCertificate, verifyCertificate } = require('../controllers/productController');
const { uploadCertificate } = require('../utils/upload');
const { protect, authorize, checkShopOwnership, checkPermission } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and must be less than 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

const categoryIdValidation = [
  param('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required')
];

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/ocp', getOCOPProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', categoryIdValidation, handleValidationErrors, getProductsByCategory);
router.get('/:id', productIdValidation, handleValidationErrors, getProduct);

// Protected routes (platform admin or shop admin/owner)
router.use(protect);
// Allow both platform admin, shop_owner, and shop_admin; product controller will enforce shop ownership where needed
router.use(authorize('admin', 'shop_owner', 'shop_admin'));

// Create product - check shop ownership for shop_admin
router.post('/', 
  checkShopOwnership('shop'),
  createProductValidation, 
  handleValidationErrors, 
  createProduct
);

// Update product - check shop ownership for shop_admin
router.put('/:id', 
  checkShopOwnership('shop'),
  productIdValidation.concat(updateProductValidation), 
  handleValidationErrors, 
  updateProduct
);

// Delete product - check shop ownership for shop_admin
router.delete('/:id', 
  checkShopOwnership('shop'),
  productIdValidation, 
  handleValidationErrors, 
  deleteProduct
);

router.get('/admin/stats', getProductStats);

// Admin: add certificate to product
router.post('/:id/certificates', 
  productIdValidation, 
  uploadCertificate, 
  handleValidationErrors, 
  addCertificate
);

// Admin: verify certificate
router.put('/:id/certificates/:certId/verify', 
  [
    param('id').isMongoId().withMessage('Valid product ID is required'),
    param('certId').isMongoId().withMessage('Valid certificate ID is required')
  ], 
  handleValidationErrors, 
  verifyCertificate
);

module.exports = router;
