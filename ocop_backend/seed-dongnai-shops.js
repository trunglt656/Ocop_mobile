const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Shop = require('./models/Shop');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// 6 shops tại Đồng Nai
const shopsData = [
  {
    name: 'Hạt Điều Lộc Ninh',
    slug: 'hat-dieu-loc-ninh-dn',
    description: 'Chuyên cung cấp hạt điều rang muối và các sản phẩm từ điều chất lượng cao',
    contact: {
      email: 'hatdieu@dongnaishop.vn',
      phone: '0251234567'
    },
    address: '123 Đường Phạm Văn Thuận, Phường Tân Phong, Thành phố Biên Hòa, Đồng Nai'
  },
  {
    name: 'Thủ Công Mỹ Nghệ Trảng Bom',
    slug: 'thu-cong-my-nghe-trang-bom',
    description: 'Sản xuất và cung cấp đồ thủ công mỹ nghệ từ mây tre đan, gốm sứ',
    contact: {
      email: 'thucong@dongnaishop.vn',
      phone: '0251234568'
    },
    address: '456 Quốc lộ 1A, Xã Trảng Bom, Huyện Trảng Bom, Đồng Nai'
  },
  {
    name: 'Dược Liệu Định Quán',
    slug: 'duoc-lieu-dinh-quan',
    description: 'Cung cấp dược liệu sạch và các sản phẩm từ thảo dược thiên nhiên',
    contact: {
      email: 'duoclieu@dongnaishop.vn',
      phone: '0251234569'
    },
    address: '789 Đường Hùng Vương, Thị trấn Định Quán, Huyện Định Quán, Đồng Nai'
  },
  {
    name: 'Nông Sản Cẩm Mỹ',
    slug: 'nong-san-cam-my',
    description: 'Chuyên cung cấp trái cây sấy khô, mứt, và các sản phẩm từ nông sản',
    contact: {
      email: 'nongsan@dongnaishop.vn',
      phone: '0251234570'
    },
    address: '321 Đường Võ Thị Sáu, Thị trấn Cẩm Mỹ, Huyện Cẩm Mỹ, Đồng Nai'
  },
  {
    name: 'Du Lịch Sinh Thái Tân Phú',
    slug: 'du-lich-sinh-thai-tan-phu',
    description: 'Dịch vụ du lịch cộng đồng, homestay và trải nghiệm văn hóa địa phương',
    contact: {
      email: 'dulich@dongnaishop.vn',
      phone: '0251234571'
    },
    address: '654 Đường Hồ Chí Minh, Xã Tân Phú, Huyện Tân Phú, Đồng Nai'
  },
  {
    name: 'Sinh Vật Cảnh Long Thành',
    slug: 'sinh-vat-canh-long-thanh',
    description: 'Cung cấp cây cảnh, hoa lan và các loài sinh vật cảnh đặc sản',
    contact: {
      email: 'caycanh@dongnaishop.vn',
      phone: '0251234572'
    },
    address: '987 Quốc lộ 51, Thị trấn Long Thành, Huyện Long Thành, Đồng Nai'
  }
];

