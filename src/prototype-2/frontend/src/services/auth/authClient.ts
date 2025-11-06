// Authentication HTTP client
// Based on SPEC-authentication.md endpoint contracts

import type {
  LoginCredentials,
  AuthResponse,
  LogoutResponse,
  LogoutAllResponse,
  AuthErrorResponse,
} from '../../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Login user with credentials
 * POST /api/1/auth/login
 *
 * @param credentials - Username and password
 * @returns Authentication response with tokens and user data
 * @throws Error if login fails
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error: AuthErrorResponse = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 * POST /api/1/auth/refresh
 *
 * @param refreshToken - Valid refresh token
 * @returns New authentication response with fresh tokens
 * @throws Error if refresh fails
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error: AuthErrorResponse = await response.json();
    throw new Error(error.message || 'Token refresh failed');
  }

  return response.json();
}

/**
 * Logout current session
 * POST /api/1/auth/logout
 *
 * @param refreshToken - Refresh token to revoke
 * @returns Logout confirmation
 * @throws Error if logout fails
 */
export async function logout(refreshToken: string): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error: AuthErrorResponse = await response.json();
    throw new Error(error.message || 'Logout failed');
  }

  return response.json();
}

/**
 * Logout all sessions for current user
 * POST /api/1/auth/logout-all
 *
 * @param accessToken - Valid access token (JWT)
 * @returns Logout all confirmation with count of revoked tokens
 * @throws Error if logout all fails
 */
export async function logoutAll(accessToken: string): Promise<LogoutAllResponse> {
  const response = await fetch(`${API_BASE_URL}/api/1/auth/logout-all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error: AuthErrorResponse = await response.json();
    throw new Error(error.message || 'Logout all failed');
  }

  return response.json();
}
