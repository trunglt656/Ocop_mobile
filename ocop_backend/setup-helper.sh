#!/bin/bash

echo "🔧 MongoDB Setup Helper"
echo "======================="
echo ""

# Function to update .env file
update_env_file() {
    local env_file=".env"
    local new_uri="MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce"

    if [ -f "$env_file" ]; then
        # Check if MONGODB_URI already exists
        if grep -q "^MONGODB_URI=" "$env_file"; then
            echo "📝 Updating existing MONGODB_URI in .env file..."
            sed -i.bak "s|^MONGODB_URI=.*|$new_uri|" "$env_file"
            echo "✅ Updated .env file with local MongoDB connection"
        else
            echo "📝 Adding MONGODB_URI to .env file..."
            echo "$new_uri" >> "$env_file"
            echo "✅ Added local MongoDB connection to .env file"
        fi

        echo ""
        echo "📄 Current .env file:"
        grep "MONGODB_URI" "$env_file"
    else
        echo "❌ .env file not found. Please create it with:"
        echo "$new_uri"
    fi
}

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected. You can use the setup script:"
    echo "   ./setup-mongodb.sh"
    echo ""
fi

# Check current MongoDB connection
if [ -f ".env" ] && grep -q "MONGODB_URI" .env; then
    current_uri=$(grep "MONGODB_URI" .env)
    echo "📍 Current MongoDB URI: $current_uri"

    if echo "$current_uri" | grep -q "localhost\|127.0.0.1"; then
        echo "✅ Already using local MongoDB"
    else
        echo "🌐 Currently using remote MongoDB (Atlas)"
        echo "💡 For development, consider using local MongoDB"
        read -p "🔄 Switch to local MongoDB? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            update_env_file
        fi
    fi
else
    echo "📝 No MongoDB URI found in .env file"
    echo "💡 Setting up local MongoDB connection..."
    update_env_file
fi

echo ""
echo "🚀 Ready to start the server!"
echo "   Run: npm start"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:5000/api/health"
