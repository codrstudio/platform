/**
 * Authentication Service
 * Communicates with backend auth routes
 * SPEC-AU-RO-* compliance
 */

import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  LogoutAllRequest,
  AuthorizeRequest,
  AuthorizeResponse,
  AuthTokens,
} from './types';
import { AuthError } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_PREFIX = '/1/auth'; // API_BASE already contains /api prefix

class AuthService {
  /**
   * Login with username and password
   * POST /api/1/auth/login
   * SPEC-AU-LI-*
   */
  async login(request: LoginRequest): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE}${AUTH_PREFIX}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new AuthError({
        code: data.code || 'login_failed',
        message: data.code || 'Login failed',
      });
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  }

  /**
   * Refresh access token
   * POST /api/1/auth/refresh
   * SPEC-AU-RF-*
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const request: RefreshRequest = {
      refresh_token: refreshToken,
    };

    const response = await fetch(`${API_BASE}${AUTH_PREFIX}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: RefreshResponse = await response.json();

    if (!response.ok) {
      throw new AuthError({
        code: data.code || 'refresh_failed',
        message: data.code || 'Token refresh failed',
      });
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  }

  /**
   * Logout current session
   * POST /api/1/auth/logout
   * SPEC-AU-LO-*
   */
  async logout(refreshToken: string): Promise<void> {
    const request: LogoutRequest = {
      refresh_token: refreshToken,
    };

    const response = await fetch(`${API_BASE}${AUTH_PREFIX}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new AuthError({
        code: data.code || 'logout_failed',
        message: data.message || 'Logout failed',
      });
    }
  }

  /**
   * Logout all sessions
   * POST /api/1/auth/logout-all
   * SPEC-AU-LA-*
   */
  async logoutAll(accessToken: string): Promise<void> {
    const request: LogoutAllRequest = {
      access_token: accessToken,
    };

    const response = await fetch(`${API_BASE}${AUTH_PREFIX}/logout-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new AuthError({
        code: data.code || 'logout_all_failed',
        message: data.message || 'Logout all failed',
      });
    }
  }

  /**
   * Authorize JWT and check permissions
   * POST /api/1/auth/authorize
   * SPEC-AU-AZ-*
   */
  async authorize(
    accessToken: string,
    permission?: string
  ): Promise<AuthorizeResponse> {
    const request: AuthorizeRequest = {
      access_token: accessToken,
      permission,
    };

    const response = await fetch(`${API_BASE}${AUTH_PREFIX}/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    const data: AuthorizeResponse = await response.json();

    if (!response.ok) {
      throw new AuthError({
        code: data.code || 'authorize_failed',
        message: data.code || 'Authorization failed',
      });
    }

    return data;
  }
}

// Export singleton instance
export const authService = new AuthService();
