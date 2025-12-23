const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function resetShopPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const shopEmails = [
      'hatdieu@dongnaishop.vn',
      'thucong@dongnaishop.vn',
      'duoclieu@dongnaishop.vn',
      'nongsan@dongnaishop.vn',
      'dulich@dongnaishop.vn',
      'caycanh@dongnaishop.vn'
    ];

    const newPassword = '123456';

    console.log('🔐 Resetting passwords for shop accounts...');
    console.log('New password:', newPassword, '\n');

    for (const email of shopEmails) {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      // Set plain password and let the pre-save middleware hash it
      user.password = newPassword;
      await user.save();

      // Re-fetch to test
      const updatedUser = await User.findOne({ email }).select('+password');
      const isMatch = await updatedUser.matchPassword(newPassword);
      
      console.log(`${isMatch ? '✅' : '❌'} ${email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password match test: ${isMatch}`);
      console.log('   ---');
    }

    console.log('\n✅ Password reset complete!');
    console.log('\n📋 Login credentials:');
    shopEmails.forEach(email => {
      console.log(`   ${email} / ${newPassword}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetShopPasswords();
