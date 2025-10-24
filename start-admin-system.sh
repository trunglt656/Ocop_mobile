#!/bin/bash

echo "🚀 Starting OCOP Admin System..."
echo "================================="
echo ""

echo "📋 Step 1: Starting Admin API Server..."
echo "   Port: 5000"
echo "   URL: http://localhost:5000"
echo ""

# Start admin API in background
node admin-api.js &
ADMIN_PID=$!

echo "✅ Admin API Server started (PID: $ADMIN_PID)"
echo ""

echo "📋 Step 2: Starting Admin Frontend..."
echo "   This will open Expo DevTools"
echo "   Web: http://localhost:8082"
echo ""

# Start frontend
cd ocop_admin
echo "Installing frontend dependencies..."
npm install

echo ""
echo "Starting Expo development server..."
npx expo start --web

echo ""
echo "🛑 To stop the admin API server, run: kill $ADMIN_PID"
