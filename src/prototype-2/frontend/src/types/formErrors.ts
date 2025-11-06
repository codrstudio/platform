/**
 * Form error types
 * Based on SPEC-error-handling.md SPEC-ERR-FORM-*
 */

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface FieldError {
  field: string;
  message: string;
  severity?: ErrorSeverity;
  code?: string;
}

export interface ValidationErrorProps {
  errors: FieldError[];
  title?: string;
  onFieldClick?: (fieldName: string) => void;
  compact?: boolean;
}

export interface FormFieldErrorProps {
  fieldName?: string;
  error: string | undefined;
  showIcon?: boolean;
  severity?: ErrorSeverity;
}
