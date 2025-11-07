// Token Storage Service
// Based on SPEC-authentication.md (SPEC-AU-ST-*)

import type { TokenStorage } from '@/types/auth';

/**
 * Token storage manager
 *
 * SPEC-AU-ST-001: Access token stored in memory
 * SPEC-AU-ST-002: Can be stored in sessionStorage
 * SPEC-AU-ST-003: NOT stored in localStorage (XSS risk)
 * SPEC-AU-ST-005: Refresh token in HttpOnly cookie (preferred)
 * SPEC-AU-ST-006: Can be stored in localStorage (less secure fallback)
 */

class TokenStorageService {
  private tokens: TokenStorage = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'expires_at';

  constructor() {
    // Initialize from sessionStorage if available
    this.loadFromSessionStorage();
  }

  /**
   * Set access token (memory only)
   * SPEC-AU-ST-001, SPEC-AU-ST-002
   */
  setAccessToken(token: string, expiresIn: number): void {
    this.tokens.accessToken = token;
    this.tokens.expiresAt = Date.now() + expiresIn * 1000;

    // Also store expiration in sessionStorage for persistence across tab refresh
    sessionStorage.setItem(this.EXPIRES_AT_KEY, this.tokens.expiresAt.toString());
  }

  /**
   * Get access token from memory
   */
  getAccessToken(): string | null {
    return this.tokens.accessToken;
  }

  /**
   * Set refresh token
   * SPEC-AU-ST-005: Prefer HttpOnly cookie (set by server)
   * SPEC-AU-ST-006: Fallback to sessionStorage
   */
  setRefreshToken(token: string): void {
    this.tokens.refreshToken = token;

    // Store in sessionStorage as fallback
    // In production, this should be HttpOnly cookie set by backend
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    // Try memory first
    if (this.tokens.refreshToken) {
      return this.tokens.refreshToken;
    }

    // Fallback to sessionStorage
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get token expiration timestamp
   */
  getExpiresAt(): number | null {
    return this.tokens.expiresAt;
  }

  /**
   * Check if access token is expired or expiring soon
   * SPEC-AU-ST-009: Renew before expiration
   */
  isTokenExpiringSoon(bufferMs: number = 5 * 60 * 1000): boolean {
    const expiresAt = this.tokens.expiresAt;
    if (!expiresAt) return true;

    return Date.now() >= expiresAt - bufferMs;
  }

  /**
   * Clear all tokens
   * SPEC-AU-LO-013, SPEC-AU-LO-014, SPEC-AU-LO-015
   */
  clearTokens(): void {
    this.tokens = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };

    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  /**
   * Load tokens from sessionStorage on initialization
   * Used to restore state after page refresh
   */
  private loadFromSessionStorage(): void {
    const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiresAt = sessionStorage.getItem(this.EXPIRES_AT_KEY);

    if (refreshToken) {
      this.tokens.refreshToken = refreshToken;
    }

    if (expiresAt) {
      this.tokens.expiresAt = parseInt(expiresAt, 10);
    }
  }

  /**
   * Check if we have a refresh token available
   * Used to determine if we should attempt auto-login on app start
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Get all tokens (for debugging only - never expose to UI)
   */
  getAllTokens(): TokenStorage {
    return {
      accessToken: this.tokens.accessToken,
      refreshToken: this.getRefreshToken(),
      expiresAt: this.tokens.expiresAt,
    };
  }
}

// Singleton instance
export const tokenStorage = new TokenStorageService();
