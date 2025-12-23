import api from '@/lib/api';
import { Product, CreateProductInput } from '@/types/product';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  isOCOP?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
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

export interface ProductResponse {
  success: boolean;
  data: Product;
}

// Get all products with filters
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    // Only add status filter if explicitly set
    if (filters.status !== undefined && filters.status !== '') {
      params.append('status', filters.status);
    }
    if (filters.isOCOP !== undefined) params.append('isOCOP', filters.isOCOP.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.sort) params.append('sort', filters.sort);
  }

  // 🔒 Use admin API endpoint which filters by shop for shop owners
  const response = await api.get(`/admin/products?${params.toString()}`);
  
  // Transform backend response to match expected format
  const backendData = response.data;
  return {
    success: backendData.success,
    data: backendData.data,
    pagination: {
      page: backendData.currentPage || filters?.page || 1,
      limit: filters?.limit || 10,
      total: backendData.total || 0,
      pages: backendData.pages || 1,
    },
  };
};

// Get single product
export const getProduct = async (id: string): Promise<ProductResponse> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create new product
export const createProduct = async (data: CreateProductInput): Promise<ProductResponse> => {
  const response = await api.post('/products', data);
  return response.data;
};

// Update product
export const updateProduct = async (id: string, data: Partial<CreateProductInput>): Promise<ProductResponse> => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Upload product images
export const uploadProductImages = async (id: string, files: FileList | File[]): Promise<ProductResponse> => {
  const formData = new FormData();
  
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post(`/products/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Toggle product featured status
export const toggleFeatured = async (id: string): Promise<ProductResponse> => {
  const response = await api.put(`/products/${id}/featured`);
  return response.data;
};

// Update product status
export const updateProductStatus = async (
  id: string,
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued'
): Promise<ProductResponse> => {
  const response = await api.put(`/products/${id}/status`, { status });
  return response.data;
};

// Bulk delete products
export const bulkDeleteProducts = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/products/bulk-delete', { ids });
  return response.data;
};

// Get low stock products
export const getLowStockProducts = async (): Promise<ProductsResponse> => {
  const response = await api.get('/products/low-stock');
  return response.data;
};
