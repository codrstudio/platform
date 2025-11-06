/**
 * Error Fallback Component
 *
 * Full-page error display for critical errors caught by error boundaries.
 * Provides clear messaging and recovery options.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-BOUND-003, SPEC-ERR-UI-005 to SPEC-ERR-UI-007)
 * - SPEC-error-handling.md (SPEC-ERR-DEV-001, SPEC-ERR-PROD-001)
 */

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface ErrorFallbackProps {
  /**
   * The error that was caught
   */
  error: Error;
  /**
   * Callback to reset the error boundary
   */
  onReset?: () => void;
  /**
   * Callback to reload the page
   */
  onReload?: () => void;
  /**
   * Level of the error boundary (affects messaging)
   */
  level?: 'global' | 'portal' | 'module' | 'component';
  /**
   * Additional context to display
   */
  context?: Record<string, any>;
}

/**
 * Error Fallback UI
 *
 * SPEC-ERR-BOUND-003: Display appropriate fallback
 * SPEC-ERR-UI-005: Critical errors MUST use modal/full-page display
 * SPEC-ERR-UI-006: Modal MUST have title, description, actions
 * SPEC-ERR-UI-007: Modal MUST block interaction
 * SPEC-ERR-DEV-001: Stack traces visible in development
 * SPEC-ERR-PROD-001: Stack traces NOT visible in production
 */
export function ErrorFallback({
  error,
  onReset,
  onReload,
  level = 'component',
  context,
}: ErrorFallbackProps): ReactNode {
  const isGlobal = level === 'global';
  const isPortal = level === 'portal';

  // SPEC-ERR-BOUND-003: Different messages per level
  const getTitle = (): string => {
    if (isGlobal) return 'Something Went Wrong';
    if (isPortal) return 'Portal Error';
    return 'Component Error';
  };

  const getMessage = (): string => {
    if (isGlobal) {
      return 'An unexpected error occurred. The application needs to reload to recover.';
    }
    if (isPortal) {
      return 'This portal encountered an error. You can try again or return to the home page.';
    }
    return 'This component encountered an error. You can try again.';
  };

  const handleGoHome = (): void => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        <Alert variant="destructive" className="bg-white border-2 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-red-900 mb-2">{getTitle()}</h3>
              <AlertDescription className="text-base">
                <p className="mb-4 text-red-800">{getMessage()}</p>

                {/* Error message */}
                <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-900 mb-1">Error Details:</p>
                  <p className="text-sm text-red-700 font-mono break-words">
                    {error.message || 'Unknown error'}
                  </p>
                </div>

                {/* Context information (if provided) */}
                {context && Object.keys(context).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">Context:</p>
                    <dl className="text-sm space-y-1">
                      {Object.entries(context).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <dt className="font-medium text-gray-700">{key}:</dt>
                          <dd className="text-gray-600">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Action buttons - SPEC-ERR-UI-006 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {onReset && (
                    <Button
                      onClick={onReset}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  )}

                  {onReload && (
                    <Button
                      onClick={onReload}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reload Page
                    </Button>
                  )}

                  {!isGlobal && (
                    <Button
                      onClick={handleGoHome}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Go to Home
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Stack trace - SPEC-ERR-DEV-001 vs SPEC-ERR-PROD-001 */}
        {import.meta.env.DEV && error.stack && (
          <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-md overflow-auto">
            <p className="text-xs font-semibold mb-2 text-gray-300">
              Stack Trace (Development Only):
            </p>
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Development warning */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Development Mode:</strong> Stack traces and detailed error information are
              visible. In production, only user-friendly messages will be shown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
