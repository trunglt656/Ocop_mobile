const express = require('express');
const { body, param } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getOrderStats,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('paymentMethod')
    .isIn(['cod', 'bank_transfer', 'e_wallet', 'credit_card'])
    .withMessage('Invalid payment method'),
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const cancelOrderValidation = [
  body('reason')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Cancellation reason is required and must be less than 200 characters')
];

const orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid order ID is required')
];

// User routes (require authentication)
router.use(protect);

// User order routes
router.get('/', getOrders);
router.get('/:id', orderIdValidation, handleValidationErrors, getOrder);
router.post('/', createOrderValidation, handleValidationErrors, createOrder);
router.put('/:id/cancel', orderIdValidation.concat(cancelOrderValidation), handleValidationErrors, cancelOrder);

// Admin routes (require admin role)
router.use(authorize('admin'));

// Admin order routes
router.get('/admin/all', getAllOrders);
router.get('/admin/stats', getOrderStats);
router.put('/:id/status', orderIdValidation.concat(updateOrderStatusValidation), handleValidationErrors, updateOrderStatus);

module.exports = router;
