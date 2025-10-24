import apiClient, { ApiResponse } from '../services/apiClient';
import API_CONFIG from '../constants/api';

// Types for orders
export interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
    discount: number;
  };
  name: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  total: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  instructions?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  count: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  data: Order[];
}

export interface CreateOrderRequest {
  shippingAddress?: ShippingAddress;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

// Order service class
class OrderService {
  // Get user's orders
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<OrderListResponse>> {
    return apiClient.get<ApiResponse<OrderListResponse>>(API_CONFIG.ENDPOINTS.ORDERS.LIST, params);
  }

  // Get single order
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(`${API_CONFIG.ENDPOINTS.ORDERS.DETAIL}/${id}`);
  }

  // Create new order
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, data);
  }

  // Cancel order
  async cancelOrder(id: string, data: CancelOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.put<ApiResponse<Order>>(`${API_CONFIG.ENDPOINTS.ORDERS.CANCEL}/${id}`, data);
  }

  // Get all orders (Admin only)
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<OrderListResponse>> {
    return apiClient.get<ApiResponse<OrderListResponse>>(API_CONFIG.ENDPOINTS.ORDERS.ADMIN_ALL, params);
  }

  // Get order statistics (Admin only)
  async getOrderStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_CONFIG.ENDPOINTS.ORDERS.ADMIN_STATS, params);
  }

  // Update order status (Admin only)
  async updateOrderStatus(id: string, data: {
    status: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    return apiClient.put<ApiResponse<Order>>(`${API_CONFIG.ENDPOINTS.ORDERS.ADMIN_UPDATE_STATUS}/${id}`, data);
  }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService;
