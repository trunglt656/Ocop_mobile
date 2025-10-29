const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Address = require('./models/Address');
const Favorite = require('./models/Favorite');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleCategories = [
  {
    name: 'Trái cây',
    icon: '🍊',
    description: 'Các loại trái cây tươi ngon từ nông dân Đồng Nai',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Hạt & Đậu',
    icon: '🥜',
    description: 'Hạt và đậu các loại chất lượng cao',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Kẹo & Bánh',
    icon: '🍬',
    description: 'Kẹo và bánh truyền thống Việt Nam',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Thực phẩm khác',
    icon: '🍽️',
    description: 'Các sản phẩm thực phẩm đặc sản khác',
    isActive: true,
    sortOrder: 4
  }
];

const sampleProducts = [
  {
    name: 'Bưởi da xanh Đồng Nai',
    description: 'Bưởi da xanh đặc sản Đồng Nai, vỏ mỏng, múi mọng nước, vị ngọt thanh tự nhiên. Sản phẩm OCOP 4 sao được chứng nhận chất lượng cao.',
    shortDescription: 'Bưởi da xanh đặc sản Đồng Nai, OCOP 4 sao',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    sku: 'BDX-DN-001',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop',
        alt: 'Bưởi da xanh Đồng Nai',
        isPrimary: true
      }
    ],
    weight: 1.2,
    unit: 'kg',
    stock: 100,
    minStock: 10,
    status: 'active',
    isFeatured: true,
    isOCOP: true,
    ocopLevel: '4 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Long Khánh',
      address: 'Xã Bàu Sen'
    },
    producer: {
      name: 'HTX Bưởi Da Xanh Long Khánh',
      phone: '0987654321',
      email: 'htxbuoi@gmail.com'
    },
    specifications: [
      { name: 'Kích thước', value: 'Đường kính 20-25cm' },
      { name: 'Trọng lượng', value: '1.0-1.5kg' },
      { name: 'Bảo quản', value: 'Nơi khô ráo, thoáng mát' }
    ],
    tags: ['OCOP', 'Đồng Nai', 'Trái cây', 'Tự nhiên', '4 sao'],
    rating: { average: 4.5, count: 25 },
    totalSold: 150,
    seo: {
      metaTitle: 'Bưởi da xanh Đồng Nai - Đặc sản OCOP 4 sao',
      metaDescription: 'Bưởi da xanh đặc sản Đồng Nai, sản phẩm OCOP 4 sao, vỏ mỏng, múi mọng nước',
      slug: 'buoi-da-xanh-dong-nai-ocop'
    }
  },
  {
    name: 'Cacao nguyên chất Đồng Nai',
    description: 'Bột cacao nguyên chất từ hạt cacao Đồng Nai, không đường, giữ nguyên hương vị tự nhiên. Sản phẩm OCOP 3 sao.',
    shortDescription: 'Bột cacao nguyên chất Đồng Nai, OCOP 3 sao',
    price: 120000,
    originalPrice: 150000,
    discount: 20,
    sku: 'CAC-DN-001',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop',
        alt: 'Cacao nguyên chất Đồng Nai',
        isPrimary: true
      }
    ],
    weight: 0.5,
    unit: 'kg',
    stock: 50,
    minStock: 5,
    status: 'active',
    isFeatured: true,
    isOCOP: true,
    ocopLevel: '3 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Định Quán',
      address: 'Xã Ngọc Định'
    },
    producer: {
      name: 'HTX Cacao Định Quán',
      phone: '0987654322',
      email: 'htxcacao@gmail.com'
    },
    specifications: [
      { name: 'Thành phần', value: '100% cacao nguyên chất' },
      { name: 'Xuất xứ', value: 'Đồng Nai' },
      { name: 'Bảo quản', value: 'Nơi khô ráo, tránh ánh nắng' }
    ],
    tags: ['OCOP', 'Cacao', 'Nguyên chất', '3 sao'],
    rating: { average: 4.8, count: 18 },
    totalSold: 80,
    seo: {
      metaTitle: 'Cacao nguyên chất Đồng Nai - OCOP 3 sao',
      metaDescription: 'Bột cacao nguyên chất từ hạt cacao Đồng Nai, không đường, giữ nguyên hương vị tự nhiên',
      slug: 'cacao-nguyen-chat-dong-nai-ocop'
    }
  },
  {
    name: 'Đậu phộng rang tỏi ớt',
    description: 'Đậu phộng rang giòn với tỏi và ớt, hương vị đậm đà đặc trưng. Sản phẩm truyền thống Đồng Nai.',
    shortDescription: 'Đậu phộng rang tỏi ớt đặc sản Đồng Nai',
    price: 35000,
    originalPrice: 40000,
    discount: 12.5,
    sku: 'DPH-DN-001',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
        alt: 'Đậu phộng rang tỏi ớt',
        isPrimary: true
      }
    ],
    weight: 0.3,
    unit: 'kg',
    stock: 75,
    minStock: 10,
    status: 'active',
    isFeatured: false,
    isOCOP: true,
    ocopLevel: '3 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Vĩnh Cửu',
      address: 'Thị trấn Vĩnh An'
    },
    producer: {
      name: 'HTX Đậu Phộng Vĩnh Cửu',
      phone: '0987654323',
      email: 'htxdauphong@gmail.com'
    },
    specifications: [
      { name: 'Thành phần', value: 'Đậu phộng, tỏi, ớt, muối' },
      { name: 'Bảo quản', value: 'Nơi khô ráo, thoáng mát' }
    ],
    tags: ['OCOP', 'Đậu phộng', 'Rang', 'Tỏi ớt'],
    rating: { average: 4.3, count: 32 },
    totalSold: 200,
    seo: {
      metaTitle: 'Đậu phộng rang tỏi ớt Đồng Nai - Đặc sản OCOP',
      metaDescription: 'Đậu phộng rang giòn với tỏi và ớt, hương vị đậm đà đặc trưng Đồng Nai',
      slug: 'dau-phong-rang-toi-ot-dong-nai'
    }
  },
  {
    name: 'Kẹo dừa Bến Tre',
    description: 'Kẹo dừa truyền thống Bến Tre, vị ngọt thanh, dẻo dai. Sản phẩm OCOP 4 sao.',
    shortDescription: 'Kẹo dừa truyền thống Bến Tre, OCOP 4 sao',
    price: 55000,
    originalPrice: 55000,
    discount: 0,
    sku: 'KDO-BT-001',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
        alt: 'Kẹo dừa Bến Tre',
        isPrimary: true
      }
    ],
    weight: 0.5,
    unit: 'kg',
    stock: 60,
    minStock: 8,
    status: 'active',
    isFeatured: true,
    isOCOP: true,
    ocopLevel: '4 sao',
    origin: {
      province: 'Bến Tre',
      district: 'Chợ Lách',
      address: 'Xã Vĩnh Thành'
    },
    producer: {
      name: 'HTX Kẹo Dừa Chợ Lách',
      phone: '0987654324',
      email: 'htxkeodua@gmail.com'
    },
    specifications: [
      { name: 'Thành phần', value: 'Dừa, đường, sữa' },
      { name: 'Bảo quản', value: 'Nơi khô ráo, tránh nắng' }
    ],
    tags: ['OCOP', 'Kẹo dừa', 'Bến Tre', '4 sao'],
    rating: { average: 4.6, count: 45 },
    totalSold: 120,
    seo: {
      metaTitle: 'Kẹo dừa Bến Tre - OCOP 4 sao',
      metaDescription: 'Kẹo dừa truyền thống Bến Tre, vị ngọt thanh, dẻo dai, sản phẩm OCOP 4 sao',
      slug: 'keo-dua-ben-tre-ocop'
    }
  },
  {
    name: 'Mật ong hoa cà phê',
    description: 'Mật ong nguyên chất từ hoa cà phê, màu vàng trong, vị ngọt thanh. Sản phẩm OCOP 3 sao.',
    shortDescription: 'Mật ong hoa cà phê nguyên chất, OCOP 3 sao',
    price: 180000,
    originalPrice: 200000,
    discount: 10,
    sku: 'MON-DN-001',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
        alt: 'Mật ong hoa cà phê',
        isPrimary: true
      }
    ],
    weight: 0.5,
    unit: 'l',
    stock: 40,
    minStock: 5,
    status: 'active',
    isFeatured: false,
    isOCOP: true,
    ocopLevel: '3 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Xuân Lộc',
      address: 'Xã Xuân Hưng'
    },
    producer: {
      name: 'HTX Ong Xuân Lộc',
      phone: '0987654325',
      email: 'htxong@gmail.com'
    },
    specifications: [
      { name: 'Nguồn gốc', value: 'Hoa cà phê' },
      { name: 'Độ tinh khiết', value: '100%' },
      { name: 'Bảo quản', value: 'Nơi khô ráo, thoáng mát' }
    ],
    tags: ['OCOP', 'Mật ong', 'Hoa cà phê', '3 sao'],
    rating: { average: 4.7, count: 28 },
    totalSold: 95,
    seo: {
      metaTitle: 'Mật ong hoa cà phê Đồng Nai - OCOP 3 sao',
      metaDescription: 'Mật ong nguyên chất từ hoa cà phê, màu vàng trong, vị ngọt thanh, OCOP 3 sao',
      slug: 'mat-ong-hoa-ca-phe-dong-nai'
    }
  }
];

