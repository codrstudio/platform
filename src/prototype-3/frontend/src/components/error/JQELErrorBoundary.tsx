/**
 * JQEL-Specific Error Boundary
 *
 * Specialized error boundary for components that use JQEL queries.
 * Provides tailored error messages and recovery options for JQEL errors.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-JQEL-*, SPEC-ERR-CH-JQEL-*)
 * - SPEC-data-access.md (SPEC-DA-ERR-*)
 */

import { Component, ReactNode } from 'react';
import { isJQELError, JQELError } from '@/types/jqel';
import { logError } from '@/services/logging/errorLogger';
import { JQELErrorFallback } from './JQELErrorFallback';

export interface JQELErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback for JQEL errors
   */
  fallback?: (error: JQELError, reset: () => void) => ReactNode;
  /**
   * Callback when JQEL error is caught
   */
  onError?: (error: JQELError, errorInfo: React.ErrorInfo) => void;
  /**
   * Callback when boundary is reset
   */
  onReset?: () => void;
  /**
   * Schema context for logging
   */
  schema?: string;
  /**
   * Entity context for logging
   */
  entity?: string;
}

interface JQELErrorBoundaryState {
  hasError: boolean;
  error: Error | JQELError | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * JQEL Error Boundary
 *
 * SPEC-ERR-CH-JQEL-001: TanStack Query MUST handle errors via onError
 * SPEC-ERR-CH-JQEL-002: Query fails → Component displays inline error
 * SPEC-DA-ERR-006: Critical queries MUST have Error Boundary
 * SPEC-DA-ERR-007: Error Boundary captures untreated errors
 */
export class JQELErrorBoundary extends Component<
  JQELErrorBoundaryProps,
  JQELErrorBoundaryState
> {
  constructor(props: JQELErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error | JQELError): Partial<JQELErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error | JQELError, errorInfo: React.ErrorInfo): void {
    // SPEC-ERR-JQEL-001 to SPEC-ERR-JQEL-006: Log specific JQEL error types
    if (isJQELError(error)) {
      logError(error, {
        category: 'jqel',
        context: {
          schema: this.props.schema,
          entity: this.props.entity,
          code: error.code,
          field: error.field,
          jresult: error.jresult,
          componentStack: errorInfo.componentStack,
        },
      });
    } else {
      logError(error, {
        category: 'jqel-boundary',
        context: {
          schema: this.props.schema,
          entity: this.props.entity,
          componentStack: errorInfo.componentStack,
        },
      });
    }

    this.setState({ errorInfo });

    if (isJQELError(error)) {
      this.props.onError?.(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Handle JQEL-specific errors
      if (isJQELError(this.state.error)) {
        // Use custom fallback if provided
        if (this.props.fallback) {
          return this.props.fallback(this.state.error, this.handleReset);
        }

        // Use default JQEL error fallback
        return (
          <JQELErrorFallback
            error={this.state.error}
            onRetry={this.handleReset}
            schema={this.props.schema}
            entity={this.props.entity}
          />
        );
      }

      // Handle non-JQEL errors (generic error boundary behavior)
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-700 text-sm mb-3">
            {this.state.error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
