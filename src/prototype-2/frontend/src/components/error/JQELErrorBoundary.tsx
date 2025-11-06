import { type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { InlineErrorFallback } from './InlineErrorFallback';
import { MinimalErrorFallback } from './MinimalErrorFallback';
import { isJQELError } from '../../services/jqel/errors';
import { logError } from '../../services/logging/errorLogger';

/**
 * Props for JQEL-specific error boundary
 */
interface JQELErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Type of fallback UI to display
   * @default 'inline'
   */
  fallbackType?: 'full' | 'inline' | 'minimal';

  /**
   * Query key for context in error logs
   */
  queryKey?: readonly unknown[];
}

/**
 * JQEL-specific error boundary wrapper
 * Wraps generic ErrorBoundary with JQEL error handling logic
 *
 * @example
 * <JQELErrorBoundary fallbackType="inline" queryKey={['portal', 'main']}>
 *   <PortalData />
 * </JQELErrorBoundary>
 */
export function JQELErrorBoundary({
  children,
  fallbackType = 'inline',
  queryKey
}: JQELErrorBoundaryProps) {

  const handleError = (error: Error) => {
    // Log with JQEL context
    logError(error, {
      category: 'jqel-query',
      level: 'ERROR',
      context: {
        isJQELError: isJQELError(error),
        queryKey: queryKey ? JSON.stringify(queryKey) : undefined,
        ...(isJQELError(error) && {
          code: error.code,
          field: error.field
        })
      }
    });
  };

  // Select fallback component based on type
  const fallbackComponent =
    fallbackType === 'full' ? ErrorFallback :
    fallbackType === 'inline' ? InlineErrorFallback :
    MinimalErrorFallback;

  return (
    <ErrorBoundary
      fallback={fallbackComponent}
      onError={handleError}
      level="module"
    >
      {children}
    </ErrorBoundary>
  );
}
