import { API_CONFIG } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UploadResponse {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

class UploadService {
  /**
   * Get auth token from storage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Upload single image
   */
  async uploadImage(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<UploadResponse> {
    const formData = new FormData();
    
    // @ts-ignore - FormData accepts blob/file in React Native
    formData.append('image', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD.IMAGE}`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Upload multiple images
   */
  async uploadImages(files: Array<{
    uri: string;
    name: string;
    type: string;
  }>): Promise<UploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      // @ts-ignore - FormData accepts blob/file in React Native
      formData.append('images', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });

    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD.IMAGES}`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filename: string): Promise<string> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD.DELETE}/${filename}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Delete failed: ${response.status}`);
    }

    const result = await response.json();
    return result.message;
  }

  /**
   * Get full URL for uploaded file
   */
  getFileUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${API_CONFIG.BASE_URL.replace('/api', '')}${path}`;
  }
}

export const uploadService = new UploadService();
export default uploadService;
