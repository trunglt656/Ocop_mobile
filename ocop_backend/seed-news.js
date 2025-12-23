const mongoose = require('mongoose');
const News = require('./models/News');
const User = require('./models/User');
require('dotenv').config();

const newsData = [
  {
    title: 'Sự kiện OCOP Đồng Nai 2025 thu hút hơn 5.000 lượt tham quan',
    content: `
      <p>Sự kiện OCOP Đồng Nai 2025 đã diễn ra thành công tốt đẹp tại Trung tâm Thương mại Biên Hòa từ ngày 15-17/2/2025, thu hút hơn 5.000 lượt khách tham quan và mua sắm.</p>
      
      <h3>Quy mô sự kiện</h3>
      <p>Sự kiện quy tụ hơn 80 gian hàng trưng bày sản phẩm OCOP đến từ 11 huyện, thành phố trong tỉnh, với đa dạng các mặt hàng từ thực phẩm, đồ thủ công mỹ nghệ đến dược liệu.</p>
      
      <h3>Hoạt động nổi bật</h3>
      <p>Trong 3 ngày diễn ra, sự kiện đã tổ chức nhiều hoạt động phong phú như:</p>
      <ul>
        <li>Hội thảo kết nối doanh nghiệp OCOP với hệ thống phân phối</li>
        <li>Workshop về đóng gói và marketing sản phẩm địa phương</li>
        <li>Biểu diễn văn hóa dân gian các vùng miền</li>
        <li>Chương trình khuyến mãi và tặng quà cho khách hàng</li>
      </ul>
      
      <h3>Kết quả đạt được</h3>
      <p>Tổng doanh thu từ sự kiện ước tính đạt hơn 2 tỷ đồng, với nhiều sản phẩm đặc sản như mật ong rừng, trà hữu cơ, mứt trái cây được khách hàng quan tâm mua sắm.</p>
    `,
    summary: 'Gian hàng OCOP tại trung tâm thương mại Biên Hòa giới thiệu hàng chục sản phẩm đặc sắc, mang đến trải nghiệm mua sắm Tết và chương trình ưu đãi cho du khách.',
    thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'event',
    status: 'published',
    isPinned: true,
    tags: ['Sự kiện', 'Triển lãm', 'OCOP']
  },
  {
    title: 'Trà hữu cơ OCOP lên kệ siêu thị, mở cơ hội cho nông dân Tân Phú',
    content: `
      <p>Sản phẩm trà hữu cơ của hợp tác xã Tân Phú chính thức có mặt tại các siêu thị lớn trên địa bàn tỉnh Đồng Nai và TP.HCM, đánh dấu bước tiến quan trọng trong việc mở rộng thị trường.</p>
      
      <h3>Về sản phẩm</h3>
      <p>Trà hữu cơ Tân Phú được trồng và chế biến theo quy trình VietGAP, không sử dụng hóa chất, đảm bảo an toàn cho sức khỏe người tiêu dùng. Sản phẩm đã được cấp chứng nhận OCOP 4 sao.</p>
      
      <h3>Kênh phân phối</h3>
      <p>Hiện tại, trà hữu cơ Tân Phú đã có mặt tại:</p>
      <ul>
        <li>Hệ thống siêu thị Co.opMart Đồng Nai</li>
        <li>Chuỗi cửa hàng Bách Hóa Xanh</li>
        <li>Siêu thị VinMart tại TP.HCM</li>
        <li>Các cửa hàng đặc sản Đồng Nai</li>
      </ul>
      
      <h3>Lợi ích cho nông dân</h3>
      <p>Việc ký kết hợp đồng với hệ thống siêu thị giúp nông dân có đầu ra ổn định, giá thu mua cao hơn 20-30% so với bán buôn truyền thống.</p>
    `,
    summary: 'Các hệ thống siêu thị lớn tại Biên Hòa và TP.HCM đã ký kết hợp tác phân phối trà hữu cơ OCOP, giúp mở rộng đầu ra bền vững cho nông dân địa phương.',
    thumbnail: 'https://images.unsplash.com/photo-1515824955341-43172b000fea?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1515824955341-43172b000fea?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'news',
    status: 'published',
    tags: ['Nông nghiệp', 'Chuỗi cung ứng', 'Trà']
  },
  {
    title: 'Câu chuyện khởi nghiệp từ đặc sản mứt đu đủ của 9x Tài Sơn',
    content: `
      <p>Anh Nguyễn Văn Tài (28 tuổi), quê ở xã Tài Sơn, đã khởi nghiệp thành công với sản phẩm mứt đu đủ từ năm 2020 và hiện tại đã có mặt trên nhiều kênh bán hàng.</p>
      
      <h3>Bắt đầu từ đâu</h3>
      <p>Xuất phát từ vườn đu đủ 2 héc-ta của gia đình, anh Tài quyết định chế biến mứt thay vì bán trái tươi để tăng giá trị sản phẩm. Ban đầu, anh chỉ làm thủ công và bán online qua Facebook.</p>
      
      <h3>Phát triển thương hiệu</h3>
      <p>Sau 2 năm, anh Tài đầu tư máy móc, xây dựng xưởng chế biến đạt chuẩn ATTP và đăng ký thương hiệu "Mứt Tài Sơn". Sản phẩm được cấp chứng nhận OCOP 3 sao năm 2023.</p>
      
      <h3>Thành công hiện tại</h3>
      <p>Hiện tại, xưởng mứt của anh Tài sản xuất khoảng 500kg mứt/tháng, với 5 nhân công cố định. Doanh thu trung bình đạt 150 triệu đồng/tháng.</p>
      
      <blockquote>"Tôi luôn đặt chất lượng lên hàng đầu và không ngừng đổi mới bao bì, hương vị để phù hợp với thị hiếu người tiêu dùng trẻ" - Anh Tài chia sẻ.</blockquote>
    `,
    summary: 'Thương hiệu mứt đu đủ Tài Sơn tạo dấu ấn khi đổi mới bao bì, kể câu chuyện OCOP khác biệt và nhanh chóng chiếm được tình cảm của người tiêu dùng trẻ.',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'news',
    status: 'published',
    isPinned: true,
    tags: ['Khởi nghiệp', 'Câu chuyện', 'Thành công']
  },
  {
    title: 'Bài học xuất khẩu sản phẩm OCOP sang thị trường Hàn Quốc',
    content: `
      <p>Công ty TNHH Thực phẩm Đồng Nai đã chia sẻ kinh nghiệm quý báu trong quá trình xuất khẩu sản phẩm OCOP sang thị trường Hàn Quốc.</p>
      
      <h3>Chuẩn bị hồ sơ</h3>
      <p>Để xuất khẩu sang Hàn Quốc, doanh nghiệp cần chuẩn bị đầy đủ:</p>
      <ul>
        <li>Giấy chứng nhận an toàn thực phẩm</li>
        <li>Giấy chứng nhận xuất xứ (C/O)</li>
        <li>Phiếu kiểm tra vệ sinh (Health Certificate)</li>
        <li>Bảng thành phần và nhãn mác song ngữ</li>
      </ul>
      
      <h3>Tiêu chuẩn chất lượng</h3>
      <p>Hàn Quốc có yêu cầu rất khắt khe về chất lượng sản phẩm, đặc biệt là:</p>
      <ul>
        <li>Không sử dụng chất bảo quản độc hại</li>
        <li>Kiểm soát hàm lượng kim loại nặng</li>
        <li>Đảm bảo độ tươi và bao bì đạt chuẩn</li>
      </ul>
      
      <h3>Kinh nghiệm thực tế</h3>
      <p>Ông Trần Văn Hùng, Giám đốc công ty cho biết: "Chúng tôi phải mất 6 tháng để hoàn thiện quy trình và vượt qua các bài kiểm tra. Tuy nhiên, giá xuất khẩu cao hơn nội địa 50% nên rất đáng để đầu tư."</p>
    `,
    summary: 'Doanh nghiệp OCOP Đồng Nai chia sẻ kinh nghiệm đáp ứng tiêu chuẩn chất lượng khắt khe và quy trình đàm phán khi làm việc với đối tác Hàn Quốc.',
    thumbnail: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'guide',
    status: 'published',
    tags: ['Thị trường', 'Xuất khẩu', 'Hàn Quốc']
  },
  {
    title: 'Đồng Nai khai trương tuyến du lịch trải nghiệm kết hợp OCOP',
    content: `
      <p>Sở Du lịch Đồng Nai phối hợp với các hợp tác xã OCOP khai trương tuyến du lịch trải nghiệm mới, kết nối du khách với các sản phẩm địa phương.</p>
      
      <h3>Lộ trình tour</h3>
      <p>Tour kéo dài 1 ngày đi qua các điểm:</p>
      <ul>
        <li>Vườn trái cây Vĩnh Cửu - Trải nghiệm hái trái và chế biến mứt</li>
        <li>Làng nghề dệt chiếu Thống Nhất - Tìm hiểu quy trình làm chiếu truyền thống</li>
        <li>Cơ sở chế biến trà hữu cơ Tân Phú - Thưởng thức và mua sắm</li>
        <li>Gian hàng OCOP Đồng Nai - Mua sắm đặc sản</li>
      </ul>
      
      <h3>Giá tour và ưu đãi</h3>
      <p>Giá tour khởi điểm 450.000đ/người, bao gồm xe đưa đón, hướng dẫn viên, bữa trưa và voucher mua sắm 100.000đ tại các điểm OCOP.</p>
      
      <h3>Đăng ký tham gia</h3>
      <p>Du khách có thể đăng ký qua hotline: 1900-XXXX hoặc website: dulichdongnai.vn</p>
    `,
    summary: 'Tour trải nghiệm mới đưa du khách đến thăm trang trại trái cây, làng nghề và các gian hàng OCOP tại Vĩnh Cửu, Thống Nhất, kết nối văn hóa bản địa.',
    thumbnail: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'event',
    status: 'published',
    tags: ['Du lịch', 'Trải nghiệm', 'Tour']
  },
  {
    title: 'Chuyển đổi số giúp doanh nghiệp OCOP tối ưu chuỗi cung ứng',
    content: `
      <p>Xu hướng chuyển đổi số đang giúp các doanh nghiệp OCOP tối ưu hóa quy trình sản xuất, quản lý kho và bán hàng hiệu quả hơn.</p>
      
      <h3>Ứng dụng công nghệ</h3>
      <p>Nhiều doanh nghiệp OCOP đã triển khai:</p>
      <ul>
        <li>Phần mềm quản lý kho ERP để theo dõi tồn kho realtime</li>
        <li>App bán hàng di động kết nối với khách hàng</li>
        <li>Hệ thống thanh toán không tiền mặt</li>
        <li>Website và fanpage bán hàng online</li>
      </ul>
      
      <h3>Hiệu quả đạt được</h3>
      <p>Sau khi áp dụng chuyển đổi số, các doanh nghiệp ghi nhận:</p>
      <ul>
        <li>Giảm 30% chi phí quản lý kho</li>
        <li>Tăng 40% doanh thu từ kênh online</li>
        <li>Giảm tình trạng tồn kho và hư hỏng</li>
      </ul>
      
      <h3>Hỗ trợ từ địa phương</h3>
      <p>Sở Công Thương Đồng Nai đang triển khai chương trình đào tạo miễn phí về chuyển đổi số cho doanh nghiệp OCOP trong quý 1/2025.</p>
    `,
    summary: 'Việc ứng dụng phần mềm quản trị kho và bán lẻ giúp doanh nghiệp OCOP giảm tồn kho, tăng hiệu quả vận hành trong mùa cao điểm cuối năm.',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'news',
    status: 'published',
    isPinned: true,
    tags: ['Công nghệ', 'Chuyển đổi số', 'Quản lý']
  },
  {
    title: 'Chương trình khuyến mãi OCOP mừng Tết Nguyên Đán 2025',
    content: `
      <p>Nhân dịp Tết Nguyên Đán Ất Tỵ 2025, các cơ sở sản xuất OCOP Đồng Nai triển khai chương trình khuyến mãi hấp dẫn.</p>
      
      <h3>Thời gian áp dụng</h3>
      <p>Từ ngày 20/01/2025 đến hết 28/01/2025 (tức 21 tháng Chạp đến 29 tháng Chạp âm lịch)</p>
      
      <h3>Ưu đãi nổi bật</h3>
      <ul>
        <li>Giảm 20-30% cho các sản phẩm mứt, kẹo, bánh</li>
        <li>Mua 2 tặng 1 cho các sản phẩm trà, cà phê</li>
        <li>Tặng quà may mắn cho hóa đơn từ 500.000đ</li>
        <li>Miễn phí giao hàng nội thành Biên Hòa với đơn từ 300.000đ</li>
      </ul>
      
      <h3>Địa điểm mua sắm</h3>
      <ul>
        <li>Cửa hàng OCOP Đồng Nai - 123 Phạm Văn Thuận, Biên Hòa</li>
        <li>Gian hàng OCOP tại TTTM Sense City</li>
        <li>Website: ocopdongnai.vn</li>
      </ul>
    `,
    summary: 'Nhiều chương trình giảm giá và quà tặng hấp dẫn dành cho khách hàng mua sắm sản phẩm OCOP dịp Tết Nguyên Đán.',
    thumbnail: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'promotion',
    status: 'published',
    tags: ['Khuyến mãi', 'Tết', 'Ưu đãi']
  },
  {
    title: 'Hội chợ OCOP Vùng Đông Nam Bộ 2025 tại Đồng Nai',
    content: `
      <p>Đồng Nai vinh dự là địa phương đăng cai tổ chức Hội chợ OCOP Vùng Đông Nam Bộ 2025, dự kiến diễn ra từ 15-18/3/2025.</p>
      
      <h3>Quy mô sự kiện</h3>
      <p>Hội chợ quy tụ hơn 200 gian hàng đến từ 6 tỉnh thành vùng Đông Nam Bộ, trưng bày hàng nghìn sản phẩm OCOP đặc sắc.</p>
      
      <h3>Hoạt động chính</h3>
      <ul>
        <li>Triển lãm và giới thiệu sản phẩm OCOP</li>
        <li>Hội nghị kết nối cung cầu hàng hóa</li>
        <li>Tọa đàm phát triển thương hiệu OCOP vùng</li>
        <li>Biểu diễn văn hóa dân gian</li>
        <li>Thi nấu ăn với nguyên liệu OCOP</li>
      </ul>
      
      <h3>Dự kiến thu hút</h3>
      <p>Ban tổ chức kỳ vọng sự kiện sẽ thu hút hơn 50.000 lượt khách tham quan và đạt doanh thu khoảng 20 tỷ đồng.</p>
      
      <p><strong>Địa điểm:</strong> Trung tâm Hội chợ Triển lãm Đồng Nai, Biên Hòa</p>
    `,
    summary: 'Sự kiện quy mô lớn quy tụ các sản phẩm OCOP tiêu biểu từ 6 tỉnh thành, tạo cơ hội kết nối và quảng bá thương hiệu.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1080&q=80',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1080&q=80'
    ],
    category: 'announcement',
    status: 'published',
    tags: ['Hội chợ', 'Sự kiện', 'Vùng']
  }
];

async function seedNews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ocop_db');
    console.log('✅ Connected to MongoDB');

    // Find an admin user to be the author
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      // If no admin, find any user
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    console.log(`📝 Using author: ${adminUser.name || adminUser.email}`);

    // Clear existing news
    await News.deleteMany({});
    console.log('🗑️  Cleared existing news');

    // Add author to news data
    const newsWithAuthor = newsData.map(news => ({
      ...news,
      author: adminUser._id,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
    }));

    // Insert news
    const createdNews = await News.insertMany(newsWithAuthor);
    console.log(`✅ Created ${createdNews.length} news articles`);

    // Display created news
    createdNews.forEach((news, index) => {
      console.log(`${index + 1}. ${news.title} (${news.category})`);
    });

    console.log('\n✅ News seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding news:', error);
    process.exit(1);
  }
}

seedNews();
