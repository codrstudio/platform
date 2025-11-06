/**
 * Error Toast Display - User-friendly error notifications
 * Based on SPEC-EH-DI-001:004
 */

import { toast } from '../../hooks/use-toast';
import { logError, logWarning } from './errorLogger';
import { isJQELError } from '../jqel/errors';

/**
 * Options for error toast display
 */
export interface ErrorToastOptions {
  /**
   * Error category for logging
   * @default 'error'
   */
  category?: string;

  /**
   * Custom user-facing title (overrides automatic title)
   */
  title?: string;

  /**
   * Custom user-facing message (overrides automatic message)
   */
  message?: string;

  /**
   * Retry callback for recoverable errors
   */
  onRetry?: () => void;

  /**
   * Toast duration in milliseconds (overrides automatic calculation)
   */
  duration?: number;

  /**
   * Additional context for logging
   */
  context?: Record<string, any>;

  /**
   * Whether to log the error (default: true)
   */
  logError?: boolean;
}

/**
 * Get user-friendly error message from error object
 * Based on SPEC-ERR-* error categories
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred.';
  }

  // Handle JQELError with built-in user messages
  if (isJQELError(error)) {
    return error.getUserMessage();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('network') || error.message.includes('fetch')) {
      return 'Connection error. Please check your internet connection.';
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }

    // Generic error message (sanitized)
    return error.message || 'An unexpected error occurred.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred.';
}

/**
 * Get appropriate toast title based on error type
 */
export function getErrorTitle(error: unknown): string {
  if (isJQELError(error)) {
    if (error.isValidationError()) return 'Validation Error';
    if (error.isAuthError()) return 'Authentication Error';
    if (error.isNotFound()) return 'Not Found';
    if (error.isServerError()) return 'Server Error';
    return 'Error';
  }

  if (error instanceof Error) {
    if (error.name === 'NetworkError') return 'Connection Error';
    if (error.message.includes('timeout')) return 'Timeout Error';
  }

  return 'Error';
}

/**
 * Calculate toast duration based on message length and severity
 * Based on SPEC-EH-DI-002 (4-6 seconds)
 */
export function getToastDuration(message: string, _isError = true): number {
  const wordsPerSecond = 3; // Average reading speed
  const words = message.split(' ').length;
  const readingTime = (words / wordsPerSecond) * 1000;

  // Min 3s, max 8s
  return Math.min(Math.max(readingTime, 3000), 8000);
}

/**
 * Show error toast with automatic logging
 * Based on SPEC-EH-DI-001:004
 *
 * @param error - Error object to display
 * @param options - Display and logging options
 *
 * @example
 * // Basic usage
 * try {
 *   await queryData();
 * } catch (error) {
 *   showErrorToast(error, { category: 'data-query' });
 * }
 *
 * @example
 * // With retry action
 * showErrorToast(error, {
 *   category: 'data-mutation',
 *   onRetry: () => mutation.mutate()
 * });
 *
 * @example
 * // Custom message
 * showErrorToast(error, {
 *   category: 'custom',
 *   title: 'Upload Failed',
 *   message: 'Could not upload file. Please try again.'
 * });
 */
export function showErrorToast(error: unknown, options: ErrorToastOptions = {}): void {
  const {
    category = 'error',
    title,
    message,
    onRetry,
    duration,
    context,
    logError: shouldLog = true
  } = options;

  // Generate user-friendly messages
  const toastTitle = title || getErrorTitle(error);
  const toastMessage = message || getErrorMessage(error);
  const toastDuration = duration || getToastDuration(toastMessage, true);

  // Log error if enabled
  if (shouldLog && error instanceof Error) {
    logError(error, {
      category,
      level: 'ERROR',
      context: {
        toastShown: true,
        userMessage: toastMessage,
        ...context
      }
    });
  }

  // Show toast notification
  toast({
    variant: 'error',
    title: toastTitle,
    description: toastMessage,
    duration: toastDuration,
    action: onRetry ? {
      label: 'Retry',
      onClick: onRetry
    } : undefined
  });
}

/**
 * Show warning toast with optional logging
 * Based on SPEC-EH-DI-001:004
 */
export function showWarningToast(
  message: string,
  options: Omit<ErrorToastOptions, 'message'> = {}
): void {
  const {
    category = 'warning',
    title = 'Warning',
    duration,
    context,
    logError: shouldLog = true
  } = options;

  const toastDuration = duration || getToastDuration(message, false);

  // Log warning if enabled
  if (shouldLog) {
    logWarning(message, category, {
      toastShown: true,
      ...context
    });
  }

  toast({
    variant: 'warning',
    title,
    description: message,
    duration: toastDuration
  });
}

/**
 * Show success toast (typically no logging needed)
 * Based on SPEC-EH-DI-001:004
 */
export function showSuccessToast(
  message: string,
  options: { title?: string; duration?: number } = {}
): void {
  const {
    title = 'Success',
    duration
  } = options;

  const toastDuration = duration || 3000; // Success toasts are shorter

  toast({
    variant: 'success',
    title,
    description: message,
    duration: toastDuration
  });
}

/**
 * Show info toast (typically no logging needed)
 * Based on SPEC-EH-DI-001:004
 */
export function showInfoToast(
  message: string,
  options: { title?: string; duration?: number } = {}
): void {
  const {
    title = 'Info',
    duration
  } = options;

  const toastDuration = duration || 4000;

  toast({
    variant: 'default',
    title,
    description: message,
    duration: toastDuration
  });
}
