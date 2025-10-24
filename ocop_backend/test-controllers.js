// Test if controllers can be loaded
console.log('Testing controller imports...');

try {
  console.log('Loading dotenv...');
  require('dotenv').config();

  console.log('Loading auth controller...');
  const authController = require('./controllers/authController');
  console.log('✅ Auth controller loaded:', typeof authController);
  console.log('Auth functions:', Object.keys(authController));

  console.log('Loading product controller...');
  const productController = require('./controllers/productController');
  console.log('✅ Product controller loaded:', typeof productController);
  console.log('Product functions:', Object.keys(productController));

  console.log('Loading category controller...');
  const categoryController = require('./controllers/categoryController');
  console.log('✅ Category controller loaded:', typeof categoryController);
  console.log('Category functions:', Object.keys(categoryController));

  console.log('✅ All controllers loaded successfully');
} catch (error) {
  console.error('❌ Error loading controllers:', error.message);
  console.error('Stack:', error.stack);
}
