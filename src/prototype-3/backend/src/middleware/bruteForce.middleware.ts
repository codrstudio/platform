import type { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service.js';
import { env } from '../config/env.js';

/**
 * Brute Force Protection Middleware
 *
 * SPEC-AU-LI-025: Multiple failed login attempts CAN result in rate limiting
 * SPEC-AU-LI-026: Rate limiting MUST be implemented in Backbone
 * SPEC-AU-SG-006: IP blocked temporarily after multiple failures
 *
 * Specifically designed for /api/1/auth/login route to prevent brute force attacks.
 * Tracks failed login attempts per IP and implements progressive delays and blocking.
 */

export interface BruteForceOptions {
  /**
   * Maximum failed attempts before blocking
   */
  maxAttempts: number;

  /**
   * Time window for tracking attempts (in seconds)
   */
  windowSeconds: number;

  /**
   * Block duration when max attempts exceeded (in seconds)
   */
  blockDurationSeconds: number;

  /**
   * Custom key generator function (defaults to IP-based)
   */
  keyGenerator?: (req: Request) => string;

  /**
   * Skip brute force check for certain conditions
   */
  skip?: (req: Request) => boolean;
}

/**
 * Create a brute force protection middleware
 *
 * This middleware should be applied BEFORE the login handler.
 * It checks if the IP is currently blocked or has exceeded failed attempts.
 *
 * @param options - Brute force protection configuration
 * @returns Express middleware function
 */
export function createBruteForceProtection(options: BruteForceOptions) {
  const {
    maxAttempts,
    windowSeconds,
    blockDurationSeconds,
    keyGenerator = defaultKeyGenerator,
    skip,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip if configured
      if (skip && skip(req)) {
        return next();
      }

      // Get identifier (IP address)
      const identifier = keyGenerator(req);

      // Check failed login attempts
      const result = await redisService.trackFailedLogin(identifier);

      // If IP is currently blocked
      if (result.blockedUntil !== null) {
        const remainingSeconds = Math.ceil((result.blockedUntil - Date.now()) / 1000);

        console.warn(`[BruteForce] Blocked login attempt from ${identifier} (${remainingSeconds}s remaining)`);

        res.setHeader('Retry-After', remainingSeconds.toString());

        return res.status(429).json({
          code: 'too_many_attempts',
          message: 'Too many failed login attempts. Your IP has been temporarily blocked.',
          details: {
            blockedUntil: result.blockedUntil,
            retryAfter: remainingSeconds,
          },
        }) as any;
      }

      // If approaching max attempts, warn in response headers
      if (result.attempts >= maxAttempts - 2) {
        res.setHeader('X-Login-Attempts-Remaining', (maxAttempts - result.attempts).toString());
      }

      // Store identifier in request for use in response handler
      (req as any).bruteForceIdentifier = identifier;

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('[BruteForce] Error:', error);

      // If Redis is down, allow request but log error
      console.warn('[BruteForce] Bypassing brute force protection due to Redis error');
      next();
    }
  };
}

/**
 * Handler to track login result after authentication attempt
 *
 * This should be called in the login route handler after authentication.
 * It resets counters on success or increments and potentially blocks on failure.
 *
 * Usage in login route:
 * ```typescript
 * router.post('/login', bruteForceProtection, async (req, res) => {
 *   try {
 *     const result = await authenticate(req.body);
 *     await handleLoginSuccess(req); // Reset counters
 *     res.json(result);
 *   } catch (error) {
 *     await handleLoginFailure(req); // Track failure
 *     res.status(401).json({ error: 'Invalid credentials' });
 *   }
 * });
 * ```
 */

/**
 * Handle successful login: Reset failed attempts counter
 *
 * @param req - Express request (with bruteForceIdentifier set by middleware)
 */
export async function handleLoginSuccess(req: Request): Promise<void> {
  const identifier = (req as any).bruteForceIdentifier;

  if (!identifier) {
    return;
  }

  try {
    await redisService.resetFailedLogin(identifier);
    console.log(`[BruteForce] Reset failed attempts for ${identifier}`);
  } catch (error) {
    console.error('[BruteForce] Error resetting failed attempts:', error);
  }
}

/**
 * Handle failed login: Track failure and potentially block IP
 *
 * @param req - Express request (with bruteForceIdentifier set by middleware)
 * @param options - Same options used in createBruteForceProtection
 */
export async function handleLoginFailure(
  req: Request,
  options: { maxAttempts: number; blockDurationSeconds: number }
): Promise<void> {
  const identifier = (req as any).bruteForceIdentifier;

  if (!identifier) {
    return;
  }

  try {
    // Track failed attempt (already incremented by middleware)
    const result = await redisService.trackFailedLogin(identifier);

    console.warn(`[BruteForce] Failed login attempt from ${identifier} (attempt ${result.attempts}/${options.maxAttempts})`);

    // Block IP if max attempts exceeded
    if (result.attempts >= options.maxAttempts) {
      await redisService.blockIP(identifier, options.blockDurationSeconds);
      console.warn(`[BruteForce] Blocked ${identifier} for ${options.blockDurationSeconds} seconds`);
    }
  } catch (error) {
    console.error('[BruteForce] Error handling login failure:', error);
  }
}

/**
 * Default key generator: Use IP address
 *
 * @param req - Express request
 * @returns IP address or fallback identifier
 */
function defaultKeyGenerator(req: Request): string {
  // Try to get real IP from various headers (proxy support)
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    'unknown';

  return ip;
}

/**
 * Predefined brute force protection: Login endpoint
 *
 * SPEC-AU-LI-025, SPEC-AU-LI-026: Brute force protection for login
 * SPEC-AU-SG-006: IP blocking after multiple failures
 */
export const loginBruteForceProtection = createBruteForceProtection({
  maxAttempts: env.BRUTE_FORCE_MAX_ATTEMPTS,
  windowSeconds: env.BRUTE_FORCE_WINDOW_SECONDS,
  blockDurationSeconds: env.BRUTE_FORCE_BLOCK_DURATION_SECONDS,
});

/**
 * Predefined options for handleLoginFailure
 */
export const loginBruteForceOptions = {
  maxAttempts: env.BRUTE_FORCE_MAX_ATTEMPTS,
  blockDurationSeconds: env.BRUTE_FORCE_BLOCK_DURATION_SECONDS,
};
