// Authentication API Client
// Based on SPEC-authentication.md

import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllRequest,
  LogoutAllResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  AuthError,
} from '@/types/auth';

const API_BASE = '/api/1/auth';

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle API response and extract data or throw error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: AuthError = await response.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
    }));

    throw new AuthenticationError(
      error.message || 'Authentication failed',
      error.code || 'UNKNOWN_ERROR',
      error.details
    );
  }

  return response.json();
}

/**
 * Login with credentials
 * SPEC-AU-LI-001 to SPEC-AU-LI-018
 *
 * @param credentials - Login credentials
 * @returns Login response with tokens and user data
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
      realm: credentials.realm,
      schema: credentials.schema,
    }),
    credentials: 'include', // Include cookies (SPEC-AU-SG-009)
  });

  return handleResponse<LoginResponse>(response);
}

/**
 * Refresh access token
 * SPEC-AU-RF-001 to SPEC-AU-RF-017
 *
 * @param request - Refresh token request
 * @returns New tokens
 */
export async function refresh(request: RefreshRequest): Promise<RefreshResponse> {
  const response = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: request.refresh_token,
    }),
    credentials: 'include',
  });

  return handleResponse<RefreshResponse>(response);
}

/**
 * Logout (revoke current refresh token)
 * SPEC-AU-LO-001 to SPEC-AU-LO-012
 *
 * @param request - Logout request
 * @returns Logout confirmation
 */
export async function logout(request: LogoutRequest): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: request.refresh_token,
    }),
    credentials: 'include',
  });

  return handleResponse<LogoutResponse>(response);
}

/**
 * Logout from all devices
 * SPEC-AU-LA-001 to SPEC-AU-LA-017
 *
 * @param request - Logout all request
 * @returns Logout confirmation
 */
export async function logoutAll(request: LogoutAllRequest): Promise<LogoutAllResponse> {
  const response = await fetch(`${API_BASE}/logout-all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${request.access_token}`,
    },
    credentials: 'include',
  });

  return handleResponse<LogoutAllResponse>(response);
}

/**
 * Authorize (validate token and check permissions)
 * SPEC-AU-AZ-001 to SPEC-AU-AZ-036
 *
 * @param request - Authorization request
 * @returns Authorization result
 */
export async function authorize(request: AuthorizeRequest): Promise<AuthorizeResponse> {
  const response = await fetch(`${API_BASE}/authorize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${request.access_token}`,
    },
    body: JSON.stringify({
      schema: request.schema,
      permission: request.permission,
      query: request.query,
    }),
    credentials: 'include',
  });

  return handleResponse<AuthorizeResponse>(response);
}

/**
 * Parse JWT payload (client-side only, for quick checks)
 * WARNING: This does NOT validate the signature!
 * Server-side validation is required for security.
 */
export function parseJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
