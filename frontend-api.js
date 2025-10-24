const express = require('express');
const cors = require('cors');

console.log('🚀 Starting OCOP Frontend Mock API Server...');
console.log('📍 Port: 5000');
console.log('🌐 URL: http://localhost:5000');
console.log('');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:19006', 'http://127.0.0.1:8081', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Mock data
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OCOP Frontend API is running',
    timestamp: new Date().toISOString()
  });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, featured, category } = req.query;
  let filteredProducts = [...mockProducts];

  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category._id === category);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      count: paginatedProducts.length,
      totalCount: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      currentPage: parseInt(page),
      data: paginatedProducts
    }
  });
});

app.get('/api/products/featured', (req, res) => {
  const { limit = 8 } = req.query;
  const featuredProducts = mockProducts.filter(p => p.isFeatured).slice(0, parseInt(limit));

  res.json({
    success: true,
    data: featuredProducts
  });
});

app.get('/api/products/ocp', (req, res) => {
  const ocopProducts = mockProducts.filter(p => p.isOCOP);

  res.json({
    success: true,
    data: {
      count: ocopProducts.length,
      totalCount: ocopProducts.length,
      totalPages: 1,
      currentPage: 1,
      data: ocopProducts
    }
  });
});

app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  const searchResults = mockProducts.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );

  res.json({
    success: true,
    data: {
      count: searchResults.length,
      totalCount: searchResults.length,
      totalPages: 1,
      currentPage: 1,
      data: searchResults
    }
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Categories endpoints
app.get('/api/categories', (req, res) => {
  const { includeProducts = false } = req.query;

  let response = {
    success: true,
    data: mockCategories
  };

  if (includeProducts === 'true') {
    // Add products to categories
    response.data = mockCategories.map(category => ({
      ...category,
      products: mockProducts.filter(p => p.category._id === category._id)
    }));
  }

  res.json(response);
});

// Auth endpoints (basic mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: 'user1',
          name: 'Test User',
          email: email,
          role: 'user'
        },
        token: 'mock-jwt-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('✅ OCOP Frontend Mock API Server running!');
  console.log(`🌐 Server Details:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   API Base URL: http://localhost:${PORT}/api`);
  console.log('');
  console.log(`📚 Available API Endpoints:`);
  console.log(`   GET /api/health - Health Check`);
  console.log(`   GET /api/products - Get Products`);
  console.log(`   GET /api/products/featured - Get Featured Products`);
  console.log(`   GET /api/products/:id - Get Product Details`);
  console.log(`   GET /api/categories - Get Categories`);
  console.log(`   POST /api/auth/login - User Login`);
  console.log('');
  console.log(`🧪 Test Data:`);
  console.log(`   Featured Products: ${mockProducts.filter(p => p.isFeatured).length}`);
  console.log(`   Total Products: ${mockProducts.length}`);
  console.log(`   Categories: ${mockCategories.length}`);
});
