require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('Error:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 This might be due to:');
      console.error('   - Network connectivity issues');
      console.error('   - Incorrect MongoDB URI');
      console.error('   - MongoDB Atlas IP whitelist restrictions');
      console.error('   - Database credentials issues');
    }
    process.exit(1);
  }
};

testConnection();
