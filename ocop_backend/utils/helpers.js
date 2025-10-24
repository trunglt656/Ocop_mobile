const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate OTP for verification
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OCOP${timestamp}${random}`;
};

// Generate SKU
const generateSKU = (prefix = 'OCOP') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

// Calculate discount price
const calculateDiscountPrice = (price, discount) => {
  if (discount > 0 && discount <= 100) {
    return price * (1 - discount / 100);
  }
  return price;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format currency (Vietnamese Dong)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Paginate results
const paginateResults = (model, query = {}, options = {}) => {
  const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
  const skip = (page - 1) * limit;

  return {
    query: model
      .find(query)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    page,
    limit,
    skip
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateOTP,
  generateSlug,
  generateOrderNumber,
  generateSKU,
  isValidEmail,
  isValidPhone,
  calculateDiscountPrice,
  calculateDistance,
  formatCurrency,
  paginateResults
};
