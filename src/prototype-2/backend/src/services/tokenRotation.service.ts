import crypto from 'crypto';
import { redisService } from './redis.service.js';
import { config } from '../config/env.js';
import type {
  BackendRefreshTokenData,
  TokenGenerationOptions,
  TokenValidationResult,
} from '../types/auth.types.js';

/**
 * TokenRotationService
 *
 * Implements refresh token rotation with family tracking and reuse detection.
 * Follows OWASP 2025 best practices for refresh token security.
 *
 * Key Security Features:
 * - One-time use tokens (rotation on each refresh)
 * - Token family tracking for breach detection
 * - Reuse detection triggers family revocation
 * - SHA-256 hashing before storage
 * - Automatic TTL cleanup via Redis
 *
 * SPEC References:
 * - SPEC-AU-RF-011: Token rotation
 * - SPEC-AU-RF-008: Reuse detection
 * - SPEC-AU-RF-009: Family revocation
 * - SPEC-AU-RF-012: Old token invalidation
 */
export class TokenRotationService {
  private readonly KEY_PREFIX = 'refresh_token:';
  private readonly USER_TOKENS_PREFIX = 'user_tokens:';
  private readonly FAMILY_TOKENS_PREFIX = 'family_tokens:';

  /**
   * Parse JWT_REFRESH_TOKEN_EXPIRES_IN to seconds
   *
   * Supports formats: 30s, 15m, 24h, 7d
   *
   * @param expiresIn - Expiration string (e.g., "7d")
   * @returns TTL in seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }

  /**
   * Hash token using SHA-256
   *
   * Security: Never store raw tokens in database/Redis.
   * Hashing prevents token exposure if storage is compromised.
   *
   * @param token - Raw token string
   * @returns Hex-encoded SHA-256 hash
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate random opaque token
   *
   * Uses crypto.randomBytes for cryptographically secure randomness.
   * Base64url encoding ensures URL-safe characters.
   *
   * @returns Random token (44 characters)
   */
  private generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate family ID
   *
   * Creates unique identifier for token family.
   * Used to track all tokens derived from same initial authentication.
   *
   * @returns Random family ID (32 hex characters)
   */
  private generateFamilyId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get TTL in seconds for refresh tokens
   *
   * @returns TTL from environment config
   */
  private getTTL(): number {
    return this.parseExpiresIn(config.jwtRefreshTokenExpiresIn);
  }

  /**
   * Store refresh token in Redis
   *
   * Stores token metadata with automatic expiration.
   * Adds token to user and family sets for bulk operations.
   *
   * SPEC-AU-RF-011: Token válido DEVE gerar novo refresh token (rotação)
   *
   * @param token - Raw refresh token (will be hashed)
   * @param options - Token generation options
   */
  async storeRefreshToken(
    token: string,
    options: TokenGenerationOptions
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    const ttl = this.getTTL();
    const now = Math.floor(Date.now() / 1000);

    const tokenData: BackendRefreshTokenData = {
      token_hash: tokenHash,
      user_id: options.userId,
      family_id: options.familyId || this.generateFamilyId(),
      issued_at: now,
      expires_at: now + ttl,
      revoked: false,
      ip_address: options.ipAddress,
      user_agent: options.userAgent,
    };

    const pipeline = redisService.multi();

    // Store token data with TTL
    pipeline.setex(
      `${this.KEY_PREFIX}${tokenHash}`,
      ttl,
      JSON.stringify(tokenData)
    );

    // Add to user's token set
    pipeline.sadd(`${this.USER_TOKENS_PREFIX}${options.userId}`, tokenHash);
    pipeline.expire(`${this.USER_TOKENS_PREFIX}${options.userId}`, ttl);

    // Add to family's token set
    pipeline.sadd(`${this.FAMILY_TOKENS_PREFIX}${tokenData.family_id}`, tokenHash);
    pipeline.expire(`${this.FAMILY_TOKENS_PREFIX}${tokenData.family_id}`, ttl);

    await pipeline.exec();
  }

  /**
   * Validate refresh token
   *
   * Checks if token exists, is not expired, not revoked, and not consumed.
   * Detects reuse attempts for security breach detection.
   *
   * SPEC-AU-RF-006: Backbone DEVE validar refresh_token
   * SPEC-AU-RF-007: Backbone DEVE verificar se token não foi revogado
   * SPEC-AU-RF-008: Backbone DEVE detectar reuso de token
   *
   * @param token - Raw refresh token
   * @returns Validation result with token data or error
   */
  async validateRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const tokenHash = this.hashToken(token);
      const key = `${this.KEY_PREFIX}${tokenHash}`;

      const dataStr = await redisService.get(key);

      // SPEC-AU-RF-018: Token inválido ou expirado DEVE retornar HTTP 401
      if (!dataStr) {
        return {
          valid: false,
          error: 'NOT_FOUND',
        };
      }

      const data: BackendRefreshTokenData = JSON.parse(dataStr);
      const now = Math.floor(Date.now() / 1000);

      // Check expiration
      if (data.expires_at < now) {
        return {
          valid: false,
          error: 'EXPIRED',
        };
      }

