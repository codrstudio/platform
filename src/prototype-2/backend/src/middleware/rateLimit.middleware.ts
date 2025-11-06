import { Request, Response, NextFunction, RequestHandler } from 'express';
import { rateLimiterService } from '../services/rateLimiter.service.js';

/**
 * Extract IP address from request
 *
 * Handles various scenarios:
 * - Behind proxy: X-Forwarded-For header
 * - Direct connection: req.ip or socket.remoteAddress
 * - Development: localhost (::1, 127.0.0.1)
 *
 * Priority order:
 * 1. X-Forwarded-For (first IP if multiple)
 * 2. req.ip (Express built-in)
 * 3. socket.remoteAddress
 * 4. 'unknown' fallback
 *
 * @param req - Express request object
 * @returns Client IP address
 */
function getClientIp(req: Request): string {
  // Priority 1: X-Forwarded-For header (behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  // Priority 2: req.ip (Express built-in)
  if (req.ip) {
    return req.ip;
  }

  // Priority 3: Socket remote address
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  // Fallback
  return 'unknown';
}

/**
 * Create authentication rate limiter middleware
 *
 * Implements SPEC-AU-SG-004 to SPEC-AU-SG-006:
 * - Limit authentication requests per IP address
 * - Block temporarily after exceeding limit
 * - Return 429 Too Many Requests with proper headers
 *
 * Features:
 * - Sliding window rate limiting via Redis
 * - Standard rate limit headers (X-RateLimit-*)
 * - Retry-After header for 429 responses
 * - Structured error responses
 * - Graceful degradation on Redis errors
 *
 * Headers Set (per RateLimit draft-7 standard):
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in window
 * - X-RateLimit-Reset: Unix timestamp when window resets
 * - Retry-After: Seconds until retry allowed (429 only)
 *
 * SPEC References:
 * - SPEC-AU-SG-004: Login must have rate limiting
 * - SPEC-AU-SG-005: Rate limiting implemented in Backend
 * - SPEC-AU-SG-006: IP blocked temporarily after failures
 *
 * @returns Express middleware function
 */
export function createAuthRateLimiter(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = getClientIp(req);

      // Skip rate limiting if IP couldn't be determined (very rare edge case)
      if (ip === 'unknown') {
        console.warn('⚠️ Could not determine client IP for rate limiting');
        next();
        return;
      }

      // Check rate limit
      const result = await rateLimiterService.checkLimit(ip);

      // Set rate limit headers (draft-7 standard)
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

      if (!result.allowed) {
        // Calculate retry-after in seconds
        const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);

        res.setHeader('Retry-After', retryAfterSeconds.toString());

        // Log rate limit violation
        console.warn('⚠️ Rate limit exceeded:', {
          ip,
          timestamp: new Date().toISOString(),
          path: req.path,
          limit: result.limit,
          resetAt: new Date(result.resetAt).toISOString(),
        });

        // Return 429 with structured error
        res.status(429).json({
          code: 'rate_limit_exceeded',
          message: 'Too many authentication requests. Please try again later.',
          retryAfter: retryAfterSeconds,
        });
        return;
      }

      // Within limit - continue to next middleware
      next();
    } catch (error) {
      console.error('❌ Error in rate limit middleware:', error);
      // Fail open - don't block requests on errors
      // Better to allow potential attack than block legitimate users
      next();
    }
  };
}

/**
 * Pre-configured rate limiter for authentication routes
 *
 * Uses environment-based configuration:
 * - Development: 100 requests/min (lenient for testing)
 * - Production: 10 requests/min (strict for security)
 *
 * Apply to all /api/1/auth/* endpoints via app.use()
 */
export const authRateLimiter = createAuthRateLimiter();
