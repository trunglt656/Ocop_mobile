const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getUserCart(req.user._id);

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Get user's cart
  let cart = await Cart.getUserCart(req.user._id);

  // Add item to cart
  await cart.addItem(productId, parseInt(quantity));

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  // Get user's cart
  const cart = await Cart.getUserCart(req.user._id);

  // Update item quantity
  await cart.updateItemQuantity(req.params.productId, parseInt(quantity));

  res.status(200).json({
    success: true,
    message: 'Cart item updated successfully',
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  // Get user's cart
  const cart = await Cart.getUserCart(req.user._id);

  // Remove item from cart
  await cart.removeItem(req.params.productId);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  // Get user's cart
  const cart = await Cart.getUserCart(req.user._id);

  // Clear cart
  await cart.clearCart();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
  });
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.getUserCart(req.user._id);

  const summary = {
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    discountAmount: cart.discountAmount,
    finalPrice: cart.finalPrice,
    itemCount: cart.items.length
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
};
