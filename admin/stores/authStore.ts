import { create } from 'zustand';
import api from '@/lib/api';
import { User, LoginCredentials } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔐 Attempting login with:', credentials.email);
      
      const { data } = await api.post('/admin/login', credentials);
      console.log('📡 Login response:', data);
      
      if (data.success) {
        const { user, token } = data.data;
        console.log('✅ Login successful, user:', user.email, 'role:', user.role);
        localStorage.setItem('admin_token', token);
        set({ user, token, isLoading: false });
      } else {
        const errorMsg = data.message || 'Login failed';
        console.error('❌ Login failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      console.error('Error message:', errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        set({ user: null, token: null });
        return;
      }

      const { data } = await api.get('/admin/me');
      if (data.success) {
        set({ user: data.data, token });
      } else {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null });
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      set({ user: null, token: null });
    }
  },

  clearError: () => set({ error: null }),
}));
