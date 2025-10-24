import API_CONFIG from '../constants/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  count?: number;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

// API Client class
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method with retry logic
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = API_CONFIG.RETRY.ATTEMPTS
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Merge headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors or timeout
      if (error instanceof ApiError) {
        throw error;
      }

      if ((error as any)?.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      // Retry logic for network errors
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(API_CONFIG.RETRY.DELAY);
        return this.request<T>(endpoint, options, retries - 1);
      }

      throw new ApiError(
        (error as Error)?.message || 'Network error',
        0
      );
    }
  }

  // Check if error should be retried
  private shouldRetry(error: any): boolean {
    return error.name === 'TypeError' || error.status === 0;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get auth token from storage
  private async getAuthToken(): Promise<string | null> {
    try {
      // In a real app, you'd get this from AsyncStorage or SecureStore
      // For now, return null - we'll implement proper auth later
      return null;
    } catch (error) {
      return null;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    file: any,
    fieldName: string = 'image'
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.errors
      );
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
