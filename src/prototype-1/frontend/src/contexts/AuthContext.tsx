/**
 * Auth Context
 * Manages authentication state and provides auth actions
 * SPEC-AU-* compliance
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth/authService';
import { tokenManager } from '@/services/auth/tokenManager';
import type { JWTPayload, LoginRequest } from '@/services/auth/types';

interface AuthState {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: JWTPayload }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH_START' }
  | { type: 'AUTH_REFRESH_SUCCESS'; payload: JWTPayload };

interface AuthContextType extends AuthState {
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_REFRESH_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'AUTH_REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Login with username and password
   */
  const login = useCallback(async (request: LoginRequest) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const tokens = await authService.login(request);
      tokenManager.setTokens(tokens);

      const payload = tokenManager.getUserPayload();
      if (!payload) {
        throw new Error('Failed to parse user payload');
      }

      dispatch({ type: 'AUTH_SUCCESS', payload });
    } catch (error: any) {
      const message = error.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  }, []);

  /**
   * Logout current session
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    dispatch({ type: 'AUTH_REFRESH_START' });

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokens = await authService.refresh(refreshToken);
      tokenManager.setTokens(tokens);

      const payload = tokenManager.getUserPayload();
      if (!payload) {
        throw new Error('Failed to parse user payload');
      }

      dispatch({ type: 'AUTH_REFRESH_SUCCESS', payload });
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // On refresh failure, logout user
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  }, []);

  /**
   * Initialize auth on mount
   * Try to restore session from refresh token
   */
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 [Auth] Initializing auth context...');
      const refreshTokenValue = tokenManager.getRefreshToken();

      if (!refreshTokenValue) {
        console.log('🔐 [Auth] No refresh token found, user not authenticated');
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      console.log('🔐 [Auth] Found refresh token, attempting to restore session');
      try {
        await refreshToken();
        console.log('✅ [Auth] Session restored successfully');
      } catch (error) {
        console.error('❌ [Auth] Failed to restore session:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, [refreshToken]);

  /**
   * Listen for automatic refresh events
   */
  useEffect(() => {
    const handleRefreshNeeded = () => {
      if (state.isAuthenticated) {
        refreshToken().catch((error) => {
          console.error('Auto-refresh failed:', error);
        });
      }
    };

    window.addEventListener('auth:refresh-needed', handleRefreshNeeded);

    return () => {
      window.removeEventListener('auth:refresh-needed', handleRefreshNeeded);
    };
  }, [state.isAuthenticated, refreshToken]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
