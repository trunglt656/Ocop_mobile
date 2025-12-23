const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Mapping dựa trên file DANH_SACH_SAN_PHAM.md
const productCategoryMapping = {
  'Thực phẩm': [
    'Mít sấy giòn', 'Chuối sấy khô', 'Dứa sấy lát', 'Khoai môn sấy',
    'Bánh phồng tôm', 'Kẹo dừa truyền thống', 'Mứt gừng', 'Mứt dừa',
    'Mứt chanh', 'Mứt mít', 'Hạt điều rang muối', 'Hạt điều tẩm vị (tỏi, ớt)',
    'Hạt bí rang muối', 'Hạt hướng dương tẩm mật ong', 'Ngũ cốc ăn sáng (mix hạt)',
    'Bánh bông lan trứng muối', 'Bánh quy bơ', 'Bánh mì khô vị mè',
    'Bánh phu thê đóng gói', 'Bánh tiêu truyền thống', 'Chả lụa (lọ chịu lạnh, đóng gói)',
    'Nem chua đặc sản (đóng gói bảo quản)', 'Cá khô một nắng', 'Mực khô tẩm gia vị',
    'Ruốc tômruốc cá', 'Tương ớt quê nhà (chai)', 'Tương cà chua (sốt)',
    'Nước mắm nhĩ truyền thống (chai)', 'Tổ yến sào đóng gói nhỏ', 'Bột ca cao nguyên chất',
    'Bột ca cao pha sẵn (gói)', 'Bột gạo lứt ăn liền', 'Bánh tráng mè (đóng gói)',
    'Chè khô (gói pha nhanh)', 'Sấy trái cây hỗn hợp (mix)', 'Mật ong rừng (chai)',
    'Mật ong hoa nhãn (chai)', 'Tỏi đen (hộp)', 'Nước cốt dừa đóng lon',
    'Bột nghệ hữu cơ', 'Bột sả ớt khô (gia vị)', 'Trà sấy trái cây (blend)',
    'Rượu trái cây truyền thống (chai nhỏ)', 'Bánh gạo lứt vị rong biển',
    'Cá viên chả cá chế biến sẵn (đóng gói)', 'Sốt me chua ngọt (chai)',
    'Nước sốt dưa chua (chai)', 'Pate gan truyền thống (hũ)', 'Mứt khoai lang mật'
  ],
  
  'Đồ uống': [
    'Cà phê rang xay đặc sản (túi)', 'Cà phê hòa tan 3 trong 1 (gói)',
    'Trà xanh đóng lon (túi lọc lon)', 'Trà sả chanh đóng chai', 'Trà atiso khô (gói)',
    'Nước ép dứa đóng chai', 'Nước ép mít cô đặc', 'Nước ép trái cây tổng hợp (chai)',
    'Nước mía truyền thống đóng chai', 'Siro trái cây (vị dứa, mít, chanh)',
    'Rượu sim rừng (chai)', 'Rượu nếp cái hoa vàng (chai)', 'Rượu gạo truyền thống (chai)',
    'Nước yến đường phèn (chai)', 'Trà gừng mật ong đóng lọ',
    'Sữa hạt (đậu nànhhạt điều) đóng chai', 'Nước nha đam ép (chai)',
    'Nước cốt trái cây đóng gói pha sẵn', 'Trà hoa nhài (hộp túi lọc)',
    'Trà hoa cúc (gói)', 'Đồ uống bổ dưỡng bột thảo dược (gói pha)',
    'Nước dừa đóng chaixi rô dừa', 'Coffee cold brew (chai)',
    'Nước ép cà rốt hỗn hợp (chai)', 'Bia thủ công (local craft beer)',
    'Siro ca cao nguyên chất', 'Sữa chua uống hũ nhỏ',
    'Nước trái cây lên men nhẹ (kombucha vị trái cây)', 'Trà lạnh vị trái cây (chai)',
    'Siro đường phèn vị thảo mộc'
  ],
  
  'Dược liệu và sản phẩm từ dược liệu': [
    'Cao sâm dây (lọ)', 'Trà cây an xoa (gói)', 'Cao ích mẫu (lọ)',
    'Tinh dầu sả chanh (chai)', 'Tinh dầu tràm (chai)', 'Dầu xoa bóp thảo dược (hũ)',
    'Cao nghệ ngâm (lọ)', 'Bột nghệ nguyên chất (hộp)', 'Viên nang bột nấm linh chi',
    'Bột nấm linh chi sấy (gói)', 'Mật ong kết hợp thảo dược (chai)',
    'Viên nang chiết xuất hạt điều (thực phẩm bảo vệ sức khỏe)', 'Cao chè vằng (lọ)',
    'Trà gừng sấy khô (gói)', 'Thuốc bôi ngoài da từ thảo mộc (mỡsalbe)',
    'Xà phòng thảo dược (sạch, làm từ dược liệu)', 'Dầu gội thảo dược (chai)',
    'Tinh chất bưởihoa hồng (serum dạng thảo dược)', 'Thuốc hít thảo dược (hộp nhỏ)',
    'Chè vằng pha túi lọc (hộp)', 'Cao ích nhan (sản phẩm dưỡng da thảo mộc)',
    'Bột tam thất (góihộp)', 'Rượu thuốc ngâm thảo dược (chai)',
    'Cao ngày cốt (sản phẩm xương khớp)', 'Viên bổ sung chiết xuất sâm cau (hộp)',
    'Gói chườm thảo mộc (sac heat pack)', 'Dược liệu sấy khô (lá, rễ đóng gói)',
    'Hũ thảo dược hỗ trợ tiêu hóa (gói lọ)', 'Túi thảo mộc tắm (hộp)',
    'Cao xương rồng chế phẩm khô (nội địa)', 'Bột tỏi đen (hộp)',
    'Tinh dầu bạc hà (chai)', 'Bột gừng sấy tinh khiết (gói)',
    'Viên sủi thảo dược (gói nhỏ)', 'Dung dịch rửa mũi thảo dược (chai)',
    'Dung dịch súc miệng thảo mộc (chai)', 'Mặt nạ bùn + thảo dược (hộp)',
    'Gel bôi vết thương thảo dược (tuýp)', 'Si rô bổ phổi thảo dược (chai)'
  ],
  
  'Thủ công mỹ nghệ': [
    'Đan lát tre (giỏ, khay)', 'Gỗ chạm khắc (tượng trang trí)',
    'Tranh sơn mài (tấm nhỏ)', 'Đồ gỗ thủ công (khay, đĩa, muỗng)',
    'Sản phẩm mây tre đan (giỏ quà)', 'Lọ hoa gốm sứ men rạn',
    'Đồ gốm trang trí (chén, bình)', 'Trống đồng mini (đồ lưu niệm)',
    'Thớt gỗ keo tràm (thớt bếp)', 'Tượng gỗ phong thủy nhỏ',
    'Đồ da thủ công (ví, túi)', 'Khay tre đựng bánh kẹo',
    'Đèn treo trang trí (đèn lồng)', 'Lục bình mây tre đan (bình trang trí)',
    'Tranh thêu tay (khung nhỏ)', 'Vật dụng decor từ vỏ hạt (vỏ điều, vỏ dừa)',
    'Tấm trải bàn thêu tay', 'Bộ ấm chén gốm làm thủ công',
    'Hộp quà handcrafted (đóng gói OCOP)', 'Đồ trang sức thiên nhiên (vòng tay vỏ hạt)',
    'Khung ảnh gỗ khắc tay', 'Kẹo dừa gói thủ công (bao bì thủ công mỹ nghệ)',
    'Túi vải thổ cẩm (handmade)', 'Bánh kẹo truyền thống đóng hộp trang trí artisan',
    'Sản phẩm móc len  thủ công (móc chìa khóa)', 'Bàn ghế mini gỗ thủ công (đồ decor)',
    'Sản phẩm mộc kết hợp sơn dầu (tranh)', 'Bình rượu trang trí chạm khắc',
    'Đồ dùng nhà bếp tre (muỗng, đũa, cốc)', 'Tượng gốm phong cách dân gian',
    'Quạt tay giấy sơn mài thủ công', 'Hộp gỗ đựng trà chế tác thủ công',
    'Sản phẩm mây tre đan chống ẩm (rổ, lồng bàn)', 'Bộ đồ ăn bằng tre (bộ quà OCOP)'
  ],
  
  'Sinh vật cảnh': [
    'Cây bonsai mini (đa dạng loại)', 'Cây phong thủy trong chậu nhỏ',
    'Lan rừng ghép chậu (orchid)', 'Cây dương xỉ trang trí',
    'Cây sen đá (succulent) mix bộ 3', 'Cây bạc hà trồng chậu nhỏ',
    'Cây húng quế trồng chậu (gia vị + cảnh)', 'Cây đuôi công mini (chậu)',
    'Cây trầu bà leo chậu treo', 'Cây vạn niên thanh (chậu)',
    'Combo cây cảnh bàn làm việc (set)', 'Cây cảnh bonsai từ quả mít (bonsai trái cây)',
    'Cây phong lan mặt đá (chậu treo)', 'Bộ terrarium mini (hộp kính)',
    'Cây lộc vừng giống (chậu nhỏ)', 'Cây hoa giấy bonsai (mini)',
    'Cây bàng non chậu decor', 'Cây phát tài nhỏ (chậu)',
    'Bộ cây thủy canh mini (kit)', 'Cây cẩm tú cầu chậu nhỏ'
  ],
  
  'Dịch vụ du lịch cộng đồng, du lịch sinh thái và điểm du lịch': [
    'Homestay trang trại trải nghiệm nông nghiệp', 'Tour hái trái cây tại vườn (theo mùa)',
    'Trải nghiệm chế biến mít chế biến nông sản tại làng',
    'Tour tham quan nhà máy chế biến hạt điều (tham quan + tasting)',
    'Trải nghiệm làm bánh truyền thống (workshop)',
    'Tour tham quan vườn ca cao + thử ca cao tươi', 'Dịch vụ cắm trại sinh thái ven sông',
    'Tour xem chim & quan sát động thực vật (birdwatching)',
    'Trải nghiệm câu cá & nướng tại chỗ', 'Tour du lịch cộng đồng kết hợp ẩm thực OCOP',
    'Điểm picnic ven hồ (day trip)', 'Tour xe đạp khám phá làng nghề thủ công',
    'Lớp học làm đồ mây tre đan (workshop)',
    'Trải nghiệm thu hoạch mật ong & thưởng mật ong nguyên chất',
    'Tour mua sắm đặc sản OCOP + workshop gói quà',
    'Điểm du lịch vườn sinh thái (tham quan vườn, giáo dục môi trường)',
    'Tour nếm rượu sim rượu nếp truyền thống (tasting)',
    'Trải nghiệm trồng lúa gặt lúa (mùa vụ)',
    'Cắm trại kết hợp team building cho doanh nghiệp',
    'Điểm chụp ảnh hoa lan & bonsai (studio ngoài trời)',
    'Tour học làm nước mắm thực phẩm truyền thống',
    'Dịch vụ đưa đón & guide địa phương (hướng dẫn viên bản địa)',
    'Tour đêm khám phá hệ sinh thái đầm lầy (night walk)',
    'Trải nghiệm thu hoạch và chế biến thảo dược',
    'Điểm du lịch văn hóa kết hợp ẩm thực dân gian',
    'Homestay nông trại giáo dục cho trẻ em (edutour)'
  ]
};

