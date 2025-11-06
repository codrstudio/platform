/**
 * Toaster Component - Minimal Implementation
 *
 * Renders toast notifications from useToast hook.
 * Mount in App.tsx to enable toasts globally.
 */

import { useToast, type ToastVariant } from '../../hooks/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Get icon component and classes for toast variant
 */
function getVariantStyles(variant?: ToastVariant) {
  switch (variant) {
    case 'success':
      return {
        Icon: CheckCircle,
        className: 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800',
        iconClassName: 'text-green-600 dark:text-green-400'
      };
    case 'error':
    case 'destructive':
      return {
        Icon: AlertCircle,
        className: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800',
        iconClassName: 'text-red-600 dark:text-red-400'
      };
    case 'warning':
      return {
        Icon: AlertTriangle,
        className: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800',
        iconClassName: 'text-yellow-600 dark:text-yellow-400'
      };
    default:
      return {
        Icon: Info,
        className: 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800',
        iconClassName: 'text-blue-600 dark:text-blue-400'
      };
  }
}

/**
 * Toaster container component
 *
 * Renders all active toasts. Mount once in App.tsx.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-md">
      {toasts.map((toast) => {
        const { Icon, className, iconClassName } = getVariantStyles(toast.variant);

        return (
          <div
            key={toast.id}
            className={`
              group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden
              rounded-lg border p-4 pr-8 shadow-lg transition-all
              data-[state=closed]:animate-out data-[state=closed]:fade-out-80
              data-[state=closed]:slide-out-to-right-full
              data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full
              ${className}
            `}
            data-state={toast.open ? 'open' : 'closed'}
            role="alert"
            aria-live="polite"
          >
            {/* Icon */}
            <Icon className={`h-5 w-5 shrink-0 ${iconClassName}`} />

            {/* Content */}
            <div className="grid flex-1 gap-1">
              {toast.title && (
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {toast.description}
                </div>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:hover:text-gray-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
