console.log('🧪 Testing basic Node.js functionality...');

try {
  console.log('✅ Basic console output works');

  // Test environment variables
  require('dotenv').config({ path: './.env' });
  console.log('✅ dotenv loaded successfully');
  console.log('📋 Environment variables:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('   PORT:', process.env.PORT || 'not set');
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'configured' : 'not set');

  // Test Express
  const express = require('express');
  console.log('✅ Express loaded successfully');

  // Create simple server
  const app = express();
  console.log('✅ Express app created');

  // Simple route
  app.get('/test', (req, res) => {
    res.json({ message: 'Test successful!', timestamp: new Date().toISOString() });
  });

  console.log('✅ Route defined');

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🎉 Simple test server running on port ${PORT}`);
    console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  });

  console.log('✅ Server started successfully');

} catch (error) {
  console.error('❌ Error during testing:');
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
}
