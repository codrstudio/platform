import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Full-page error fallback UI
 * Based on pattern from ErrorState component
 *
 * @example
 * <ErrorFallback
 *   error={error}
 *   resetError={() => window.location.reload()}
 *   level="global"
 * />
 */
export function ErrorFallback({ error, resetError, level = 'global' }: FallbackProps) {
  const handleRetry = () => {
    resetError();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const title = level === 'global'
    ? 'Something went wrong'
    : level === 'portal'
    ? 'Portal error'
    : 'Component error';

  const message = level === 'global'
    ? 'An unexpected error occurred. Please reload the page.'
    : level === 'portal'
    ? 'This portal encountered an error. Try reloading or go back to home.'
    : 'This component failed to load. Try again or refresh the page.';

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md px-4">
        {/* Error Icon */}
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
        <h2 className="text-xl font-semibold mb-2">{title}</h2>

        {/* Message */}
        <p className="text-muted-foreground mb-4">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          {level !== 'global' && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          )}

          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
