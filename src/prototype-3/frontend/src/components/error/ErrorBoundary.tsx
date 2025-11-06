/**
 * Generic Error Boundary Component
 *
 * Implements comprehensive error handling as specified in:
 * - SPEC-error-handling.md (SPEC-ERR-BOUND-*)
 * - SPEC-data-access.md (SPEC-DA-ERR-006 to SPEC-DA-ERR-008)
 *
 * Can be used at any level of the component tree to isolate errors.
 */

import { Component, ReactNode } from 'react';
import { logError } from '@/services/logging/errorLogger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback UI to render when an error occurs
   * SPEC-ERR-BOUND-003, SPEC-ERR-BOUND-007, SPEC-ERR-BOUND-010
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /**
   * Callback invoked when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Callback invoked when boundary is reset
   */
  onReset?: () => void;
  /**
   * Category for logging (e.g., 'portal', 'module', 'jqel')
   * SPEC-ERR-LOG-002: category field
   */
  category?: string;
  /**
   * Additional context for logging
   * SPEC-ERR-LOG-002: context field
   */
  context?: Record<string, any>;
  /**
   * Level in the component tree (global, portal, module)
   * Affects the fallback UI presentation
   */
  level?: 'global' | 'portal' | 'module' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Implementation
 *
 * SPEC-ERR-BOUND-001: Application MUST have Error Boundary global
 * SPEC-ERR-BOUND-002: Boundary global MUST capture errors not treated
 * SPEC-ERR-BOUND-005: Each portal MUST have its own Error Boundary
 * SPEC-ERR-BOUND-006: Error in one portal MUST NOT affect others
 * SPEC-ERR-BOUND-008: Complex modules CAN have Error Boundary
 * SPEC-ERR-BOUND-009: Module error MUST NOT break entire portal
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // SPEC-ERR-BOUND-004: Error MUST be logged for monitoring
    // SPEC-ERR-LOG-001: Use ERROR level
    logError(error, {
      category: this.props.category || 'error-boundary',
      context: {
        ...this.props.context,
        level: this.props.level || 'component',
        componentStack: errorInfo.componentStack,
      },
    });

    // Store errorInfo for debugging
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    // SPEC-ERR-BOUND-009: Allow recovery without full reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      // Default fallback is handled by specific boundary implementations
      // (GlobalErrorBoundary, PortalErrorBoundary, etc.)
      return null;
    }

    return this.props.children;
  }
}
