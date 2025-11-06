// backend/src/services/jwt.service.ts
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import {
  generateRandomToken,
  hashToken,
  generateUUID,
  parseExpirationToSeconds,
  calculateExpirationDate,
} from '../utils/token.utils.js';
import type {
  JwtPayload,
  TokenResponse,
} from '../types/auth.types.js';

/**
 * JWT Service
 * Handles generation of access tokens (JWT) and refresh tokens
 * Following SPEC-AU-JWT-* and SPEC-AU-LO-013:016
 */
export class JwtService {
  private readonly secret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly issuer: string;

  constructor() {
    this.secret = config.jwtSecret;
    this.accessTokenExpiresIn = config.jwtAccessTokenExpiresIn;
    this.refreshTokenExpiresIn = config.jwtRefreshTokenExpiresIn;
    this.issuer = 'platform'; // SPEC-AU-JWT-008 - Can be configured
  }

  /**
   * Generate JWT access token
   * Following SPEC-AU-JWT-001:017
   *
   * @param payload - JWT payload with user data
   * @returns Signed JWT string
   */
  public generateAccessToken(payload: JwtPayload): string {
    // Ensure required claims
    const tokenPayload: JwtPayload = {
      ...payload,
      iss: this.issuer, // SPEC-AU-JWT-008
    };

    // Sign JWT with HS256 algorithm (SPEC-AU-JWT-002)
    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn: this.accessTokenExpiresIn as `${number}${'s'|'m'|'h'|'d'}`, // SPEC-AU-JWT-014
      // Note: sub is already in tokenPayload, don't duplicate in options
    };

    const token = jwt.sign(tokenPayload, this.secret, options);

    return token;
  }

  /**
   * Generate opaque refresh token
   *
   * @returns Random hex string (64 characters)
   */
  public generateRefreshToken(): string {
    return generateRandomToken(32); // 32 bytes = 64 hex chars
  }

  /**
   * Generate complete token pair with control data
   * This is the main method used by auth routes
   *
   * @param payload - User data to include in JWT
   * @returns Complete token response with tokens and control data
   */
  public generateTokenPair(payload: JwtPayload): TokenResponse {
    // Generate tokens
    const access_token = this.generateAccessToken(payload);
    const refresh_token = this.generateRefreshToken();

    // Generate control data
    const refresh_token_hash = hashToken(refresh_token);
    const familia_id = generateUUID();
    const expires_at = calculateExpirationDate(this.refreshTokenExpiresIn);

    // Calculate expires_in for access token
    const expires_in = parseExpirationToSeconds(this.accessTokenExpiresIn);

    // Build response following n8n pattern
    return {
      tokens: {
        access_token,
        refresh_token,
        token_type: 'bearer',
        expires_in,
      },
      tokens_control: {
        refresh_token_hash,
        familia_id,
        expires_at,
      },
      payload: {
        ...payload,
        iss: this.issuer,
      },
    };
  }

  /**
   * Verify and decode JWT access token
   * (Future use - for middleware)
   *
   * @param token - JWT to verify
   * @returns Decoded payload
   * @throws Error if token is invalid or expired
   */
  public verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode JWT without verification
   * (For debugging/inspection only - DO NOT use for auth)
   *
   * @param token - JWT to decode
   * @returns Decoded payload (unverified)
   */
  public decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }

  /**
   * Get access token TTL in seconds
   * Used for returning expires_in in token responses
   *
   * @returns TTL in seconds
   */
  public getAccessTokenTTL(): number {
    return parseExpirationToSeconds(this.accessTokenExpiresIn);
  }
}

// Export singleton instance
export const jwtService = new JwtService();
