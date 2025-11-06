import { useNavigate } from 'react-router-dom';
import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Portal-level error fallback with recovery options
 *
 * This is the second tier in the error boundary hierarchy (Global → Portal → Module).
 * It catches errors within a specific portal, preventing one portal's failure from
 * affecting other portals or the global application.
 *
 * Recovery options:
 * - Try Again: Resets error state and re-renders portal (may not fix persistent errors)
 * - Go Home: Navigates to main portal (safe escape from problem)
 *
 * Based on SPEC-ERR-BOUND-005:007
 *
 * @example
 * <ErrorBoundary level="portal" fallback={PortalErrorFallback}>
 *   <PortalRouter portal={portal} modules={modules} />
 * </ErrorBoundary>
 *
 * @param props.error - The error that was caught
 * @param props.resetError - Function to reset error state and retry rendering
 */
export function PortalErrorFallback({ error, resetError }: FallbackProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    resetError();
  };

  const handleGoHome = () => {
    navigate('/');
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
          Portal Error
        </h2>

        {/* Message */}
        <p className="text-muted-foreground mb-4">
          This portal encountered an error. Try reloading or go back to home.
        </p>

        {/* Actions - Two buttons side-by-side */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go Home
          </button>
        </div>

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
