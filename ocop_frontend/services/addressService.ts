import apiClient, { ApiResponse } from './apiClient';
import API_CONFIG from '../constants/api';

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
  fullAddress: string;
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

class AddressService {
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiClient.get<ApiResponse<Address[]>>(API_CONFIG.ENDPOINTS.ADDRESSES.LIST);
  }

  async getAddress(id: string): Promise<ApiResponse<Address>> {
    return apiClient.get<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DETAIL}/${id}`);
  }

  async createAddress(data: CreateAddressRequest): Promise<ApiResponse<Address>> {
    return apiClient.post<ApiResponse<Address>>(API_CONFIG.ENDPOINTS.ADDRESSES.LIST, data);
  }

  async updateAddress(id: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> {
    return apiClient.put<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DETAIL}/${id}`, data);
  }

  async deleteAddress(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DETAIL}/${id}`);
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<Address>> {
    return apiClient.put<ApiResponse<Address>>(`${API_CONFIG.ENDPOINTS.ADDRESSES.DETAIL}/${id}/default`, {});
  }

  async getDefaultAddress(): Promise<ApiResponse<Address>> {
    return apiClient.get<ApiResponse<Address>>(API_CONFIG.ENDPOINTS.ADDRESSES.DEFAULT);
  }
}

export const addressService = new AddressService();
export default addressService;