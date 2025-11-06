/**
 * Logger Types
 * Type definitions for Winston logging system
 * Based on SPEC-EH-LO-001:018
 */

/**
 * Log level hierarchy (RFC 5424 - Syslog severity levels)
 * Based on SPEC-EH-LO-011:014
 *
 * ERROR - Errors that impact functionality
 * WARN  - Abnormal situations but not critical
 * INFO  - Important events (login, logout, startup)
 * HTTP  - HTTP request logging (automatic)
 * DEBUG - Detailed debugging information (dev only)
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

/**
 * Structured context for log entries
 * Based on SPEC-EH-LO-015:018
 */
export interface LogContext {
  // User context
  userId?: string;
  username?: string;
  realm?: string;

  // Request context
  method?: string;
  url?: string;
  ip?: string;
  statusCode?: number;

  // Error context
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string | number;
  };

  // Service context
  service?: string;
  category?: string;

  // Technical context
  duration?: number;
  timestamp?: string;

  // Custom fields
  [key: string]: any;
}

/**
 * Structured log entry format
 * Based on SPEC-EH-LO-015:018
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

/**
 * Options for sanitizing sensitive data
 * Based on SPEC-EH-LO-005
 */
export interface SanitizeOptions {
  /**
   * Field names to redact completely
   */
  redactFields?: string[];

  /**
   * Whether to redact stack traces in production
   * @default true
   */
  redactStackInProd?: boolean;
}
