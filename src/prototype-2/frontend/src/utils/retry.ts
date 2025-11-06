/**
 * Retry utilities with exponential backoff
 * Based on SPEC-error-handling.md SPEC-EH-RE-001:007
 */

import type { RetryConfig, RetryResult, RetryableError } from '../types/retry';
import { isJQELError } from '../services/jqel/errors';

const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'signal' | 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  strategy: 'exponential',
  jitter: true,
};

/**
 * Classify error type for retry decision
 */
export function classifyError(error: unknown): string {
  if (isJQELError(error)) {
    if (error.code === 429) return 'rate_limit';
    if (error.code === 401 || error.code === 403) return 'auth';
    if (error.code >= 400 && error.code < 500) return 'client';
    if (error.code >= 500) return 'server';
  }

  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
    return 'network';
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return 'network';
  }

  return 'unknown';
}

/**
 * Determine if error should be retried
 */
export function shouldRetryError(error: unknown, attemptNumber: number): boolean {
  const errorType = classifyError(error);

  // Never retry these
  if (errorType === 'client' || errorType === 'auth' || errorType === 'validation') {
    return false;
  }

  // Always retry these (up to max)
  if (errorType === 'network' || errorType === 'server') {
    return true;
  }

  // Rate limit: retry with caution
  if (errorType === 'rate_limit') {
    return attemptNumber < 2;
  }

  // Unknown: retry once
  return attemptNumber < 1;
}

/**
 * Calculate backoff delay with jitter
 */
export function calculateBackoff(
  attemptNumber: number,
  config: typeof DEFAULT_CONFIG
): number {
  let delay: number;

  switch (config.strategy) {
    case 'exponential':
      delay = config.baseDelayMs * Math.pow(2, attemptNumber);
      break;
    case 'linear':
      delay = config.baseDelayMs * (attemptNumber + 1);
      break;
    case 'constant':
      delay = config.baseDelayMs;
      break;
    default:
      delay = config.baseDelayMs;
  }

  delay = Math.min(delay, config.maxDelayMs);

  if (config.jitter) {
    const jitterAmount = delay * 0.1;
    const jitter = (Math.random() * 2 - 1) * jitterAmount;
    delay = Math.max(0, delay + jitter);
  }

  return Math.floor(delay);
}

/**
 * Create a retryable error
 */
export function createRetryableError(
  originalError: Error,
  attempts: number
): RetryableError {
  const error = new Error(
    `Operation failed after ${attempts} attempts: ${originalError.message}`
  ) as RetryableError;

  error.name = 'RetryableError';
  error.originalError = originalError;
  error.attempts = attempts;
  error.isRetryable = shouldRetryError(originalError, 0);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createRetryableError);
  }

  return error;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  userConfig: RetryConfig = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const startTime = Date.now();
  let lastError: Error | null = null;
  let attemptNumber = 0;

  while (attemptNumber <= config.maxAttempts) {
    if (config.signal?.aborted) {
      throw new Error('Retry operation aborted');
    }

    try {
      const value = await operation();
      return {
        value,
        attempts: attemptNumber + 1,
        totalTimeMs: Date.now() - startTime,
        wasRetried: attemptNumber > 0
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const customShouldRetry = userConfig.shouldRetry?.(lastError, attemptNumber);
      const defaultShouldRetry = shouldRetryError(lastError, attemptNumber);
      const shouldRetry = customShouldRetry ?? defaultShouldRetry;

      if (attemptNumber >= config.maxAttempts || !shouldRetry) {
        throw createRetryableError(lastError, attemptNumber + 1);
      }

      const delay = calculateBackoff(attemptNumber, config);

      if (import.meta.env.DEV) {
        console.log(
          `[Retry] Attempt ${attemptNumber + 1}/${config.maxAttempts} failed. ` +
          `Retrying in ${delay}ms. Error: ${lastError.message}`
        );
      }

      userConfig.onRetry?.(attemptNumber, delay);

      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);
        if (config.signal) {
          config.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Retry operation aborted'));
          }, { once: true });
        }
      });

      attemptNumber++;
    }
  }

  throw createRetryableError(lastError || new Error('Unknown error'), attemptNumber);
}

/**
 * Simpler retry API
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  const result = await retryWithBackoff(operation, { maxAttempts });
  return result.value;
}

// Export types for backward compatibility
export { RetryableErrorType } from '../types/retry';
