import api from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'shop_admin';
  shop?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'admin' | 'shop_admin';
  shop?: string;
}

// Get all users
export const getUsers = async (filters?: UserFilters): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  }

  const response = await api.get(`/users?${params.toString()}`);
  
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

// Get single user
export const getUser = async (id: string): Promise<UserResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create user
export const createUser = async (data: CreateUserInput): Promise<UserResponse> => {
  const response = await api.post('/users', data);
  return response.data;
};

// Update user
export const updateUser = async (id: string, data: Partial<CreateUserInput>): Promise<UserResponse> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Toggle user active status
export const toggleUserStatus = async (id: string): Promise<UserResponse> => {
  const response = await api.put(`/users/${id}/toggle-status`);
  return response.data;
};

// Change user role
export const changeUserRole = async (id: string, role: User['role'], shopId?: string): Promise<UserResponse> => {
  const response = await api.put(`/users/${id}/role`, { role, shop: shopId });
  return response.data;
};
