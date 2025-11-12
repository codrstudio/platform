// Authentication Types
// Based on SPEC-authentication.md

// User data structure
export interface User {
  userId: string;
  username: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  sub?: string;      // JWT subject (same as userId)
  guest?: boolean;   // Guest flag from JWT
  [key: string]: unknown;
}

// Login request (SPEC-AU-LI-001 to SPEC-AU-LI-006)
export interface LoginRequest {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
  rememberMe?: boolean;
}

// Login response (SPEC-AU-LI-012 to SPEC-AU-LI-018)
export interface LoginResponse {
  code: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  payload: User;
}

// Refresh request (SPEC-AU-RF-001 to SPEC-AU-RF-004)
export interface RefreshRequest {
  refresh_token: string;
}

// Refresh response (SPEC-AU-RF-013 to SPEC-AU-RF-017)
export interface RefreshResponse {
  code: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  payload?: User;
}

// Logout request (SPEC-AU-LO-001 to SPEC-AU-LO-003)
export interface LogoutRequest {
  refresh_token: string;
}

// Logout response (SPEC-AU-LO-008 to SPEC-AU-LO-010)
export interface LogoutResponse {
  code: string;
  message: string;
}

// Logout all request (SPEC-AU-LA-001 to SPEC-AU-LA-004)
export interface LogoutAllRequest {
  access_token: string;
}

// Logout all response (SPEC-AU-LA-011 to SPEC-AU-LA-014)
export interface LogoutAllResponse {
  code: string;
  message: string;
  sessions_revoked?: number;
}

// Authorize request (SPEC-AU-AZ-001 to SPEC-AU-AZ-008)
export interface AuthorizeRequest {
  access_token: string;
  schema?: string;
  permission?: string;
  query?: unknown;
}

// Authorize response (SPEC-AU-AZ-020 to SPEC-AU-AZ-024)
export interface AuthorizeResponse {
  code: string;
  payload: User;
  authorized: boolean;
  permissions?: string[];
  required_permission?: string;
  message?: string;
}

// Auth error response (SPEC-AU-LI-019 to SPEC-AU-LI-022)
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// JWT Payload (SPEC-AU-JWT-005 to SPEC-AU-JWT-013)
export interface JWTPayload {
  sub: string;          // userId
  iat: number;          // issued at
  exp: number;          // expiration
  iss: string;          // issuer
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

// Token storage interface (SPEC-AU-ST-001 to SPEC-AU-ST-008)
export interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Auth state (SPEC-STATE-A-002)
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

// Auth context value (SPEC-STATE-A-005)
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
}

// Permission check result
export interface PermissionCheck {
  hasPermission: boolean;
  isLoading: boolean;
  error?: Error;
}
