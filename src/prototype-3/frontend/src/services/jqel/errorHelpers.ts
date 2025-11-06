/**
 * JQEL Error Helpers
 *
 * Utilities for working with JQEL errors, including retry logic
 * and error classification.
 *
 * Implements:
 * - SPEC-data-access.md (SPEC-DA-ERR-*)
 * - SPEC-error-handling.md (SPEC-ERR-CH-JQEL-*, SPEC-ERR-RETRY-*)
 */

import { JQELError, isJQELError } from '@/types/jqel';
import { logError, logWarn } from '@/services/logging/errorLogger';

/**
 * Retry configuration for JQEL queries
 * SPEC-DA-ERR-004 and SPEC-DA-ERR-005: Retry logic
 */
export interface JQELRetryConfig {
  /**
   * Maximum number of retry attempts
   * Default: 3
   */
  maxAttempts?: number;
  /**
   * Base delay in milliseconds
   * Default: 1000ms (1 second)
   */
  baseDelay?: number;
  /**
   * Maximum delay in milliseconds
   * Default: 30000ms (30 seconds)
   */
  maxDelay?: number;
  /**
   * Custom function to determine if should retry
   */
  shouldRetry?: (error: JQELError, attemptCount: number) => boolean;
  /**
   * Callback before each retry
   */
  onRetry?: (error: JQELError, attemptCount: number, delay: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<JQELRetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  shouldRetry: shouldRetryJQELError,
  onRetry: () => {},
};

/**
 * Determine if a JQEL error should be retried
 * SPEC-ERR-RETRY-004 and SPEC-ERR-RETRY-005: Only retry temporary errors
 */
export function shouldRetryJQELError(error: JQELError, attemptCount: number = 0): boolean {
  // Don't retry if max attempts reached
  if (attemptCount >= 3) {
    return false;
  }

  // SPEC-ERR-RETRY-005: Don't retry 4xx errors (except 429)
  if (error.code >= 400 && error.code < 500) {
    // Only retry rate limiting (429)
    return error.code === 429;
  }

  // SPEC-ERR-RETRY-004: Retry 5xx server errors
  if (error.code >= 500) {
    return true;
  }

  // Don't retry other errors
  return false;
}

/**
 * Calculate retry delay with exponential backoff
 * SPEC-ERR-RETRY-003: Backoff exponential: 1s, 2s, 4s
 */
export function calculateRetryDelay(attemptCount: number, config?: JQELRetryConfig): number {
  const baseDelay = config?.baseDelay || DEFAULT_RETRY_CONFIG.baseDelay;
  const maxDelay = config?.maxDelay || DEFAULT_RETRY_CONFIG.maxDelay;

  // Exponential backoff: baseDelay * 2^attemptCount
  const delay = baseDelay * Math.pow(2, attemptCount);

  // Cap at maxDelay
  return Math.min(delay, maxDelay);
}

/**
 * Execute a JQEL query with automatic retry
 * SPEC-DA-ERR-004: Queries CAN have retry automatic
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  config?: JQELRetryConfig
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let attemptCount = 0;
  let lastError: Error | JQELError | null = null;

  while (attemptCount <= finalConfig.maxAttempts) {
    try {
      // Execute the query
      return await queryFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const isJQEL = isJQELError(lastError);
      const shouldRetry = isJQEL
        ? finalConfig.shouldRetry(lastError as JQELError, attemptCount)
        : false;

      if (!shouldRetry || attemptCount >= finalConfig.maxAttempts) {
        // Don't retry or max attempts reached
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateRetryDelay(attemptCount, finalConfig);

      logWarn(
        `JQEL query failed, retrying in ${delay}ms (attempt ${attemptCount + 1}/${finalConfig.maxAttempts})`,
        'jqel-retry',
        {
          error: isJQEL ? (lastError as JQELError).code : 'unknown',
          attemptCount,
          delay,
        }
      );

      // Call onRetry callback
      if (isJQEL) {
        finalConfig.onRetry(lastError as JQELError, attemptCount, delay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      attemptCount++;
    }
  }

  // Should never reach here, but throw last error just in case
  throw lastError || new Error('Query failed after retries');
}

/**
 * Check if error is a permission error (403)
 * SPEC-ERR-JQEL-005: Permission denied
 */
export function isPermissionError(error: unknown): boolean {
  return isJQELError(error) && error.code === 403;
}

/**
 * Check if error is a not found error (404)
 * SPEC-ERR-JQEL-001, SPEC-ERR-JQEL-002: Schema/entity not found
 */
export function isNotFoundError(error: unknown): boolean {
  return isJQELError(error) && error.code === 404;
}

/**
 * Check if error is a validation error (422)
 * SPEC-ERR-JQEL-004: Validation failed
 */
export function isValidationError(error: unknown): boolean {
  return isJQELError(error) && error.code === 422;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  return isJQELError(error) && error.code >= 500 && error.code < 600;
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  return isJQELError(error) && error.code === 429;
}

/**
 * Check if error is a timeout
 * SPEC-ERR-JQEL-006: Query timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (!isJQELError(error)) return false;

  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('took too long')
  );
}

/**
 * Get user-friendly message for JQEL error
 * Provides context-aware error messages
 */
export function getJQELErrorMessage(error: JQELError): string {
  // Use error message if it's user-friendly
  if (error.message && !error.message.includes('JQEL query failed')) {
    return error.message;
  }

  // Provide default messages based on status code
  switch (error.code) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return error.field
        ? `Invalid value for field: ${error.field}`
        : 'Invalid data provided.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      if (error.code >= 500) {
        return 'A server error occurred. Please try again later.';
      }
      return 'An error occurred while processing your request.';
  }
}

/**
 * Extract validation errors from JQEL error
 * Useful for form validation
 */
export function getValidationErrors(error: JQELError): Record<string, string> | null {
  if (!isValidationError(error)) {
    return null;
  }

  // If error has field, return single field error
  if (error.field) {
    return {
      [error.field]: error.message || 'Invalid value',
    };
  }

  // Check warnings for multiple field errors
  if (error.jresult.warnings && error.jresult.warnings.length > 0) {
    const errors: Record<string, string> = {};
    error.jresult.warnings.forEach((warning) => {
      if (warning.field) {
        errors[warning.field] = warning.message || 'Invalid value';
      }
    });
    return Object.keys(errors).length > 0 ? errors : null;
  }

  return null;
}

/**
 * Log JQEL error with context
 */
export function logJQELError(
  error: JQELError,
  operation: 'query' | 'mutation',
  schema?: string,
  entity?: string
): void {
  logError(error, {
    category: 'jqel',
    context: {
      operation,
      schema,
      entity,
      code: error.code,
      field: error.field,
    },
  });
}

/**
 * Create retry configuration for TanStack Query
 * SPEC-DA-ERR-005: Retry configuration
 */
export function createTanStackRetryConfig(config?: JQELRetryConfig) {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  return {
    retry: (failureCount: number, error: unknown) => {
      if (!isJQELError(error)) {
        return false;
      }
      return finalConfig.shouldRetry(error, failureCount);
    },
    retryDelay: (attemptIndex: number) => {
      return calculateRetryDelay(attemptIndex, finalConfig);
    },
  };
}
