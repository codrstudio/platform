// Authentication Context and Provider
// Based on SPEC-authentication.md and SPEC-frontend-state.md

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  AuthContextValue,
  AuthState,
  LoginRequest,
} from '@/types/auth';
import * as authClient from '@/services/authClient';
import { tokenStorage } from '@/services/tokenStorage';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Manages authentication state
 *
 * SPEC-STATE-A-003: Managed via React Context
 * SPEC-STATE-A-004: Available globally
 * SPEC-STATE-A-005: Exposes state and methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Auth state (SPEC-STATE-A-002)
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading for hydration
    permissions: [],
  });

  /**
   * Login function
   * SPEC-AU-LI-001 to SPEC-AU-LI-018
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authClient.login(credentials);

      // Store tokens (SPEC-AU-ST-001 to SPEC-AU-ST-008)
      tokenStorage.setAccessToken(response.access_token, response.expires_in);
      tokenStorage.setRefreshToken(response.refresh_token);

      // Update state
      setAuthState({
        user: response.payload,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        permissions: response.payload.permissions || [],
      });
    } catch (error) {
      // Clear any partial state
      tokenStorage.clearTokens();
      setAuthState((prev) => ({
        ...prev,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      }));
      throw error;
    }
  }, []);

  /**
   * Logout function
   * SPEC-AU-LO-001 to SPEC-AU-LO-015
   */
  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();

    // Call logout API if we have a refresh token
    if (refreshToken) {
      try {
        await authClient.logout({ refresh_token: refreshToken });
      } catch (error) {
        // Log error but continue with local cleanup
        console.error('Logout API error:', error);
      }
    }

    // Clear tokens (SPEC-AU-LO-013, SPEC-AU-LO-014, SPEC-AU-LO-015)
    tokenStorage.clearTokens();

    // Clear state
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
    });
  }, []);

  /**
   * Refresh tokens
   * SPEC-AU-RF-001 to SPEC-AU-RF-020
   */
  const refresh = useCallback(async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authClient.refresh({ refresh_token: refreshToken });

      // Store new tokens
      tokenStorage.setAccessToken(response.access_token, response.expires_in);
      tokenStorage.setRefreshToken(response.refresh_token);

      // Update state
      setAuthState((prev) => ({
        ...prev,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.payload || prev.user,
        permissions: response.payload?.permissions || prev.permissions,
      }));
    } catch (error) {
      // Refresh failed, logout user (SPEC-AU-ST-012)
      await logout();
      throw error;
    }
  }, [logout]);

  /**
   * Check if user has permission
   * SPEC-AU-AZ-001 to SPEC-AU-AZ-036
   */
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      return false;
    }

    try {
      const response = await authClient.authorize({
        access_token: accessToken,
        permission,
      });

      return response.authorized;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }, []);

  /**
   * Auto-refresh timer
   * SPEC-AU-ST-009 to SPEC-AU-ST-012
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
    const expiresAt = tokenStorage.getExpiresAt();

    if (!expiresAt) return;

    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - REFRESH_BUFFER;

    if (timeUntilRefresh <= 0) {
      // Token already expired or expiring soon, refresh immediately
      refresh().catch((error) => {
        console.error('Auto-refresh failed:', error);
      });
      return;
    }

    // Schedule refresh
    const timer = setTimeout(() => {
      refresh().catch((error) => {
        console.error('Auto-refresh failed:', error);
      });
    }, timeUntilRefresh);

    return () => clearTimeout(timer);
  }, [authState.isAuthenticated, refresh]);

  /**
   * Hydration on app start
   * SPEC-STATE-H-002
   */
  useEffect(() => {
    const hydrateAuth = async () => {
      // Check if we have a refresh token
      if (!tokenStorage.hasRefreshToken()) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Try to refresh and restore session
      try {
        await refresh();
      } catch (error) {
        console.error('Session restoration failed:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    hydrateAuth();
  }, []); // Run once on mount

  /**
   * Memoized context value
   * SPEC-STATE-PERF-001
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login,
      logout,
      refresh,
      hasPermission,
    }),
    [authState, login, logout, refresh, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook - Access authentication context
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Export context for advanced use cases
 */
export { AuthContext };
