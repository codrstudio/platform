/**
 * useErrorHandler Hook
 *
 * React hook for handling errors with logging and user feedback.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-UTIL-003)
 */

import { useCallback } from 'react';
import { handleError as handleErrorUtil, HandleErrorOptions } from '@/utils/errorHandler';

/**
 * Error handler hook result
 */
export interface UseErrorHandlerResult {
  /**
   * Handle an error with logging and optional toast
   */
  handleError: (error: Error | unknown, options: Partial<HandleErrorOptions>) => void;
  /**
   * Show an error to the user (logs and shows toast)
   */
  showError: (message: string, category?: string) => void;
}

/**
 * Hook for error handling
 *
 * SPEC-ERR-UTIL-003: Platform MUST provide useErrorHandler hook
 *
 * @example
 * ```tsx
 * const { handleError, showError } = useErrorHandler();
 *
 * try {
 *   await mutation();
 * } catch (error) {
 *   handleError(error, {
 *     category: 'jqel',
 *     showToast: true
 *   });
 * }
 * ```
 */
export function useErrorHandler(defaultCategory: string = 'app'): UseErrorHandlerResult {
  const handleError = useCallback(
    (error: Error | unknown, options: Partial<HandleErrorOptions> = {}) => {
      // Merge with defaults
      const finalOptions: HandleErrorOptions = {
        category: options.category || defaultCategory,
        context: options.context,
        showToast: options.showToast ?? true, // Default to showing toast
        toastMessage: options.toastMessage,
        logLevel: options.logLevel,
        onHandled: options.onHandled,
      };

      handleErrorUtil(error, finalOptions);
    },
    [defaultCategory]
  );

  const showError = useCallback(
    (message: string, category: string = defaultCategory) => {
      handleErrorUtil(new Error(message), {
        category,
        showToast: true,
        toastMessage: message,
      });
    },
    [defaultCategory]
  );

  return {
    handleError,
    showError,
  };
}
