/**
 * API Configuration
 * Base URL and common API settings for the OCOP e-commerce app
 */

export const API_CONFIG = {
  // Backend API base URL - change this to your deployed backend URL
  BASE_URL: __DEV__
    ? 'http://192.168.1.50:5000/api' // <-- IMPORTANT: Change this to your computer's IP address on the local network, e.g., 'http://192.168.1.10:5000/api'
    : 'https://your-backend-domain.com/api',

  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      REFRESH_TOKEN: '/auth/refresh-token',
      UPDATE_PROFILE: '/auth/update-profile',
      CHANGE_PASSWORD: '/auth/change-password',
    },

    // Products
    PRODUCTS: {
      LIST: '/products',
      DETAIL: '/products',
      FEATURED: '/products/featured',
      OCOP: '/products/ocp',
      SEARCH: '/products/search',
      BY_CATEGORY: '/products/category',
      STATS: '/products/admin/stats',
    },

    // Categories
    CATEGORIES: {
      LIST: '/categories',
      TREE: '/categories/tree',
      POPULAR: '/categories/popular',
      DETAIL: '/categories',
      PRODUCTS: '/categories',
    },

    // Cart
    CART: {
      GET: '/cart',
      ADD: '/cart',
      UPDATE: '/cart',
      REMOVE: '/cart',
      CLEAR: '/cart',
      SUMMARY: '/cart/summary',
    },

    // Orders
    ORDERS: {
      LIST: '/orders',
      DETAIL: '/orders',
      CREATE: '/orders',
      CANCEL: '/orders',
      ADMIN_ALL: '/orders/admin/all',
      ADMIN_STATS: '/orders/admin/stats',
      ADMIN_UPDATE_STATUS: '/orders',
    },

    // Addresses
    ADDRESSES: {
      LIST: '/addresses',
      DETAIL: '/addresses',
      CREATE: '/addresses',
      UPDATE: '/addresses',
      DELETE: '/addresses',
      DEFAULT: '/addresses/default',
      SET_DEFAULT: '/addresses/:id/default',
    },

    // Favorites
    FAVORITES: {
      LIST: '/favorites',
      CHECK: '/favorites/check',
      TOGGLE: '/favorites',
    },

    // Users (Admin)
    USERS: {
      LIST: '/users',
      DETAIL: '/users',
      UPDATE: '/users',
      DELETE: '/users',
      STATS: '/users/stats',
    },

    // Health check
    HEALTH: '/health',
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000,
  },
};

export default API_CONFIG;
