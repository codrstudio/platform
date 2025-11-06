import { type ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ModuleErrorFallback } from './ModuleErrorFallback';
import { logError } from '../../services/logging/errorLogger';
import type { ModuleBoundaryProps } from '../../types/errorBoundary';

/**
 * Convenience wrapper for module-level error boundaries
 * Pre-configured with module-specific fallback and logging
 * Based on SPEC-ERR-BOUND-008:010
 *
 * @example
 * // Wrap entire module
 * export function MyModule() {
 *   return (
 *     <ModuleErrorBoundary moduleId="my-module">
 *       <ModuleContent />
 *     </ModuleErrorBoundary>
 *   );
 * }
 *
 * @example
 * // Wrap individual route
 * const routes = [
 *   {
 *     path: '/feature',
 *     element: (
 *       <ModuleErrorBoundary moduleId="feature">
 *         <FeaturePage />
 *       </ModuleErrorBoundary>
 *     )
 *   }
 * ];
 */
export function ModuleErrorBoundary({
  children,
  moduleId,
  onError
}: ModuleBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error with moduleId context
    logError(error, {
      category: 'error-boundary',
      level: 'ERROR',
      context: {
        level: 'module',
        moduleId,
        componentStack: errorInfo.componentStack
      }
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      level="module"
      fallback={ModuleErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
