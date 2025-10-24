const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock data
const mockProducts = [
  {
    _id: '1',
    name: 'Mật ong hoa rừng nguyên chất',
    description: 'Mật ong hoa rừng tự nhiên 100%, không pha tạp chất, được thu hoạch từ các vùng núi cao Việt Nam.',
    price: 250000,
    originalPrice: 300000,
    discount: 17,
    unit: 'lọ',
    stock: 50,
    images: [
      { url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500', alt: 'Mật ong hoa rừng', isPrimary: true }
    ],
    category: { _id: '1', name: 'Mật ong' },
    rating: { average: 4.8, count: 125 },
    origin: { province: 'Lâm Đồng', district: 'Đà Lạt', address: 'Vùng núi Lang Biang' },
    status: 'active',
    isFeatured: true,
    totalSold: 500
  },
  {
    _id: '2',
    name: 'Trà xanh OCOP 5 sao',
    description: 'Trà xanh cao cấp được chế biến từ lá trà tươi hái bằng tay, đạt chuẩn OCOP 5 sao.',
    price: 150000,
    originalPrice: null,
    discount: 0,
    unit: 'hộp',
    stock: 30,
    images: [
      { url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500', alt: 'Trà xanh', isPrimary: true }
    ],
    category: { _id: '2', name: 'Trà' },
    rating: { average: 4.6, count: 89 },
    origin: { province: 'Thái Nguyên', district: 'Tân Cương', address: 'Vùng chè Tân Cương' },
    status: 'active',
    isFeatured: true,
    totalSold: 300
  },
  {
    _id: '3',
    name: 'Gạo nếp cái hoa vàng',
    description: 'Gạo nếp cái hoa vàng đặc sản, hạt tròn đều, dẻo thơm, thích hợp cho các món xôi truyền thống.',
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    unit: 'kg',
    stock: 100,
    images: [
      { url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500', alt: 'Gạo nếp', isPrimary: true }
    ],
    category: { _id: '3', name: 'Gạo' },
    rating: { average: 4.7, count: 200 },
    origin: { province: 'Bắc Ninh', district: 'Quế Võ', address: 'Vùng lúa Quế Võ' },
    status: 'active',
    isFeatured: false,
    totalSold: 800
  },
  {
    _id: '4',
    name: 'Rượu nếp cái hoa vàng',
    description: 'Rượu nếp cái hoa vàng truyền thống, được ủ men lá theo phương pháp cổ truyền.',
    price: 120000,
    originalPrice: 150000,
    discount: 20,
    unit: 'lít',
    stock: 25,
    images: [
      { url: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=500', alt: 'Rượu nếp', isPrimary: true }
    ],
    category: { _id: '4', name: 'Rượu' },
    rating: { average: 4.5, count: 67 },
    origin: { province: 'Hà Nội', district: 'Ba Vì', address: 'Vùng núi Ba Vì' },
    status: 'active',
    isFeatured: true,
    totalSold: 150
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OCOP Mock API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    count: mockProducts.length,
    totalCount: mockProducts.length,
    totalPages: 1,
    currentPage: 1,
    data: mockProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
});

app.get('/api/products/featured', (req, res) => {
  const featuredProducts = mockProducts.filter(p => p.isFeatured);
  res.json({
    success: true,
    count: featuredProducts.length,
    data: featuredProducts
  });
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categories = [
    { _id: '1', name: 'Mật ong', description: 'Các sản phẩm mật ong tự nhiên' },
    { _id: '2', name: 'Trà', description: 'Các loại trà đặc sản' },
    { _id: '3', name: 'Gạo', description: 'Gạo đặc sản các vùng' },
    { _id: '4', name: 'Rượu', description: 'Rượu truyền thống' }
  ];

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// Cart endpoints
app.get('/api/cart', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [],
      summary: { totalItems: 0, totalPrice: 0 }
    }
  });
});

console.log(`🚀 Mock API server running on port ${PORT}`);
console.log(`📊 Available endpoints:`);
console.log(`   GET /api/health`);
console.log(`   GET /api/products`);
console.log(`   GET /api/products/:id`);
console.log(`   GET /api/products/featured`);
console.log(`   GET /api/categories`);
console.log(`   GET /api/cart`);

app.listen(PORT, () => {
  console.log(`✅ Server is ready at http://localhost:${PORT}`);
});
