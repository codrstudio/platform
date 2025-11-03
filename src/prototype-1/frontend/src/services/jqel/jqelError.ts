/**
 * JQEL Error Class
 * Custom error for JQEL query failures
 * SPEC-DA-W-009 to SPEC-DA-W-011
 */

import type { JResult } from './types';

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

    // Maintain proper stack trace (only in V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, JQELError);
    }
  }

  /**
   * Format error for display
   */
  toString(): string {
    if (this.field) {
      return `JQELError [${this.code}] ${this.field}: ${this.message}`;
    }
    return `JQELError [${this.code}]: ${this.message}`;
  }

  /**
   * Check if error is specific code
   */
  isCode(code: number): boolean {
    return this.code === code;
  }

  /**
   * Check if error is validation error
   */
  isValidationError(): boolean {
    return this.code === 400 && !!this.jresult.errors;
  }

  /**
   * Check if error is authentication error
   */
  isAuthError(): boolean {
    return this.code === 401;
  }

  /**
   * Check if error is permission error
   */
  isPermissionError(): boolean {
    return this.code === 403;
  }

  /**
   * Check if error is not found error
   */
  isNotFoundError(): boolean {
    return this.code === 404;
  }
}
