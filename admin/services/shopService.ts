import api from '@/lib/api';

export interface Shop {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  admins?: Array<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  }>;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  isActive: boolean;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
}

export interface ShopsResponse {
  success: boolean;
  data: Shop[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ShopResponse {
  success: boolean;
  data: Shop;
}

export interface CreateShopInput {
  name: string;
  owner?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: string;
}

// Get all shops
export const getShops = async (filters?: ShopFilters): Promise<ShopsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  }

  const response = await api.get(`/shops?${params.toString()}`);
  
  return {
    success: response.data.success,
    data: response.data.data,
    pagination: {
      page: response.data.currentPage || filters?.page || 1,
      limit: filters?.limit || 10,
      total: response.data.totalCount || 0,
      pages: response.data.totalPages || 1,
    },
  };
};

// Get single shop
export const getShop = async (id: string): Promise<ShopResponse> => {
  const response = await api.get(`/shops/${id}`);
  return response.data;
};

// Create shop
export const createShop = async (data: CreateShopInput): Promise<ShopResponse> => {
  const response = await api.post('/shops', data);
  return response.data;
};

// Update shop
export const updateShop = async (id: string, data: Partial<CreateShopInput>): Promise<ShopResponse> => {
  const response = await api.put(`/shops/${id}`, data);
  return response.data;
};

// Delete shop
export const deleteShop = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/shops/${id}`);
  return response.data;
};

// Toggle shop active status
export const toggleShopStatus = async (id: string): Promise<ShopResponse> => {
  const response = await api.put(`/shops/${id}/toggle-status`);
  return response.data;
};

// Add admin to shop
export const addShopAdmin = async (shopId: string, userId: string): Promise<ShopResponse> => {
  const response = await api.post(`/shops/${shopId}/admins`, { userId });
  return response.data;
};

// Remove admin from shop
export const removeShopAdmin = async (shopId: string, userId: string): Promise<ShopResponse> => {
  const response = await api.delete(`/shops/${shopId}/admins/${userId}`);
  return response.data;
};

// Approve shop
export const approveShop = async (shopId: string, notes?: string): Promise<ShopResponse> => {
  const response = await api.patch(`/shops/${shopId}/approve`, { 
    status: 'approved',
    notes 
  });
  return response.data;
};

// Reject shop
export const rejectShop = async (shopId: string, notes: string): Promise<ShopResponse> => {
  const response = await api.patch(`/shops/${shopId}/approve`, { 
    status: 'rejected',
    notes 
  });
  return response.data;
};
