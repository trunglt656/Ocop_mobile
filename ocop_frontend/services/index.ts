// Export all API services from a single entry point
export { default as apiClient, ApiError } from './apiClient';
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as addressService } from './addressService';
export { default as favoritesService } from './favoritesService';

// Export types
export type { ApiResponse } from './apiClient';
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest
} from './authService';
export type {
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest
} from './productService';
export type {
  Category,
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from './categoryService';
export type {
  Cart,
  CartItem,
  CartSummary,
  AddToCartRequest,
  UpdateCartItemRequest
} from './cartService';
export type {
  Order,
  OrderListResponse,
  CreateOrderRequest,
  CancelOrderRequest
} from './orderService';
export type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest
} from './addressService';
export type {
  Favorite,
  FavoriteListResponse
} from './favoritesService';
