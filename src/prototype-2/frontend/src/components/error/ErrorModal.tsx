/**
 * ErrorModal Component - Critical error display
 * Based on SPEC-EH-DI-005:007
 */

import { useState } from 'react';
import { AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useErrorModal } from '../../services/logging/errorModal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '../ui/alert-dialog';

/**
 * ErrorModal Component
 *
 * Displays critical errors in a modal dialog with:
 * - User-friendly error message
 * - Technical details (dev mode only)
 * - Action buttons (Retry, Reload, Dismiss, etc.)
 *
 * Mount once in App.tsx. Automatically shows when showErrorModal() is called.
 *
 * @example
 * // In App.tsx
 * <ErrorModal />
 *
 * // Trigger from anywhere
 * showErrorModal(error, { level: 'portal' });
 */
export function ErrorModal() {
  const { isOpen, error, title, message, actions, hideErrorModal } = useErrorModal();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!error) return null;

  const isDev = import.meta.env.DEV;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && hideErrorModal()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <AlertDialogTitle>{title || 'Error'}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {message || error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Technical Details (Dev Mode Only) */}
        {isDev && (
          <div className="mt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex w-full items-center justify-between rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span>Technical Details</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showTechnicalDetails ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showTechnicalDetails && (
              <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Name:</span>{' '}
                    <span className="font-mono text-gray-900 dark:text-gray-100">{error.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Message:</span>{' '}
                    <span className="font-mono text-gray-900 dark:text-gray-100">{error.message}</span>
                  </div>
                  {error.stack && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Stack:</span>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <AlertDialogFooter>
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions?.map((action, index) => {
              const isPrimary = action.variant === 'primary' || (!action.variant && index === 0);
              const isDestructive = action.variant === 'destructive';

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isPrimary
                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400 dark:bg-blue-700 dark:hover:bg-blue-800'
                        : isDestructive
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 dark:bg-red-700 dark:hover:bg-red-800'
                        : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {action.label === 'Retry' && <RefreshCw className="h-4 w-4" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
