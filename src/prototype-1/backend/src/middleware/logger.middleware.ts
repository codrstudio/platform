/**
 * Logger Middleware
 * Request logging using Winston
 * SPEC-A-L-015: Backend control operations
 */

import winston from 'winston';
import type { Request, Response, NextFunction } from 'express';

/**
 * Winston Logger Configuration
 * Logs to console and optionally to files
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'platform-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Routes to exclude from logging (too noisy)
 */
const EXCLUDED_ROUTES = [
  '/health',
  '/health/live',
  '/health/ready',
  '/favicon.ico',
];

/**
 * Check if route should be excluded from logging
 */
function shouldExclude(path: string): boolean {
  return EXCLUDED_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Request Logger Middleware
 * Logs all HTTP requests with method, path, status, duration
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip excluded routes
  if (shouldExclude(req.path)) {
    return next();
  }

  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Hook into response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, 'Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  next();
}

/**
 * Error Logger
 * Logs errors with full stack traces
 */
export function logError(error: Error, context?: Record<string, any>): void {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Stream for Morgan integration (if needed)
 */
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
