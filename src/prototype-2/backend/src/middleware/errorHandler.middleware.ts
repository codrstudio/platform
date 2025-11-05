import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

/**
 * Structured error response format
 */
export interface ErrorResponse {
  code: number;
  message: string;
  field?: string;      // Optional: which field caused validation error
  details?: any;       // Optional: additional context (dev only)
  stack?: string;      // Optional: stack trace (dev only)
}

/**
 * Centralized error handling middleware
 *
 * Implements SPEC-ERR-BOUND-001 to SPEC-ERR-BOUND-004:
 * - Catches all errors passed via next(err)
 * - Logs errors with context
 * - Returns structured JSON responses
 * - Hides sensitive details in production
 *
 * IMPORTANT: Must have 4 parameters for Express to recognize as error middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction // Must be present even if unused!
) => {
  // Log error with context
  console.error('\n❌ Error caught by error handler:');
  console.error({
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Determine HTTP status code
  const statusCode = err.statusCode || err.status || 500;

  // Build error response
  const errorResponse: ErrorResponse = {
    code: statusCode,
    message: err.message || 'Internal Server Error',
  };

  // Add optional field if present (validation errors)
  if (err.field) {
    errorResponse.field = err.field;
  }

  // Include additional details only in development
  if (config.nodeEnv === 'development') {
    if (err.details) {
      errorResponse.details = err.details;
    }
    if (err.stack) {
      errorResponse.stack = err.stack;
    }
  }

  // Send JSON error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Must be registered BEFORE the error handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error: any = new Error(`Route not found: ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error);
};
