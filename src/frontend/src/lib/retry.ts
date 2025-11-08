/**
 * Retry Strategy with Exponential Backoff
 *
 * SPEC-ERR-RETRY-001 a SPEC-ERR-RETRY-007: Retry automático e manual
 * SPEC-ERR-JOB-RETRY-001 a SPEC-ERR-JOB-RETRY-007: Jobs retry configuration
 */

import { isRetryableError } from './errors';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
  signal?: AbortSignal;
}

/**
 * SPEC-ERR-RETRY-003: Backoff exponencial: 1s, 2s, 4s...
 */
export const calculateBackoffDelay = (
  attempt: number,
  initialDelay: number = 1000,
  maxDelay: number = 30000,
  multiplier: number = 2
): number => {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  return Math.min(delay + jitter, maxDelay);
};

/**
 * SPEC-ERR-RETRY-004 & SPEC-ERR-RETRY-005: Decision logic for retry
 */
export const shouldRetryDefault = (error: any): boolean => {
  // Check custom isRetryableError logic
  if (isRetryableError(error)) {
    return true;
  }

  // HTTP status codes
  if (error?.response?.status) {
    const status = error.response.status;

    // SPEC-ERR-RETRY-004: Retry for 5xx errors
    if (status >= 500 && status < 600) {
      return true;
    }

    // SPEC-ERR-RETRY-004: Retry for 429 (Too Many Requests)
    if (status === 429) {
      return true;
    }

    // SPEC-ERR-RETRY-005: Don't retry for 4xx (except 429)
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  // Network errors
  if (
    error?.code === 'NETWORK_ERROR' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT' ||
    error?.code === 'ECONNABORTED'
  ) {
    return true;
  }

  // Default: don't retry
  return false;
};

/**
 * SPEC-ERR-RETRY-001 to SPEC-ERR-RETRY-007: Retry with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise with the result or throws the final error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = shouldRetryDefault,
    onRetry,
    signal
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if aborted before attempting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      // Try to execute the function
      const result = await fn();

      // Success - return result
      if (attempt > 1) {
        console.debug('[Retry] Operation succeeded after retry', {
          attempt,
          totalAttempts: maxAttempts
        });
      }

      return result;
    } catch (error) {
      // Check if this was the last attempt
      if (attempt === maxAttempts) {
        console.error('[Retry] Operation failed after all retry attempts', error, {
          totalAttempts: maxAttempts
        });
        throw error;
      }

      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        console.debug('[Retry] Error is not retryable', {
          attempt,
          errorCode: (error as any)?.code,
          statusCode: (error as any)?.response?.status
        });
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateBackoffDelay(attempt, initialDelay, maxDelay, backoffMultiplier);

      console.warn(`[Retry] Operation failed, retrying in ${delay}ms`, {
        attempt,
        maxAttempts,
        delay,
        errorMessage: (error as Error)?.message
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delay);
      }

      // Wait before retrying
      await sleep(delay, signal);
    }
  }

  // This should never be reached, but TypeScript doesn't know that
  throw new Error('Retry logic error');
}

/**
 * Sleep utility that can be cancelled with AbortSignal
 */
export const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    // Listen for abort signal
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
};

/**
 * Create a retry wrapper for a function with preset options
 */
export const createRetryable = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultOptions: RetryOptions = {}
) => {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retryWithBackoff(() => fn(...args), defaultOptions);
  };
};

/**
 * Retry configuration for TanStack Query
 * SPEC-ERR-CH-JQEL-001 to SPEC-ERR-CH-JQEL-005
 */
export const getTanstackRetryConfig = (failureCount: number, error: any) => {
  // Don't retry if error is not retryable
  if (!shouldRetryDefault(error)) {
    return false;
  }

  // SPEC-ERR-RETRY-002: Maximum of 3 attempts
  if (failureCount >= 3) {
    return false;
  }

  // Calculate delay
  const delay = calculateBackoffDelay(failureCount + 1);
  return delay;
};

/**
 * Job retry configuration (for future BullMQ integration)
 * SPEC-ERR-JOB-RETRY-001 to SPEC-ERR-JOB-RETRY-007
 */
export interface JobRetryOptions {
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export const getJobRetryConfig = (jobType: string): JobRetryOptions => {
  // Default configuration
  const defaultConfig: JobRetryOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // SPEC-ERR-JOB-RETRY-002: Start with 2s
    },
    removeOnComplete: true,
    removeOnFail: false // Keep failed jobs for analysis
  };

  // Job-specific configurations
  const jobConfigs: Record<string, JobRetryOptions> = {
    email: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      removeOnFail: false
    },
    webhook: {
      attempts: 10, // SPEC-ERR-JOB-RETRY-003: Configurable max attempts
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    },
    dataImport: {
      attempts: 1, // No retry for data imports (could cause duplicates)
      backoff: {
        type: 'fixed',
        delay: 0
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  };

  return jobConfigs[jobType] || defaultConfig;
};

/**
 * Manual retry helper for UI
 * SPEC-ERR-RETRY-006 & SPEC-ERR-RETRY-007
 */
export interface ManualRetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

export const createManualRetry = <T>(
  fn: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) => {
  let state: ManualRetryState = {
    isRetrying: false,
    retryCount: 0,
    lastError: null
  };

  const retry = async () => {
    if (state.isRetrying) return;

    state.isRetrying = true;
    state.retryCount++;

    try {
      const result = await fn();
      state.lastError = null;
      onSuccess?.(result);
      return result;
    } catch (error) {
      state.lastError = error as Error;
      onError?.(error as Error);
      throw error;
    } finally {
      state.isRetrying = false;
    }
  };

  const reset = () => {
    state = {
      isRetrying: false,
      retryCount: 0,
      lastError: null
    };
  };

  return {
    retry,
    reset,
    getState: () => ({ ...state })
  };
};

/**
 * Example usage:
 *
 * // Basic retry with defaults
 * const data = await retryWithBackoff(() => fetch('/api/data'));
 *
 * // Custom retry configuration
 * const result = await retryWithBackoff(
 *   () => apiCall(),
 *   {
 *     maxAttempts: 5,
 *     initialDelay: 500,
 *     onRetry: (error, attempt) => {
 *       console.log(`Attempt ${attempt} failed:`, error);
 *     }
 *   }
 * );
 *
 * // Create retryable function
 * const retryableFetch = createRetryable(fetch, { maxAttempts: 3 });
 * const response = await retryableFetch('/api/users');
 *
 * // Manual retry for UI
 * const { retry, reset, getState } = createManualRetry(
 *   () => saveData(),
 *   (result) => toast.success('Saved!'),
 *   (error) => toast.error('Failed to save')
 * );
 *
 * // In component
 * <Button onClick={retry} disabled={getState().isRetrying}>
 *   Retry ({getState().retryCount})
 * </Button>
 */