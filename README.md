# OCOP E-commerce System

Hệ thống thương mại điện tử cho sản phẩm OCOP (One Commune One Product) - chương trình mỗi xã một sản phẩm.

## Tính năng

### Backend (Node.js/Express)
- ✅ API RESTful hoàn chỉnh
- ✅ Xác thực và phân quyền (JWT)
- ✅ Quản lý sản phẩm, danh mục, đơn hàng
- ✅ Shopping cart và favorites
- ✅ Hệ thống địa chỉ giao hàng
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Upload hình ảnh
- ✅ Rate limiting và security

### Frontend (React Native/Expo)
- ✅ Giao diện mobile responsive
- ✅ Danh sách sản phẩm với tìm kiếm
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng và thanh toán
- ✅ Quản lý đơn hàng
- ✅ Hệ thống danh mục
- ✅ Đánh giá và bình luận

## Cài đặt

### 1. Database Setup

#### Sử dụng MongoDB Atlas (Khuyến nghị)
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo tài khoản miễn phí
3. Tạo cluster mới
4. Lấy connection string và cập nhật vào file `.env`

#### Sử dụng MongoDB Local
1. Cài đặt MongoDB Community Server
2. Khởi động MongoDB service
3. Cập nhật `.env` với: `MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce`

### 2. Environment Configuration

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp ocop_backend/.env.example ocop_backend/.env
   ```

2. Cập nhật các thông tin trong `.env`:
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
