import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse } from '../services';

// Types for auth context
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthAction {
  type: 'AUTH_START' | 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTH_LOGOUT' | 'CLEAR_ERROR' | 'SET_LOADING';
  payload?: any;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(data);

      if (response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          },
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(data);

      if (response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          },
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Update profile function
  const updateProfile = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.updateProfile(data);

      if (response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data,
            token: state.token,
            refreshToken: state.refreshToken,
          },
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Profile update failed',
      });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await authService.changePassword(data);

      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Password change failed',
      });
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();

      if (response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data,
            token: state.token,
            refreshToken: state.refreshToken,
          },
        });
      }
    } catch (error: any) {
      await logout();
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
