// backend/src/types/auth.types.ts

/**
 * JWT payload structure following SPEC-AU-JWT-005:013
 */
export interface JwtPayload {
  // Required claims (SPEC-AU-JWT-005:008)
  sub: string;        // User ID (subject)
  iss?: string;       // Issuer (platform identifier) - auto-set by service
  iat?: number;       // Issued at (auto-set by jsonwebtoken)
  exp?: number;       // Expiration (auto-set by jsonwebtoken)

  // Optional standard claims
  jti?: string;       // JWT ID (unique identifier)
  aud?: string;       // Audience

  // Optional custom claims (SPEC-AU-JWT-009:013)
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];

  // Allow additional custom fields
  [key: string]: any;
}

/**
 * Token pair returned to client
 */
export interface TokenPair {
  access_token: string;       // JWT access token
  refresh_token: string;      // Opaque refresh token
  token_type: 'bearer';       // Always 'bearer'
  expires_in: number;         // Access token TTL in seconds
}

/**
 * Token control data for internal management
 */
export interface TokenControl {
  refresh_token_hash: string; // SHA-256 hash for storage
  familia_id: string;         // Token family UUID
  expires_at: Date;           // Refresh token expiration
}

/**
 * Complete token response with control data
 */
export interface TokenResponse {
  tokens: TokenPair;
  tokens_control: TokenControl;
  payload: JwtPayload;
}

/**
 * Extended refresh token data with backend-specific fields
 *
 * This interface extends the shared RefreshTokenData with backend-specific
 * fields that may be needed in future implementations.
 */
export interface BackendRefreshTokenData {
  token_hash: string;
  user_id: string;
  family_id: string;
  issued_at: number;
  expires_at: number;
  consumed_at?: number;
  revoked: boolean;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Token generation options
 *
 * Options used when generating and storing a new refresh token.
 */
export interface TokenGenerationOptions {
  /** User ID for whom the token is being generated */
  userId: string;

  /** Optional: Reuse existing family ID for rotation (maintains family chain) */
  familyId?: string;

  /** Optional: IP address for audit trail */
  ipAddress?: string;

  /** Optional: User agent for audit trail */
  userAgent?: string;
}

/**
 * Token validation result
 *
 * Returned when validating a refresh token.
 * Indicates whether the token is valid and provides error details.
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  valid: boolean;

  /** Token data if valid */
  data?: BackendRefreshTokenData;

  /** Error type if invalid */
  error?: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'REUSED' | 'REDIS_ERROR';
}

/**
 * Result of token rotation operation
 *
 * Returned when attempting to rotate a refresh token.
 * Contains new tokens on success or error details on failure.
 */
export interface RotationResult {
  /** Whether the rotation was successful */
  success: boolean;

  /** New access token (JWT) */
  access_token?: string;

  /** New refresh token (opaque) */
  refresh_token?: string;

  /** Access token expiration in seconds */
  expires_in?: number;

  /** Error details if rotation failed */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Login credentials from client
 *
 * SPEC-AU-LI-001:006 - Login endpoint accepts these fields
 */
export interface LoginCredentials {
  /** Username (required) */
  username: string;

  /** Password (required) */
  password: string;

  /** Optional realm for multi-tenancy */
  realm?: string;

  /** Optional schema for database routing */
  schema?: string;
}

/**
 * User data returned by n8n auth-login workflow
 *
 * Contract defined by workflows/auth/auth-login.json
 */
export interface N8nUserData {
  /** User ID (required) */
  id: string;

  /** Username (required) */
  username: string;

  /** Email address (required) */
  email: string;

  /** User roles (optional) */
  roles?: string[];

  /** User permissions (optional) */
  permissions?: string[];

  /** Allow additional custom fields from n8n */
  [key: string]: any;
}

/**
 * n8n login workflow response structure
 *
 * Expected response from POST {N8N_BASE_URL}/webhook/auth/login
 */
export interface N8nLoginResponse {
  /** HTTP status code (200 for success) */
  code: number;

  /** Response data */
  data: {
    /** User information */
    user: N8nUserData;
  };
}

/**
 * Authorization request from client
 *
 * SPEC-AU-AZ-001:008 - Authorize endpoint accepts token and permission
 */
export interface AuthorizeRequest {
  /** Access token (optional, can come from header/cookie) */
  access_token?: string;

  /** Schema for permission validation (optional, defaults to "*") */
  schema?: string;

  /** Permission string in format: {operation}.{entity}[.{action}] */
  permission?: string;

  /** JQEL select operation (alternative to permission) */
  select?: string;

  /** JQEL mutate operation (alternative to permission) */
  mutate?: string;

  /** JQEL action (optional, used with select/mutate) */
  action?: string;
}

/**
 * Authorization response to client
 *
 * SPEC-AU-AZ-020:029 - Authorize endpoint returns authorization decision
 */
export interface AuthorizeResponse {
  /** Whether user is authorized */
  authorized: boolean;

  /** JWT payload (included on success) */
  payload?: JwtPayload;

  /** Permissions user has (optional) */
  permissions?: string[];

  /** Error code (included on failure) */
  code?: string;

  /** Error message (included on failure) */
  message?: string;

  /** Required permission (included when forbidden) */
  required_permission?: string;
}

/**
 * n8n authorize workflow response
 *
 * Contract from workflows/auth/authorize.json
 */
export interface N8nAuthorizeResponse {
  /** HTTP status code */
  code: number;

  /** Response data */
  data?: {
    /** Whether permission is granted */
    isGranted: boolean;

    /** JWT payload */
    payload?: JwtPayload;

    /** User permissions (optional) */
    permissions?: string[];
  };

  /** Error message (if code !== 200) */
  message?: string;
}
