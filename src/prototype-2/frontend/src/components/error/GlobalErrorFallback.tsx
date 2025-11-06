import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Full-page error fallback for global error boundary
 *
 * This is the outermost safety net that catches all unhandled React errors
 * at the application level. It displays a friendly error page with a reload
 * action and development-only error details.
 *
 * Based on SPEC-ERR-BOUND-001:004
 *
 * @example
 * <ErrorBoundary level="global" fallback={GlobalErrorFallback}>
 *   <App />
 * </ErrorBoundary>
 *
 * @param props.error - The error that was caught
 * @param props.resetError - Function to reset error state (not used for global level)
 */
export function GlobalErrorFallback({ error }: FallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-background"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md px-4">
        {/* Error Icon - AlertCircle from Lucide pattern */}
        <div className="mx-auto mb-4 text-destructive">
          <svg
            className="mx-auto"
            width="64"
            height="64"
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
        <h2 className="text-xl font-semibold mb-2 text-foreground">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred. Please reload the page.
        </p>

        {/* Action - Primary reload button */}
        <button
          onClick={handleReload}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Reload Page
        </button>

        {/* Error Details (Development Only) */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto max-h-64 text-foreground">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
