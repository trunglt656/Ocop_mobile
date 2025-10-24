const express = require('express');
const { body, param } = require('express-validator');
const {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
  getPopularCategories
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name is required and must be less than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be less than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const categoryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid category ID is required')
];

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/popular', getPopularCategories);
router.get('/:id', categoryIdValidation, handleValidationErrors, getCategory);
router.get('/:id/products', categoryIdValidation, handleValidationErrors, getCategoryProducts);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createCategoryValidation, handleValidationErrors, createCategory);
router.put('/:id', categoryIdValidation.concat(updateCategoryValidation), handleValidationErrors, updateCategory);
router.delete('/:id', categoryIdValidation, handleValidationErrors, deleteCategory);

module.exports = router;
