import apiClient, { ApiResponse } from './apiClient';
import API_CONFIG from '../constants/api';

// Types for favorites
export interface Favorite {
  _id: string;
  user: string;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt: string; isPrimary: boolean }>;
    price: number;
    discount: number;
    rating: {
      average: number;
      count: number;
    };
    stock: number;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteListResponse {
  count: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  data: Favorite[];
}

// Favorites service class
class FavoritesService {
  // Get user's favorites
  async getFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FavoriteListResponse>> {
    return apiClient.get<ApiResponse<FavoriteListResponse>>(API_CONFIG.ENDPOINTS.FAVORITES.LIST, params);
  }

  // Check if product is in favorites
  async checkFavorite(productId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    return apiClient.get<ApiResponse<{ isFavorite: boolean }>>(
      `${API_CONFIG.ENDPOINTS.FAVORITES.CHECK}/${productId}`
    );
  }

  // Toggle favorite (add/remove)
  async toggleFavorite(productId: string): Promise<ApiResponse<{
    action: 'added' | 'removed';
    favorite: Favorite | null;
  }>> {
    return apiClient.post<ApiResponse<{
      action: 'added' | 'removed';
      favorite: Favorite | null;
    }>>(`${API_CONFIG.ENDPOINTS.FAVORITES.TOGGLE}/${productId}`);
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
export default favoritesService;
