import { redisService } from './redis.service.js';
import { config } from '../config/env.js';
import type {
  BruteForceAttemptData,
  BruteForceCheckResult,
  BruteForceConfig,
} from '../types/bruteForce.types.js';

/**
 * BruteForceProtectionService
 *
 * Tracks failed login attempts per username+IP combination to prevent
 * brute force password attacks. Implements progressive delays and
 * temporary account lockouts.
 *
 * Features:
 * - Composite tracking (username + IP) to avoid shared network lockouts
 * - Progressive attempt counting with TTL-based expiration
 * - Temporary lockouts after threshold exceeded
 * - Automatic cleanup via Redis TTL
 * - Fail-secure on Redis errors (deny access)
 *
 * SPEC References:
 * - SPEC-AU-LI-025:026: Rate limiting on failed login attempts
 * - SPEC-AU-SG-004:006: Login rate limiting and IP blocking
 */
export class BruteForceProtectionService {
  private config: BruteForceConfig;

  constructor() {
    this.config = {
      maxAttempts: config.bruteForceMaxAttempts,
      lockoutDuration: config.bruteForceLockoutDuration,
      windowDuration: config.bruteForceWindowDuration,
    };
  }

  /**
   * Generate Redis key for username+IP combination
   *
   * Format: brute_force:{username}:{ip}
   * Using composite key prevents legitimate users on shared IPs from being locked out.
   *
   * @param username - Username being attempted
   * @param ip - IP address of request
   * @returns Redis key
   */
  private getKey(username: string, ip: string): string {
    return `brute_force:${username}:${ip}`;
  }

  /**
   * Check if login attempt is allowed
   *
   * Validates current attempt count and lockout status.
   * Returns detailed result for middleware decision making.
   *
   * @param username - Username being attempted
   * @param ip - IP address of request
   * @returns Check result with allowed status and retry information
   */
  async checkAttempt(username: string, ip: string): Promise<BruteForceCheckResult> {
    try {
      const key = this.getKey(username, ip);
      const data = await redisService.get(key);

      // First attempt - no record exists
      if (!data) {
        return {
          allowed: true,
          attempts: 0,
        };
      }

      // Parse existing attempt data
      const attemptData: BruteForceAttemptData = JSON.parse(data);

      // Check if currently locked out
      if (attemptData.lockedUntil) {
        const lockedUntil = new Date(attemptData.lockedUntil);
        const now = new Date();

        if (now < lockedUntil) {
          // Still locked out
          const retryAfter = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);

          return {
            allowed: false,
            attempts: attemptData.attempts,
            retryAfter,
            message: 'Too many failed login attempts. Please try again later.',
          };
        }

        // Lockout expired - allow attempt (will be cleared after successful login)
        return {
          allowed: true,
          attempts: 0,
        };
      }

      // Check if threshold exceeded (should trigger lockout)
      if (attemptData.attempts >= this.config.maxAttempts) {
        // Threshold just exceeded - calculate lockout expiration
        const lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 1000);
        const retryAfter = this.config.lockoutDuration;

        // Update Redis with lockout timestamp
        const updatedData: BruteForceAttemptData = {
          ...attemptData,
          lockedUntil: lockedUntil.toISOString(),
        };

        await redisService.set(
          key,
          JSON.stringify(updatedData),
          this.config.lockoutDuration
        );

        return {
          allowed: false,
          attempts: attemptData.attempts,
          retryAfter,
          message: 'Too many failed login attempts. Please try again later.',
        };
      }

      // Under threshold - allow attempt
      return {
        allowed: true,
        attempts: attemptData.attempts,
      };
    } catch (error) {
      // Fail secure - deny access on Redis errors
      console.error('❌ Brute force check failed (Redis error):', {
        timestamp: new Date().toISOString(),
        username,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        allowed: false,
        attempts: 0,
        message: 'Authentication service temporarily unavailable',
      };
    }
  }

  /**
   * Record failed login attempt
   *
   * Increments failure counter and updates timestamps.
   * Sets TTL based on whether threshold is exceeded (lockout vs window duration).
   *
   * @param username - Username that failed
   * @param ip - IP address of request
   */
  async recordFailure(username: string, ip: string): Promise<void> {
    try {
      const key = this.getKey(username, ip);
      const data = await redisService.get(key);
      const now = new Date().toISOString();

      let attemptData: BruteForceAttemptData;
      let ttl: number;

      if (!data) {
        // First failure - initialize
        attemptData = {
          attempts: 1,
          firstAttempt: now,
          lastAttempt: now,
        };
        ttl = this.config.windowDuration;
      } else {
        // Subsequent failure - increment
        const existing: BruteForceAttemptData = JSON.parse(data);
        attemptData = {
          ...existing,
          attempts: existing.attempts + 1,
          lastAttempt: now,
        };

        // Check if threshold exceeded - switch to lockout duration
        if (attemptData.attempts >= this.config.maxAttempts) {
          const lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 1000);
          attemptData.lockedUntil = lockedUntil.toISOString();
          ttl = this.config.lockoutDuration;

          console.warn('⚠️ Brute force threshold exceeded - account locked', {
            timestamp: now,
            username,
            ip,
            attempts: attemptData.attempts,
            lockedUntil: attemptData.lockedUntil,
          });
        } else {
          ttl = this.config.windowDuration;
        }
      }

      // Store updated attempt data with appropriate TTL
      await redisService.set(key, JSON.stringify(attemptData), ttl);
    } catch (error) {
      // Log error but don't throw - allow login attempt to proceed with validation
      console.error('❌ Failed to record brute force attempt:', {
        timestamp: new Date().toISOString(),
        username,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Clear attempt history for successful login
   *
   * Removes Redis key to reset counter.
   * Called after successful authentication to allow future login attempts.
   *
   * @param username - Username that successfully logged in
   * @param ip - IP address of request
   */
  async clearAttempts(username: string, ip: string): Promise<void> {
    try {
      const key = this.getKey(username, ip);
      await redisService.delete(key);

      console.log('✅ Brute force attempts cleared after successful login', {
        timestamp: new Date().toISOString(),
        username,
        ip,
      });
    } catch (error) {
      // Log error but don't throw - successful login should not fail
      console.error('❌ Failed to clear brute force attempts:', {
        timestamp: new Date().toISOString(),
        username,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get current attempt information
   *
   * Retrieves attempt data for monitoring/debugging purposes.
   * Used by administrators to check lockout status.
   *
   * @param username - Username to check
   * @param ip - IP address to check
   * @returns Attempt data or null if no attempts recorded
   */
  async getAttemptInfo(username: string, ip: string): Promise<BruteForceAttemptData | null> {
    try {
      const key = this.getKey(username, ip);
      const data = await redisService.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to get attempt info:', {
        timestamp: new Date().toISOString(),
        username,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}

// Export singleton instance
export const bruteForceService = new BruteForceProtectionService();
