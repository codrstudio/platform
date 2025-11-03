/**
 * JResult Response Format
 * Standard response format for all API endpoints
 */

export interface JResult<T = any> {
  code: number; // HTTP status code
  message: string; // Human-readable message
  data?: T; // Response data
  field?: string; // Field with error (for validation)
  errors?: Array<{
    // Multiple errors
    field: string;
    message: string;
  }>;
}

/**
 * Create success JResult
 */
export function successResult<T>(data: T, message = 'Success'): JResult<T> {
  return {
    code: 200,
    message,
    data,
  };
}

/**
 * Create error JResult
 */
export function errorResult(
  code: number,
  message: string,
  field?: string
): JResult {
  return {
    code,
    message,
    ...(field && { field }),
  };
}
