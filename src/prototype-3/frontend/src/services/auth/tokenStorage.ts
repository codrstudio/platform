/**
 * SPEC-AU-ST-*: Token storage in frontend
 * SPEC-AU-ST-001: Access token in memory (sessionStorage)
 * SPEC-AU-ST-002: Can use sessionStorage for access token
 * SPEC-AU-ST-003: NOT localStorage (XSS risk)
 * SPEC-AU-ST-006: Refresh token in localStorage (less secure but practical)
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

class TokenStorage {
  /**
   * SPEC-AU-ST-001, SPEC-AU-ST-002: Store access token in sessionStorage
   * (Cleared when browser tab closes, safer than localStorage)
   */
  setAccessToken(token: string, expiresIn: number): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);

    // Store expiry timestamp for auto-renewal
    const expiryTime = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Get access token from sessionStorage
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry(): number | null {
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Check if access token is expired or about to expire
   * @param bufferSeconds How many seconds before expiry to consider "expired" (default: 60)
   */
  isAccessTokenExpired(bufferSeconds: number = 60): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) {
      return true;
    }

    const now = Date.now();
    const expiryWithBuffer = expiry - bufferSeconds * 1000;

    return now >= expiryWithBuffer;
  }

  /**
   * Clear access token from sessionStorage
   */
  clearAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * SPEC-AU-ST-006: Store refresh token in localStorage
   * Note: Less secure than HTTP-only cookie, but more practical for SPA
   * Alternative: could use HTTP-only cookie if backend supports it
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear refresh token from localStorage
   */
  clearRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * SPEC-AU-LO-013 to SPEC-AU-LO-015: Clear all tokens (logout)
   */
  clearAll(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }

  /**
   * Store both tokens
   */
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.setAccessToken(accessToken, expiresIn);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Check if user has any tokens (even if expired)
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() || this.getRefreshToken());
  }
}

// Singleton instance
export const tokenStorage = new TokenStorage();
