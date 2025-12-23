import api from '@/lib/api';
import { Order } from '@/types/order';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  count?: number;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrderStatsResponse {
  success: boolean;
  data: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    recentOrders: Order[];
  };
}

// Get all orders (admin)
export const getOrders = async (filters?: OrderFilters): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sort) params.append('sort', filters.sort);
  }

  const response = await api.get(`/orders/admin/all?${params.toString()}`);
  
  // Transform backend response
  const backendData = response.data;
  return {
    success: backendData.success,
    data: backendData.data,
    pagination: {
      page: backendData.currentPage || filters?.page || 1,
      limit: filters?.limit || 10,
      total: backendData.totalCount || 0,
      pages: backendData.totalPages || 1,
    },
  };
};

// Get single order
export const getOrder = async (id: string): Promise<OrderResponse> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (
  id: string,
  status: Order['orderStatus'],
  trackingNumber?: string
): Promise<OrderResponse> => {
  const response = await api.put(`/orders/${id}/status`, {
    status,
    trackingNumber,
  });
  return response.data;
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: Order['paymentStatus']
): Promise<OrderResponse> => {
  const response = await api.put(`/orders/${id}/payment`, {
    paymentStatus,
  });
  return response.data;
};

// Cancel order
export const cancelOrder = async (
  id: string,
  reason?: string
): Promise<OrderResponse> => {
  const response = await api.put(`/orders/${id}/cancel`, { reason });
  return response.data;
};

// Get order statistics
export const getOrderStats = async (): Promise<OrderStatsResponse> => {
  const response = await api.get('/orders/stats');
  return response.data;
};

// Export orders to CSV
export const exportOrders = async (filters?: OrderFilters): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
  }

  const response = await api.get(`/orders/export?${params.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
};
