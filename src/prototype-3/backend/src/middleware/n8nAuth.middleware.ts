import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import crypto from 'crypto';

/**
 * SPEC-CF-AM-001: Communication Platform <-> n8n must use header X-Platform-Key
 * SPEC-CF-AM-008: n8n must include X-Platform-Key when calling Backend
 * SPEC-CF-AM-010: Backend must validate header before processing
 * SPEC-CF-AM-011: Invalid header must return HTTP 401
 * SPEC-CF-AM-012: Validation must be case-sensitive
 * SPEC-CF-AM-013: Validation must use constant-time comparison (avoid timing attacks)
 * SPEC-CF-AM-014: Empty or absent secret must be rejected
 *
 * Middleware for validating n8n -> Backend requests using X-Platform-Key header
 */

/**
 * SPEC-CF-AM-013: Constant-time comparison to prevent timing attacks
 * Compare two strings in constant time
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf-8'),
    Buffer.from(b, 'utf-8')
  );
}

/**
 * SPEC-CF-AM-008 to SPEC-CF-AM-014: Validate X-Platform-Key header from n8n
 * Middleware to validate n8n authentication
 */
export function validateN8nAuth(req: Request, res: Response, next: NextFunction): void {
  const platformKey = req.headers['x-platform-key'];

  // SPEC-CF-AM-014: Empty or absent secret must be rejected
  if (!platformKey || typeof platformKey !== 'string') {
    console.warn('[n8nAuth] Missing X-Platform-Key header');
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing authentication header',
    });
    return;
  }

  // SPEC-CF-VE-017, SPEC-CF-VE-018: PLATFORM_SHARED_SECRET must equal N8N_SHARED_SECRET
  const expectedSecret = env.PLATFORM_SHARED_SECRET || env.N8N_SHARED_SECRET;

  if (!expectedSecret) {
    console.error('[n8nAuth] PLATFORM_SHARED_SECRET not configured');
    res.status(500).json({
      success: false,
      error: 'Server configuration error',
    });
    return;
  }

  // SPEC-CF-AM-012: Case-sensitive validation
  // SPEC-CF-AM-013: Constant-time comparison
  if (!constantTimeCompare(platformKey, expectedSecret)) {
    console.warn('[n8nAuth] Invalid X-Platform-Key header');
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid authentication',
    });
    return;
  }

  // Valid authentication
  console.log('[n8nAuth] Valid n8n authentication');
  next();
}

/**
 * Optional: Middleware to add X-Platform-Key to outgoing requests to n8n
 * This can be used with axios interceptors
 */
export function addN8nAuthHeader(): string {
  // SPEC-CF-AM-004: Backend must include X-Platform-Key when calling n8n
  // SPEC-CF-AM-005: Value must come from N8N_SHARED_SECRET
  return env.N8N_SHARED_SECRET;
}
