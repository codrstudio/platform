import type { JResult } from '../../types/jqel';

/**
 * JQEL Error - Wraps JResult errors with typed structure
 * Based on SPEC-DA-W-009:011
 */
export class JQELError extends Error {
  code: number;
  field?: string;
  jresult: JResult;

  constructor(jresult: JResult) {
    super(jresult.message || 'JQEL query failed');
    this.name = 'JQELError';
    this.code = jresult.code;
    this.field = jresult.field;
    this.jresult = jresult;

    // Maintain proper stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JQELError);
    }
  }

  /**
   * Check if error is validation error (400)
   */
  isValidationError(): boolean {
    return this.code === 400;
  }

  /**
   * Check if error is authentication error (401/403)
   */
  isAuthError(): boolean {
    return this.code === 401 || this.code === 403;
  }

  /**
   * Check if error is not found (404)
   */
  isNotFound(): boolean {
    return this.code === 404;
  }

  /**
   * Check if error is conflict (409)
   */
  isConflict(): boolean {
    return this.code === 409;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(): boolean {
    return this.code >= 500 && this.code < 600;
  }
}

/**
 * Type guard to check if error is JQELError
 */
export function isJQELError(error: unknown): error is JQELError {
  return error instanceof JQELError;
}

/**
 * Parse HTTP Response into JQELError
 * Handles both success and error responses
 */
export async function parseJQELResponse<T>(response: Response): Promise<T[]> {
  const jresult: JResult<T> = await response.json();

  // SPEC-JQEL-RES-003:005: Use code field to determine success/failure
  if (jresult.code >= 400) {
    throw new JQELError(jresult);
  }

  // SPEC-JQEL-RES-013: data is ALWAYS array
  return jresult.data || [];
}
