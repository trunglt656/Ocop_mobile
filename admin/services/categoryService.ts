import api from '@/lib/api';
import { Category } from '@/types/product';

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

// Get all categories
export const getCategories = async (): Promise<CategoriesResponse> => {
  // Include product count for admin dashboard
  const response = await api.get('/categories?includeProducts=true');
  return response.data;
};

// Get category tree
export const getCategoryTree = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/categories/tree');
  return response.data;
};

// Get single category
export const getCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parent?: string;
  isActive?: boolean;
  order?: number;
}): Promise<CategoryResponse> => {
  const response = await api.post('/categories', data);
  return response.data;
};

// Update category
export const updateCategory = async (id: string, data: Partial<{
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parent?: string;
  isActive?: boolean;
  order?: number;
}>): Promise<CategoryResponse> => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
