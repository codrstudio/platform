/**
 * SPEC-authentication.md - Authentication System Types
 */

/**
 * SPEC-AU-LI-001 to SPEC-AU-LI-004: Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
}

/**
 * SPEC-AU-LI-012 to SPEC-AU-LI-018: Login success response
 */
export interface LoginResponse {
  code: string;
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload: UserPayload;
}

/**
 * SPEC-AU-LI-018: User payload from JWT
 */
export interface UserPayload {
  userId: string;
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * SPEC-AU-LI-019 to SPEC-AU-LI-022: Error response
 */
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * SPEC-AU-RF-001 to SPEC-AU-RF-004: Refresh request
 */
export interface RefreshRequest {
  refresh_token: string;
}

/**
 * SPEC-AU-RF-013 to SPEC-AU-RF-017: Refresh response
 */
export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload?: UserPayload;
}

/**
 * SPEC-AU-LO-001 to SPEC-AU-LO-003: Logout request
 */
export interface LogoutRequest {
  refresh_token: string;
}

/**
 * SPEC-AU-LO-008 to SPEC-AU-LO-010: Logout response
 */
export interface LogoutResponse {
  code: string;
  message: string;
}

/**
 * SPEC-AU-LA-001 to SPEC-AU-LA-004: Logout all request
 */
export interface LogoutAllRequest {
  access_token: string;
}

/**
 * SPEC-AU-LA-011 to SPEC-AU-LA-014: Logout all response
 */
export interface LogoutAllResponse {
  code: string;
  message: string;
  sessions_revoked?: number;
}

/**
 * SPEC-AU-AZ-001 to SPEC-AU-AZ-008: Authorize request
 */
export interface AuthorizeRequest {
  access_token: string;
  schema?: string;
  permission?: string;
  query?: Record<string, any>;
}

/**
 * SPEC-AU-AZ-020 to SPEC-AU-AZ-024: Authorize success response
 */
export interface AuthorizeResponse {
  code: string;
  payload: UserPayload;
  authorized: boolean;
  permissions?: string[];
}

/**
 * SPEC-AU-AZ-025 to SPEC-AU-AZ-029: Authorize forbidden response
 */
export interface ForbiddenResponse {
  code: string;
  message: string;
  authorized: false;
  required_permission?: string;
}

/**
 * SPEC-AU-JWT-005 to SPEC-AU-JWT-013: JWT Payload
 */
export interface JWTPayload {
  sub: string; // userId
  iat: number; // issued at
  exp: number; // expiration
  iss: string; // issuer
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}
