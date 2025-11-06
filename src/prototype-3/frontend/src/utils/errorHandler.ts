/**
 * Error Handler Utilities
 *
 * Centralized error handling functions and utilities.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-UTIL-001, SPEC-ERR-UTIL-002)
 */

import { isJQELError } from '@/types/jqel';
import { logError, logWarn } from '@/services/logging/errorLogger';

/**
 * Error handler options
 */
export interface HandleErrorOptions {
  /**
   * Category for logging (e.g., 'auth', 'jqel', 'module')
   */
  category: string;
  /**
   * Additional context for logging
   */
  context?: Record<string, any>;
  /**
   * Show toast notification to user
   */
  showToast?: boolean;
  /**
   * Custom toast message (if not provided, uses error.message)
   */
  toastMessage?: string;
  /**
   * Log level (defaults to 'ERROR')
   */
  logLevel?: 'ERROR' | 'WARN' | 'INFO';
  /**
   * Callback after handling error
   */
  onHandled?: (error: Error) => void;
}

/**
 * Main error handler utility
 * SPEC-ERR-UTIL-001: Platform MUST export handleError utility
 */
export function handleError(error: Error | unknown, options: HandleErrorOptions): void {
  // Ensure we have an Error object
  const err = error instanceof Error ? error : new Error(String(error));

  // Log the error
  const logLevel = options.logLevel || 'ERROR';
  if (logLevel === 'ERROR') {
    logError(err, {
      category: options.category,
      context: options.context,
    });
  } else if (logLevel === 'WARN') {
    logWarn(err.message, options.category, options.context);
  }

  // Show toast notification if requested
  // TODO: Integrate with toast notification system when implemented
  if (options.showToast) {
    const message = options.toastMessage || err.message || 'An error occurred';
    console.log('[Toast]', message); // Placeholder until toast system is implemented
  }

  // Call custom handler if provided
  options.onHandled?.(err);
}

/**
 * Custom error classes
 * SPEC-ERR-UTIL-002: Platform MUST provide error classes
 */

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Network error
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Module error
 */
export class ModuleError extends Error {
  constructor(
    message: string,
    public moduleId?: string,
    public phase?: 'loading' | 'init' | 'activation'
  ) {
    super(message);
    this.name = 'ModuleError';
    Object.setPrototypeOf(this, ModuleError.prototype);
  }
}

/**
 * Type guards for custom error types
 */

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isModuleError(error: unknown): error is ModuleError {
  return error instanceof ModuleError;
}

/**
 * Get user-friendly error message
 * Extracts appropriate message based on error type
 */
export function getUserFriendlyMessage(error: Error | unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle JQELError
  if (isJQELError(error)) {
    return error.message || 'A data operation failed';
  }

  // Handle AuthError
  if (isAuthError(error)) {
    return error.message || 'Authentication failed';
  }

  // Handle ValidationError
  if (isValidationError(error)) {
    return error.message || 'Validation failed';
  }

  // Handle NetworkError
  if (isNetworkError(error)) {
    if (error.status === 0 || !navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }
    return error.message || 'A network error occurred';
  }

  // Handle ModuleError
  if (isModuleError(error)) {
    return error.message || 'Failed to load module';
  }

  // Handle generic Error
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }

  // Fallback for unknown errors
  return 'An unknown error occurred';
}

/**
 * Check if error should trigger retry
 * SPEC-ERR-RETRY-004 and SPEC-ERR-RETRY-005: Retry logic
 */
export function shouldRetry(error: Error | unknown, attemptCount: number = 0): boolean {
  const maxAttempts = 3;

  // Don't retry if max attempts reached
  if (attemptCount >= maxAttempts) {
    return false;
  }

  // Handle JQELError
  if (isJQELError(error)) {
    // Don't retry client errors (4xx) except 429
    if (error.code >= 400 && error.code < 500 && error.code !== 429) {
      return false;
    }
    // Retry server errors (5xx) and rate limiting (429)
    return error.code >= 500 || error.code === 429;
  }

  // Handle NetworkError
  if (isNetworkError(error)) {
    // Don't retry client errors
    if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    // Retry for network issues and server errors
    return true;
  }

  // Default: retry for unknown errors (could be transient)
  return true;
}

/**
 * Calculate retry delay with exponential backoff
 * SPEC-ERR-RETRY-003: Exponential backoff
 */
export function getRetryDelay(attemptCount: number): number {
  // Base delay: 1 second
  const baseDelay = 1000;
  // Exponential backoff: 1s, 2s, 4s, 8s...
  const delay = baseDelay * Math.pow(2, attemptCount);
  // Cap at 30 seconds
  return Math.min(delay, 30000);
}

/**
 * Extract error code from various error types
 */
export function getErrorCode(error: Error | unknown): number | undefined {
  if (isJQELError(error)) {
    return error.code;
  }
  if (isAuthError(error)) {
    return error.code;
  }
  if (isNetworkError(error)) {
    return error.status;
  }
  return undefined;
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: Error | unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('took too long')
    );
  }
  return false;
}

/**
 * Check if error is due to network issues
 */
export function isNetworkIssue(error: Error | unknown): boolean {
  if (isNetworkError(error)) {
    return error.status === 0 || !navigator.onLine;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      !navigator.onLine
    );
  }

  return !navigator.onLine;
}
