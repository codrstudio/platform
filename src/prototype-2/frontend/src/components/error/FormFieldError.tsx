import { getErrorIcon } from '../../utils/errorFormatters';
import type { FormFieldErrorProps } from '../../types/formErrors';

/**
 * Inline error display for form fields
 * Based on SPEC-EH-DI-008:011
 *
 * @example
 * <FormFieldError
 *   fieldName="email"
 *   error={errors.email?.message}
 *   showIcon={true}
 * />
 */
export function FormFieldError({
  fieldName,
  error,
  showIcon = true,
  severity = 'error'
}: FormFieldErrorProps) {
  if (!error) return null;

  const Icon = getErrorIcon(severity);
  const colorClass = severity === 'error'
    ? 'text-destructive'
    : 'text-yellow-600 dark:text-yellow-400';

  return (
    <div
      id={fieldName ? `${fieldName}-error` : undefined}
      className="flex items-start gap-2 mt-1"
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <Icon
          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`}
          aria-hidden="true"
        />
      )}
      <p className={`text-sm ${colorClass}`}>
        {error}
      </p>
    </div>
  );
}
