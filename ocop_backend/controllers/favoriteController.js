const Favorite = require('../models/Favorite');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const favorites = await Favorite.getUserFavorites(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  const totalCount = await Favorite.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    count: favorites.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page),
    data: favorites
  });
});

// @desc    Check if product is in favorites
// @route   GET /api/favorites/check/:productId
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const isFavorite = await Favorite.isFavorite(req.user._id, req.params.productId);

  res.status(200).json({
    success: true,
    isFavorite
  });
});

// @desc    Toggle favorite (add/remove)
// @route   POST /api/favorites/:productId
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const result = await Favorite.toggleFavorite(req.user._id, req.params.productId);

  res.status(200).json({
    success: true,
    message: result.action === 'added' ? 'Added to favorites' : 'Removed from favorites',
    data: result
  });
});

module.exports = {
  getFavorites,
  checkFavorite,
  toggleFavorite
};