      // Check revocation
      if (data.revoked) {
        return {
          valid: false,
          error: 'REVOKED',
        };
      }

      // SPEC-AU-RF-008: Detectar reuso de token
      // SPEC-AU-RF-019: Reuso detectado DEVE retornar HTTP 401
      if (data.consumed_at) {
        return {
          valid: false,
          error: 'REUSED',
          data, // Return data for family revocation
        };
      }

      return {
        valid: true,
        data,
      };
    } catch (error) {
      console.error('❌ Error validating refresh token:', error);
      return {
        valid: false,
        error: 'REDIS_ERROR',
      };
    }
  }

  /**
   * Mark token as consumed (used in rotation)
   *
   * Sets consumed_at timestamp to detect reuse attempts.
   * Token remains in Redis until expiration for audit trail.
   *
   * SPEC-AU-RF-012: Refresh token antigo DEVE ser invalidado
   *
   * @param tokenHash - SHA-256 hash of token
   */
  async markTokenConsumed(tokenHash: string): Promise<void> {
    const key = `${this.KEY_PREFIX}${tokenHash}`;
    const dataStr = await redisService.get(key);

    if (!dataStr) return;

    const data: BackendRefreshTokenData = JSON.parse(dataStr);
    data.consumed_at = Math.floor(Date.now() / 1000);

    const ttl = await redisService.ttl(key);
    await redisService.set(key, JSON.stringify(data), ttl > 0 ? ttl : this.getTTL());
  }

  /**
   * Revoke entire token family (when reuse detected)
   *
   * Security: When reuse is detected, entire family is compromised.
   * Revokes all tokens in family to prevent further unauthorized access.
   *
   * SPEC-AU-RF-009: Reuso detectado DEVE revogar família inteira de tokens
   * SPEC-AU-RF-023: Reuso invalida toda a família
   *
   * @param familyId - Token family ID
   */
  async revokeTokenFamily(familyId: string): Promise<void> {
    try {
      const familyKey = `${this.FAMILY_TOKENS_PREFIX}${familyId}`;
      const tokenHashes = await redisService.smembers(familyKey);

      if (tokenHashes.length === 0) return;

      const pipeline = redisService.multi();

      for (const tokenHash of tokenHashes) {
        const key = `${this.KEY_PREFIX}${tokenHash}`;
        const dataStr = await redisService.get(key);

        if (dataStr) {
          const data: BackendRefreshTokenData = JSON.parse(dataStr);
          data.revoked = true;

          const ttl = await redisService.ttl(key);
          pipeline.setex(key, ttl > 0 ? ttl : this.getTTL(), JSON.stringify(data));
        }
      }

      await pipeline.exec();

      console.warn(`⚠️ Token family revoked due to reuse: ${familyId}`);
    } catch (error) {
      console.error('❌ Error revoking token family:', error);
      throw error;
    }
  }

  /**
   * Revoke single token (for logout)
   *
   * Marks token as revoked. Idempotent - safe to call multiple times.
   *
   * SPEC-AU-LO-005: Backbone DEVE revogar o refresh_token específico
   *
   * @param token - Raw refresh token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(token);
      const key = `${this.KEY_PREFIX}${tokenHash}`;
      const dataStr = await redisService.get(key);

      if (!dataStr) return; // Token doesn't exist, idempotent

      const data: BackendRefreshTokenData = JSON.parse(dataStr);
      data.revoked = true;

      const ttl = await redisService.ttl(key);
      await redisService.set(key, JSON.stringify(data), ttl > 0 ? ttl : this.getTTL());
    } catch (error) {
      console.error('❌ Error revoking token:', error);
      throw error;
    }
  }

  /**
   * Revoke all tokens for a user (for logout-all)
   *
   * Finds all user tokens and marks them as revoked.
   * Used for security operations like password reset or account compromise.
   *
   * SPEC-AU-LA-008: Backbone DEVE revogar TODOS os refresh tokens do usuário
   *
   * @param userId - User identifier
   * @returns Number of tokens revoked
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const userKey = `${this.USER_TOKENS_PREFIX}${userId}`;
      const tokenHashes = await redisService.smembers(userKey);

      if (tokenHashes.length === 0) return 0;

      const pipeline = redisService.multi();

      for (const tokenHash of tokenHashes) {
        const key = `${this.KEY_PREFIX}${tokenHash}`;
        const dataStr = await redisService.get(key);

        if (dataStr) {
          const data: BackendRefreshTokenData = JSON.parse(dataStr);
          data.revoked = true;

          const ttl = await redisService.ttl(key);
          pipeline.setex(key, ttl > 0 ? ttl : this.getTTL(), JSON.stringify(data));
        }
      }

      await pipeline.exec();

      return tokenHashes.length;
    } catch (error) {
      console.error('❌ Error revoking all user tokens:', error);
      throw error;
    }
  }

  /**
   * Generate new refresh token (opaque)
   *
   * Creates cryptographically secure random token.
   * Use this for initial token generation and rotation.
   *
   * @returns Random opaque token
   */
  generateRefreshToken(): string {
    return this.generateOpaqueToken();
  }
}

// Export singleton instance
export const tokenRotationService = new TokenRotationService();
