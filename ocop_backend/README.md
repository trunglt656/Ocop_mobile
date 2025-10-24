# OCOP Backend API

Backend API for OCOP (One Commune One Product) e-commerce platform specializing in Đồng Nai province products.

## Features

- 🔐 **User Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Role-based access control (User/Admin)
  - Password management

- 📦 **Product Management**
  - CRUD operations for products
  - Advanced search and filtering
  - Category-based organization
  - Image upload support
  - OCOP certification levels

- 🛒 **Shopping Cart**
  - Add/remove/update cart items
  - Stock validation
  - Price calculations with discounts

- 📋 **Order Management**
  - Order creation and tracking
  - Multiple payment methods (COD, Bank Transfer, E-wallet, Credit Card)
  - Order status management
  - Admin order management

- 📍 **Address Management**
  - Multiple address support
  - Default address setting
  - Full address validation

- ❤️ **Favorites/Wishlist**
  - Add/remove favorite products
  - Quick access to preferred items

- 👥 **User Management (Admin)**
  - User administration
  - Role management
  - Activity monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## Installation

1. **Clone the repository**
   ```bash
   cd ocop_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://haibara554_db_user:0pP6pJJ3PrqDPMeG@cluster0.lcqg2zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=7d

   # File Upload Configuration
   MAX_FILE_SIZE=5000000
   FILE_UPLOAD_PATH=./uploads

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get Products (Public)
```http
GET /api/products?page=1&limit=12&category=60f1b2b3c4d5e6f7g8h9i0j1&search=tra&minPrice=10000&maxPrice=100000
```

#### Get Single Product (Public)
```http
GET /api/products/60f1b2b3c4d5e6f7g8h9i0j1
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Trà OCOP 5 sao",
  "description": "Trà đặc sản Đồng Nai",
  "price": 50000,
  "category": "60f1b2b3c4d5e6f7g8h9i0j1",
  "stock": 100,
  "isOCOP": true,
  "ocopLevel": "5 sao",
  "origin": {
    "province": "Đồng Nai",
    "district": "Biên Hòa",
    "address": "123 Đường ABC"
  },
  "producer": {
    "name": "Hợp tác xã XYZ",
    "phone": "0123456789",
    "email": "contact@xyz.com"
  }
}
```

### Category Endpoints

#### Get Categories (Public)
```http
GET /api/categories
```

#### Get Category Tree (Public)
```http
GET /api/categories/tree
```

### Cart Endpoints

#### Get Cart (Authenticated)
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart (Authenticated)
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "quantity": 2
}
```

### Order Endpoints

#### Get Orders (Authenticated)
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Create Order (Authenticated)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "cod",
  "notes": "Giao hàng cẩn thận"
}
```

### Address Endpoints

#### Get Addresses (Authenticated)
```http
GET /api/addresses
Authorization: Bearer <token>
```

#### Create Address (Authenticated)
```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "0123456789",
  "address": "123 Đường ABC",
  "ward": "Phường 1",
  "district": "Quận 1",
  "province": "TP.HCM",
  "isDefault": true
}
```

## Data Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  category: ObjectId (ref: Category),
  stock: Number (required),
  images: Array of image objects,
  isOCOP: Boolean,
  ocopLevel: String (enum: ['3 sao', '4 sao', '5 sao']),
  origin: {
    province: String,
    district: String,
    address: String
  },
  producer: {
    name: String,
    phone: String,
    email: String,
    address: String
  }
}
```

### Order
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: Array of order items,
  shippingAddress: Address object,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers for Express
- **Password Hashing**: Secure password storage with bcrypt

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error details"] // if validation failed
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `MAX_FILE_SIZE` | Max upload file size (bytes) | 5000000 |
| `FILE_UPLOAD_PATH` | Upload directory | ./uploads |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Project Structure

```
ocop_backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product management
│   ├── categoryController.js# Category management
│   ├── cartController.js    # Shopping cart logic
│   ├── orderController.js   # Order management
│   ├── addressController.js # Address management
│   ├── favoriteController.js# Favorites management
│   └── userController.js    # User management (admin)
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── error.js            # Error handling middleware
├── models/
│   ├── User.js             # User schema
│   ├── Product.js          # Product schema
│   ├── Category.js         # Category schema
│   ├── Cart.js             # Shopping cart schema
│   ├── Order.js            # Order schema
│   ├── Address.js          # Address schema
│   └── Favorite.js         # Favorites schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── categories.js       # Category routes
│   ├── cart.js             # Cart routes
│   ├── orders.js           # Order routes
│   ├── addresses.js        # Address routes
│   ├── favorites.js        # Favorites routes
│   └── users.js            # User management routes
├── utils/
│   ├── helpers.js          # Utility functions
│   └── upload.js           # File upload utilities
├── uploads/                # File upload directory
├── server.js               # Main server file
├── package.json            # Dependencies
├── .env                    # Environment variables
└── .gitignore             # Git ignore rules
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please contact the development team.
