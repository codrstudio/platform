/**
 * Token Manager
 * Manages JWT tokens with security best practices
 * SPEC-AU-LI-023, SPEC-AU-LI-024
 */

import type { AuthTokens, JWTPayload } from './types';

class TokenManager {
  private accessToken: string | null = null;
  private refreshTimeout: number | null = null;
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly REFRESH_BUFFER_MS = 60 * 1000; // Refresh 1 min before expiry

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Store tokens securely
   * - access_token in memory only (XSS protection)
   * - refresh_token in localStorage
   */
  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;

    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }

    // Schedule automatic refresh
    this.scheduleRefresh(tokens.expires_in);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;

    try {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }

    // Cancel scheduled refresh
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Check if token is expired
   * Parses JWT without validation (client-side hint only)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJWT(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  /**
   * Parse JWT payload (without validation)
   * Client-side only - never trust this for security
   */
  parseJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Schedule automatic token refresh
   * Refreshes 1 minute before expiration
   */
  scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const refreshIn = (expiresIn * 1000) - this.REFRESH_BUFFER_MS;

    if (refreshIn > 0) {
      this.refreshTimeout = setTimeout(() => {
        // Trigger refresh event (to be handled by AuthContext)
        window.dispatchEvent(new CustomEvent('auth:refresh-needed'));
      }, refreshIn);
    }
  }

  /**
   * Get user payload from current access token
   */
  getUserPayload(): JWTPayload | null {
    if (!this.accessToken) {
      return null;
    }
    return this.parseJWT(this.accessToken);
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
