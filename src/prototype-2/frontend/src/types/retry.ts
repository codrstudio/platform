/**
 * Retry configuration and types
 * Based on SPEC-error-handling.md SPEC-EH-RE-001:007
 */

export type BackoffStrategy = 'exponential' | 'linear' | 'constant';

export interface RetryConfig {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  strategy?: BackoffStrategy;
  jitter?: boolean;
  shouldRetry?: (error: Error, attemptNumber: number) => boolean;
  onRetry?: (attemptNumber: number, delay: number) => void;
  signal?: AbortSignal;
}

export interface RetryResult<T> {
  value: T;
  attempts: number;
  totalTimeMs: number;
  wasRetried: boolean;
}

export interface RetryableError extends Error {
  originalError: Error;
  attempts: number;
  isRetryable: boolean;
}

export enum RetryableErrorType {
  NETWORK_ERROR = 'network',
  SERVER_ERROR = 'server',
  RATE_LIMIT = 'rate_limit',
  CLIENT_ERROR = 'client',
  AUTH_ERROR = 'auth',
  VALIDATION_ERROR = 'validation',
  UNKNOWN = 'unknown'
}
