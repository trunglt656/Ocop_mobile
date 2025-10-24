const express = require('express');
const { body, param } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

// Cart routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/', addToCartValidation, handleValidationErrors, addToCart);
router.put('/:productId', productIdValidation.concat(updateCartItemValidation), handleValidationErrors, updateCartItem);
router.delete('/:productId', productIdValidation, handleValidationErrors, removeFromCart);
router.delete('/', clearCart);

module.exports = router;
