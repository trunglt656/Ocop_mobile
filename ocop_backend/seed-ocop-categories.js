const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const ocopCategories = [
  {
    name: 'Thực phẩm',
    description: 'Các sản phẩm thực phẩm OCOP như gạo, rau củ quả, thịt, cá...',
    icon: '🍚',
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'Đồ uống',
    description: 'Các loại đồ uống như trà, cà phê, nước ép, rượu...',
    icon: '🍵',
    sortOrder: 2,
    isActive: true
  },
  {
    name: 'Dược liệu và sản phẩm từ dược liệu',
    description: 'Dược liệu thiên nhiên và các sản phẩm chế biến từ dược liệu',
    icon: '🌿',
    sortOrder: 3,
    isActive: true
  },
  {
    name: 'Thủ công mỹ nghệ',
    description: 'Các sản phẩm thủ công truyền thống như gốm sứ, thêu, mây tre đan...',
    icon: '🎨',
    sortOrder: 4,
    isActive: true
  },
  {
    name: 'Sinh vật cảnh',
    description: 'Cây cảnh, hoa, cá cảnh và các sinh vật cảnh khác',
    icon: '🌺',
    sortOrder: 5,
    isActive: true
  },
  {
    name: 'Dịch vụ du lịch cộng đồng, du lịch sinh thái và điểm du lịch',
    description: 'Các dịch vụ và điểm đến du lịch cộng đồng, sinh thái',
    icon: '🏞️',
    sortOrder: 6,
    isActive: true
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Xóa các danh mục cũ (nếu cần)
    const existingCount = await Category.countDocuments();
    console.log(`📊 Existing categories: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Found existing categories. Options:');
      console.log('   1. Keep existing and add new (default)');
      console.log('   2. Delete all and recreate');
      console.log('\n   Running option 1: Keep existing and add new only\n');
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const categoryData of ocopCategories) {
      const existing = await Category.findOne({ name: categoryData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${categoryData.name}" (already exists)`);
        skippedCount++;
      } else {
        const category = await Category.create(categoryData);
        console.log(`✅ Added: "${category.name}" (${category.icon})`);
        addedCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Added: ${addedCount} categories`);
    console.log(`⏭️  Skipped: ${skippedCount} categories`);
    console.log(`📊 Total: ${await Category.countDocuments()} categories\n`);

    // Display all categories
    const allCategories = await Category.find().sort({ sortOrder: 1 });
    console.log('=== ALL CATEGORIES ===');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.icon || '📦'} ${cat.name}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedCategories();
