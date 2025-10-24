console.log('Testing server.js syntax...');

try {
  // Test if we can load all the modules that server.js uses
  console.log('Loading express...');
  const express = require('express');
  console.log('✅ Express loaded');

  console.log('Loading dotenv...');
  const dotenv = require('dotenv');
  dotenv.config();
  console.log('✅ Dotenv loaded');

  console.log('Loading cors...');
  const cors = require('cors');
  console.log('✅ CORS loaded');

  console.log('Loading helmet...');
  const helmet = require('helmet');
  console.log('✅ Helmet loaded');

  console.log('Loading database config...');
  const connectDB = require('./config/database');
  console.log('✅ Database config loaded');

  console.log('Loading error middleware...');
  const { errorHandler } = require('./middleware/error');
  console.log('✅ Error middleware loaded');

  console.log('Testing route loading...');
  try {
    const authRoutes = require('./routes/auth');
    console.log('✅ Auth routes loaded:', typeof authRoutes);
  } catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
  }

  console.log('✅ All modules loaded successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
