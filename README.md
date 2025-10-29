# OCOP Đồng Nai - Ứng dụng thương mại điện tử

Ứng dụng thương mại điện tử cho sản phẩm OCOP (One Commune One Product) đặc sản Đồng Nai.

## ✨ Tính năng đã triển khai

### 🏪 **Mua sắm**
- ✅ **Sản phẩm đa dạng**: Trái cây, hạt & đậu, kẹo & bánh, thực phẩm đặc sản
- ✅ **Chứng nhận OCOP**: Hiển thị cấp độ OCOP (3 sao, 4 sao, 5 sao)
- ✅ **Tìm kiếm thông minh**: Tìm kiếm sản phẩm theo tên, danh mục
- ✅ **Giỏ hàng**: Thêm/xóa/cập nhật sản phẩm trong giỏ hàng
- ✅ **Đặt hàng**: Đơn hàng với nhiều phương thức thanh toán

### 🔐 **Tài khoản**
- ✅ **Đăng ký/Đăng nhập**: Xác thực JWT an toàn
- ✅ **Quản lý profile**: Cập nhật thông tin cá nhân
- ✅ **Lịch sử đơn hàng**: Theo dõi đơn hàng đã đặt
- ✅ **Yêu thích**: Lưu sản phẩm yêu thích

### 📱 **Giao diện**
- ✅ **Responsive Design**: Tối ưu cho mọi thiết bị
- ✅ **UI/UX thân thiện**: Giao diện đẹp, dễ sử dụng
- ✅ **Hình ảnh chất lượng cao**: Hình ảnh sản phẩm từ assets local
- ✅ **Fallback system**: Hiển thị dữ liệu mẫu khi API không khả dụng

## 🚀 **Cài đặt và Chạy**

### **Yêu cầu hệ thống**
- Node.js 16+
- MongoDB (local hoặc MongoDB Atlas)
- React Native/Expo CLI

### **Backend Setup**

```bash
cd ocop_backend

# Cài đặt dependencies
npm install

# Tạo dữ liệu mẫu (tự động với environment variables)
node server.js

# Hoặc chạy seeder riêng biệt
node seeder.js
```

Backend sẽ chạy tại: `http://localhost:5000`

### **Frontend Setup**

```bash
cd ocop_frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

## 📊 **Dữ liệu sản phẩm có sẵn**

### **Sản phẩm đặc trưng:**
1. **🍊 Bưởi da xanh Đồng Nai** - OCOP 4 sao - 45,000₫ (có giảm giá 10%)
2. **🌰 Cacao nguyên chất** - OCOP 5 sao - 120,000₫
3. **🥜 Đậu phộng rang muối** - OCOP 3 sao - 35,000₫
4. **🍬 Kẹo sữa đặc Đồng Nai** - OCOP 3 sao - 25,000₫ (có giảm giá 17%)
5. **🍇 Mận hậu Đồng Nai** - OCOP 4 sao - 55,000₫
6. **🟡 Nghệ tươi Đồng Nai** - OCOP 3 sao - 15,000₫ (có giảm giá 17%)
7. **🍶 Nước mắm truyền thống** - OCOP 4 sao - 85,000₫
8. **🥭 Xoài cát Đồng Nai** - OCOP 4 sao - 40,000₫
9. **🍵 Trà xanh Đồng Nai** - OCOP 3 sao - 65,000₫
10. **🍐 Na dai Đồng Nai** - OCOP 3 sao - 30,000₫ (có giảm giá 14%)

### **Tài khoản test:**
- **Admin**: admin@ocop.vn / admin123
- **User**: nguyenvana@example.com / password

## 🎨 **Giao diện Home Screen**

### **Banners**
- Ưu đãi đặc biệt OCOP với hình ảnh bưởi
- Sản phẩm tươi mới với hình ảnh cacao

### **Danh mục sản phẩm**
- 🍊 Trái cây (Bưởi, Mận, Xoài, Na)
- 🥜 Hạt & Đậu (Cacao, Đậu phộng)
- 🍬 Kẹo & Bánh (Kẹo sữa)
- 🍽️ Thực phẩm khác (Nghệ, Nước mắm, Trà)

### **Sản phẩm nổi bật**
- Hiển thị 10 sản phẩm với hình ảnh local
- Thông tin giá, giảm giá, đánh giá
- Badge OCOP và rating
- Navigation đến chi tiết sản phẩm

## 🛠 **Công nghệ sử dụng**

### **Backend**
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose ODM**
- **JWT Authentication**
- **File Upload** (Multer)
- **Security** (Helmet, CORS, Rate Limiting)

### **Frontend**
- **React Native** + **Expo**
- **TypeScript**
- **React Navigation**
- **AsyncStorage** (Token persistence)
- **Responsive UI**

## 🔧 **API Integration**

### **Tự động fallback**
- Nếu backend không khả dụng → Hiển thị mock data
- Mock data bao gồm 10 sản phẩm với hình ảnh thực tế
- Categories với icons emoji
- Full product information (giá, mô tả, đánh giá, etc.)

### **Authentication**
- JWT token persistence với AsyncStorage
- Automatic token refresh
- Protected routes

## 📁 **Cấu trúc thư mục**

```
ocop_demo/
├── ocop_backend/          # Backend API
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/       # Middleware
│   └── config/           # Configuration
├── ocop_frontend/        # Frontend App
│   ├── app/              # Screens & Navigation
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   └── assets/           # Images & assets
│   └── constants/        # App constants
└── README.md
```

## 🎯 **Cách sử dụng**

1. **Chạy Backend**: `cd ocop_backend && npm start`
2. **Chạy Frontend**: `cd ocop_frontend && npm start`
3. **Mở app**: Scan QR code hoặc chạy trên device
4. **Khám phá**: Xem sản phẩm, thêm vào giỏ hàng, đặt hàng

## 📞 **Liên hệ**

- **Email**: support@ocop.vn
- **Phone**: 1900-XXXX
- **Website**: https://ocop-dongnai.vn

---

**OCOP Đồng Nai** - Kết nối nông sản Việt Nam với người tiêu dùng toàn quốc! 🌾🇻🇳
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your-super-secret-jwt-key
   ```

