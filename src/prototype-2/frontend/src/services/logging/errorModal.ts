/**
 * Error Modal - Imperative API for critical error display
 * Based on SPEC-EH-DI-005:007
 */

import * as React from 'react';
import { logError } from './errorLogger';

/**
 * Action button configuration
 */
export interface ErrorModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

/**
 * Error modal state
 */
export interface ErrorModalState {
  isOpen: boolean;
  error: Error | null;
  title?: string;
  message?: string;
  actions?: ErrorModalAction[];
  level?: 'global' | 'portal' | 'module';
  context?: Record<string, any>;
}

/**
 * Options for showing error modal
 */
export interface ErrorModalOptions {
  /**
   * Custom modal title (overrides automatic)
   */
  title?: string;

  /**
   * Custom error message (overrides automatic)
   */
  message?: string;

  /**
   * Action buttons to display
   */
  actions?: ErrorModalAction[];

  /**
   * Error boundary level (for contextual messaging)
   */
  level?: 'global' | 'portal' | 'module';

  /**
   * Additional logging context
   */
  context?: Record<string, any>;

  /**
   * Whether to log the error (default: true)
   */
  logError?: boolean;
}

// Global state
let modalState: ErrorModalState = {
  isOpen: false,
  error: null
};

// State listeners
const listeners: Array<(state: ErrorModalState) => void> = [];

/**
 * Subscribe to modal state changes
 */
function subscribe(listener: (state: ErrorModalState) => void): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Update modal state and notify listeners
 */
function updateState(newState: ErrorModalState): void {
  modalState = newState;
  listeners.forEach((listener) => listener(modalState));
}

/**
 * Get user-friendly error message
 */
function getDefaultErrorMessage(error: Error, level?: string): string {
  if (level === 'global') {
    return 'A critical error occurred. The application may need to be reloaded.';
  }
  if (level === 'portal') {
    return 'An error occurred in this portal. You may need to navigate away.';
  }
  if (level === 'module') {
    return 'This component encountered an error. Try refreshing or contact support.';
  }
  return error.message || 'An unexpected error occurred.';
}

/**
 * Get default actions based on error level
 */
function getDefaultActions(
  level: string | undefined,
  onRetry?: () => void
): ErrorModalAction[] {
  const actions: ErrorModalAction[] = [];

  // Retry action (if provided)
  if (onRetry) {
    actions.push({
      label: 'Retry',
      onClick: () => {
        hideErrorModal();
        onRetry();
      },
      variant: 'primary'
    });
  }

  // Level-specific actions
  if (level === 'global') {
    actions.push({
      label: 'Reload Page',
      onClick: () => {
        window.location.reload();
      },
      variant: onRetry ? 'secondary' : 'primary'
    });
  }

  if (level === 'portal' || level === 'module') {
    actions.push({
      label: 'Go Home',
      onClick: () => {
        hideErrorModal();
        window.location.href = '/';
      },
      variant: onRetry ? 'secondary' : 'primary'
    });
  }

  // Always have dismiss option
  actions.push({
    label: 'Dismiss',
    onClick: hideErrorModal,
    variant: 'secondary'
  });

  return actions;
}

/**
 * Show error modal
 * Based on SPEC-EH-DI-005:007
 *
 * @param error - Error to display
 * @param options - Modal configuration
 *
 * @example
 * // In error boundary
 * showErrorModal(error, {
 *   level: 'portal',
 *   actions: [
 *     { label: 'Retry', onClick: resetError, variant: 'primary' },
 *     { label: 'Go Home', onClick: () => navigate('/'), variant: 'secondary' }
 *   ]
 * });
 *
 * @example
 * // Manual critical error
 * showErrorModal(new Error('Critical failure'), {
 *   title: 'Critical Error',
 *   message: 'The system encountered a critical error.',
 *   context: { feature: 'data-export' }
 * });
 */
export function showErrorModal(error: Error, options: ErrorModalOptions = {}): void {
  const {
    title,
    message,
    actions,
    level,
    context,
    logError: shouldLog = true
  } = options;

  // Log error if enabled
  if (shouldLog) {
    logError(error, {
      category: 'error-modal',
      level: 'ERROR',
      context: {
        modalShown: true,
        modalLevel: level,
        ...context
      }
    });
  }

  // Determine actions
  const modalActions = actions || getDefaultActions(level);

  // Update state
  updateState({
    isOpen: true,
    error,
    title: title || (level === 'global' ? 'Critical Error' : 'Error'),
    message: message || getDefaultErrorMessage(error, level),
    actions: modalActions,
    level,
    context
  });
}

/**
 * Hide error modal
 */
export function hideErrorModal(): void {
  updateState({
    isOpen: false,
    error: null
  });
}

/**
 * React hook to observe error modal state
 */
export function useErrorModal(): ErrorModalState & {
  showErrorModal: typeof showErrorModal;
  hideErrorModal: typeof hideErrorModal;
} {
  const [state, setState] = React.useState<ErrorModalState>(modalState);

  React.useEffect(() => {
    return subscribe(setState);
  }, []);

  return {
    ...state,
    showErrorModal,
    hideErrorModal
  };
}

// Export state accessor for non-React code
export function getErrorModalState(): ErrorModalState {
  return modalState;
}
