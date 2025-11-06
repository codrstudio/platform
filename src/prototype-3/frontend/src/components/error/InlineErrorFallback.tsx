/**
 * Inline Error Fallback Component
 *
 * Compact error display for inline/embedded contexts (e.g., form fields, cards).
 * Does not block the entire UI.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-UI-008 to SPEC-ERR-UI-011, SPEC-ERR-UI-012)
 */

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface InlineErrorFallbackProps {
  /**
   * Error to display
   */
  error: Error;
  /**
   * Callback to retry the operation
   */
  onRetry?: () => void;
  /**
   * Custom message to display instead of error.message
   */
  message?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Hide retry button
   */
  hideRetry?: boolean;
}

/**
 * Inline Error Fallback
 *
 * SPEC-ERR-UI-012: Component in loading that fails MUST display error inline
 * SPEC-ERR-FORM-001 to SPEC-ERR-FORM-004: Form field error display
 */
export function InlineErrorFallback({
  error,
  onRetry,
  message,
  size = 'md',
  hideRetry = false,
}: InlineErrorFallbackProps): ReactNode {
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={`border border-red-200 bg-red-50 rounded-md ${sizeClasses[size]}`}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {/* SPEC-ERR-UI-011: Error icon */}
        <AlertCircle className={`text-red-600 flex-shrink-0 mt-0.5 ${iconSizes[size]}`} />

        <div className="flex-1 min-w-0">
          {/* SPEC-ERR-UI-009: Error message below field */}
          <p className="text-red-900 font-medium">
            {message || error.message || 'An error occurred'}
          </p>

          {/* SPEC-ERR-UI-012: Option to try again */}
          {!hideRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 flex items-center gap-1 text-red-700 hover:text-red-900 hover:underline"
            >
              <RefreshCw className={iconSizes[size]} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
