/**
 * SPEC-authentication.md - Frontend Authentication Types
 */

/**
 * User payload from JWT (SPEC-AU-LI-018)
 */
export interface User {
  userId: string;
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Authentication tokens (SPEC-AU-LI-013, SPEC-AU-LI-014)
 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * Login request (SPEC-AU-LI-001 to SPEC-AU-LI-004)
 */
export interface LoginCredentials {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
}

/**
 * Login response (SPEC-AU-LI-012 to SPEC-AU-LI-018)
 */
export interface LoginResponse {
  code: string;
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload: User;
}

/**
 * Refresh response (SPEC-AU-RF-013 to SPEC-AU-RF-017)
 */
export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  payload?: User;
}

/**
 * Auth error response (SPEC-AU-LI-019 to SPEC-AU-LI-022)
 */
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Authorization request (SPEC-AU-AZ-001 to SPEC-AU-AZ-004)
 */
export interface AuthorizeRequest {
  action: string;
  resource: string;
  context?: Record<string, any>;
}

/**
 * Authorization response (SPEC-AU-AZ-010 to SPEC-AU-AZ-014)
 */
export interface AuthorizeResponse {
  code: string;
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
  grantedPermissions?: string[];
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
  grantedPermissions?: string[];
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  authorize: (action: string, resource: string, context?: Record<string, any>) => Promise<AuthorizeResponse>;
}
