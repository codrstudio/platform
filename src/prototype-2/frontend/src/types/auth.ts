// Frontend authentication type definitions
// Based on SPEC-authentication.md and backend auth contracts

/**
 * User information extracted from JWT payload
 */
export interface User {
  id: string;
  username: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Login credentials payload
 */
export interface LoginCredentials {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
}

/**
 * Authentication response from login and refresh endpoints
 * Contains JWT tokens and user payload
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  payload: {
    sub: string;
    username: string;
    email: string;
    roles?: string[];
    permissions?: string[];
  };
}

/**
 * Logout response from single session logout
 */
export interface LogoutResponse {
  code: string;
  message: string;
}

/**
 * Logout all response from all sessions logout
 */
export interface LogoutAllResponse {
  code: string;
  message: string;
  tokens_revoked: number;
}

/**
 * Error response structure from auth endpoints
 */
export interface AuthErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