// Hàm tạo mô tả sản phẩm từ tên file
function generateProductDescription(filename) {
  const descriptions = [
    'Sản phẩm OCOP chất lượng cao, được sản xuất theo quy trình nghiêm ngặt.',
    'Đạt chuẩn OCOP 3 sao, an toàn cho sức khỏe người tiêu dùng.',
    'Sản phẩm thủ công truyền thống kết hợp công nghệ hiện đại.',
    'Nguyên liệu tự nhiên 100%, không chất bảo quản.',
    'Được chứng nhận OCOP, đảm bảo chất lượng và nguồn gốc xuất xứ.',
    'Sản phẩm đặc sản Đồng Nai, mang đậm hương vị địa phương.',
    'Chế biến từ nguyên liệu sạch, an toàn tuyệt đối.',
    'Đóng gói kỹ càng, bảo quản tốt, giữ nguyên hương vị.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Hàm tạo giá ngẫu nhiên theo loại sản phẩm
function generatePrice(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('tour') || name.includes('dịch vụ') || name.includes('trải nghiệm')) {
    return Math.floor(Math.random() * (1500000 - 300000) + 300000); // 300k-1.5M
  }
  if (name.includes('cây') || name.includes('bonsai') || name.includes('lan')) {
    return Math.floor(Math.random() * (500000 - 50000) + 50000); // 50k-500k
  }
  if (name.includes('rượu') || name.includes('mật ong')) {
    return Math.floor(Math.random() * (300000 - 80000) + 80000); // 80k-300k
  }
  if (name.includes('dược liệu') || name.includes('cao') || name.includes('viên')) {
    return Math.floor(Math.random() * (200000 - 50000) + 50000); // 50k-200k
  }
  
  return Math.floor(Math.random() * (150000 - 20000) + 20000); // 20k-150k
}

// Hàm xác định danh mục từ tên sản phẩm (theo DANH_SACH_SAN_PHAM.md)
async function getCategoryForProduct(productName) {
  const name = productName.toLowerCase();
  const categories = await Category.find();
  
  // 1. Dịch vụ du lịch - Ưu tiên cao nhất
  if (name.includes('tour') || name.includes('homestay') || name.includes('trải nghiệm') || 
      name.includes('workshop') || name.includes('điểm du lịch') || name.includes('điểm picnic') ||
      name.includes('điểm chụp') || name.includes('dịch vụ') || name.includes('cắm trại')) {
    return categories.find(c => c.name.includes('du lịch'))._id;
  }
  
  // 2. Sinh vật cảnh
  if (name.includes('cây') || name.includes('bonsai') || name.includes('lan') || 
      name.includes('chậu') || name.includes('terrarium') || name.includes('thủy canh')) {
    return categories.find(c => c.name.includes('Sinh vật cảnh'))._id;
  }
  
  // 3. Thủ công mỹ nghệ
  if (name.includes('mây tre') || name.includes('gốm') || name.includes('thủ công') || 
      name.includes('tranh') || name.includes('đan lát') || name.includes('móc len') ||
      name.includes('gỗ') || name.includes('khắc') || name.includes('chạm') ||
      name.includes('thêu') || name.includes('decor') || name.includes('trang trí') ||
      name.includes('lọ hoa') || name.includes('khay') || name.includes('giỏ') ||
      name.includes('trống') || name.includes('tượng') || name.includes('khung') ||
      name.includes('thớt') || name.includes('đèn') || name.includes('quạt') ||
      name.includes('hộp gỗ') || name.includes('túi vải') || name.includes('vòng tay') ||
      (name.includes('bình') && name.includes('rượu')) ||
      (name.includes('bánh kẹo') && name.includes('artisan')) ||
      (name.includes('kẹo') && name.includes('gói thủ công'))) {
    return categories.find(c => c.name.includes('Thủ công'))._id;
  }
  
  // 4. Dược liệu và sản phẩm từ dược liệu
  if (name.includes('cao ') || name.includes('bột nghệ') || name.includes('bột tỏi') ||
      name.includes('bột tam') || name.includes('bột gừng') || name.includes('bột nấm') ||
      name.includes('viên nang') || name.includes('viên bổ') || name.includes('viên sủi') ||
      name.includes('tinh dầu') || name.includes('dầu xoa') || name.includes('dầu gội') ||
      name.includes('thuốc') || name.includes('xà phòng thảo') || name.includes('gel bôi') ||
      name.includes('tinh chất') || name.includes('dược liệu') || name.includes('thảo dược') ||
      name.includes('dung dịch') || name.includes('túi thảo') || name.includes('gói chườm') ||
      name.includes('mặt nạ') || name.includes('hũ thảo') || name.includes('si rô bổ') ||
      (name.includes('trà') && (name.includes('an xoa') || name.includes('chè vằng'))) ||
      (name.includes('mật ong') && name.includes('thảo dược'))) {
    return categories.find(c => c.name.includes('Dược liệu'))._id;
  }
  
  // 5. Đồ uống
  if (name.includes('cà phê') || name.includes('coffee') || name.includes('bia') ||
      name.includes('rượu') || name.includes('nước ép') || name.includes('nước yến') ||
      name.includes('nước mía') || name.includes('siro') || name.includes('sữa') ||
      name.includes('kombucha') || name.includes('nước nha') || 
      (name.includes('trà') && !name.includes('thảo dược')) ||
      (name.includes('nước') && (name.includes('chai') || name.includes('lon') || name.includes('đóng'))) ||
      (name.includes('đồ uống') && name.includes('bột'))) {
    return categories.find(c => c.name.includes('Đồ uống'))._id;
  }
  
  // 6. Thực phẩm (default cho phần còn lại)
  return categories.find(c => c.name.includes('Thực phẩm'))._id;
}

async function seedShopsAndProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy danh sách file hình ảnh
    const imagesDir = 'D:\\DATN\\ocop_demo\\ocop_frontend\\assets\\ocop_dongnai_images';
    const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));
    console.log(`📸 Found ${imageFiles.length} product images\n`);

    if (imageFiles.length < 200) {
      console.log('⚠️  Warning: Less than 200 images found!');
    }

    let createdShops = 0;
    let createdProducts = 0;
    const productsPerShop = Math.ceil(imageFiles.length / shopsData.length);

    // Tạo shops và products
    for (let i = 0; i < shopsData.length; i++) {
      const shopData = shopsData[i];
      
      // Kiểm tra shop đã tồn tại chưa
      let shop = await Shop.findOne({ slug: shopData.slug });
      
      if (!shop) {
        // Tạo user cho shop
        const ownerEmail = shopData.contact.email;
        let owner = await User.findOne({ email: ownerEmail });
        
        if (!owner) {
          owner = await User.create({
            name: `Chủ ${shopData.name}`,
            email: ownerEmail,
            phone: shopData.contact.phone,
            password: 'password123',
            role: 'shop_owner',
            isActive: true
          });
          console.log(`👤 Created user: ${owner.email}`);
        }

        // Tạo shop
        shop = await Shop.create({
          ...shopData,
          owner: owner._id,
          status: 'active',
          isVerified: true,
          rating: {
            average: 4.5 + Math.random() * 0.5,
            count: Math.floor(Math.random() * 50) + 10
          }
        });

        // Cập nhật user với shop info
        owner.shop = shop._id;
        owner.shopRole = 'owner';
        await owner.save();

        console.log(`✅ Created shop: ${shop.name}`);
        createdShops++;
      } else {
        console.log(`⏭️  Shop exists: ${shop.name}`);
      }

      // Tạo products cho shop này
      const startIdx = i * productsPerShop;
      const endIdx = Math.min(startIdx + productsPerShop, imageFiles.length);
      const shopImages = imageFiles.slice(startIdx, endIdx);

      console.log(`\n📦 Creating ${shopImages.length} products for ${shop.name}...`);

      for (const imageFile of shopImages) {
        const productName = imageFile.replace('.jpg', '');
        
        // Kiểm tra sản phẩm đã tồn tại chưa
        const existing = await Product.findOne({ 
          name: productName,
          shop: shop._id 
        });

        if (existing) {
          console.log(`   ⏭️  Product exists: ${productName}`);
          continue;
        }

        const price = generatePrice(productName);
        const category = await getCategoryForProduct(productName);
        const imagePath = `/ocop_dongnai_images/${imageFile}`;

        const product = await Product.create({
          name: productName,
          description: generateProductDescription(productName),
          shop: shop._id,
          category: category,
          price: price,
          originalPrice: Math.floor(price * 1.2),
          stock: Math.floor(Math.random() * 100) + 20,
          images: [{
            url: imagePath,
            alt: productName,
            isPrimary: true
          }],
          status: 'active',
          isOCOP: true,
          ocopLevel: ['3 sao', '4 sao', '5 sao'][Math.floor(Math.random() * 3)],
          approvalStatus: {
            status: 'approved',
            reviewedAt: new Date()
          },
          rating: {
            average: 4 + Math.random(),
            count: Math.floor(Math.random() * 20)
          },
          sold: Math.floor(Math.random() * 50),
          createdBy: shop.owner,
          producer: {
            name: shop.name,
            phone: shop.contact.phone,
            email: shop.contact.email
          },
          origin: {
            province: 'Đồng Nai',
            district: shop.address.split(',')[2]?.trim() || 'Biên Hòa',
            address: shop.address
          }
        });

        console.log(`   ✅ ${productName} - ${price.toLocaleString('vi-VN')}đ`);
        createdProducts++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Shops created: ${createdShops}`);
    console.log(`✅ Products created: ${createdProducts}`);
    console.log(`📊 Total shops: ${await Shop.countDocuments()}`);
    console.log(`📊 Total products: ${await Product.countDocuments()}`);

    // Hiển thị thông tin các shop
    console.log('\n=== SHOP ACCOUNTS ===');
    const allShops = await Shop.find().populate('owner', 'email');
    allShops.forEach((shop, index) => {
      const owner = shop.owner;
      console.log(`\n${index + 1}. ${shop.name}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Password: password123`);
      console.log(`   Address: ${shop.address.street}, ${shop.address.district}, ${shop.address.province}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedShopsAndProducts();