const sampleUsers = [
  {
    name: 'Super Admin',
    email: 'admin@ocop.vn',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    phone: '0901234567',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    phone: '0901234568',
    role: 'user',
    isActive: true,
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

// Clear existing data and seed database
const seedDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Address.deleteMany(),
      Favorite.deleteMany()
    ]);

    console.log('✅ Existing data cleared');

    // Create categories
    console.log('🌱 Creating categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Update products with category references
    const productsWithCategories = sampleProducts.map(product => {
      let categoryName;
      if (product.name.includes('Bưởi')) {
          categoryName = 'Trái cây';
      } else if (product.name.includes('Đậu phộng')) {
          categoryName = 'Hạt & Đậu';
      } else if (product.name.includes('Kẹo')) {
          categoryName = 'Kẹo & Bánh';
      } else {
          categoryName = 'Thực phẩm khác'; // Fallback for Cacao, Mật ong etc.
      }
      
      const foundCategory = createdCategories.find(cat => cat.name === categoryName);
      
      return {
          ...product,
          category: foundCategory._id
      };
    });

    // Create products
    console.log('🌱 Creating products...');
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create users
    console.log('🌱 Creating users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Update category product counts
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount });
    }

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('   Admin: admin@ocop.vn / admin123');
    console.log('   User: nguyenvana@example.com / password');
    console.log('');
    console.log('🚀 You can now start the backend server with: npm start');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
const runSeeder = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Seeder interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Seeder terminated');
  process.exit(0);
});

if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase };
