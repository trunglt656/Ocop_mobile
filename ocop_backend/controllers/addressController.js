const Address = require('../models/Address');
const { asyncHandler, AppError } = require('../middleware/error');

// @desc    Get user's addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.getUserAddresses(req.user._id);

  res.status(200).json({
    success: true,
    count: addresses.length,
    data: addresses
  });
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
const getAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to access this address', 403);
  }

  res.status(200).json({
    success: true,
    data: address
  });
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  // Add user to address
  req.body.user = req.user._id;

  const address = await Address.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: address
  });
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  let address = await Address.findById(req.params.id);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this address', 403);
  }

  address = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: address
  });
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this address', 403);
  }

  await Address.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Check if address belongs to user
  if (address.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this address', 403);
  }

  // Set as default (this will automatically unset other defaults)
  address.isDefault = true;
  await address.save();

  res.status(200).json({
    success: true,
    message: 'Default address set successfully',
    data: address
  });
});

// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
const getDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.getDefaultAddress(req.user._id);

  if (!address) {
    throw new AppError('No default address found', 404);
  }

  res.status(200).json({
    success: true,
    data: address
  });
});

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
};
