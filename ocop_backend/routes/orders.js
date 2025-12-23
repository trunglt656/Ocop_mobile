const express = require('express');
const { body, param } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getOrderStats,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');
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
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updatePaymentStatusValidation = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
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
router.get('/', getOrders); // User can only see their own orders
router.get('/:id', orderIdValidation, handleValidationErrors, getOrder); // Check ownership in controller
router.post('/', createOrderValidation, handleValidationErrors, createOrder);
router.put('/:id/cancel', orderIdValidation.concat(cancelOrderValidation), handleValidationErrors, cancelOrder);

// Admin & Shop Admin routes
router.use(authorize('admin', 'shop_admin'));

// Admin order management (shop_admin can only see their shop's orders)
router.get('/admin/all', getAllOrders);
router.get('/admin/stats', getOrderStats);

// Admin only routes
router.use(authorize('admin'));
router.put('/:id/status', orderIdValidation.concat(updateOrderStatusValidation), handleValidationErrors, updateOrderStatus);
router.put('/:id/payment', orderIdValidation.concat(updatePaymentStatusValidation), handleValidationErrors, updatePaymentStatus);

module.exports = router;
