/**
 * Refresh token data stored in Redis
 *
 * This interface defines the structure of refresh token metadata
 * stored in Redis for token rotation and family tracking.
 */
export interface RefreshTokenData {
  /** SHA-256 hash of the token */
  token_hash: string;

  /** User identifier */
  user_id: string;

  /** Token family ID for reuse detection */
  family_id: string;

  /** Unix timestamp (seconds) when token was issued */
  issued_at: number;

  /** Unix timestamp (seconds) when token expires */
  expires_at: number;

  /** Unix timestamp (seconds) when token was consumed (rotated) */
  consumed_at?: number;

  /** Revocation flag */
  revoked: boolean;

  /** Optional: IP address for audit trail */
  ip_address?: string;

  /** Optional: User agent for audit trail */
  user_agent?: string;
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
 * Token validation result
 *
 * Returned when validating a refresh token.
 * Indicates whether the token is valid and provides error details.
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  valid: boolean;

  /** Token data if valid */
  data?: RefreshTokenData;

  /** Error type if invalid */
  error?: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'REUSED' | 'REDIS_ERROR';
}
