import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JWTPayload, UserPayload } from '../types/auth.types.js';

/**
 * SPEC-AU-JWT-*: JWT token validation and handling
 * SPEC-AU-AZ-014 to SPEC-AU-AZ-015: JWT validation for authorize endpoint
 */

class JWTService {
  private secret: string;

  constructor() {
    // SPEC-AU-JWT-018 to SPEC-AU-JWT-021: Secret management
    this.secret = env.JWT_SECRET;

    if (this.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters (SPEC-AU-JWT-018)');
    }
  }

  /**
   * SPEC-AU-AZ-014: Validate JWT (signature, expiration)
   * SPEC-AU-JWT-017: Expired tokens cannot be used
   */
  verify(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256', 'RS256'], // SPEC-AU-JWT-002
      }) as JWTPayload;

      // SPEC-AU-JWT-005 to SPEC-AU-JWT-008: Validate required fields
      if (!payload.sub || !payload.iat || !payload.exp || !payload.iss) {
        throw new Error('Invalid JWT payload: missing required fields');
      }

      return payload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired'); // SPEC-AU-JWT-017
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token signature');
      } else {
        throw new Error(`JWT validation failed: ${error.message}`);
      }
    }
  }

  /**
   * Decode JWT without verification (for debugging/logging)
   * WARNING: Do not use for security decisions
   */
  decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * SPEC-AU-AZ-015: Extract payload from JWT
   * SPEC-AU-LA-006: Extract userId from token
   */
  extractPayload(token: string): UserPayload {
    const payload = this.verify(token);

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }

  /**
   * Extract userId from token
   */
  extractUserId(token: string): string {
    const payload = this.verify(token);
    return payload.sub;
  }

  /**
   * Check if token is expired (without throwing)
   */
  isExpired(token: string): boolean {
    try {
      this.verify(token);
      return false;
    } catch (error: any) {
      return error.message === 'Token expired';
    }
  }

  /**
   * Get remaining time until token expiration (in seconds)
   */
  getTimeToExpiry(token: string): number {
    try {
      const payload = this.decode(token);
      if (!payload?.exp) {
        return 0;
      }

      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;

      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const jwtService = new JWTService();
