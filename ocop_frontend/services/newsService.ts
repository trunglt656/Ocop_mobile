import apiClient from './apiClient';
import API_CONFIG from '../constants/api';

export interface News {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  thumbnail?: string;
  images?: string[];
  category: 'announcement' | 'news' | 'event' | 'promotion' | 'guide';
  status: 'draft' | 'published' | 'archived';
  isPinned: boolean;
  viewCount: number;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  success: boolean;
  data: {
    news: News[];
    count: number;
    totalCount: number;
    totalPages?: number;
    currentPage?: number;
  };
}

export interface NewsDetailResponse {
  success: boolean;
  data: News;
}

export const newsService = {
  // Get all news with filters
  getNews: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<NewsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/news?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  },

  // Get single news by ID
  getNewsById: async (id: string): Promise<NewsDetailResponse> => {
    const response = await apiClient.get(`/news/${id}`);
    return response;
  },

  // Get featured/pinned news
  getFeaturedNews: async (): Promise<NewsListResponse> => {
    const response = await apiClient.get('/news/featured');
    return response;
  },

  // Get news by category
  getNewsByCategory: async (category: string, limit: number = 10): Promise<NewsListResponse> => {
    const response = await apiClient.get(`/news?category=${category}&status=published&limit=${limit}`);
    return response;
  },
};

export default newsService;
