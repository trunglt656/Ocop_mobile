# OCOP Frontend

React Native/Expo frontend for the OCOP (One Commune One Product) e-commerce platform specializing in Đồng Nai province products.

## Features

- 🏠 **Home Screen** with featured products and categories
- 🛒 **Shopping Cart** with real-time updates
- 📦 **Product Management** with detailed product information
- 👤 **User Authentication** (Login/Register)
- 📍 **Address Management** for delivery
- ❤️ **Favorites/Wishlist** for saved products
- 📋 **Order Tracking** with status updates
- 🔍 **Product Search** and filtering
- 🎯 **OCOP Certification** badges and information

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context + useReducer
- **HTTP Client**: Custom API client with retry logic
- **Storage**: AsyncStorage for user sessions
- **TypeScript**: Full type safety

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Backend Setup

Make sure your backend is running on `http://localhost:5000`. If using a different URL, update the `API_CONFIG.BASE_URL` in `constants/api.ts`.

### 3. Start Development Server

```bash
npm start
```

Then use the Expo Go app on your device or run on simulator:

```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## API Integration

The frontend is fully integrated with the backend API:

### Services Available

- **Authentication**: Login, register, profile management
- **Products**: Browse, search, featured products
- **Categories**: Category tree, product filtering
- **Cart**: Add, update, remove items
- **Orders**: Create, track, manage orders
- **Addresses**: Manage delivery addresses
- **Favorites**: Wishlist management

### API Configuration

```typescript
// constants/api.ts
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:5000/api'  // Development
    : 'https://your-backend-domain.com/api', // Production

  // All API endpoints defined
  ENDPOINTS: {
    AUTH: { REGISTER: '/auth/register', LOGIN: '/auth/login', ... },
    PRODUCTS: { LIST: '/products', DETAIL: '/products', ... },
    // ... more endpoints
  }
};
```

### Using API Services

```typescript
import { productService, authService, cartService } from '@/services';

// Get featured products
const products = await productService.getFeaturedProducts({ limit: 10 });

// Login user
const response = await authService.login({ email, password });

// Add to cart
await cartService.addToCart({ productId, quantity: 1 });
```

## Project Structure

```
frontend/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home screen with API integration
│   │   ├── categories.tsx # Categories screen
│   │   ├── cart.tsx       # Shopping cart
│   │   ├── profile.tsx    # User profile
│   │   └── explore.tsx    # Product exploration
│   ├── product/           # Product detail screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── themed-text.tsx    # Themed text component
│   ├── themed-view.tsx    # Themed view component
│   └── ui/                # UI components
├── constants/             # App constants
│   ├── api.ts            # API configuration
│   ├── products.ts       # Product types and interfaces
│   └── theme.ts          # Theme configuration
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── services/              # API services
│   ├── apiClient.ts      # HTTP client with error handling
│   ├── authService.ts    # Authentication API calls
│   ├── productService.ts # Product API calls
│   ├── cartService.ts    # Cart API calls
│   ├── orderService.ts   # Order API calls
│   ├── addressService.ts # Address API calls
│   └── favoritesService.ts # Favorites API calls
└── hooks/                 # Custom React hooks
```

## Key Features Implemented

### 🔐 Authentication Context
- User login/logout state management
- Token refresh handling
- Secure storage integration
- Error handling and loading states

### 🛒 Shopping Cart
- Real-time cart updates
- Stock validation
- Price calculations with discounts
- Persistent cart state

### 📦 Product Management
- Dynamic product loading from API
- Featured products section
- Category-based filtering
- OCOP certification display
- Product search and pagination

### 🏷️ Category System
- Hierarchical categories
- Category icons and navigation
- Product count per category
- API-driven category management

## Development Tips

### Adding New API Endpoints

1. **Update API_CONFIG** in `constants/api.ts`:
```typescript
ENDPOINTS: {
  NEW_FEATURE: {
    LIST: '/new-feature',
    CREATE: '/new-feature',
    UPDATE: '/new-feature',
    DELETE: '/new-feature',
  }
}
```

2. **Create Service** in `services/`:
```typescript
// services/newFeatureService.ts
import apiClient from './apiClient';
import API_CONFIG from '../constants/api';

class NewFeatureService {
  async getItems() {
    return apiClient.get(API_CONFIG.ENDPOINTS.NEW_FEATURE.LIST);
  }

  async createItem(data: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.NEW_FEATURE.CREATE, data);
  }
}

export const newFeatureService = new NewFeatureService();
```

3. **Add to services index**:
```typescript
// services/index.ts
export { default as newFeatureService } from './newFeatureService';
```

### Error Handling

The API client includes comprehensive error handling:

```typescript
try {
  const response = await productService.getProducts();
  if (response.data) {
    setProducts(response.data.data);
  }
} catch (error: any) {
  console.error('Error loading products:', error.message);
  // Handle error (show toast, fallback data, etc.)
}
```

## Testing

### Health Check
Test backend connection:
```bash
curl http://localhost:5000/api/health
```

### API Testing
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"0123456789","password":"password123"}'

# Get products
curl http://localhost:5000/api/products
```

## What's New (API Integration)

✅ **Backend API Integration Complete**
- All frontend screens now use real API calls
- Dynamic product loading from backend
- User authentication with JWT tokens
- Shopping cart with backend synchronization
- Order management and tracking
- Address management for delivery
- Favorites/wishlist functionality

✅ **Type Safety**
- Full TypeScript integration
- Proper interfaces for all API responses
- Type-safe API client with error handling

✅ **State Management**
- React Context for authentication state
- Proper loading and error states
- Optimistic updates for better UX

## Next Steps

1. **Install Dependencies**: Run `npm install`
2. **Start Backend**: Ensure backend is running on port 5000
3. **Start Frontend**: Run `npm start`
4. **Test Integration**: Verify API calls are working
5. **Add Authentication UI**: Complete login/register screens
6. **Enhance Cart**: Add cart persistence and animations
7. **Deploy**: Deploy both frontend and backend

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Update documentation
5. Test API integration thoroughly
