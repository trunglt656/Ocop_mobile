# 🎯 OCOP Admin Panel

Admin Panel for OCOP E-commerce platform - Quản lý hệ thống thương mại điện tử OCOP Đồng Nai.

## 🚀 Quick Start

### 1. Cài đặt Dependencies

```bash
cd admin
npm install
```

### 2. Cấu hình Environment

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=OCOP Admin Panel
```

### 3. Chạy Development Server

```bash
npm run dev
```

Admin panel sẽ chạy tại: **http://localhost:7000**

### 4. Đăng nhập

**Tài khoản Admin mặc định:**
- Email: `admin@ocop.vn`
- Password: `admin123`

---

## 📁 Cấu trúc Project

```
admin/
├── app/
│   ├── dashboard/              # Dashboard pages
│   │   ├── layout.tsx         # Dashboard layout với sidebar
│   │   ├── page.tsx           # Dashboard homepage
│   │   ├── products/          # Quản lý sản phẩm
│   │   ├── orders/            # Quản lý đơn hàng
│   │   ├── categories/        # Quản lý danh mục
│   │   ├── users/             # Quản lý người dùng
│   │   └── shops/             # Quản lý cửa hàng
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Root page (redirect)
│   ├── providers.tsx          # React Query provider
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # UI components
│   ├── dashboard/             # Dashboard components
│   ├── products/              # Product components
│   └── orders/                # Order components
├── lib/
│   ├── api.ts                 # Axios API client
│   └── utils.ts               # Utility functions
├── stores/
│   └── authStore.ts           # Zustand auth store
├── types/
│   ├── auth.ts                # Auth types
│   ├── product.ts             # Product types
│   ├── order.ts               # Order types
│   └── dashboard.ts           # Dashboard types
├── public/                    # Static files
├── .env.local                 # Environment variables
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## ✨ Features

### ✅ Đã hoàn thành

#### 1. Authentication
- [x] Admin login page
- [x] JWT token management
- [x] Protected routes
- [x] Auto redirect to login if not authenticated
- [x] Logout functionality

#### 2. Dashboard
- [x] Tổng quan thống kê:
  - Tổng số người dùng
  - Tổng số sản phẩm
  - Tổng số đơn hàng
  - Tổng doanh thu
- [x] Thống kê đơn hàng theo trạng thái
- [x] Thống kê sản phẩm
- [x] Danh sách đơn hàng gần đây

#### 3. UI Components
- [x] Responsive layout
- [x] Sidebar navigation
- [x] Top navbar with user info
- [x] Stats cards
- [x] Loading states
- [x] Error handling

### 🚧 Đang phát triển

#### 3. Quản lý Sản phẩm
- [ ] Danh sách sản phẩm (table with pagination)
- [ ] Thêm sản phẩm mới
  - Form nhập thông tin
  - Upload multiple images
  - Chọn category
  - Thông tin OCOP (level, origin, producer)
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Tìm kiếm & Filter
- [ ] Bulk actions

#### 4. Quản lý Đơn hàng
- [ ] Danh sách đơn hàng
- [ ] Chi tiết đơn hàng
- [ ] Cập nhật trạng thái đơn
- [ ] In hóa đơn

#### 5. Quản lý Người dùng
- [ ] Danh sách người dùng
- [ ] Chi tiết người dùng
- [ ] Phân quyền
- [ ] Kích hoạt/Vô hiệu hóa tài khoản

#### 6. Quản lý Danh mục
- [ ] Danh sách danh mục
- [ ] Thêm/Sửa/Xóa danh mục
- [ ] Tree view

#### 7. Quản lý Shops
- [ ] Danh sách shops
- [ ] Duyệt/Xác minh shops
- [ ] Chi tiết shop

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

---

## 🔐 Authentication Flow

### Login Process
```
1. User enters email + password
2. POST /api/admin/login
3. Backend verifies credentials + checks admin role
4. Backend returns JWT token + user data
5. Frontend stores token in localStorage
6. Frontend redirects to /dashboard
```

### Protected Routes
```
1. User accesses protected route
2. Layout checks for auth token
3. If no token → redirect to /login
4. If token exists → verify with backend
5. If valid → show content
6. If invalid → clear token + redirect to /login
```

### API Requests
```
All API requests include:
Authorization: Bearer <token>

If 401 response:
→ Clear token
→ Redirect to /login
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/admin/login              - Admin login
GET    /api/admin/me                 - Get current admin
```

### Dashboard
```
GET    /api/admin/dashboard/stats    - Dashboard statistics
```

### Products (To be implemented)
```
GET    /api/products                 - List products
POST   /api/products                 - Create product
PUT    /api/products/:id             - Update product
DELETE /api/products/:id             - Delete product
```

### Orders (To be implemented)
```
GET    /api/orders                   - List orders
GET    /api/orders/:id               - Get order details
PUT    /api/orders/:id/status        - Update order status
```

### Users (To be implemented)
```
GET    /api/users                    - List users
PUT    /api/users/:id                - Update user
DELETE /api/users/:id                - Delete user
```

---

## 🎨 Styling Guide

### Colors

**Primary (Green OCOP)**
- `primary-50` to `primary-900`
- Default: `primary-600`

**Gold (OCOP Certificate)**
- `gold-50` to `gold-900`
- Default: `gold-500`

**Status Colors**
- Success: `green-500`
- Warning: `yellow-500`
- Error: `red-500`
- Info: `blue-500`

### Typography
- Heading: `font-bold`
- Body: `font-normal`
- Small: `text-sm`
- Medium: `text-base`
- Large: `text-lg`

---

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server on port 7000

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## 🔧 Configuration

### Next.js Config (`next.config.mjs`)
```javascript
{
  images: {
    domains: ['localhost'],  // Allow images from backend
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',  // Large file uploads
    },
  },
}
```

### Tailwind Config
```javascript
{
  theme: {
    extend: {
      colors: {
        primary: { ... },  // Green shades
        gold: { ... },     // Gold shades
      },
    },
  },
}
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to API
**Solution**: 
- Đảm bảo backend đang chạy tại `http://localhost:5000`
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`

### Issue: Login redirects back to login
**Solution**:
- Check console for errors
- Verify admin account exists in database
- Check JWT token in localStorage
- Verify CORS settings in backend

### Issue: TypeScript errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Style not updating
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build
npm run build

# Start
npm start
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=OCOP Admin Panel
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 👥 Development Team

OCOP Đồng Nai - Admin Panel Development

---

## 📄 License

ISC License

---

## 🎉 Next Steps

1. **Run the app:**
   ```bash
   npm install
   npm run dev
   ```

2. **Login with admin account:**
   - Email: admin@ocop.vn
   - Password: admin123

3. **Explore the dashboard:**
   - View statistics
   - Check recent orders
   - Navigate through sidebar

4. **Start developing:**
   - Add product management pages
   - Implement order management
   - Build user management

Happy coding! 🚀
