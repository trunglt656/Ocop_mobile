#!/bin/bash

echo "🐳 Setting up local MongoDB with Docker..."
echo "📦 Pulling MongoDB Docker image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    echo "💡 Alternative: Install MongoDB locally"
    exit 1
fi

# Stop and remove existing container if exists
echo "🧹 Cleaning up existing MongoDB container..."
docker stop mongodb-ocop > /dev/null 2>&1
docker rm mongodb-ocop > /dev/null 2>&1

# Create Docker volume for data persistence
echo "💾 Creating MongoDB data volume..."
docker volume create mongodb-ocop-data > /dev/null 2>&1

# Run MongoDB container
echo "🚀 Starting MongoDB container..."
docker run -d \
    --name mongodb-ocop \
    -p 27017:27017 \
    -v mongodb-ocop-data:/data/db \
    --restart unless-stopped \
    mongo:latest

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to initialize..."
sleep 5

# Check if MongoDB is running
if docker ps | grep -q mongodb-ocop; then
    echo "✅ MongoDB is running successfully!"
    echo "📍 Connection Details:"
    echo "   Host: localhost"
    echo "   Port: 27017"
    echo "   Database: ocop_ecommerce"
    echo "   Connection String: mongodb://localhost:27017/ocop_ecommerce"

    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Update your .env file:"
    echo "      MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce"
    echo ""
    echo "   2. Start your backend server:"
    echo "      npm start"
    echo ""
    echo "   3. Test the connection:"
    echo "      curl http://localhost:5000/api/health"
    echo ""
    echo "🎉 Your OCOP Backend should now work with local MongoDB!"
else
    echo "❌ Failed to start MongoDB container"
    echo "💡 Try running: docker run -d -p 27017:27017 --name mongodb-ocop mongo:latest"
fi
