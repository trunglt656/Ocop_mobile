const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/error');

// Load environment variables
console.log('🚀 Starting OCOP Backend Server...');

// Set default environment variables if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  console.log('📝 Using default MongoDB Atlas connection string');
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_super_secret_jwt_key_here_change_in_production';
  console.log('📝 Using default JWT secret (change in production)');
}

if (!process.env.MAX_FILE_SIZE) {
  process.env.MAX_FILE_SIZE = '5000000';
}

if (!process.env.FILE_UPLOAD_PATH) {
  process.env.FILE_UPLOAD_PATH = './uploads';
}

if (!process.env.RATE_LIMIT_WINDOW_MS) {
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
}

if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
}

if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = '7d';
}

console.log('📋 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   PORT:', process.env.PORT || '5000');
console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Connect to MongoDB
connectDB();

const app = express();

console.log('⚙️ Configuring Express middleware...');

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:8081', 'http://localhost:8082', 'http://127.0.0.1:8081', 'http://127.0.0.1:8082'],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

console.log('🔗 Loading API Routes...');

// Routes
console.log('Loading auth routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('   ✅ Auth routes loaded');
} catch (error) {
  console.error('   ❌ Error loading auth routes:', error.message);
  console.error('   Stack:', error.stack);
}

try {
  app.use('/api/products', require('./routes/products'));
  console.log('   ✅ Product routes loaded');
} catch (error) {
  console.error('   ❌ Error loading product routes:', error.message);
}

try {
  app.use('/api/categories', require('./routes/categories'));
  console.log('   ✅ Category routes loaded');
} catch (error) {
  console.error('   ❌ Error loading category routes:', error.message);
}

try {
  app.use('/api/cart', require('./routes/cart'));
  console.log('   ✅ Cart routes loaded');
} catch (error) {
  console.error('   ❌ Error loading cart routes:', error.message);
}

try {
  app.use('/api/orders', require('./routes/orders'));
  console.log('   ✅ Order routes loaded');
} catch (error) {
  console.error('   ❌ Error loading order routes:', error.message);
}

try {
  app.use('/api/addresses', require('./routes/addresses'));
  console.log('   ✅ Address routes loaded');
} catch (error) {
  console.error('   ❌ Error loading address routes:', error.message);
}

try {
  app.use('/api/favorites', require('./routes/favorites'));
  console.log('   ✅ Favorites routes loaded');
} catch (error) {
  console.error('   ❌ Error loading favorites routes:', error.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('   ✅ User routes loaded');
} catch (error) {
  console.error('   ❌ Error loading user routes:', error.message);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('   ✅ Admin routes loaded');
} catch (error) {
  console.error('   ❌ Error loading admin routes:', error.message);
}

// Health check route
app.get('/api/health', (req, res) => {
  console.log(`🏥 Health check requested from ${req.ip} at ${new Date().toISOString()}`);
  res.status(200).json({
    success: true,
    message: 'OCOP Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler (must be before error handler)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ OCOP Backend Server running successfully!`);
  console.log(`🌐 Server Details:`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   API Base URL: http://localhost:${PORT}/api`);
  console.log('');
  console.log(`📚 Available API Endpoints:`);
  console.log(`   POST /api/auth/register - User Registration`);
  console.log(`   POST /api/auth/login - User Login`);
  console.log(`   POST /api/admin/login - Admin Login`);
  console.log(`   GET /api/admin/me - Get Current Admin`);
  console.log(`   GET /api/admin/dashboard/stats - Admin Dashboard Stats`);
  console.log(`   GET /api/products - Get Products`);
  console.log(`   GET /api/categories - Get Categories`);
  console.log(`   GET /api/health - Health Check`);
  console.log('');
  console.log(`💡 Admin Credentials:`);
  console.log(`   Create admin user: Set role='admin' in user registration`);
  console.log(`   Default admin: admin@ocop.vn / admin123`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:');
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:');
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);
  process.exit(1);
});

console.log('🔄 Server initialization complete!');
