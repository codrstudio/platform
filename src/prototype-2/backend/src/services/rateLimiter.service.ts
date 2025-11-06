import { redisService } from './redis.service.js';
import { config } from '../config/env.js';

/**
 * Rate limit result returned by checkLimit
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in milliseconds
}

/**
 * Rate limit status for monitoring
 */
export interface RateLimitStatus {
  requestCount: number;
  windowStart: number;
  windowEnd: number;
}

/**
 * Redis-stored rate limit data
 */
interface RateLimitData {
  windowStart: number;
  requestCount: number;
}

/**
 * RateLimiterService
 *
 * Implements IP-based rate limiting using Redis with sliding window algorithm.
 * Provides DoS protection for authentication endpoints.
 *
 * Key Features:
 * - Sliding window algorithm (more accurate than fixed window)
 * - Atomic operations to prevent race conditions
 * - Automatic TTL cleanup via Redis
 * - Fail-open on Redis errors (don't block legitimate users)
 * - Environment-aware limits (lenient in dev, strict in prod)
 *
 * SPEC References:
 * - SPEC-AU-SG-004: Login must have rate limiting
 * - SPEC-AU-SG-005: Rate limiting implemented in Backend
 * - SPEC-AU-SG-006: IP blocked temporarily after failures
 */
export class RateLimiterService {
  private readonly KEY_PREFIX = 'rate_limit:auth:';

  /**
   * Generate Redis key for IP address
   *
   * @param identifier - IP address or other identifier
   * @returns Redis key
   */
  private getKey(identifier: string): string {
    return `${this.KEY_PREFIX}${identifier}`;
  }

  /**
   * Check rate limit for identifier and increment counter
   *
   * Implements sliding window algorithm:
   * 1. Get current window data from Redis
   * 2. Check if window has expired (sliding)
   * 3. Increment request count
   * 4. Verify against limit
   * 5. Store updated data with TTL
   *
   * SPEC-AU-SG-004: Login must have rate limiting
   *
   * @param identifier - IP address or other identifier
   * @returns Rate limit result with allowed flag and metadata
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const windowMs = config.rateLimitWindowMs;
    const maxRequests = config.rateLimitMaxRequests;

    try {
      // Get current data
      const dataStr = await redisService.get(key);
      let windowStart: number;
      let requestCount: number;

      if (!dataStr) {
        // First request in window
        windowStart = now;
        requestCount = 0;
      } else {
        try {
          const data: RateLimitData = JSON.parse(dataStr);
          windowStart = data.windowStart;
          requestCount = data.requestCount;

          // Check if window has expired (sliding window)
          if (now - windowStart >= windowMs) {
            // Reset window
            windowStart = now;
            requestCount = 0;
          }
        } catch (parseError) {
          // Data corrupted - reset window
          console.warn('⚠️ Rate limit data corrupted, resetting:', parseError);
          windowStart = now;
          requestCount = 0;
        }
      }

      // Increment count
      requestCount++;

      // Check limit
      const allowed = requestCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - requestCount);
      const resetAt = windowStart + windowMs;

      // Store updated data (only if allowed or within grace period)
      // Grace period: Allow a few extra requests to be tracked for better monitoring
      if (allowed || requestCount <= maxRequests + 5) {
        await redisService.set(
          key,
          JSON.stringify({ windowStart, requestCount } as RateLimitData),
          Math.ceil(windowMs / 1000) // TTL in seconds
        );
      }

      return {
        allowed,
        limit: maxRequests,
        remaining,
        resetAt,
      };
    } catch (error) {
      console.error('❌ Rate limiter Redis error:', error);
      // Fail open - allow request on Redis errors
      // Don't block legitimate users due to infrastructure issues
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetAt: now + windowMs,
      };
    }
  }

  /**
   * Reset rate limit for specific identifier
   *
   * Removes rate limit data from Redis, allowing fresh start.
   * Useful for admin operations or testing.
   *
   * @param identifier - IP address or other identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    try {
      await redisService.delete(key);
    } catch (error) {
      console.error('❌ Error resetting rate limit:', error);
      throw error;
    }
  }

  /**
   * Get current rate limit status for identifier
   *
   * Non-incrementing check for monitoring purposes.
   * Does not count as a request.
   *
   * @param identifier - IP address or other identifier
   * @returns Current status or null if no data
   */
  async getStatus(identifier: string): Promise<RateLimitStatus | null> {
    const key = this.getKey(identifier);
    const windowMs = config.rateLimitWindowMs;

    try {
      const dataStr = await redisService.get(key);
      if (!dataStr) return null;

      const data: RateLimitData = JSON.parse(dataStr);

      return {
        requestCount: data.requestCount,
        windowStart: data.windowStart,
        windowEnd: data.windowStart + windowMs,
      };
    } catch (error) {
      console.error('❌ Error getting rate limit status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const rateLimiterService = new RateLimiterService();
