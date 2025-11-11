// Authentication Context and Provider
// Based on SPEC-authentication.md and SPEC-frontend-state.md
// Updated per PLAN_AUTH.md Phase 2.3 - Use authService

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  AuthContextValue,
  AuthState,
  LoginRequest,
  User,
} from '@/types/auth';
import { authService } from '@/services/auth.service';

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
   * PLAN_AUTH.md Phase 2.3: Use authService (cookies + memory)
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      const payload = await authService.login(
        credentials.username,
        credentials.password,
        credentials.realm,
        credentials.schema
      );

      // authService stores access_token in memory
      // refresh_token stored in httpOnly cookie by backend

      // Update state
      setAuthState({
        user: payload as User,
        accessToken: authService.getAccessToken(),
        refreshToken: null, // Not accessible (httpOnly cookie)
        isAuthenticated: true,
        isLoading: false,
        permissions: (payload.permissions as string[]) || [],
      });
    } catch (error) {
      // Clear any partial state
      authService.setAccessToken(null);
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
   * PLAN_AUTH.md Phase 2.3: Use authService (clears cookie + memory)
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // authService calls backend logout (clears cookie)
      await authService.logout();
    } catch (error) {
      // Log error but continue with local cleanup
      console.error('Logout API error:', error);
    }

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
   * PLAN_AUTH.md Phase 2.3: Use authService (cookie sent automatically)
   */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      // authService.refresh() uses cookie automatically
      const success = await authService.refresh();

      if (!success) {
        throw new Error('Token refresh failed');
      }

      // Update state with new access_token
      setAuthState((prev) => ({
        ...prev,
        accessToken: authService.getAccessToken(),
        refreshToken: null, // Not accessible (httpOnly cookie)
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
   * Note: Still uses authClient directly (no change needed)
   */
  const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
    const accessToken = authService.getAccessToken();

    if (!accessToken) {
      return false;
    }

    try {
      // Use authClient for authorize endpoint
      const authClient = await import('@/services/authClient');
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
   * Note: With httpOnly cookies, refresh happens automatically via fetchClient interceptor
   * This timer is kept as a backup mechanism
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    // Parse token to get expiration
    const payload = authService.parseToken();
    if (!payload?.exp) return;

    const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
    const expiresAt = (payload.exp as number) * 1000; // Convert to milliseconds

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
   * PLAN_AUTH.md Phase 2.3: Refresh token in httpOnly cookie
   */
  useEffect(() => {
    const hydrateAuth = async () => {
      // Try to refresh and restore session
      // If refresh_token cookie exists, this will succeed
      try {
        const success = await authService.refresh();

        if (success) {
          // Parse token to get user info
          const payload = authService.parseToken();

          setAuthState({
            user: (payload as User) || null,
            accessToken: authService.getAccessToken(),
            refreshToken: null, // Not accessible (httpOnly cookie)
            isAuthenticated: true,
            isLoading: false,
            permissions: (payload?.permissions as string[]) || [],
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
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
