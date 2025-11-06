import type { FieldError, ErrorSeverity } from '../types/formErrors';
import { isJQELError } from '../services/jqel/errors';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Format single field error message
 * Adds context if field name available
 */
export function formatFieldError(
  fieldName: string | undefined,
  error: string
): string {
  if (!fieldName) return error;

  // Don't repeat field name if already in message
  if (error.toLowerCase().includes(fieldName.toLowerCase())) {
    return error;
  }

  // Add field context
  return `${fieldName}: ${error}`;
}

/**
 * Extract validation errors from various sources
 * Handles React Hook Form, JQEL, and generic errors
 */
export function formatValidationErrors(errors: unknown): FieldError[] {
  const formatted: FieldError[] = [];

  // Handle JQEL validation errors
  if (isJQELError(errors)) {
    if (errors.isValidationError() && errors.field) {
      formatted.push({
        field: errors.field,
        message: errors.getUserMessage(),
        severity: 'error',
        code: errors.code.toString()
      });
    }
    return formatted;
  }

  // Handle React Hook Form errors
  if (typeof errors === 'object' && errors !== null) {
    for (const [field, error] of Object.entries(errors)) {
      if (error && typeof error === 'object' && 'message' in error) {
        formatted.push({
          field,
          message: String(error.message),
          severity: 'error'
        });
      }
    }
  }

  return formatted;
}

/**
 * Get error severity from error object
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isJQELError(error)) {
    if (error.isServerError()) return 'error';
    if (error.isValidationError()) return 'warning';
  }
  return 'error';
}

/**
 * Get appropriate Lucide icon for error severity
 */
export function getErrorIcon(severity: ErrorSeverity): LucideIcon {
  switch (severity) {
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    default:
      return AlertCircle;
  }
}
