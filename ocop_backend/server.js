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
console.log('Starting server...');

// Set default environment variables if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_super_secret_jwt_key_here_change_in_production';
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

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting - more generous in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 
    : 1000, // 1000 requests per 15 minutes in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for static files
    return req.url.startsWith('/uploads');
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Cho phép requests không có origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Chỉ cho phép domain cụ thể
      const allowedOrigins = ['https://yourdomain.com'];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: Cho phép localhost và local network
      const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,  // Cho phép mọi IP trong 192.168.x.x
        /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,   // Cho phép mọi IP trong 10.x.x.x
      ];
      
      const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('⚠️  CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
// Allow admin UI running on port 7000 during development
// (additionally allow http://localhost:7000 to CORS origins)
if (process.env.NODE_ENV !== 'production') {
  try {
    // mutate origin array safely
    const origins = app && app.get && app.get('origins');
  } catch (e) {}
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/shop/orders', require('./routes/shopOrders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/news', require('./routes/news'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
// 404 handler (should be before the error handler so 404s can be passed to error handler if needed)
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down...');
  server.close(async () => {
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('Server stopped');
      process.exit(0);
    } catch (e) {
      console.error('Error closing MongoDB connection:', e);
      process.exit(0);
    }
  });

  setTimeout(() => {
    console.error('Force shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
