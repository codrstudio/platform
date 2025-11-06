import { AlertCircle } from 'lucide-react';
import type { ValidationErrorProps } from '../../types/formErrors';

/**
 * Validation error summary component
 * Displays multiple field errors in a summary alert
 * Based on SPEC-EH-DI-008:010
 *
 * @example
 * <ValidationError
 *   errors={[
 *     { field: 'email', message: 'Invalid format' },
 *     { field: 'password', message: 'Too short' }
 *   ]}
 *   title="Please fix the following errors:"
 *   onFieldClick={(field) => focusField(field)}
 * />
 */
export function ValidationError({
  errors,
  title = 'Validation errors',
  onFieldClick,
  compact = false
}: ValidationErrorProps) {
  if (!errors.length) return null;

  return (
    <div
      className="rounded-lg border border-destructive bg-destructive/10 p-4"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />

        <div className="flex-1">
          {!compact && (
            <p className="text-sm font-semibold text-destructive mb-2">
              {title}
            </p>
          )}

          <ul className="space-y-1 text-sm text-destructive/90">
            {errors.map((error, index) => (
              <li key={`${error.field}-${index}`}>
                {onFieldClick ? (
                  <button
                    onClick={() => onFieldClick(error.field)}
                    className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded"
                  >
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </button>
                ) : (
                  <>
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
