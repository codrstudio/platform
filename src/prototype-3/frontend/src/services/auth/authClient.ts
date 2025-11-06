import type { LoginCredentials, LoginResponse, RefreshResponse } from '@/types/auth';

/**
 * SPEC-AU-RO-*: Authentication API client
 * Makes HTTP calls to backend auth routes
 */

const API_BASE = import.meta.env.VITE_API_URL || '';
const AUTH_BASE = `${API_BASE}/api/1/auth`;

class AuthClient {
  /**
   * SPEC-AU-LI-*: POST /api/1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthClientError(data.code, data.message, response.status, data.details);
    }

    return data;
  }

  /**
   * SPEC-AU-RF-*: POST /api/1/auth/refresh
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${AUTH_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthClientError(data.code, data.message, response.status, data.details);
    }

    return data;
  }

  /**
   * SPEC-AU-LO-*: POST /api/1/auth/logout
   */
  async logout(refreshToken: string): Promise<void> {
    const response = await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthClientError(data.code, data.message, response.status, data.details);
    }
  }

  /**
   * SPEC-AU-LA-*: POST /api/1/auth/logout-all
   */
  async logoutAll(accessToken: string): Promise<void> {
    const response = await fetch(`${AUTH_BASE}/logout-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthClientError(data.code, data.message, response.status, data.details);
    }
  }

  /**
   * SPEC-AU-AZ-*: POST /api/1/auth/authorize
   */
  async authorize(
    accessToken: string,
    options?: {
      schema?: string;
      permission?: string;
      query?: Record<string, any>;
    }
  ): Promise<{ authorized: boolean; payload: any; permissions?: string[] }> {
    const response = await fetch(`${AUTH_BASE}/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(options || {}),
    });

    const data = await response.json();

    if (!response.ok && response.status !== 403) {
      throw new AuthClientError(data.code, data.message, response.status, data.details);
    }

    return data;
  }
}

/**
 * Custom error class for auth errors
 */
export class AuthClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthClientError';
  }

  /**
   * Check if error is due to invalid/expired token
   */
  isTokenError(): boolean {
    return this.status === 401 || this.code === 'invalid_token' || this.code === 'invalid_credentials';
  }

  /**
   * Check if error is due to missing permission
   */
  isForbidden(): boolean {
    return this.status === 403 || this.code === 'forbidden';
  }
}

// Singleton instance
export const authClient = new AuthClient();
