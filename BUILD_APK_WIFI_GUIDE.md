#  HƯỚNG DẪN BUILD APK BẰNG EAS

## Điều kiện tiên quyết

1. **Backend đang chạy trên máy tính**
   ```bash
   cd ocop_backend
   npm start
   ```
   Backend phải chạy trên: http://192.168.1.25:5000

2. **Điện thoại và máy tính CÙNG mạng WiFi**

3. **Đã cấu hình:**
   -  API_URL: http://192.168.1.25:5000/api
   -  usesCleartextTraffic: true (cho phép HTTP)

---

##  BƯỚC 1: Build APK với EAS

### Option A: Build trên cloud

```bash
cd ocop_frontend

# Build APK preview
eas build --profile preview --platform android
```

**Thời gian:** ~10-15 phút

**Kết quả:** Bạn sẽ nhận được:
- Link download APK
- Có thể scan QR code để download trực tiếp

### Option B: Build local (Nhanh hơn nhưng cần setup)

```bash
cd ocop_frontend

# Build local
eas build --profile preview --platform android --local
```

**Lưu ý:** Cần cài Android SDK và Java

---

## 📱 BƯỚC 2: Cài đặt APK

1. **Download APK** từ link EAS cung cấp
2. **Chuyển APK** vào điện thoại (qua USB, AirDroid, v.v.)
3. **Cài đặt APK** (cho phép cài từ nguồn không xác định nếu cần)

---

## 🔧 BƯỚC 3: Chạy Backend

**QUAN TRỌNG:** Backend phải chạy TRƯỚC KHI mở app!

```bash
# Terminal 1: Start Backend
cd ocop_backend
npm start

# Backend sẽ chạy trên: http://192.168.1.25:5000
```

Kiểm tra backend:
```bash
# Trên máy tính
curl http://192.168.1.25:5000/api/products

# Hoặc mở trình duyệt điện thoại:
# http://192.168.1.25:5000/api/products
```

---

## 📝 BƯỚC 4: Kiểm tra kết nối

1. **Mở Settings trên điện thoại** → Kiểm tra WiFi (phải cùng mạng với máy tính)
2. **Mở trình duyệt điện thoại** → Truy cập: `http://192.168.1.25:5000/api/products`
   - Nếu thấy dữ liệu JSON → ✅ Kết nối OK
   - Nếu không load được → ❌ Kiểm tra lại WiFi/Backend

3. **Mở app OCOP** → Các sản phẩm sẽ hiển thị

---

## 🐛 Troubleshooting

### Lỗi: "Network request failed"

**Nguyên nhân:** Không kết nối được backend

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://192.168.1.25:5000`
2. Kiểm tra cùng WiFi
3. Kiểm tra firewall (tắt tạm nếu cần)
4. Ping từ điện thoại: `http://192.168.1.25:5000/api/products`

### Lỗi: "Connection refused"

**Nguyên nhân:** IP không đúng hoặc firewall chặn

**Giải pháp:**
```bash
# Kiểm tra IP hiện tại
ipconfig | Select-String "IPv4"

# Nếu IP thay đổi (không phải 192.168.1.25):
# 1. Cập nhật trong ocop_frontend/constants/api.ts
# 2. Build lại APK
```

### Lỗi: "Cleartext traffic not permitted"

**Nguyên nhân:** Android chặn HTTP

**Giải pháp:**
✅ Đã fix: `usesCleartextTraffic: true` trong app.json

---

## 🎯 Lệnh tóm tắt

```bash
# 1. Start backend (Terminal 1)
cd ocop_backend
npm start

# 2. Build APK (Terminal 2)
cd ocop_frontend
eas build --profile preview --platform android

# 3. Đợi build xong → Download APK → Cài vào điện thoại
# 4. Đảm bảo backend đang chạy → Mở app
```

---

## 📊 Kiểm tra cấu hình

### File: `ocop_frontend/constants/api.ts`
```typescript
const PRODUCTION_API_URL = 'http://192.168.1.25:5000/api';
```

### File: `ocop_frontend/app.json`
```json
{
  "android": {
    "usesCleartextTraffic": true
  }
}
```

### File: `ocop_frontend/eas.json`
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backend phải chạy** khi dùng app
2. **Cùng mạng WiFi** với máy tính
3. **IP có thể thay đổi** sau khi khởi động lại máy → Cần build lại APK
4. **Không dùng được mạng di động** (4G/5G)

---

## 🌐 Giải pháp lâu dài

Để app hoạt động mọi nơi (không cần cùng WiFi):

1. **Dùng ngrok** (miễn phí):
   ```bash
   ngrok http 5000
   # Cập nhật URL ngrok vào api.ts
   ```

2. **Deploy backend** lên VPS/Cloud:
   - Railway.app (free tier)
   - Render.com (free tier)
   - Heroku
   - VPS riêng

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend logs (Terminal chạy backend)
2. App có hiện lỗi gì không
3. Test API trực tiếp từ trình duyệt điện thoại
