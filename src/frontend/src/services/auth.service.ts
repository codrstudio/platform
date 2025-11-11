// Authentication Service
// Consolidates token management and auth operations
// Based on SPEC-authentication.md and PLAN_AUTH.md Phase 2

import * as authClient from './authClient';
import type { LoginRequest, LogoutAllRequest } from '@/types/auth';

/**
 * In-memory access token storage
 * SPEC-AU-ST-001: Access token stored in memory (more secure than localStorage)
 * PLAN_AUTH.md: Migrate from localStorage to memory + httpOnly cookies
 */
let accessToken: string | null = null;

/**
 * Authentication service
 * Manages access_token in memory and delegates to authClient for API calls
 */
export const authService = {
  /**
   * Login with credentials
   * SPEC-AU-LI-001 to SPEC-AU-LI-018
   *
   * @param username - Username or email
   * @param password - User password
   * @param realm - Authentication realm (optional)
   * @param schema - Database schema (optional)
   * @returns User payload from JWT
   */
  async login(
    username: string,
    password: string,
    realm?: string,
    schema?: string
  ): Promise<Record<string, unknown>> {
    const credentials: LoginRequest = {
      username,
      password,
      realm,
      schema,
    };

    const response = await authClient.login(credentials);

    if (response.code === '200') {
      // Store access_token in memory
      accessToken = response.access_token;

      // refresh_token is automatically stored in httpOnly cookie by backend
      // (see PLAN_AUTH.md Phase 1.4)

      return response.payload || {};
    }

    throw new Error('Login failed');
  },

  /**
   * Refresh access token
   * SPEC-AU-RF-001 to SPEC-AU-RF-017
   *
   * Uses refresh_token from httpOnly cookie (automatic)
   * Backend extracts it and forwards to n8n
   *
   * @returns True if refresh succeeded
   */
  async refresh(): Promise<boolean> {
    try {
      // No need to pass refresh_token - it's sent automatically via cookie
      // Backend will extract from req.cookies and forward to n8n
      const response = await authClient.refresh({
        refresh_token: '', // Empty - cookie handles this
      });

      if (response.code === '200') {
        // Update access_token in memory
        accessToken = response.access_token;

        // refresh_token is automatically renewed in httpOnly cookie by backend
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },

  /**
   * Logout (revoke current refresh token)
   * SPEC-AU-LO-001 to SPEC-AU-LO-012
   *
   * Clears access_token from memory and httpOnly cookie from browser
   */
  async logout(): Promise<void> {
    try {
      // No need to pass refresh_token - it's sent automatically via cookie
      await authClient.logout({
        refresh_token: '', // Empty - cookie handles this
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear access_token from memory regardless of API result
      accessToken = null;

      // Cookie is cleared by backend (res.clearCookie)
    }
  },

  /**
   * Logout from all devices
   * SPEC-AU-LA-001 to SPEC-AU-LA-017
   *
   * Revokes ALL refresh tokens for the current user
   */
  async logoutAll(): Promise<void> {
    const token = accessToken;

    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const request: LogoutAllRequest = {
        access_token: token,
      };

      await authClient.logoutAll(request);
    } catch (error) {
      console.error('Logout all failed:', error);
      throw error;
    } finally {
      // Clear local access_token
      accessToken = null;
    }
  },

  /**
   * Get current access token
   *
   * @returns Access token or null if not authenticated
   */
  getAccessToken(): string | null {
    return accessToken;
  },

  /**
   * Set access token (used by interceptors after refresh)
   *
   * @param token - New access token
   */
  setAccessToken(token: string | null): void {
    accessToken = token;
  },

  /**
   * Check if user is authenticated (has access token)
   *
   * @returns True if access token exists
   */
  isAuthenticated(): boolean {
    return accessToken !== null;
  },

  /**
   * Parse JWT payload (client-side only, for quick checks)
   * WARNING: This does NOT validate the signature!
   * Server-side validation is required for security.
   *
   * @returns Parsed JWT payload or null
   */
  parseToken(): Record<string, unknown> | null {
    if (!accessToken) return null;

    return authClient.parseJWT(accessToken);
  },

  /**
   * Get user ID from current token
   *
   * @returns User ID or null
   */
  getUserId(): string | null {
    const payload = this.parseToken();
    return payload?.userId as string || null;
  },

  /**
   * Get username from current token
   *
   * @returns Username or null
   */
  getUsername(): string | null {
    const payload = this.parseToken();
    return payload?.username as string || null;
  },
};
