/**
 * Brute Force Protection Types
 *
 * Defines interfaces for attempt tracking and validation results.
 */

/**
 * Attempt data stored in Redis
 */
export interface BruteForceAttemptData {
  attempts: number;           // Number of failed attempts
  firstAttempt: string;       // ISO timestamp of first attempt in window
  lastAttempt: string;        // ISO timestamp of most recent attempt
  lockedUntil?: string;       // ISO timestamp when lockout expires (optional)
}

/**
 * Result of checkAttempt validation
 */
export interface BruteForceCheckResult {
  allowed: boolean;           // Whether attempt is permitted
  attempts: number;           // Current attempt count
  retryAfter?: number;        // Seconds until retry allowed (if blocked)
  message?: string;           // Error message if blocked
}

/**
 * Configuration for brute force protection
 */
export interface BruteForceConfig {
  maxAttempts: number;        // Failures before lockout
  lockoutDuration: number;    // Lockout time in seconds
  windowDuration: number;     // Time window for counting attempts (seconds)
}