### 3. Cài đặt Dependencies

#### Backend
```bash
cd ocop_backend
npm install
```

#### Frontend
```bash
cd ocop_frontend
npm install
```

### 4. Khởi tạo Database

```bash
cd ocop_backend
npm run seed
```

### 5. Khởi động Servers

#### Backend (Terminal 1)
```bash
cd ocop_backend
npm start
```
API sẽ chạy tại: http://localhost:5000

#### Frontend (Terminal 2)
```bash
cd ocop_frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/search` - Tìm kiếm sản phẩm
- `GET /api/products/category/:categoryId` - Sản phẩm theo danh mục

### Categories
- `GET /api/categories` - Danh sách danh mục

### Cart
- `GET /api/cart` - Giỏ hàng
- `POST /api/cart` - Thêm vào giỏ hàng
- `PUT /api/cart` - Cập nhật giỏ hàng
- `DELETE /api/cart` - Xóa khỏi giỏ hàng

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng

## Test Credentials

### Admin
- Email: admin@ocop.vn
- Password: admin123

### User
- Email: nguyenvana@example.com
- Password: password

## Sản phẩm mẫu

Hệ thống đã được seed với các sản phẩm OCOP:

1. **Bưởi da xanh Đồng Nai** - OCOP 4 sao
   - Giá: 45,000₫
   - Xuất xứ: Long Khánh, Đồng Nai

2. **Cacao nguyên chất** - OCOP 3 sao
   - Giá: 120,000₫
   - Xuất xứ: Định Quán, Đồng Nai

3. **Đậu phộng rang tỏi ớt** - OCOP 3 sao
   - Giá: 35,000₫
   - Xuất xứ: Vĩnh Cửu, Đồng Nai

4. **Kẹo dừa Bến Tre** - OCOP 4 sao
   - Giá: 55,000₫
   - Xuất xứ: Chợ Lách, Bến Tre

5. **Mật ong hoa cà phê** - OCOP 3 sao
   - Giá: 180,000₫
   - Xuất xứ: Xuân Lộc, Đồng Nai

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MongoDB URI trong file `.env`
- Đảm bảo MongoDB đang chạy
- Kiểm tra network connection

### Lỗi API
- Kiểm tra backend server đang chạy
- Xem logs trong terminal
- Kiểm tra CORS settings

### Lỗi Frontend
- Xóa node_modules và reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo r -c`
- Kiểm tra API URL trong `constants/api.ts`

## Development

### Scripts hữu ích

#### Backend
```bash
npm run dev          # Development mode với nodemon
npm run seed         # Seed database với dữ liệu mẫu
npm test             # Chạy tests
```

#### Frontend
```bash
npm start            # Khởi động Expo
npm run android      # Chạy trên Android
npm run ios          # Chạy trên iOS
npm run web          # Chạy trên web
```

## Architecture

```
ocop_backend/
├── config/          # Database và các config
├── controllers/     # Business logic
├── middleware/      # Authentication, validation
├── models/          # Database models
├── routes/          # API routes
└── utils/           # Helper functions

ocop_frontend/
├── app/             # React Native pages
├── components/      # Reusable components
├── constants/       # App constants
├── services/        # API services
└── contexts/        # React contexts
```

## License

MIT License - see LICENSE file for details.

## Support

For support, please contact:
- Email: support@ocop.vn
- Phone: +84 123 456 789
