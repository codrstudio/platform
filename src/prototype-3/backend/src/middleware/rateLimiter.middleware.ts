import type { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service.js';
import { env } from '../config/env.js';

/**
 * Rate Limiter Middleware
 *
 * SPEC-AU-SG-004: Login MUST have rate limiting (e.g., 5 attempts/minute)
 * SPEC-AU-SG-005: Rate limiting MUST be implemented in Backend or Backbone
 *
 * Configurable rate limiting middleware using Redis for distributed storage.
 * Can be applied to any route to limit requests per IP.
 */

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Key prefix for Redis keys (e.g., "rate:login", "rate:api")
   */
  keyPrefix: string;

  /**
   * Custom key generator function (defaults to IP-based)
   */
  keyGenerator?: (req: Request) => string;

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (req: Request) => boolean;

  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Create a rate limiter middleware
 *
 * @param options - Rate limiting configuration
 * @returns Express middleware function
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    limit,
    windowSeconds,
    keyPrefix,
    keyGenerator = defaultKeyGenerator,
    skip,
    message = 'Too many requests, please try again later',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip if configured
      if (skip && skip(req)) {
        return next();
      }

      // Generate rate limit key
      const identifier = keyGenerator(req);
      const key = `${keyPrefix}:${identifier}`;

      // Check rate limit in Redis
      const result = await redisService.rateLimit(key, limit, windowSeconds);

      // Set rate limit headers (standard headers)
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

      // Block if limit exceeded
      if (result.blocked) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());

        return res.status(429).json({
          code: 'rate_limit_exceeded',
          message,
          details: {
            limit,
            windowSeconds,
            retryAfter,
            resetTime: result.resetTime,
          },
        }) as any;
      }

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('[RateLimiter] Error:', error);

      // If Redis is down, allow request but log error
      // This prevents rate limiting from breaking the entire application
      console.warn('[RateLimiter] Bypassing rate limit due to Redis error');
      next();
    }
  };
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
 * Predefined rate limiter: General API rate limiting
 *
 * SPEC-AU-SG-004: Example configuration
 */
export const apiRateLimiter = createRateLimiter({
  limit: env.RATE_LIMIT_API_MAX_REQUESTS,
  windowSeconds: env.RATE_LIMIT_API_WINDOW_SECONDS,
  keyPrefix: 'rate:api',
  message: 'Too many API requests, please slow down',
});

/**
 * Predefined rate limiter: Authentication endpoints
 *
 * SPEC-AU-SG-004: Login MUST have rate limiting (e.g., 5 attempts/minute)
 */
export const authRateLimiter = createRateLimiter({
  limit: env.RATE_LIMIT_AUTH_MAX_REQUESTS,
  windowSeconds: env.RATE_LIMIT_AUTH_WINDOW_SECONDS,
  keyPrefix: 'rate:auth',
  message: 'Too many authentication requests, please try again later',
});

/**
 * Predefined rate limiter: Strict rate limiting for sensitive operations
 */
export const strictRateLimiter = createRateLimiter({
  limit: 3,
  windowSeconds: 60,
  keyPrefix: 'rate:strict',
  message: 'Too many requests for this operation, please wait before trying again',
});
