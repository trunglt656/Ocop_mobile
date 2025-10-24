const http = require('http');
const url = require('url');

console.log('🚀 Starting OCOP API Server...');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  console.log(`${method} ${path}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (path === '/api/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'OCOP API is running',
      timestamp: new Date().toISOString()
    }));
    console.log('✅ Health check requested');
    return;
  }

  // Admin login
  if (path === '/api/admin/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('🔐 Admin Login attempt:', email);

        if (email === 'admin@ocop.vn' && password === 'admin123') {
          const token = 'admin-jwt-token-' + Date.now();
          const user = {
            _id: 'admin1',
            name: 'Super Admin',
            email: 'admin@ocop.vn',
            role: 'admin',
            isActive: true
          };

          console.log('✅ Admin Login successful');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'Admin login successful',
            data: {
              user: user,
              token: token,
              refreshToken: token
            }
          }));
        } else {
          console.log('❌ Admin Login failed');
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        console.error('❌ Admin Login error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
    return;
  }

  // Get current admin user
  if (path === '/api/admin/me' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('✅ Get current admin - valid token');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          _id: 'admin1',
          name: 'Super Admin',
          email: 'admin@ocop.vn',
          role: 'admin',
          isActive: true
        }
      }));
    } else {
      console.log('❌ Get current admin - no token');
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }));
    }
    return;
  }

  // Dashboard stats
  if (path === '/api/admin/dashboard/stats' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('✅ Dashboard stats - valid token');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          totalProducts: 150,
          totalOrders: 320,
          totalUsers: 1250,
          totalRevenue: 2500000,
          orderStats: {
            pending: 15,
            confirmed: 25,
            processing: 10,
            delivered: 240
          },
          productStats: {
            active: 120,
            outOfStock: 10,
            featured: 15,
            ocop: 45
          }
        }
      }));
    } else {
      console.log('❌ Dashboard stats - no token');
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }));
    }
    return;
  }

  // Frontend API endpoints
  if (path === '/api/products/featured' && method === 'GET') {
    const urlParams = new URLSearchParams(parsedUrl.query);
    const limit = parseInt(urlParams.get('limit')) || 8;

    const mockProducts = [
      {
        _id: '1',
        name: 'Bưởi da xanh Đồng Nai',
        description: 'Bưởi da xanh đặc sản Đồng Nai',
        price: 45000,
        originalPrice: 50000,
        discount: 10,
        images: [{ url: 'https://via.placeholder.com/300x300?text=Buoi+Da+Xanh', alt: 'Bưởi da xanh', isPrimary: true }],
        category: { _id: '1', name: 'Trái cây' },
        isFeatured: true,
        rating: { average: 4.5, count: 25 },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: '2',
        name: 'Cacao nguyên chất',
        description: 'Bột cacao nguyên chất Đồng Nai',
        price: 120000,
        originalPrice: 150000,
        discount: 20,
        images: [{ url: 'https://via.placeholder.com/300x300?text=Cacao+Nguyen+Chat', alt: 'Cacao nguyên chất', isPrimary: true }],
        category: { _id: '2', name: 'Hạt & Đậu' },
        isFeatured: true,
        rating: { average: 4.8, count: 18 },
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      }
    ];

    const featuredProducts = mockProducts.filter(p => p.isFeatured).slice(0, limit);

    console.log('✅ Featured products requested');
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: featuredProducts
    }));
    return;
  }

  if (path === '/api/categories' && method === 'GET') {
    const mockCategories = [
      {
        _id: '1',
        name: 'Trái cây',
        icon: '🍊',
        isActive: true,
        sortOrder: 1,
        productCount: 15,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '2',
        name: 'Hạt & Đậu',
        icon: '🥜',
        isActive: true,
        sortOrder: 2,
        productCount: 8,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    console.log('✅ Categories requested');
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: mockCategories
    }));
    return;
  }

  // Auth endpoint for frontend
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('🔐 Frontend Login attempt:', email);

        if (email === 'test@example.com' && password === 'password') {
          const token = 'frontend-jwt-token-' + Date.now();
          const user = {
            _id: 'user1',
            name: 'Test User',
            email: email,
            role: 'user'
          };

          console.log('✅ Frontend Login successful');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            data: {
              user: user,
              token: token,
              refreshToken: token
            }
          }));
        } else {
          console.log('❌ Frontend Login failed');
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        console.error('❌ Frontend Login error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
    return;
  }

  // 404
  console.log('❓ 404:', method, path);
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'API endpoint not found'
  }));
});

server.listen(5000, () => {
  console.log('✅ OCOP API Server started on port 5000');
  console.log('📍 http://localhost:5000');
  console.log('');
  console.log('🔐 Admin Endpoints:');
  console.log('   POST /api/admin/login - Admin Login');
  console.log('   GET /api/admin/me - Get Current Admin');
  console.log('   GET /api/admin/dashboard/stats - Admin Dashboard Stats');
  console.log('');
  console.log('📱 Frontend Endpoints:');
  console.log('   GET /api/products/featured - Get Featured Products');
  console.log('   GET /api/categories - Get Categories');
  console.log('   POST /api/auth/login - User Login');
  console.log('');
  console.log('💡 Test credentials:');
  console.log('   Admin: admin@ocop.vn / admin123');
  console.log('   User: test@example.com / password');
});
