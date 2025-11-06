import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { config } from '../config/env.js';

/**
 * Compare two secrets using constant-time comparison
 *
 * Prevents timing attacks where attacker measures response time
 * to guess secret character-by-character.
 *
 * SPEC-CF-AM-013: Validação DEVE usar comparação constant-time
 *
 * @param received - Secret from request header
 * @param expected - Secret from config
 * @returns true if secrets match, false otherwise
 */
function compareSecrets(received: string, expected: string): boolean {
  try {
    // Convert strings to buffers for timingSafeEqual
    const bufferReceived = Buffer.from(received, 'utf8');
    const bufferExpected = Buffer.from(expected, 'utf8');

    // CRITICAL: timingSafeEqual throws if lengths differ
    // Check lengths first (different length = definitely not equal)
    if (bufferReceived.length !== bufferExpected.length) {
      return false;
    }

    // Constant-time comparison (SPEC-CF-AM-013)
    // Returns true if buffers are identical, false otherwise
    return timingSafeEqual(bufferReceived, bufferExpected);
  } catch (error) {
    // Log error but don't expose to client
    console.error('❌ Error in secret comparison:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
    });

    // Fail closed - reject on error
    return false;
  }
}

/**
 * Extended request type with platform authentication metadata
 * (Optional - for future enhancement if needed)
 */
export interface PlatformAuthRequest extends Request {
  platformAuth?: {
    validated: boolean;
    timestamp: Date;
  };
}

/**
 * Platform Authentication Middleware
 *
 * Validates X-Platform-Key header for requests from n8n → Backend.
 * Implements mutual authentication to ensure requests originate from authorized n8n instance.
 *
 * Security Features:
 * - Constant-time comparison (prevents timing attacks)
 * - Case-sensitive validation
 * - Rejects empty or missing headers
 * - Generic error messages (no information leakage)
 *
 * SPEC References:
 * - SPEC-CF-AM-008:011: n8n → Backend authentication requirements
 * - SPEC-CF-AM-012: Case-sensitive validation
 * - SPEC-CF-AM-013: Constant-time comparison
 * - SPEC-CF-AM-014: Reject empty/absent secrets
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const platformAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract header (Express normalizes to lowercase)
  const headerValue = req.headers['x-platform-key'];

  // Handle header as string (may be string[] if duplicated, take first)
  const receivedKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  // Validate header presence (SPEC-CF-AM-014)
  if (!receivedKey || receivedKey === '') {
    // Log security event (server-side only)
    console.warn('⚠️  Platform authentication failed: Missing or empty X-Platform-Key header', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    // Return generic error (no details to client)
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  // Get expected secret from config
  const expectedKey = config.platformSharedSecret;

  // Validate using constant-time comparison (prevent timing attacks)
  const isValid = compareSecrets(receivedKey, expectedKey);

  if (!isValid) {
    // Log security event
    console.warn('⚠️  Platform authentication failed: Invalid X-Platform-Key value', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    // Return generic error
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  // Success - log and continue
  if (config.logLevel === 'debug') {
    console.log('✅ Platform authentication successful', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
  }

  // Continue to next middleware/route handler
  next();
};

/**
 * Usage Examples:
 *
 * 1. Apply to specific route:
 * ```typescript
 * router.post('/api/internal/webhook', platformAuthMiddleware, webhookHandler);
 * ```
 *
 * 2. Apply to all routes under path:
 * ```typescript
 * app.use('/api/internal', platformAuthMiddleware);
 * ```
 *
 * 3. Conditional application:
 * ```typescript
 * // Only apply in production
 * if (config.nodeEnv === 'production') {
 *   app.use('/api/internal', platformAuthMiddleware);
 * }
 * ```
 *
 * IMPORTANT: This middleware should ONLY be applied to routes that n8n calls.
 * Do NOT apply to public routes (health check, JQEL, auth endpoints).
 */
