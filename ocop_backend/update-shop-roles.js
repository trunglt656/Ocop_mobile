const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function updateShopOwnerRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm tất cả các shop
    const shops = await Shop.find().populate('owner');
    console.log(`\n📦 Found ${shops.length} shops\n`);

    for (const shop of shops) {
      if (!shop.owner) {
        console.log(`⚠️  Shop "${shop.name}" has no owner`);
        continue;
      }

      const owner = await User.findById(shop.owner._id);
      if (!owner) {
        console.log(`⚠️  Owner not found for shop "${shop.name}"`);
        continue;
      }

      // Kiểm tra và cập nhật role
      const oldRole = owner.role;
      const needsUpdate = owner.role === 'user' || !owner.shop;

      if (needsUpdate) {
        owner.role = 'shop_owner';
        owner.shop = shop._id;
        owner.shopRole = 'owner';
        await owner.save();

        console.log(`✅ Updated: ${owner.email}`);
        console.log(`   Shop: ${shop.name}`);
        console.log(`   Role: ${oldRole} → shop_owner`);
        console.log(`   Shop linked: ${!!owner.shop}`);
        console.log('');
      } else {
        console.log(`✓  Already correct: ${owner.email}`);
        console.log(`   Shop: ${shop.name}`);
        console.log(`   Role: ${owner.role}`);
        console.log('');
      }
    }

    // Cập nhật admins của các shop
    for (const shop of shops) {
      if (shop.admins && shop.admins.length > 0) {
        for (const adminId of shop.admins) {
          const admin = await User.findById(adminId);
          if (admin && admin.role === 'user') {
            admin.role = 'shop_admin';
            admin.shop = shop._id;
            admin.shopRole = 'admin';
            await admin.save();
            console.log(`✅ Updated shop admin: ${admin.email} for shop "${shop.name}"`);
          }
        }
      }

      if (shop.staff && shop.staff.length > 0) {
        for (const staffId of shop.staff) {
          const staff = await User.findById(staffId);
          if (staff && staff.role === 'user') {
            staff.role = 'shop_staff';
            staff.shop = shop._id;
            staff.shopRole = 'staff';
            await staff.save();
            console.log(`✅ Updated shop staff: ${staff.email} for shop "${shop.name}"`);
          }
        }
      }
    }

    // Hiển thị tổng kết
    console.log('\n=== SUMMARY ===');
    const userCount = await User.countDocuments({ role: 'user' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const moderatorCount = await User.countDocuments({ role: 'moderator' });
    const shopOwnerCount = await User.countDocuments({ role: 'shop_owner' });
    const shopAdminCount = await User.countDocuments({ role: 'shop_admin' });
    const shopStaffCount = await User.countDocuments({ role: 'shop_staff' });

    console.log(`Users: ${userCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Moderators: ${moderatorCount}`);
    console.log(`Shop Owners: ${shopOwnerCount}`);
    console.log(`Shop Admins: ${shopAdminCount}`);
    console.log(`Shop Staff: ${shopStaffCount}`);

    // Hiển thị danh sách shop owners có thể đăng nhập
    console.log('\n=== SHOP OWNERS CAN LOGIN ===');
    const shopOwners = await User.find({ role: 'shop_owner' }).populate('shop', 'name');
    shopOwners.forEach(owner => {
      console.log(`✓ ${owner.email}`);
      console.log(`  Shop: ${owner.shop?.name || 'N/A'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done! All shop owners can now login to admin panel.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateShopOwnerRoles();
