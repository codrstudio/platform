/**
 * Authentication Types
 * SPEC-AU-* compliance
 */

// JWT Tokens Response
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
}

// JWT Payload (decoded from access_token)
export interface JWTPayload {
  sub: string; // User ID
  iss: string; // Issuer
  iat: number; // Issued at (unix timestamp)
  exp: number; // Expiration (unix timestamp)
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any; // Additional custom claims
}

// Login Request
export interface LoginRequest {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
}

// Login Response (success)
export interface LoginResponse {
  code: string; // "success"
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload: JWTPayload;
}

// Refresh Request
export interface RefreshRequest {
  refresh_token: string;
}

// Refresh Response
export interface RefreshResponse {
  code: string;
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload?: JWTPayload;
}

// Logout Request
export interface LogoutRequest {
  refresh_token: string;
}

// Logout All Request
export interface LogoutAllRequest {
  access_token: string;
}

// Authorize Request
export interface AuthorizeRequest {
  access_token: string;
  permission?: string;
}

// Authorize Response
export interface AuthorizeResponse {
  code: string;
  authorized: boolean;
  payload: JWTPayload;
}

// Error Response
export interface AuthErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Auth Error Class
export class AuthError extends Error {
  code: string;
  details?: any;

  constructor(response: AuthErrorResponse) {
    super(response.message);
    this.name = 'AuthError';
    this.code = response.code;
    this.details = response.details;
  }
}
