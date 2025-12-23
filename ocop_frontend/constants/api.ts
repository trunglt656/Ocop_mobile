import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve API base URL dynamically so the app works across devices
 * without hard-coding local IP addresses.
 */
const sanitizeUrl = (url: string) => url.replace(/\/+$/, '');

const getEnvApiUrl = () => {
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra as Record<string, any> | undefined)?.apiUrl;

  if (!envUrl) {
    return undefined;
  }

  return sanitizeUrl(envUrl);
};

const getDebuggerHost = () => {
  const expoConfig = Constants.expoConfig as Record<string, any> | undefined;
  const debuggerHost =
    expoConfig?.hostUri ||
    expoConfig?.extra?.expoGo?.debuggerHost ||
    (Constants as unknown as { debuggerHost?: string }).debuggerHost;

  if (!debuggerHost) {
    return undefined;
  }

  return debuggerHost.split(':')[0];
};

// =================================================================
// BẮT ĐẦU PHẦN ĐÃ SỬA
// =================================================================
const getLocalApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  // 1. Ưu tiên host của debugger (hoạt động khi chạy bằng Expo Go)
  const host = getDebuggerHost();
  if (host) {
    return `http://${host}:5000/api`;
  }

  // 2. Dùng địa chỉ IP local (cho development)
  return 'http://192.168.1.25:5000/api';
};
// =================================================================
// KẾT THÚC PHẦN ĐÃ SỬA
// =================================================================

// PRODUCTION API URL - URL ngrok để APK chạy trên mọi thiết bị
// Thay đổi URL này sau khi chạy ngrok (ví dụ: https://1234-abc-def.ngrok-free.app/api)
// Hoặc để IP local nếu test trong cùng mạng WiFi: http://192.168.1.25:5000/api
const PRODUCTION_API_URL = 'http://192.168.1.25:5000/api';

// Ưu tiên: EXPO_PUBLIC_API_URL > PRODUCTION_API_URL > getLocalApiUrl()
const envUrl = getEnvApiUrl();
const BASE_URL = envUrl || PRODUCTION_API_URL;

// Debug: Log URL đang sử dụng (chỉ hiện trong development)
if (__DEV__) {
  console.log('🔗 API Config:', {
    envUrl,
    PRODUCTION_API_URL,
    BASE_URL,
    platform: Platform.OS,
    debuggerHost: getDebuggerHost(),
  });
}

export const API_CONFIG = {
  // Backend API base URL - can be overridden with EXPO_PUBLIC_API_URL
  BASE_URL,

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

    // Shops
    SHOPS: {
      LIST: '/shops',
      DETAIL: '/shops',
      REGISTER: '/shops/register',
      DASHBOARD: '/shops',
      STAFF: '/shops',
      DOCUMENTS: '/shops',
    },

    // Upload
    UPLOAD: {
      IMAGE: '/upload/image',
      IMAGES: '/upload/images',
      DELETE: '/upload',
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