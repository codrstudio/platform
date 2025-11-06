import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Module-level error fallback UI
 * Displays inline error message within module container
 * Based on SPEC-ERR-BOUND-010
 *
 * @example
 * <ErrorBoundary level="module" fallback={ModuleErrorFallback}>
 *   <ModuleContent />
 * </ErrorBoundary>
 */
export function ModuleErrorFallback({ error, resetError }: FallbackProps) {
  const handleRetry = () => {
    resetError();
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      {/* Error Icon (24x24 - smaller for inline display) */}
      <div className="mb-2 text-destructive">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold mb-2">
        Failed to Load Module
      </h3>

      {/* Message */}
      <p className="text-sm text-muted-foreground mb-4">
        This module encountered an error. Try reloading.
      </p>

      {/* Action Button */}
      <button
        onClick={handleRetry}
        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Try Again
      </button>

      {/* Error Details - Development Only (Inline) */}
      {import.meta.env.DEV && (
        <details className="mt-4 text-left w-full">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
