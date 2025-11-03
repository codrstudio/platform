/**
 * Global Error Handler Middleware
 * Catches all errors and maps them to JResult format
 * SPEC-A-L-012: Backend validation
 */

import type { Request, Response, NextFunction } from 'express';
import type { JResult } from '../types/jresult.types.js';

/**
 * HTTP Error Class
 * Structured error with HTTP status code
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation Error Class
 * For request validation errors
 */
export class ValidationError extends HttpError {
  constructor(message: string, field?: string) {
    super(400, 'validation_error', message, field);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error Class
 * For auth-related errors
 */
export class AuthenticationError extends HttpError {
  constructor(message: string = 'Authentication required') {
    super(401, 'authentication_required', message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error Class
 * For permission-related errors
 */
export class AuthorizationError extends HttpError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'forbidden', message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error Class
 * For resource not found errors
 */
export class NotFoundError extends HttpError {
  constructor(resource: string = 'Resource') {
    super(404, 'not_found', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them as JResult
 */
export function errorHandler(
  err: Error | HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Note: Winston logger should be imported if available
  // For now, using console.error (will be replaced when logger middleware is imported)
  console.error('[Error Handler]', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code and error code
  let statusCode = 500;
  let message = 'An internal server error occurred';
  let field: string | undefined;

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    field = err.field;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.message) {
    message = err.message;
  }

  // Build JResult response
  const result: JResult = {
    code: statusCode,
    message,
    ...(field && { field }),
  };

  res.status(statusCode).json(result);
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
export function notFoundHandler(_req: Request, res: Response): void {
  const result: JResult = {
    code: 404,
    message: 'Endpoint not found',
  };

  res.status(404).json(result);
}