async function recategorizeProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy tất cả categories
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('📋 Available categories:');
    categories.forEach(cat => {
      console.log(`   ${cat.icon || '📦'} ${cat.name}`);
    });
    console.log('');

    let totalUpdated = 0;
    let totalChecked = 0;
    let errors = [];

    // Duyệt qua từng danh mục
    for (const [categoryName, productNames] of Object.entries(productCategoryMapping)) {
      const categoryId = categoryMap[categoryName];
      
      if (!categoryId) {
        console.log(`⚠️  Category not found: ${categoryName}`);
        continue;
      }

      console.log(`\n📂 Processing category: ${categoryName} (${productNames.length} products)`);

      for (const productName of productNames) {
        totalChecked++;
        
        const product = await Product.findOne({ name: productName });
        
        if (!product) {
          errors.push(`Product not found: ${productName}`);
          console.log(`   ⚠️  Not found: ${productName}`);
          continue;
        }

        // Kiểm tra xem category có đúng không
        if (product.category.toString() !== categoryId.toString()) {
          const oldCategory = categories.find(c => c._id.toString() === product.category.toString());
          product.category = categoryId;
          await product.save();
          
          console.log(`   ✅ Updated: ${productName}`);
          console.log(`      From: ${oldCategory?.name || 'Unknown'} → To: ${categoryName}`);
          totalUpdated++;
        } else {
          console.log(`   ✓  Correct: ${productName}`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('=== SUMMARY ===');
    console.log(`📊 Total products checked: ${totalChecked}`);
    console.log(`✅ Products updated: ${totalUpdated}`);
    console.log(`✓  Products already correct: ${totalChecked - totalUpdated - errors.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    // Thống kê theo danh mục
    console.log('\n📊 Products per category:');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id });
      console.log(`   ${cat.icon || '📦'} ${cat.name}: ${count} products`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

recategorizeProducts();
