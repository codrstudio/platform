/**
 * Production AuthProvider - Authentication state management
 *
 * Based on SPEC-frontend-state.md SPEC-FS-AU-001:013
 * Integrates with backend auth endpoints via authClient
 *
 * Features:
 * - User authentication state management
 * - Login/logout/logoutAll operations via TanStack Query mutations
 * - Secure token storage (task 1.3.11 - sessionStorage for access, localStorage for refresh)
 * - Session restoration on page load (task 1.3.11)
 * - Automatic token renewal (task 1.3.12 - renews 1 minute before expiration)
 * - Retry logic with exponential backoff for renewal failures
 * - Cleanup on logout and unmount to prevent memory leaks
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { User, LoginCredentials, AuthResponse } from '../types/auth';
import * as authClient from '../services/auth';
import { tokenStorage } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component
 * Manages global authentication state and provides auth methods to the application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initially true for session check

  // Derived state
  const isAuthenticated = user !== null;

  // Token renewal management
  const renewalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRenewingRef = useRef<boolean>(false);
  const renewalAttemptsRef = useRef<number>(0);

  // Configuration
  const RENEWAL_BUFFER_SECONDS = 60; // Renew 1 minute before expiration
  const MAX_RENEWAL_ATTEMPTS = 3;
  const RETRY_BASE_DELAY_MS = 1000; // Start with 1 second

  // Helper function to update state from AuthResponse
  const updateAuthState = (response: AuthResponse) => {
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);
    setUser({
      id: response.payload.sub,
      username: response.payload.username,
      email: response.payload.email,
      roles: response.payload.roles,
      permissions: response.payload.permissions,
    });

    // Persist tokens to storage (task 1.3.11)
    tokenStorage.saveAccessToken(response.access_token);
    tokenStorage.saveRefreshToken(response.refresh_token);
  };

  // Helper function to clear auth state
  const clearAuthState = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear tokens from storage (task 1.3.11)
    tokenStorage.clearAllTokens();
  };

  // Cancel any scheduled renewal
  const cancelRenewal = useCallback(() => {
    if (renewalTimerRef.current) {
      clearTimeout(renewalTimerRef.current);
      renewalTimerRef.current = null;
    }
    renewalAttemptsRef.current = 0;
    isRenewingRef.current = false;
  }, []);

  // Handle renewal failure with retry or logout
  const handleRenewalFailure = useCallback((error: Error) => {
    renewalAttemptsRef.current += 1;

    console.error(`Token renewal failed (attempt ${renewalAttemptsRef.current}/${MAX_RENEWAL_ATTEMPTS}):`, error);

    // Check if error is fatal (refresh token expired/revoked)
    if (error.message.includes('invalid') || error.message.includes('expired') || error.message.includes('revoked')) {
      console.error('Refresh token is invalid, logging out user');
      clearAuthState();
      cancelRenewal();
      return;
    }

    // Check if max retries reached
    if (renewalAttemptsRef.current >= MAX_RENEWAL_ATTEMPTS) {
      console.error('Max renewal attempts reached, logging out user');
      clearAuthState();
      cancelRenewal();
      return;
    }

    // Calculate exponential backoff delay
    const retryDelay = RETRY_BASE_DELAY_MS * Math.pow(2, renewalAttemptsRef.current - 1);
    console.log(`Retrying renewal in ${retryDelay}ms`);

    // Schedule retry
    renewalTimerRef.current = setTimeout(() => {
      performRenewal();
    }, retryDelay);
  }, [cancelRenewal]); // performRenewal will be added to deps after it's defined

  // Perform token renewal
  const performRenewal = useCallback(async () => {
    // Prevent concurrent renewals
    if (isRenewingRef.current) {
      console.warn('Renewal already in progress, skipping');
      return;
    }

    // Check if we have a refresh token
    if (!refreshToken) {
      console.warn('No refresh token available for renewal');
      return;
    }

    isRenewingRef.current = true;

    try {
      console.log('Performing automatic token renewal');
      const response = await authClient.refreshTokens(refreshToken);

      // Success - update state and schedule next renewal
      updateAuthState(response);
      scheduleRenewal(response.expires_in);
      renewalAttemptsRef.current = 0; // Reset retry counter

      console.log('Token renewal successful');
    } catch (error) {
      handleRenewalFailure(error as Error);
    } finally {
      isRenewingRef.current = false;
    }
  }, [refreshToken, handleRenewalFailure]); // scheduleRenewal and updateAuthState will be added after

  // Schedule next token renewal
  const scheduleRenewal = useCallback((expiresInSeconds: number) => {
    // Clear existing timer
    cancelRenewal();

    // Calculate renewal time (1 minute before expiration)
    let renewalDelayMs = (expiresInSeconds - RENEWAL_BUFFER_SECONDS) * 1000;

    // Edge case: Token expires sooner than buffer - renew immediately
    if (renewalDelayMs <= 0) {
      console.warn('Token expires soon, renewing immediately');
      renewalDelayMs = 0;
    }

    // Schedule renewal
    console.log(`Scheduling token renewal in ${renewalDelayMs / 1000}s`);
    renewalTimerRef.current = setTimeout(() => {
      performRenewal();
    }, renewalDelayMs);
  }, [cancelRenewal, performRenewal]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authClient.login(credentials),
    onSuccess: (response: AuthResponse) => {
      updateAuthState(response);
      scheduleRenewal(response.expires_in);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      clearAuthState();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      if (!refreshToken) throw new Error('No refresh token');
      return authClient.logout(refreshToken);
    },
    onSuccess: () => {
      cancelRenewal();
      clearAuthState();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      // Clear state even if API call fails (local cleanup)
      cancelRenewal();
      clearAuthState();
    },
  });

  // Logout all mutation
  const logoutAllMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('No access token');
      return authClient.logoutAll(accessToken);
    },
    onSuccess: () => {
      cancelRenewal();
      clearAuthState();
    },
    onError: (error: Error) => {
      console.error('Logout all failed:', error);
      // Clear state even if API call fails (local cleanup)
      cancelRenewal();
      clearAuthState();
    },
  });

  // Auth methods
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const logoutAll = async () => {
    await logoutAllMutation.mutateAsync();
  };

  const refreshSession = async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const response = await authClient.refreshTokens(refreshToken);
    updateAuthState(response);
    scheduleRenewal(response.expires_in);
  };

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      // Check for stored refresh token
      const storedRefreshToken = tokenStorage.loadRefreshToken();

      if (!storedRefreshToken) {
        // No stored token - user is logged out
        setIsLoading(false);
        return;
      }

      // Attempt to refresh session
      try {
        const response = await authClient.refreshTokens(storedRefreshToken);
        updateAuthState(response); // This will save new tokens to storage
        scheduleRenewal(response.expires_in); // Schedule automatic renewal
        console.log('Session restored successfully');
      } catch (error) {
        console.error('Session restoration failed:', error);
        // Clear invalid token from storage
        tokenStorage.clearAllTokens();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []); // Empty deps - run once on mount

  // Cleanup renewal timer on unmount
  useEffect(() => {
    return () => {
      cancelRenewal();
    };
  }, [cancelRenewal]);

  // Combine loading states from all mutations
  const combinedIsLoading =
    isLoading ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    logoutAllMutation.isPending;

  // Context value (optimized with useMemo to prevent unnecessary re-renders)
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading: combinedIsLoading,
      login,
      logout,
      logoutAll,
      refreshSession,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      combinedIsLoading,
      // Note: login, logout, logoutAll, refreshSession are stable references
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider>.'
    );
  }

  return context;
}
