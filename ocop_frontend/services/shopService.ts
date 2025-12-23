import apiClient from './apiClient';
import { API_CONFIG } from '@/constants/api';

export interface Shop {
  _id: string;
  name: string;
  slug?: string;
  owner: string | {
    _id: string;
    name: string;
    email: string;
  };
  admins?: string[];
  staff?: string[];
  contact: {
    phone?: string;
    email?: string;
  };
  address?: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  verificationDocuments?: Array<{
    _id: string;
    type: string;
    url: string;
    filename?: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  }>;
  commission?: number;
  rating?: {
    average: number;
    count: number;
  };
  totalProducts?: number;
  totalSales?: number;
  isActive: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopRegistrationData {
  name: string;
  contact: {
    phone: string;
    email: string;
  };
  address: string;
  description: string;
  logo?: string;
  banner?: string;
}

export interface ShopDashboard {
  shop?: Shop;
  stats?: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    totalOrders: number;
    totalRevenue: number;
    orderStats: {
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  // Support both nested and flat structure
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  averageRating?: number;
  recentOrders?: any[];
}

class ShopService {
  /**
   * Get all shops (public)
   */
  async getShops(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const response = await apiClient.get<{ data: Shop[]; total: number; pages: number }>(
      API_CONFIG.ENDPOINTS.SHOPS.LIST,
      { params }
    );
    return response.data;
  }

  /**
   * Get my shop (current user's shop)
   */
  async getMyShop() {
    const response = await apiClient.get<{ data: Shop }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.LIST}/my-shop`
    );
    return response.data;
  }

  /**
   * Get single shop by ID
   */
  async getShop(shopId: string) {
    const response = await apiClient.get<{ data: Shop }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.DETAIL}/${shopId}`
    );
    return response.data;
  }

  /**
   * Register new shop
   */
  async registerShop(data: ShopRegistrationData) {
    const response = await apiClient.post<{ data: Shop; message: string }>(
      API_CONFIG.ENDPOINTS.SHOPS.REGISTER,
      data
    );
    return response.data;
  }

  /**
   * Update shop information
   */
  async updateShop(shopId: string, data: Partial<ShopRegistrationData>) {
    const response = await apiClient.put<{ data: Shop }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.DETAIL}/${shopId}`,
      data
    );
    return response.data;
  }

  /**
   * Get shop dashboard stats
   */
  async getShopDashboard(shopId: string) {
    const response = await apiClient.get<{ data: ShopDashboard }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.DASHBOARD}/${shopId}/dashboard`
    );
    return response.data;
  }

  /**
   * Upload shop verification document
   */
  async uploadDocument(shopId: string, data: {
    type: string;
    url: string;
    filename: string;
  }) {
    const response = await apiClient.post<{ data: Shop }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.DOCUMENTS}/${shopId}/documents`,
      data
    );
    return response.data;
  }

  /**
   * Add staff member to shop
   */
  async addStaff(shopId: string, data: {
    userId: string;
    role: 'shop_admin' | 'shop_staff';
  }) {
    const response = await apiClient.post<{ data: { shop: Shop; user: any } }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.STAFF}/${shopId}/staff`,
      data
    );
    return response.data;
  }

  /**
   * Remove staff member from shop
   */
  async removeStaff(shopId: string, userId: string) {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.SHOPS.STAFF}/${shopId}/staff/${userId}`
    );
    return response.message;
  }
}

export const shopService = new ShopService();
export default shopService;
