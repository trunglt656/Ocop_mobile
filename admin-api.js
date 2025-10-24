const http = require('http');
const url = require('url');

console.log('🚀 Starting Admin API Server...');

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
      message: 'Admin API is running',
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
        console.log('🔐 Login attempt:', email, password);

        // Simple authentication - only allow admin@ocop.vn
        if (email === 'admin@ocop.vn' && password === 'admin123') {
          const token = 'admin-jwt-token-' + Date.now();
          const user = {
            _id: 'admin1',
            name: 'Super Admin',
            email: 'admin@ocop.vn',
            role: 'admin',
            isActive: true
          };

          console.log('✅ Login successful');
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
          console.log('❌ Login failed - invalid credentials');
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        console.error('❌ Login error:', error);
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
      console.log('✅ Get current user - valid token');
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
      console.log('❌ Get current user - no token');
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

  // 404
  console.log('❓ 404:', method, path);
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'API endpoint not found'
  }));
});

// Mock data for frontend
const mockProducts = [
  {
    _id: '1',
    name: 'Bưởi da xanh Đồng Nai',
    description: 'Bưởi da xanh đặc sản Đồng Nai, vỏ mỏng, múi mọng nước, vị ngọt thanh tự nhiên.',
    shortDescription: 'Bưởi da xanh đặc sản Đồng Nai',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    sku: 'BDX-DN-001',
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Buoi+Da+Xanh', alt: 'Bưởi da xanh', isPrimary: true }
    ],
    category: { _id: '1', name: 'Trái cây' },
    brand: 'OCOP Đồng Nai',
    weight: 1.2,
    unit: 'kg',
    stock: 100,
    minStock: 10,
    status: 'active',
    isFeatured: true,
    isOCOP: true,
    ocopLevel: '4 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Long Khánh',
      address: 'Xã Bàu Sen'
    },
    producer: {
      name: 'HTX Bưởi Da Xanh',
      phone: '0987654321',
      email: 'htxbuoi@gmail.com'
    },
    specifications: [
      { name: 'Kích thước', value: 'Đường kính 20-25cm' },
      { name: 'Trọng lượng', value: '1.0-1.5kg' }
    ],
    tags: ['OCOP', 'Đồng Nai', 'Trái cây', 'Tự nhiên'],
    rating: { average: 4.5, count: 25 },
    totalSold: 150,
    seo: {
      metaTitle: 'Bưởi da xanh Đồng Nai - Đặc sản OCOP',
      metaDescription: 'Bưởi da xanh đặc sản Đồng Nai, sản phẩm OCOP 4 sao',
      slug: 'buoi-da-xanh-dong-nai'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Cacao nguyên chất',
    description: 'Bột cacao nguyên chất từ hạt cacao Đồng Nai, không đường, giữ nguyên hương vị tự nhiên.',
    shortDescription: 'Bột cacao nguyên chất Đồng Nai',
    price: 120000,
    originalPrice: 150000,
    discount: 20,
    sku: 'CAC-DN-001',
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Cacao+Nguyen+Chat', alt: 'Cacao nguyên chất', isPrimary: true }
    ],
    category: { _id: '2', name: 'Hạt & Đậu' },
    brand: 'Cacao Đồng Nai',
    weight: 0.5,
    unit: 'kg',
    stock: 50,
    minStock: 5,
    status: 'active',
    isFeatured: true,
    isOCOP: true,
    ocopLevel: '3 sao',
    origin: {
      province: 'Đồng Nai',
      district: 'Định Quán',
      address: 'Xã Ngọc Định'
    },
    producer: {
      name: 'HTX Cacao Định Quán',
      phone: '0987654322',
      email: 'htxcacao@gmail.com'
    },
    specifications: [
      { name: 'Thành phần', value: '100% cacao nguyên chất' },
      { name: 'Xuất xứ', value: 'Đồng Nai' }
    ],
    tags: ['OCOP', 'Cacao', 'Nguyên chất'],
    rating: { average: 4.8, count: 18 },
    totalSold: 80,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];

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
  },
  {
    _id: '3',
    name: 'Kẹo & Bánh',
    icon: '🍬',
    isActive: true,
    sortOrder: 3,
    productCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '4',
    name: 'Thực phẩm khác',
    icon: '🍽️',
    isActive: true,
    sortOrder: 4,
    productCount: 20,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Frontend API endpoints
if (path === '/api/products/featured' && method === 'GET') {
  const urlParams = new URLSearchParams(parsedUrl.query);
  const limit = parseInt(urlParams.get('limit')) || 8;
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
  const urlParams = new URLSearchParams(parsedUrl.query);
  const includeProducts = urlParams.get('includeProducts') === 'true';

  console.log('✅ Categories requested');
  let categoriesData = mockCategories;

  if (includeProducts) {
    categoriesData = mockCategories.map(category => ({
      ...category,
      products: mockProducts.filter(p => p.category._id === category._id)
    }));
  }

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: categoriesData
  }));
  return;
}

if (path === '/api/products' && method === 'GET') {
  const urlParams = new URLSearchParams(parsedUrl.query);
  const featured = urlParams.get('featured');
  const category = urlParams.get('category');
  let filteredProducts = [...mockProducts];

  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category._id === category);
  }

  console.log('✅ Products requested');
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    data: {
      count: filteredProducts.length,
      totalCount: filteredProducts.length,
      totalPages: 1,
      currentPage: 1,
      data: filteredProducts
    }
  }));
  return;
}

if (path.startsWith('/api/products/') && method === 'GET' && !path.includes('/featured') && !path.includes('/ocp') && !path.includes('/search')) {
  const productId = path.split('/api/products/')[1];
  const product = mockProducts.find(p => p._id === productId);

  if (product) {
    console.log('✅ Product detail requested:', productId);
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: product
    }));
  } else {
    console.log('❌ Product not found:', productId);
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'Product not found'
    }));
  }
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

      // Simple authentication for testing
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
        console.log('❌ Frontend Login failed:', email);
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
  console.log('   GET /api/products - Get Products');
  console.log('   GET /api/products/:id - Get Product Details');
  console.log('   GET /api/categories - Get Categories');
  console.log('   POST /api/auth/login - User Login');
  console.log('');
  console.log('💡 Test credentials:');
  console.log('   Admin: admin@ocop.vn / admin123');
  console.log('   User: test@example.com / password');
});
