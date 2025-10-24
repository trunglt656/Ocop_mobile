import apiClient, { ApiResponse } from './apiClient';
import API_CONFIG from '../constants/api';

// Types for cart
export interface CartItem {
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt: string; isPrimary: boolean }>;
    price: number;
    discount: number;
    stock: number;
    status: string;
  };
  quantity: number;
  price: number;
  discount: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Cart service class
class CartService {
  // Get user's cart
  async getCart(): Promise<ApiResponse<Cart>> {
    return apiClient.get<ApiResponse<Cart>>(API_CONFIG.ENDPOINTS.CART.GET);
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<ApiResponse<Cart>> {
    return apiClient.post<ApiResponse<Cart>>(API_CONFIG.ENDPOINTS.CART.ADD, data);
  }

  // Update cart item quantity
  async updateCartItem(productId: string, data: UpdateCartItemRequest): Promise<ApiResponse<Cart>> {
    return apiClient.put<ApiResponse<Cart>>(`${API_CONFIG.ENDPOINTS.CART.UPDATE}/${productId}`, data);
  }

  // Remove item from cart
  async removeFromCart(productId: string): Promise<ApiResponse<Cart>> {
    return apiClient.delete<ApiResponse<Cart>>(`${API_CONFIG.ENDPOINTS.CART.REMOVE}/${productId}`);
  }

  // Clear cart
  async clearCart(): Promise<ApiResponse<Cart>> {
    return apiClient.delete<ApiResponse<Cart>>(API_CONFIG.ENDPOINTS.CART.CLEAR);
  }

  // Get cart summary
  async getCartSummary(): Promise<ApiResponse<CartSummary>> {
    return apiClient.get<ApiResponse<CartSummary>>(API_CONFIG.ENDPOINTS.CART.SUMMARY);
  }
}

// Export singleton instance
export const cartService = new CartService();
export default cartService;
