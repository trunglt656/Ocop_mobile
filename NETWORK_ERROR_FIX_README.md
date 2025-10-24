# ✅ OCOP Admin Panel - Network Error Fixed!

## 🔧 **Issue Fixed:**
The error **"ERROR Error loading home data: [ApiError: Network request failed]"** was caused by the frontend trying to connect to the wrong API URL (`http://192.168.1.128:5000/api` instead of `http://localhost:5000/api`).

## 🚀 **How to Run the Complete System:**

### **Step 1: Start the API Server**
```bash
# Terminal 1 - Start API Server
cd d:\DATN\demo1\ocop_DN
node express-api.js
```

### **Step 2: Start the Frontend**
```bash
# Terminal 2 - Start Frontend
cd d:\DATN\demo1\ocop_DN\ocop_frontend
npx expo start --web
```

### **Step 3: Access the Applications**
- **🌐 Frontend (User App):** http://localhost:8081
- **🔐 Admin Panel:** The admin panel is in the `ocop_admin` directory
- **📊 API Health:** http://localhost:5000/api/health

## 📋 **API Endpoints Available:**

### **Frontend Endpoints:**
- `GET /api/products/featured` - Featured products for home screen
- `GET /api/categories` - Product categories
- `GET /api/products/:id` - Product details
- `POST /api/auth/login` - User authentication

### **Admin Endpoints:**
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/me` - Current admin user
- `GET /api/admin/dashboard/stats` - Dashboard statistics

## 🔐 **Test Credentials:**

### **For Frontend (User):**
- Email: `test@example.com`
- Password: `password`

### **For Admin Panel:**
- Email: `admin@ocop.vn`
- Password: `admin123`

## 📱 **What I've Fixed:**

1. **✅ API Configuration:** Changed from hardcoded IP `192.168.1.128` to `localhost`
2. **✅ Express API Server:** Created a working API server with all required endpoints
3. **✅ Mock Data:** Added sample products and categories for testing
4. **✅ CORS Support:** Configured for local development
5. **✅ Error Handling:** Proper error responses and fallbacks

## 🧪 **Testing the Fix:**

1. **Start API Server:** `node express-api.js`
2. **Test Health:** Visit http://localhost:5000/api/health
3. **Test Products:** Visit http://localhost:5000/api/products/featured
4. **Start Frontend:** `cd ocop_frontend && npx expo start --web`
5. **Check Console:** The "Error loading home data" should be gone

## 📁 **Project Structure:**
```
d:\DATN\demo1\ocop_DN\
├── ocop_frontend/     # Main user app (React Native/Expo)
├── ocop_admin/        # Admin panel (React Native/Expo)
├── ocop_backend/      # Full backend with MongoDB
├── express-api.js     # Simple API server (recommended)
└── admin-api.js       # Admin-only API server
```

## 💡 **Alternative API Servers:**

If the Express server doesn't work, you can also use:
```bash
# Admin API only
node admin-api.js

# Or the full backend (requires MongoDB setup)
cd ocop_backend
npm install
npm start
```

## 🔍 **Debugging:**

If you still see network errors:
1. Check if API server is running on port 5000
2. Verify API configuration in `constants/api.ts`
3. Check browser console for detailed error messages
4. Ensure no firewall is blocking localhost connections

The frontend should now successfully load home data without network errors! 🎉
