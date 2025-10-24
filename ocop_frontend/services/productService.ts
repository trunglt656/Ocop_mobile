import apiClient, { ApiResponse } from '../services/apiClient';
import API_CONFIG from '../constants/api';

// Types for products
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductOrigin {
  province: string;
  district: string;
  address: string;
}

export interface ProductProducer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  sku?: string;
  images: ProductImage[];
  category: {
    _id: string;
    name: string;
  };
  brand?: string;
  weight?: number;
  unit: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isFeatured: boolean;
  isOCOP: boolean;
  ocopLevel: string;
  origin: ProductOrigin;
  producer: ProductProducer;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  tags?: string[];
  rating: ProductRating;
  totalSold: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  count: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  data: Product[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  weight?: number;
  unit?: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isFeatured?: boolean;
  isOCOP?: boolean;
  ocopLevel?: string;
  origin: ProductOrigin;
  producer: ProductProducer;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Product service class
class ProductService {
  // Get all products with filtering and pagination
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    featured?: boolean;
    status?: string;
  }): Promise<ApiResponse<ProductListResponse>> {
    return apiClient.get<ApiResponse<ProductListResponse>>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST, params);
  }

  // Get single product
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<ApiResponse<Product>>(`${API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
  }

  // Get products by category
  async getProductsByCategory(
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<ApiResponse<ProductListResponse & { category: any }>> {
    return apiClient.get<ApiResponse<ProductListResponse & { category: any }>>(
      `${API_CONFIG.ENDPOINTS.PRODUCTS.BY_CATEGORY}/${categoryId}`,
      params
    );
  }

  // Get featured products
  async getFeaturedProducts(params?: { limit?: number }): Promise<ApiResponse<Product[]>> {
    return apiClient.get<ApiResponse<Product[]>>(API_CONFIG.ENDPOINTS.PRODUCTS.FEATURED, params);
  }

  // Get OCOP products
  async getOCOPProducts(params?: {
    page?: number;
    limit?: number;
    level?: string;
    sort?: string;
  }): Promise<ApiResponse<ProductListResponse>> {
    return apiClient.get<ApiResponse<ProductListResponse>>(API_CONFIG.ENDPOINTS.PRODUCTS.OCOP, params);
  }

  // Search products
  async searchProducts(params: {
    q: string;
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<ApiResponse<ProductListResponse>> {
    return apiClient.get<ApiResponse<ProductListResponse>>(API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH, params);
  }

  // Create product (Admin only)
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return apiClient.post<ApiResponse<Product>>(API_CONFIG.ENDPOINTS.PRODUCTS.LIST, data);
  }

  // Update product (Admin only)
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return apiClient.put<ApiResponse<Product>>(`${API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL}/${id}`, data);
  }

  // Delete product (Admin only)
  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(`${API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
  }

  // Get product statistics (Admin only)
  async getProductStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_CONFIG.ENDPOINTS.PRODUCTS.STATS);
  }

  // Upload product images
  async uploadProductImages(productId: string, images: any[]): Promise<ApiResponse<ProductImage[]>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    return apiClient.post<ApiResponse<ProductImage[]>>(
      `${API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL}/${productId}/images`,
      formData
    );
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
