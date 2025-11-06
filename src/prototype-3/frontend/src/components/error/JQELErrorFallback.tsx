/**
 * JQEL Error Fallback Component
 *
 * Specialized error display for JQEL query errors.
 * Provides context-aware messages based on HTTP status codes.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-JQEL-*, SPEC-ERR-NET-004)
 * - SPEC-data-access.md (SPEC-DA-ERR-003)
 */

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, ShieldAlert, SearchX, ServerCrash } from 'lucide-react';
import { JQELError } from '@/types/jqel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface JQELErrorFallbackProps {
  /**
   * JQEL error instance
   */
  error: JQELError;
  /**
   * Callback to retry the operation
   */
  onRetry?: () => void;
  /**
   * Schema context
   */
  schema?: string;
  /**
   * Entity context
   */
  entity?: string;
  /**
   * Inline mode (compact display)
   */
  inline?: boolean;
}

/**
 * JQEL Error Fallback
 *
 * SPEC-ERR-JQEL-001: Schema not found
 * SPEC-ERR-JQEL-002: Entity not found
 * SPEC-ERR-JQEL-003: Action not found
 * SPEC-ERR-JQEL-004: Validation failed
 * SPEC-ERR-JQEL-005: Permission denied
 * SPEC-ERR-JQEL-006: Query timeout
 * SPEC-ERR-NET-004: HTTP 4xx errors
 * SPEC-DA-ERR-003: Display error with context
 */
export function JQELErrorFallback({
  error,
  onRetry,
  schema,
  entity,
  inline = false,
}: JQELErrorFallbackProps): ReactNode {
  // Determine icon and color based on error code
  const getErrorIcon = (): ReactNode => {
    if (error.code === 403) return <ShieldAlert className="h-5 w-5" />;
    if (error.code === 404) return <SearchX className="h-5 w-5" />;
    if (error.code >= 500) return <ServerCrash className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  // Get user-friendly title based on error code
  const getTitle = (): string => {
    // SPEC-ERR-NET-004: HTTP 4xx client errors
    if (error.code === 400) return 'Invalid Request';
    if (error.code === 401) return 'Authentication Required';
    if (error.code === 403) return 'Access Denied'; // SPEC-ERR-JQEL-005
    if (error.code === 404) return 'Not Found'; // SPEC-ERR-JQEL-001, SPEC-ERR-JQEL-002
    if (error.code === 422) return 'Validation Error'; // SPEC-ERR-JQEL-004
    if (error.code === 429) return 'Too Many Requests';
    if (error.code >= 500) return 'Server Error';
    return 'Query Error';
  };

  // Get user-friendly message
  const getUserMessage = (): string => {
    // Use the error message from JResult if available
    if (error.message && !error.message.includes('JQEL query failed')) {
      return error.message;
    }

    // SPEC-ERR-JQEL-005: Permission denied
    if (error.code === 403) {
      return 'You do not have permission to access this resource.';
    }

    // SPEC-ERR-JQEL-001, SPEC-ERR-JQEL-002: Not found
    if (error.code === 404) {
      if (schema && entity) {
        return `Resource not found in ${schema}.${entity}`;
      }
      return 'The requested resource was not found.';
    }

    // SPEC-ERR-JQEL-004: Validation failed
    if (error.code === 422) {
      return 'The provided data is invalid.';
    }

    // SPEC-ERR-JQEL-006: Timeout
    if (error.message?.includes('timeout') || error.message?.includes('took too long')) {
      return 'The operation took too long to complete. Please try again.';
    }

    // Generic messages for status code ranges
    if (error.code >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    return 'An error occurred while processing your request.';
  };

  // Determine if retry should be available
  // SPEC-DA-ERR-005: Retry logic configuration
  const shouldShowRetry = (): boolean => {
    // Don't retry on client errors (except 429)
    if (error.code >= 400 && error.code < 500 && error.code !== 429) {
      return false;
    }
    // Retry available for server errors and rate limiting
    return error.code >= 500 || error.code === 429;
  };

  // Inline compact display
  if (inline) {
    return (
      <div className="p-3 border border-red-200 bg-red-50 rounded-md">
        <div className="flex items-start gap-2">
          <div className="text-red-600 mt-0.5">{getErrorIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">{getTitle()}</p>
            <p className="text-sm text-red-700 mt-1">{getUserMessage()}</p>
            {error.field && (
              <p className="text-xs text-red-600 mt-1">Field: {error.field}</p>
            )}
            {shouldShowRetry() && onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full display
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <div className="flex items-start gap-3">
          <div className="text-red-600 mt-0.5">{getErrorIcon()}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">{getTitle()}</h3>
            <AlertDescription>
              <p className="text-red-800 mb-3">{getUserMessage()}</p>

              {/* Technical details */}
              <div className="space-y-2 mb-4">
                <div className="p-2 bg-red-100 rounded text-sm">
                  <p className="font-medium text-red-900">Status Code: {error.code}</p>
                  {schema && <p className="text-red-700">Schema: {schema}</p>}
                  {entity && <p className="text-red-700">Entity: {entity}</p>}
                  {error.field && <p className="text-red-700">Field: {error.field}</p>}
                </div>

                {/* Show warnings if present */}
                {error.jresult.warnings && error.jresult.warnings.length > 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-900 mb-1">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {error.jresult.warnings.map((warning, idx) => (
                        <li key={idx} className="text-yellow-800">
                          {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {shouldShowRetry() && onRetry && (
                <Button onClick={onRetry} variant="default" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Development details */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
          <p className="text-xs font-semibold mb-2">Debug Information (Dev Only):</p>
          <pre className="text-xs font-mono overflow-auto">
            {JSON.stringify(error.jresult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
