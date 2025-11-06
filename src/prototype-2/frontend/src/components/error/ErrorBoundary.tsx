import { Component, type ReactNode, type ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '../../types/errorBoundary';
import { logError } from '../../services/logging/errorLogger';
import { ErrorFallback } from './ErrorFallback';

/**
 * Generic error boundary component
 * Catches React rendering errors and displays fallback UI
 * Based on SPEC-DA-ERR-006 and React 19 error boundary pattern
 *
 * @example
 * <ErrorBoundary level="global">
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state to render fallback UI on next render
   * This is a static method - cannot access 'this'
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error with context after error is caught
   * This is for side effects (logging), not state updates
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context
    logError(error, {
      category: 'error-boundary',
      level: 'ERROR',
      context: {
        level: this.props.level || 'unknown',
        componentStack: errorInfo.componentStack
      }
    });

    // Store errorInfo for display
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset error state to retry rendering
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          level={this.props.level}
        />
      );
    }

    return this.props.children;
  }
}
