import api from '@/lib/api';
import { News, NewsFormData, NewsStats } from '@/types/admin';

export const newsService = {
  // Get all news
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }) {
    const response = await api.get('/news', { params });
    return response.data;
  },

  // Get single news
  async getById(id: string) {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  // Create news (Admin only)
  async create(data: NewsFormData) {
    const response = await api.post('/news', data);
    return response.data;
  },

  // Update news (Admin only)
  async update(id: string, data: Partial<NewsFormData>) {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },

  // Delete news (Admin only)
  async delete(id: string) {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },

  // Publish news
  async publish(id: string) {
    const response = await api.patch(`/news/${id}/publish`);
    return response.data;
  },

  // Unpublish news
  async unpublish(id: string) {
    const response = await api.patch(`/news/${id}/unpublish`);
    return response.data;
  },

  // Toggle pin status
  async togglePin(id: string) {
    const response = await api.patch(`/news/${id}/pin`);
    return response.data;
  },

  // Get statistics
  async getStats() {
    const response = await api.get('/news/admin/stats');
    return response.data;
  },
};
