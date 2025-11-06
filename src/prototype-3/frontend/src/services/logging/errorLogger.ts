/**
 * Error Logging Service
 *
 * Centralized error logging with structured log format and environment-aware behavior.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-LOG-*, SPEC-ERR-DEV-*, SPEC-ERR-PROD-*)
 */

/**
 * Log levels
 * SPEC-ERR-LOG-001: Platform MUST use log levels
 */
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

/**
 * Log entry structure
 * SPEC-ERR-LOG-002: Logs MUST include specific fields
 */
export interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: LogLevel;
  category: string;       // 'auth', 'jqel', 'sse', 'module', etc.
  message: string;        // Human-readable description
  error?: {
    name: string;
    message: string;
    stack?: string;       // Only in development
  };
  context?: {             // Additional data
    userId?: string;
    portalId?: string;
    moduleId?: string;
    [key: string]: any;
  };
}

/**
 * Error logging options
 */
export interface LogErrorOptions {
  category: string;
  context?: Record<string, any>;
  logLevel?: LogLevel;
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if running in production mode
 */
function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Sanitize context to remove sensitive data
 * SPEC-ERR-LOG-005: Logs MUST NOT include sensitive data
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sensitive = ['password', 'token', 'secret', 'key', 'authorization', 'credentials'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    // Check if key contains sensitive words
    const isSensitive = sensitive.some((s) => key.toLowerCase().includes(s));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  category: string,
  error?: Error,
  context?: Record<string, any>
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
  };

  // Add error details if provided
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      // SPEC-ERR-DEV-001 vs SPEC-ERR-PROD-001: Stack only in dev
      ...(isDevelopment() && { stack: error.stack }),
    };
  }

  // Add sanitized context if provided
  if (context && Object.keys(context).length > 0) {
    entry.context = sanitizeContext(context);
  }

  return entry;
}

/**
 * Format log entry for console output
 */
function formatLogForConsole(entry: LogEntry): string[] {
  const emoji = {
    ERROR: '❌',
    WARN: '⚠️',
    INFO: 'ℹ️',
    DEBUG: '🐛',
  };

  const color = {
    ERROR: 'color: #dc2626; font-weight: bold;',
    WARN: 'color: #ea580c; font-weight: bold;',
    INFO: 'color: #2563eb;',
    DEBUG: 'color: #64748b;',
  };

  const header = `%c${emoji[entry.level]} [${entry.level}] ${entry.category}`;
  const time = `%c${new Date(entry.timestamp).toLocaleTimeString()}`;

  return [
    `${header} ${time}`,
    color[entry.level],
    'color: #64748b; font-size: 0.9em;',
  ];
}

/**
 * Write log entry to console
 * SPEC-ERR-LOG-003: In development - all levels to console
 * SPEC-ERR-LOG-004: In production - only ERROR and WARN to console
 */
function writeToConsole(entry: LogEntry): void {
  // SPEC-ERR-DEV-002: Detailed logs in development
  if (isDevelopment()) {
    console.group(...formatLogForConsole(entry));
    console.log('Message:', entry.message);
    if (entry.error) {
      console.error('Error:', entry.error.message);
      if (entry.error.stack) {
        console.log('Stack:', entry.error.stack);
      }
    }
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    console.groupEnd();
    return;
  }

  // SPEC-ERR-PROD-002: Only ERROR and WARN in production
  if (isProduction() && (entry.level === 'ERROR' || entry.level === 'WARN')) {
    const [format, ...styles] = formatLogForConsole(entry);
    console.log(format, ...styles);
    console.log(entry.message);
    if (entry.error) {
      console.error(entry.error.message);
    }
  }
}

/**
 * Send log to external monitoring service (future implementation)
 * SPEC-ERR-LOG-004: In production - ERROR to monitoring service
 * SPEC-ERR-PROD-004: Errors MUST be sent to monitoring
 */
async function sendToMonitoring(entry: LogEntry): Promise<void> {
  // Only send ERROR logs in production
  if (!isProduction() || entry.level !== 'ERROR') {
    return;
  }

  // TODO: Implement integration with monitoring service (e.g., Sentry, Datadog)
  // For now, this is a placeholder
  try {
    // Example: await fetch('/api/monitoring/log', { method: 'POST', body: JSON.stringify(entry) });
    console.log('[Monitoring] Would send to external service:', entry);
  } catch (err) {
    // Silently fail - don't want logging to break the app
    console.error('[Monitoring] Failed to send log:', err);
  }
}

/**
 * Main logging function
 */
function log(
  level: LogLevel,
  message: string,
  category: string,
  error?: Error,
  context?: Record<string, any>
): void {
  const entry = createLogEntry(level, message, category, error, context);

  // Write to console
  writeToConsole(entry);

  // Send to monitoring (async, non-blocking)
  sendToMonitoring(entry).catch(() => {
    // Silently fail
  });
}

/**
 * Log an ERROR
 * SPEC-ERR-LOG-001: ERROR level for errors that impact functionality
 */
export function logError(error: Error, options: LogErrorOptions): void {
  log(
    options.logLevel || 'ERROR',
    error.message || 'An error occurred',
    options.category,
    error,
    options.context
  );
}

/**
 * Log a WARNING
 * SPEC-ERR-LOG-001: WARN level for abnormal but not critical situations
 */
export function logWarn(message: string, category: string, context?: Record<string, any>): void {
  log('WARN', message, category, undefined, context);
}

/**
 * Log an INFO message
 * SPEC-ERR-LOG-001: INFO level for important events
 */
export function logInfo(message: string, category: string, context?: Record<string, any>): void {
  log('INFO', message, category, undefined, context);
}

/**
 * Log a DEBUG message
 * SPEC-ERR-LOG-001: DEBUG level for detailed information (dev only)
 */
export function logDebug(message: string, category: string, context?: Record<string, any>): void {
  // Only log debug in development
  if (isDevelopment()) {
    log('DEBUG', message, category, undefined, context);
  }
}

/**
 * Create a category-specific logger
 * Useful for modules to have their own logger instance
 */
export function createLogger(category: string) {
  return {
    error: (error: Error, context?: Record<string, any>) =>
      logError(error, { category, context }),
    warn: (message: string, context?: Record<string, any>) => logWarn(message, category, context),
    info: (message: string, context?: Record<string, any>) => logInfo(message, category, context),
    debug: (message: string, context?: Record<string, any>) =>
      logDebug(message, category, context),
  };
}
