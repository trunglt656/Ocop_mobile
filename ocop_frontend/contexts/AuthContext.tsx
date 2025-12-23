import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  updateUser: (user: User) => void;
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

// Token persistence methods
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';

const saveTokens = async (token: string, refreshToken: string, user: User) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

const loadTokens = async (): Promise<{ token: string | null; refreshToken: string | null; user: User | null }> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    const userString = await AsyncStorage.getItem(USER_KEY);
    const user = userString ? JSON.parse(userString) : null;

    return { token, refreshToken, user };
  } catch (error) {
    console.error('Error loading tokens:', error);
    return { token: null, refreshToken: null, user: null };
  }
};

const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load tokens on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { token, refreshToken, user } = await loadTokens();
        
        if (token && user) {
          // Validate the token by trying to fetch current user
          try {
            const response = await authService.getCurrentUser();
            if (response.data) {
              // Token is valid, use the fresh user data from server
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: response.data,
                  token,
                  refreshToken: refreshToken || '',
                },
              });
            }
          } catch (error) {
            // Token is invalid or expired, clear storage
            console.log('Stored token is invalid, clearing auth data');
            await clearTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Clear any existing tokens before login
      await clearTokens();

      const response = await authService.login(data);

      if (response.data) {
        // Save tokens to AsyncStorage
        await saveTokens(response.data.token, response.data.refreshToken, response.data.user);

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
        // Save tokens to AsyncStorage
        await saveTokens(response.data.token, response.data.refreshToken, response.data.user);

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
      // Only call logout API if user is authenticated with a valid token
      if (state.token && state.isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      // Silently handle logout errors - user can still log out locally
      // Don't log to console to avoid confusion
    } finally {
      // Always clear tokens from AsyncStorage regardless of API call result
      await clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Update profile function
  const updateProfile = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.updateProfile(data);

      if (response.data) {
        // Save updated user data to AsyncStorage
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));

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

  // Update user function (for direct state update)
  const updateUser = async (user: User) => {
    try {
      // Save updated user data to AsyncStorage
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token: state.token,
          refreshToken: state.refreshToken,
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
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
        // Save updated user data to AsyncStorage
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));

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
    updateUser,
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
