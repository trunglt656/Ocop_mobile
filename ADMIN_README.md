# OCOP Admin Panel

Admin panel for OCOP e-commerce system with authentication and dashboard.

## 🚀 Quick Start

### 1. Start Admin API Server
```bash
# Terminal 1
node admin-api.js
```

### 2. Start Admin Panel
```bash
# Terminal 2
cd ocop_admin
npx expo start --web
```

### 3. Access Admin Panel
- **🌐 Web:** http://localhost:8082
- **📱 Mobile:** Scan QR code with Expo Go

## 🔐 Admin Login

### Credentials
- **Email:** `admin@ocop.vn`
- **Password:** `admin123`

### API Endpoints
- **Health Check:** `GET http://localhost:5000/api/health`
- **Admin Login:** `POST http://localhost:5000/api/admin/login`
- **Current User:** `GET http://localhost:5000/api/admin/me`
- **Dashboard Stats:** `GET http://localhost:5000/api/admin/dashboard/stats`

## 📋 Features

### ✅ Authentication
- Admin login with role-based access
- JWT token management
- Secure API endpoints

### 📊 Dashboard
- Real-time statistics
- Order status overview
- Product analytics
- Revenue tracking

### 🔧 Development
- React Native with Expo
- TypeScript support
- Navigation with React Navigation
- Responsive design

## 🐛 Troubleshooting

### If Login Redirects Back to Login Page:

1. **Check Console Logs**
   - Open browser dev tools (F12)
   - Look for authentication logs
   - Check for API errors

2. **Verify API Server**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Test Login API**
   ```bash
   curl -X POST http://localhost:5000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ocop.vn","password":"admin123"}'
   ```

4. **Check CORS**
   - Ensure admin panel URL is allowed in CORS origins
   - Check browser console for CORS errors

### Common Issues:

- **"Network Error"** → Backend not running on port 5000
- **"Invalid Credentials"** → Wrong email/password
- **"Unauthorized"** → Missing or invalid JWT token
- **CORS Error** → Frontend URL not allowed in backend CORS

## 📁 Project Structure

```
ocop_admin/
├── index.js              # Main app entry point
├── package.json          # Dependencies
├── app.json             # Expo configuration
├── tsconfig.json        # TypeScript configuration
└── screens/
    ├── auth/
    │   └── LoginScreen.js
    └── dashboard/
        └── DashboardScreen.js

admin-api.js              # Backend API server
```

## 🔄 Development Commands

```bash
# Install dependencies
npm install

# Start web version
npx expo start --web

# Start mobile version
npx expo start --android
npx expo start --ios

# Clear cache
npx expo start --clear
```

## 🌟 Next Steps

1. **Test Login:** Use credentials above
2. **Check Console:** Monitor authentication logs
3. **Verify Navigation:** Ensure proper routing after login
4. **Add Features:** Extend dashboard with more admin functions

The admin panel is now ready for testing! 🎉
