# OCOP Admin Panel - Fixed Setup Guide

## 🚀 Quick Start

### 1. Start Admin API Server
```bash
# Option 1: Using Node.js directly
node admin-api.js

# Option 2: Using PowerShell
powershell -ExecutionPolicy Bypass -File start-admin-api.ps1

# Option 3: Using Batch file
start-admin-api.bat
```

### 2. Test Admin API
Open `test-admin.html` in your browser to test all endpoints.

### 3. Start Admin Panel Frontend
```bash
cd ocop_admin
npm install
npx expo start --web
```

### 4. Access Admin Panel
- **🌐 Web:** http://localhost:8082
- **📱 Mobile:** Scan QR code with Expo Go

## 🔐 Admin Login Credentials
- **Email:** `admin@ocop.vn`
- **Password:** `admin123`

## 📋 API Endpoints
- **Health Check:** `GET http://localhost:5000/api/health`
- **Admin Login:** `POST http://localhost:5000/api/admin/login`
- **Current User:** `GET http://localhost:5000/api/admin/me`
- **Dashboard Stats:** `GET http://localhost:5000/api/admin/dashboard/stats`

## 🔧 Recent Fixes Applied
1. ✅ Fixed DashboardScreen to use proper authentication tokens
2. ✅ Updated navigation to pass tokens between screens
3. ✅ Created admin API server startup scripts
4. ✅ Added comprehensive API testing interface
5. ✅ Fixed frontend entry point configuration

## 📱 Frontend Features
- **Authentication:** Admin login with JWT tokens
- **Dashboard:** Real-time statistics and analytics
- **Responsive:** Works on web and mobile devices
- **Modern UI:** Clean, professional admin interface

## 🐛 Troubleshooting
1. **Admin API not starting:** Make sure no other service is using port 5000
2. **Login failing:** Check credentials are exactly `admin@ocop.vn` / `admin123`
3. **Frontend not loading:** Run `npm install` in the `ocop_admin` directory
4. **CORS issues:** The admin API has CORS configured for localhost development

## 📊 Admin Panel Features
- **User Management:** View and manage system users
- **Product Management:** Add, edit, and organize products
- **Order Management:** Process and track customer orders
- **Analytics:** View sales statistics and trends
- **Category Management:** Organize product categories
- **Profile Management:** Admin profile settings
