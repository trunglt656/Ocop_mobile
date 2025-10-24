const express = require('express');
const { param } = require('express-validator');
const {
  getFavorites,
  checkFavorite,
  toggleFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/error');

const router = express.Router();

// All favorites routes require authentication
router.use(protect);

// Validation rules
const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

// Favorites routes
router.get('/', getFavorites);
router.get('/check/:productId', productIdValidation, handleValidationErrors, checkFavorite);
router.post('/:productId', productIdValidation, handleValidationErrors, toggleFavorite);

module.exports = router;
