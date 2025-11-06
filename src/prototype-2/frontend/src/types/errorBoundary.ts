import type { ReactNode, ComponentType, ErrorInfo } from 'react';

/**
 * Props for ErrorBoundary component
 * Based on SPEC-DA-ERR-006:008
 */
export interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Custom fallback component to render when error occurs
   * @default ErrorFallback
   */
  fallback?: ComponentType<FallbackProps>;

  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Boundary level for contextual error handling
   */
  level?: 'global' | 'portal' | 'module';
}

/**
 * State for ErrorBoundary component
 */
export interface ErrorBoundaryState {
  /**
   * Whether an error has been caught
   */
  hasError: boolean;

  /**
   * The caught error
   */
  error: Error | null;

  /**
   * Additional error information from React
   */
  errorInfo: ErrorInfo | null;
}

/**
 * Props for fallback UI components
 */
export interface FallbackProps {
  /**
   * The error that was caught
   */
  error: Error;

  /**
   * Function to reset error state and retry
   */
  resetError: () => void;

  /**
   * Boundary level for contextual messaging
   */
  level?: 'global' | 'portal' | 'module';
}

/**
 * Options for error logging
 */
export interface LogErrorOptions {
  /**
   * Error category for grouping
   */
  category: string;

  /**
   * Log level
   * @default 'ERROR'
   */
  level?: 'ERROR' | 'WARN' | 'INFO';

  /**
   * Additional context data
   */
  context?: Record<string, any>;
}

/**
 * Props for ModuleErrorBoundary wrapper component
 * Based on SPEC-ERR-BOUND-008
 */
export interface ModuleBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Module identifier for contextual logging
   * @optional
   */
  moduleId?: string;

  /**
   * Custom error handler callback
   * @optional
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
