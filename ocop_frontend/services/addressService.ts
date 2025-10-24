import apiClient, { ApiResponse } from './apiClient';
import API_CONFIG from '../constants/api';

// Types for addresses
export interface Address {
  _id: string;
  user: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  fullAddress?: string;
}

export interface CreateAddressRequest {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | 'other';
  instructions?: string;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Address service class
class AddressService {
  // Get user's addresses
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiClient.get<ApiResponse<Address[]>>(API_CONFIG.ENDPOINTS.ADDRESSES.LIST);
  }

  // Get single address
  async getAddress(id: string): Promise<ApiResponse<Address>> {
    return apiClient.get<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DETAIL}/${id}`);
  }

  // Create new address
  async createAddress(data: CreateAddressRequest): Promise<ApiResponse<Address>> {
    return apiClient.post<ApiResponse<Address>>(API_CONFIG.ENDPOINTS.ADDRESSES.CREATE, data);
  }

  // Update address
  async updateAddress(id: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> {
    return apiClient.put<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.UPDATE}/${id}`, data);
  }

  // Delete address
  async deleteAddress(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DELETE}/${id}`);
  }

  // Get default address
  async getDefaultAddress(): Promise<ApiResponse<Address>> {
    return apiClient.get<ApiResponse<Address>>(API_CONFIG.ENDPOINTS.ADDRESSES.DEFAULT);
  }

  // Set default address
  async setDefaultAddress(id: string): Promise<ApiResponse<Address>> {
    return apiClient.put<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.SET_DEFAULT}/${id}/default`);
  }
}

// Export singleton instance
export const addressService = new AddressService();
export default addressService;
