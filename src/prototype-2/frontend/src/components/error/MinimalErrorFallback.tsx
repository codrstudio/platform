import type { FallbackProps } from '../../types/errorBoundary';

/**
 * Minimal error fallback UI
 * Single-line display for non-critical components
 *
 * @example
 * <MinimalErrorFallback
 *   error={error}
 *   resetError={() => refetch()}
 * />
 */
export function MinimalErrorFallback({ resetError }: FallbackProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="alert">
      <svg
        className="h-4 w-4 text-destructive flex-shrink-0"
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
      <span>Error loading data.</span>
      <button
        onClick={resetError}
        className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        Try again?
      </button>
    </div>
  );
}
