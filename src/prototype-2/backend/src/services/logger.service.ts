/**
 * Logger Service - Winston-based structured logging
 * Based on SPEC-EH-LO-001:018
 *
 * Implements:
 * - SPEC-EH-LO-001:010 - Winston configuration with multiple transports
 * - SPEC-EH-LO-011:014 - Log levels (ERROR, WARN, INFO, DEBUG)
 * - SPEC-EH-LO-015:018 - Structured logging with context
 * - SPEC-EH-LO-005 - Sensitive data protection
 */

import winston from 'winston';
import { config } from '../config/env.js';
import type { LogContext, SanitizeOptions } from '../types/logger.types.js';

/**
 * Default sensitive field names (case-insensitive)
 * Based on SPEC-EH-LO-005
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'jwt',
  'refreshtoken',
  'refresh_token',
  'accesstoken',
  'access_token',
  'sessiontoken',
  'session_token',
  'privatekey',
  'private_key',
  'credential',
  'credentials',
];

/**
 * Check if field name indicates sensitive data
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some((sensitive) => lowerName.includes(sensitive));
}

/**
 * Sanitize context object by removing/masking sensitive fields
 * Based on SPEC-EH-LO-005
 *
 * @param context - Context object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized context object
 */
function sanitizeContext(
  context: Record<string, any>,
  options?: SanitizeOptions
): Record<string, any> {
  const { redactFields = [], redactStackInProd = true } = options || {};

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    // Check if field should be completely redacted
    if (isSensitiveField(key) || redactFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Redact stack traces in production if configured
    if (
      redactStackInProd &&
      config.nodeEnv === 'production' &&
      (key === 'stack' || key.toLowerCase().includes('stack'))
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Handle nested objects (recursive sanitization)
    if (typeof value === 'object' && !Array.isArray(value)) {
      try {
        sanitized[key] = sanitizeContext(value, options);
      } catch (error) {
        // Handle circular references
        sanitized[key] = '[CIRCULAR]';
      }
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeContext(item, options)
          : item
      );
      continue;
    }

    // Keep non-sensitive values as-is
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Determine log level based on environment
 * Based on SPEC-EH-LO-011:014
 *
 * - development: 'debug' (all logs)
 * - staging: 'info' (INFO and above)
 * - production: 'info' (INFO and above)
 */
function getLogLevel(): string {
  switch (config.nodeEnv) {
    case 'development':
      return 'debug';
    case 'staging':
    case 'production':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Create Winston logger instance
 * Based on SPEC-EH-LO-001:010
 */
function createLogger(): winston.Logger {
  // Custom log levels (npm standard)
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  // Colors for console output (development only)
  const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  };

  winston.addColors(colors);

  // Custom format for console output
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.nodeEnv === 'development'
      ? winston.format.colorize({ all: true })
      : winston.format.uncolorize(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      }
    )
  );

  // JSON format for file output
  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  // Create transports
  const transports: winston.transport[] = [
    // Console transport - colored in dev, plain in prod
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file - ERROR level only
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file - all levels
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ];

  // Create logger
  const logger = winston.createLogger({
    level: getLogLevel(),
    levels,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.metadata(),
      winston.format.json()
    ),
    transports,
    exitOnError: false, // Don't exit on handled exceptions
  });

  return logger;
}

/**
 * Winston logger instance
 * Based on SPEC-EH-LO-001:018
 */
let loggerInstance: winston.Logger;

try {
  loggerInstance = createLogger();
} catch (error) {
  // Fallback to console if Winston fails
  console.error('❌ Failed to initialize Winston logger:', error);
  console.warn('⚠️  Falling back to console logging');

  // Create fallback logger interface
  loggerInstance = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.log.bind(console),
    http: console.log.bind(console),
    debug: console.log.bind(console),
    log: console.log.bind(console),
  } as any;
}

/**
 * Enhanced logger with structured logging helpers
 * Based on SPEC-EH-LO-015:018
 */
export const logger = {
  /**
   * Log error message
   * @param message - Error message
   * @param context - Optional context metadata
   */
  error(message: string, context?: LogContext): void {
    const sanitized = context ? sanitizeContext(context) : {};
    loggerInstance.error(message, sanitized);
  },

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Optional context metadata
   */
  warn(message: string, context?: LogContext): void {
    const sanitized = context ? sanitizeContext(context) : {};
    loggerInstance.warn(message, sanitized);
  },

  /**
   * Log info message
   * @param message - Info message
   * @param context - Optional context metadata
   */
  info(message: string, context?: LogContext): void {
    const sanitized = context ? sanitizeContext(context) : {};
    loggerInstance.info(message, sanitized);
  },

  /**
   * Log HTTP request (automatic via middleware)
   * @param message - HTTP message
   * @param context - Optional context metadata
   */
  http(message: string, context?: LogContext): void {
    const sanitized = context ? sanitizeContext(context) : {};
    loggerInstance.http(message, sanitized);
  },

  /**
   * Log debug message (development only)
   * @param message - Debug message
   * @param context - Optional context metadata
   */
  debug(message: string, context?: LogContext): void {
    const sanitized = context ? sanitizeContext(context) : {};
    loggerInstance.debug(message, sanitized);
  },
};

// Export sanitization utility for external use
export { sanitizeContext };
