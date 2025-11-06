import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Inline error fallback UI
 * Compact alert-style display for module-level errors
 *
 * @example
 * <InlineErrorFallback
 *   error={error}
 *   resetError={() => refetch()}
 * />
 */
export function InlineErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div
      className="rounded-lg border border-destructive bg-destructive/10 p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <svg
          className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load this section
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An error occurred while loading.'}
          </p>
          <button
            onClick={resetError}
            className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>

      {/* Error Details (Development Only) */}
      {import.meta.env.DEV && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto max-h-32">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
