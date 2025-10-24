const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
console.log('Loading environment from:', path.join(__dirname, '.env'));
dotenv.config({ path: './.env' });

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

console.log('Testing MongoDB connection...');
const mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}
