import type { LogErrorOptions } from '../../types/errorBoundary';

/**
 * Structured error log entry
 */
interface ErrorLogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  category: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
}

/**
 * Log error with structured data
 * Based on SPEC-DA-ERR-008
 *
 * @param error - Error object to log
 * @param options - Logging options
 *
 * @example
 * logError(new Error('Query failed'), {
 *   category: 'jqel-query',
 *   level: 'ERROR',
 *   context: { queryKey: 'portal:main' }
 * });
 */
export function logError(error: Error, options: LogErrorOptions): void {
  const { category, level = 'ERROR', context = {} } = options;

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message: error.message,
    error: {
      name: error.name,
      message: error.message,
      ...(import.meta.env.DEV && { stack: error.stack })
    },
    context
  };

  // Console output (always in dev, only ERROR/WARN in prod)
  if (import.meta.env.DEV || level === 'ERROR' || level === 'WARN') {
    console.error(`[${level}] ${category}:`, logEntry);
  }

  // TODO: Send to monitoring service in production
  // if (!import.meta.env.DEV && level === 'ERROR') {
  //   sendToMonitoring(logEntry);
  // }
}

/**
 * Log warning message
 *
 * @param message - Warning message
 * @param category - Category for grouping
 * @param context - Additional context data
 */
export function logWarning(message: string, category: string, context?: Record<string, any>): void {
  console.warn(`[WARN] ${category}:`, { message, context });
}

/**
 * Log info message (development only)
 *
 * @param message - Info message
 * @param category - Category for grouping
 * @param context - Additional context data
 */
export function logInfo(message: string, category: string, context?: Record<string, any>): void {
  if (import.meta.env.DEV) {
    console.info(`[INFO] ${category}:`, { message, context });
  }
}
