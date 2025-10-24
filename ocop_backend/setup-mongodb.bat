@echo off
echo 🐳 Setting up local MongoDB with Docker...
echo 📦 Pulling MongoDB Docker image...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    echo 💡 Alternative: Install MongoDB locally
    pause
    exit /b 1
)

REM Stop and remove existing container if exists
echo 🧹 Cleaning up existing MongoDB container...
docker stop mongodb-ocop >nul 2>&1
docker rm mongodb-ocop >nul 2>&1

REM Create Docker volume for data persistence
echo 💾 Creating MongoDB data volume...
docker volume create mongodb-ocop-data >nul 2>&1

REM Run MongoDB container
echo 🚀 Starting MongoDB container...
docker run -d --name mongodb-ocop -p 27017:27017 -v mongodb-ocop-data:/data/db --restart unless-stopped mongo:latest

REM Wait for MongoDB to start
echo ⏳ Waiting for MongoDB to initialize...
timeout /t 5 /nobreak >nul

REM Check if MongoDB is running
docker ps | findstr mongodb-ocop >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to start MongoDB container
    echo 💡 Try running: docker run -d -p 27017:27017 --name mongodb-ocop mongo:latest
    pause
    exit /b 1
)

echo ✅ MongoDB is running successfully!
echo 📍 Connection Details:
echo    Host: localhost
echo    Port: 27017
echo    Database: ocop_ecommerce
echo    Connection String: mongodb://localhost:27017/ocop_ecommerce
echo.
echo 🔧 Next Steps:
echo    1. Update your .env file:
echo       MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce
echo.
echo    2. Start your backend server:
echo       npm start
echo.
echo    3. Test the connection:
echo       curl http://localhost:5000/api/health
echo.
echo 🎉 Your OCOP Backend should now work with local MongoDB!
pause
