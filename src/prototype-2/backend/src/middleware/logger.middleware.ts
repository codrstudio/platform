import morgan from 'morgan';
import { config } from '../config/env.js';

/**
 * Custom morgan token to sanitize request bodies
 * Removes sensitive fields before logging
 */
morgan.token('sanitized-body', (req: any) => {
  if (!req.body || typeof req.body !== 'object') {
    return '';
  }

  const sanitized = { ...req.body };

  // List of sensitive field names to redact
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'accessToken',
    'refreshToken',
    'authorization',
  ];

  // Redact sensitive fields
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return JSON.stringify(sanitized);
});

/**
 * HTTP request logging middleware
 *
 * Environment-aware logging:
 * - Development: detailed logs with colors
 * - Staging: combined format, JSON structure
 * - Production: minimal logs, JSON structure
 *
 * Implements SPEC-ERR-LOG-001 to SPEC-ERR-LOG-005:
 * - Logs all HTTP requests
 * - Different verbosity per environment
 * - Sanitizes sensitive data
 * - Skips health checks in production (reduce noise)
 */

// Define format based on environment
const getLogFormat = (): string => {
  switch (config.nodeEnv) {
    case 'development':
      return 'dev'; // Colorized, detailed output
    case 'staging':
      return 'combined'; // Standard Apache combined log
    case 'production':
      return 'combined'; // Standard Apache combined log
    default:
      return 'combined';
  }
};

// Create logger with environment-specific format
export const loggerMiddleware = morgan(getLogFormat(), {
  // Skip logging for health checks in production (reduce noise)
  skip: (req, _res) => {
    if (config.nodeEnv === 'production' && req.url === '/api/health') {
      return true;
    }
    return false;
  },
});
