// backend/src/utils/token.utils.ts
import { createHash, randomBytes, randomUUID } from 'crypto';

/**
 * Generate a secure random token (hex string)
 * Used for refresh tokens
 *
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex string of random bytes
 */
export function generateRandomToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Hash a token using SHA-256
 * Used to store refresh tokens securely
 *
 * @param token - Token to hash
 * @returns SHA-256 hash as hex string
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a UUID v4
 * Used for token family tracking
 *
 * @returns UUID string
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Convert expiration string to seconds
 * Handles formats like '15m', '7d', '1h'
 *
 * @param expiresIn - Expiration string
 * @returns Expiration in seconds
 */
export function parseExpirationToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${expiresIn}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return value * (multipliers[unit] || 1);
}

/**
 * Calculate expiration date from duration string
 *
 * @param expiresIn - Duration string (e.g., '7d')
 * @returns Future Date object
 */
export function calculateExpirationDate(expiresIn: string): Date {
  const seconds = parseExpirationToSeconds(expiresIn);
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + seconds);
  return expirationDate;
}
