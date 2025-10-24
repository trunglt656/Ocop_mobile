const express = require('express');
const { body, param } = require('express-validator');
const {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// All address routes require authentication
router.use(protect);

// Validation rules
const createAddressValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name is required and must be less than 50 characters'),
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Valid phone number is required'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address is required and must be less than 200 characters'),
  body('ward')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ward is required and must be less than 50 characters'),
  body('district')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('District is required and must be less than 50 characters'),
  body('province')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Province is required and must be less than 50 characters')
];

const updateAddressValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be less than 50 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Valid phone number is required'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('ward')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ward must be less than 50 characters'),
  body('district')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('District must be less than 50 characters'),
  body('province')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Province must be less than 50 characters')
];

const addressIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid address ID is required')
];

// Address routes
router.get('/', getAddresses);
router.get('/default', getDefaultAddress);
router.get('/:id', addressIdValidation, handleValidationErrors, getAddress);
router.post('/', createAddressValidation, handleValidationErrors, createAddress);
router.put('/:id', addressIdValidation.concat(updateAddressValidation), handleValidationErrors, updateAddress);
router.delete('/:id', addressIdValidation, handleValidationErrors, deleteAddress);
router.put('/:id/default', addressIdValidation, handleValidationErrors, setDefaultAddress);

module.exports = router;
