import { Request, Response, NextFunction } from 'express';
import { bruteForceService } from '../services/bruteForceProtection.service.js';
import { config } from '../config/env.js';

/**
 * Brute Force Protection Middleware
 *
 * Validates login attempts before credential processing to prevent
 * brute force password attacks. Enforces progressive delays and
 * temporary lockouts based on failed attempt history.
 *
 * Applied to /api/1/auth/login endpoint BEFORE login handler.
 *
 * Behavior:
 * - Extracts username from req.body and IP from req.ip
 * - Checks attempt count via bruteForceService
 * - If blocked: Returns HTTP 429 with retry_after header
 * - If allowed: Calls next() to proceed to login handler
 * - On Redis error: Returns HTTP 503 (fail secure)
 *
 * SPEC References:
 * - SPEC-AU-LI-025:026: Rate limiting on failed login attempts
 * - SPEC-AU-SG-004:006: Login rate limiting and IP blocking
 */
const bruteForceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract username from request body
    const username = req.body.username;

    // If no username provided, skip check (will fail at validation stage)
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.warn('⚠️ Brute force check skipped - missing username', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });
      next();
      return;
    }

    // Extract IP address (fallback to 0.0.0.0 if missing)
    const ip = req.ip || '0.0.0.0';

    if (ip === '0.0.0.0') {
      console.warn('⚠️ Request without IP address detected', {
        timestamp: new Date().toISOString(),
        username,
      });
    }

    // Check if attempt is allowed
    const result = await bruteForceService.checkAttempt(username, ip);

    if (!result.allowed) {
      // Blocked due to too many attempts
      console.warn('⚠️ Brute force attempt blocked', {
        timestamp: new Date().toISOString(),
        username,
        ip,
        attempts: result.attempts,
        retryAfter: result.retryAfter,
      });

      // Return 429 Too Many Requests with retry information
      res.status(429).json({
        code: 'too_many_attempts',
        message: result.message || 'Too many failed login attempts. Please try again later.',
        retry_after: result.retryAfter,
        details: {
          attempts: result.attempts,
          max_attempts: config.bruteForceMaxAttempts,
        },
      });
      return;
    }

    // Attempt allowed - proceed to login handler
    next();
  } catch (error) {
    // Unexpected error in middleware (not caught by service)
    console.error('❌ Brute force middleware error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fail secure - deny access
    res.status(503).json({
      code: 'service_unavailable',
      message: 'Authentication service temporarily unavailable',
    });
  }
};

export default bruteForceMiddleware;
