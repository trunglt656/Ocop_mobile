const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@ocop.vn' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@ocop.vn',
      phone: '0123456789',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phoneVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ocop.vn');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createAdminUser();
