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

// Development format: detailed with colors
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format: minimal, structured
const prodFormat = ':remote-addr :method :url :status :response-time ms';

/**
 * HTTP request logging middleware
 *
 * Implements SPEC-ERR-LOG-001 to SPEC-ERR-LOG-005:
 * - Logs all HTTP requests
 * - Different verbosity per environment
 * - Sanitizes sensitive data
 * - Skips health checks in production (reduce noise)
 */
export const loggerMiddleware = morgan(
  config.nodeEnv === 'production' ? prodFormat : devFormat,
  {
    skip: (req) => {
      // Skip health check logs in production to reduce noise
      if (config.nodeEnv === 'production' && req.url === '/api/health') {
        return true;
      }
      return false;
    },
  }
);
