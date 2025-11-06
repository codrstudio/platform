import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { authClient, AuthClientError } from '@/services/auth/authClient';
import { tokenStorage } from '@/services/auth/tokenStorage';
import type { User, LoginCredentials, AuthContextValue, AuthorizeResponse } from '@/types/auth';

/**
 * SPEC-AU-MA-010 to SPEC-AU-MA-013: Auth Context and Provider
 * SPEC-AU-ST-009 to SPEC-AU-ST-012: Auto-renewal of access token
 * SPEC-AU-AZ-*: Authorization/permission checking
 */

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * SPEC-AU-ST-009: Auto-renew access token before expiry
   * SPEC-AU-ST-010: Happens automatically (1 minute before expiry)
   */
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Schedule refresh 1 minute before expiry (SPEC-AU-ST-010)
    const refreshTime = Math.max((expiresIn - 60) * 1000, 5000); // At least 5 seconds

    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('[Auth] Auto-refreshing token...');
      try {
        const refresh_token = tokenStorage.getRefreshToken();
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const response = await authClient.refresh(refresh_token);
        tokenStorage.setTokens(response.access_token, response.refresh_token, response.expires_in);

        if (response.payload) {
          setUser(response.payload);
        }

        // Schedule next refresh recursively
        scheduleTokenRefresh(response.expires_in);
      } catch (error) {
        console.error('[Auth] Auto-refresh failed:', error);
        // SPEC-AU-ST-012: If refresh fails, clear tokens and logout
        tokenStorage.clearAll();
        setUser(null);
      }
    }, refreshTime);
  }, []); // Empty deps - stable function

  /**
   * SPEC-AU-RF-*: Refresh access token
   */
  const refreshToken = useCallback(async () => {
    const refresh_token = tokenStorage.getRefreshToken();

    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authClient.refresh(refresh_token);

      // Store new tokens
      tokenStorage.setTokens(response.access_token, response.refresh_token, response.expires_in);

      // Update user if payload returned
      if (response.payload) {
        setUser(response.payload);
      }

      // Schedule next refresh
      scheduleTokenRefresh(response.expires_in);
    } catch (error) {
      if (error instanceof AuthClientError && error.isTokenError()) {
        // Token invalid/expired - clear and logout
        tokenStorage.clearAll();
        setUser(null);
        throw error;
      }
      throw error;
    }
  }, [scheduleTokenRefresh]);

  /**
   * SPEC-AU-LI-*: Login with credentials
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await authClient.login(credentials);

      // Store tokens (SPEC-AU-ST-001, SPEC-AU-ST-006)
      tokenStorage.setTokens(response.access_token, response.refresh_token, response.expires_in);

      // Set user
      setUser(response.payload);

      // Schedule token refresh (SPEC-AU-ST-009)
      scheduleTokenRefresh(response.expires_in);
    } catch (error) {
      tokenStorage.clearAll();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  /**
   * SPEC-AU-LO-*: Logout current session
   * SPEC-AU-LO-013 to SPEC-AU-LO-015: Clear tokens and state
   */
  const logout = useCallback(async () => {
    const refresh_token = tokenStorage.getRefreshToken();

    // Clear local state immediately
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    tokenStorage.clearAll();
    setUser(null);

    // Try to revoke token on backend (best effort)
    if (refresh_token) {
      try {
        await authClient.logout(refresh_token);
      } catch (error) {
        console.warn('[Auth] Logout request failed (already cleared locally):', error);
      }
    }
  }, []); // No dependencies needed

  /**
   * SPEC-AU-LA-*: Logout all sessions
   */
  const logoutAll = useCallback(async () => {
    const access_token = tokenStorage.getAccessToken();

    // Clear local state immediately
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    tokenStorage.clearAll();
    setUser(null);

    // Try to revoke all tokens on backend (best effort)
    if (access_token) {
      try {
        await authClient.logoutAll(access_token);
      } catch (error) {
        console.warn('[Auth] Logout all request failed (already cleared locally):', error);
      }
    }
  }, []); // No dependencies needed

  /**
   * SPEC-AU-AZ-*: Check permissions
   */
  const authorize = useCallback(async (
    action: string,
    resource: string,
    context?: Record<string, any>
  ): Promise<AuthorizeResponse> => {
    const response = await fetch('/api/1/auth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action, resource, context }),
    });

    if (!response.ok) {
      throw new Error('Authorization failed');
    }

    return response.json();
  }, []);

  /**
   * Initialize auth state on mount
   * SPEC-AU-ST-009: Restore session on page reload
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Check if we have tokens
      if (!tokenStorage.hasTokens()) {
        setIsLoading(false);
        return;
      }

      // Check if access token is still valid
      if (!tokenStorage.isAccessTokenExpired()) {
        // Token still valid - try to get user info
        const access_token = tokenStorage.getAccessToken();
        if (access_token) {
          try {
            const result = await authClient.authorize(access_token);
            setUser(result.payload);

            // Schedule refresh
            const expiry = tokenStorage.getTokenExpiry();
            if (expiry) {
              const expiresIn = Math.floor((expiry - Date.now()) / 1000);
              scheduleTokenRefresh(expiresIn);
            }

            setIsLoading(false);
            return;
          } catch (error) {
            console.warn('[Auth] Token validation failed on init');
          }
        }
      }

      // Access token expired or invalid - try refresh
      try {
        await refreshToken();
      } catch (error) {
        console.warn('[Auth] Refresh failed on init - clearing tokens');
        tokenStorage.clearAll();
      }

      setIsLoading(false);
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [refreshToken, scheduleTokenRefresh]); // Include necessary dependencies

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    logoutAll,
    refreshToken,
    authorize,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * SPEC-AU-MA-013: Hook to consume auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
