# Hướng dẫn thiết lập MongoDB cho Windows

## Cách 1: Sử dụng MongoDB Atlas (Khuyến nghị)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo tài khoản miễn phí
3. Tạo cluster mới
4. Lấy connection string và cập nhật vào file `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ocop_ecommerce
   ```

## Cách 2: Cài đặt MongoDB cục bộ

1. Tải MongoDB Community Server từ: https://www.mongodb.com/try/download/community
2. Cài đặt với cấu hình mặc định
3. Khởi động MongoDB service
4. Cập nhật file `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce
   ```

## Cách 3: Sử dụng Docker (nếu có Docker Desktop)

1. Cài đặt Docker Desktop cho Windows
2. Chạy script setup:
   ```bash
   .\setup-mongodb.bat
   ```

## Khởi tạo dữ liệu mẫu

Sau khi thiết lập MongoDB, chạy lệnh sau để tạo dữ liệu mẫu:

```bash
npm run seed
```

## Khởi động server

```bash
npm start
```

## Test API

Mở trình duyệt và truy cập: http://localhost:5000/api/health
