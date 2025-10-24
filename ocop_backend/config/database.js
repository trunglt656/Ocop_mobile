const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('📍 MongoDB URI is configured');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`🔗 Port: ${conn.connection.port}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('🔍 Error Details:');
    console.error('   Message:', error.message);
    console.error('   Name:', error.name);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 Possible Issues:');
      console.error('   - Network connectivity problems');
      console.error('   - Incorrect MongoDB connection string');
      console.error('   - MongoDB Atlas IP whitelist restrictions');
      console.error('   - Database authentication issues');
      console.error('   - Database might be down');
      console.error('');
      console.error('🔧 Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas credentials');
      console.error('   3. Add your IP to MongoDB Atlas Network Access');
      console.error('   4. Or use a local MongoDB instance for development');
    }

    if (error.name === 'MongoParseError') {
      console.error('💡 MongoDB URI Format Issue:');
      console.error('   - Check if the connection string is properly formatted');
      console.error('   - Verify username and password are URL encoded');
      console.error('   - Ensure the database name is included');
    }

    console.error('🚨 Server will continue without database connection');
    console.error('📝 Please fix the MongoDB configuration to use full functionality');
    console.error('💡 Tip: Use local MongoDB for development:');
    console.error('   MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce');

    // Don't exit the process, let the user see the error and continue
    // process.exit(1);
  }
};

module.exports = connectDB;
