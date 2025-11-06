/**
 * Global Error Boundary
 *
 * Top-level error boundary that catches all unhandled errors in the application.
 * Provides a full-screen error page with reload option.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-BOUND-001 to SPEC-ERR-BOUND-004)
 */

import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

export interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Global Error Boundary
 *
 * SPEC-ERR-BOUND-001: Application MUST have Error Boundary global
 * SPEC-ERR-BOUND-002: Boundary global MUST capture errors not treated
 * SPEC-ERR-BOUND-003: Boundary global MUST display fallback
 * SPEC-ERR-BOUND-004: Error MUST be logged for monitoring
 */
export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps): ReactNode {
  const handleReset = (): void => {
    // For global errors, reset means full page reload
    // SPEC-ERR-BOUND-003: Reload page button
    window.location.href = '/';
  };

  return (
    <ErrorBoundary
      level="global"
      category="global"
      fallback={(error, reset) => (
        <ErrorFallback
          error={error}
          onReset={reset}
          onReload={() => window.location.reload()}
          level="global"
        />
      )}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}
