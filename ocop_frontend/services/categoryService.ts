import apiClient, { ApiResponse } from '../services/apiClient';
import API_CONFIG from '../constants/api';

// Types for categories
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  parentCategory?: string;
  subcategories?: string[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  children: CategoryTree[];
  productCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentCategory?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Category service class
class CategoryService {
  // Get all categories
  async getCategories(params?: {
    parentOnly?: boolean;
    includeProducts?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    return apiClient.get<ApiResponse<Category[]>>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST, params);
  }

  // Get category tree
  async getCategoryTree(): Promise<ApiResponse<CategoryTree[]>> {
    return apiClient.get<ApiResponse<CategoryTree[]>>(API_CONFIG.ENDPOINTS.CATEGORIES.TREE);
  }

  // Get popular categories
  async getPopularCategories(params?: { limit?: number }): Promise<ApiResponse<Category[]>> {
    return apiClient.get<ApiResponse<Category[]>>(API_CONFIG.ENDPOINTS.CATEGORIES.POPULAR, params);
  }

  // Get single category
  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<ApiResponse<Category>>(`${API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL}/${id}`);
  }

  // Get category products
  async getCategoryProducts(
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(
      `${API_CONFIG.ENDPOINTS.CATEGORIES.PRODUCTS}/${categoryId}`,
      params
    );
  }

  // Create category (Admin only)
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiClient.post<ApiResponse<Category>>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST, data);
  }

  // Update category (Admin only)
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiClient.put<ApiResponse<Category>>(`${API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL}/${id}`, data);
  }

  // Delete category (Admin only)
  async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(`${API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL}/${id}`);
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
