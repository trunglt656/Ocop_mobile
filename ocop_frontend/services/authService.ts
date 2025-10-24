import apiClient, { ApiResponse } from '../services/apiClient';
import API_CONFIG from '../constants/api';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication service class
class AuthService {
  // Register new user
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
  }

  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, data);
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<ApiResponse<{ message: string }>>(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
  }

  // Logout user
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  }

  // Forgot password (placeholder - implement when email service is available)
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  }

  // Reset password (placeholder - implement when email service is available)
  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<ApiResponse<{ message: string }>>('/auth/reset-password/' + token, { password });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
