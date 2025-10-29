import apiClient, { ApiResponse } from './apiClient';
import API_CONFIG from '../constants/api';
import { Address } from './addressService';

export interface OrderItem {
  _id: string;
  product: any; // Simplified for now, consider a Product interface
  name: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: Partial<Address>;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';
  notes?: string;
}

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>(API_CONFIG.ENDPOINTS.ORDERS.CREATE, data);
  }

  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Order[]>> {
    return apiClient.get<ApiResponse<Order[]>>(API_CONFIG.ENDPOINTS.ORDERS.LIST, params);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(`${API_CONFIG.ENDPOINTS.ORDERS.DETAIL}/${id}`);
  }
}

export const orderService = new OrderService();
export default orderService;