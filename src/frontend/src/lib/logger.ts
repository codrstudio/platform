/**
 * Sistema de Logging Estruturado
 *
 * Implementa os requisitos SPEC-ERR-LOG-001 a SPEC-ERR-LOG-005
 * - Níveis de log: ERROR, WARN, INFO, DEBUG
 * - Estrutura padronizada com timestamp, categoria, contexto
 * - PII filtering automático
 * - Destinos diferentes para dev vs prod
 */

// SPEC-ERR-LOG-001: Níveis de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// SPEC-ERR-LOG-002: Estrutura de log
export interface LogEntry {
  timestamp: string;           // ISO 8601
  level: LogLevel;
  category: string;            // 'auth', 'jqel', 'sse', 'module', etc
  message: string;             // Descrição legível
  error?: {
    name: string;
    message: string;
    stack?: string;            // Apenas em dev
  };
  context?: {                  // Dados adicionais
    userId?: string;
    portalId?: string;
    moduleId?: string;
    [key: string]: any;
  };
}

// SPEC-ERR-LOG-005: PII patterns para sanitização
const PII_PATTERNS = [
  // Email addresses
  /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  // Phone numbers (various formats)
  /(\+?[\d\s\-\(\)]+){10,}/g,
  // CPF (Brazilian ID)
  /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
  // Credit card numbers
  /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g,
  // Social Security Numbers
  /\d{3}-\d{2}-\d{4}/g,
  // JWT tokens
  /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
  // API keys (common patterns)
  /(api[_\-]?key|apikey|api_secret)[\s]*[:=][\s]*['"]?[a-zA-Z0-9\-_]{20,}['"]?/gi,
  // Passwords in URLs or JSON
  /(password|passwd|pwd|pass)[\s]*[:=][\s]*['"]?[^'"\s]+['"]?/gi,
  // Bearer tokens
  /Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g
];

// SPEC-ERR-LOG-005: Campos sensíveis que devem ser removidos completamente
const SENSITIVE_FIELDS = [
  'password',
  'senha',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'sessionId',
  'session_id',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'cpf'
];

export class Logger {
  private isDevelopment: boolean;
  private category: string;

  private constructor(category: string = 'general') {
    this.category = category;
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  /**
   * Get or create logger instance for category
   */
  public static getInstance(category: string = 'general'): Logger {
    // Create category-specific loggers
    return new Logger(category);
  }

  /**
   * SPEC-ERR-LOG-005: Sanitize sensitive data from any value
   */
  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle strings
    if (typeof value === 'string') {
      let sanitized = value;
      // Apply PII patterns
      PII_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      });
      return sanitized;
    }

    // Handle objects
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(item => this.sanitizeValue(item));
      }

      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Check if key is sensitive
        const lowercaseKey = key.toLowerCase();
        if (SENSITIVE_FIELDS.some(field => lowercaseKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeValue(val);
        }
      }
      return sanitized;
    }

    return value;
  }

  /**
   * Format log entry according to SPEC-ERR-LOG-002
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message: this.sanitizeValue(message)
    };

    // Add error details
    if (error) {
      entry.error = {
        name: error.name,
        message: this.sanitizeValue(error.message),
        // SPEC-ERR-LOG-002: Stack trace apenas em dev
        ...(this.isDevelopment && { stack: error.stack })
      };
    }

    // Add context with sanitization
    if (context) {
      entry.context = this.sanitizeValue(context);
    }

    return entry;
  }

  /**
   * SPEC-ERR-LOG-003 & SPEC-ERR-LOG-004: Output to appropriate destinations
   */
  private output(entry: LogEntry): void {
    const formatted = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`;

    if (this.isDevelopment) {
      // SPEC-ERR-LOG-003: Em desenvolvimento - todos os níveis no console
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(formatted, entry);
          break;
        case LogLevel.WARN:
          console.warn(formatted, entry);
          break;
        case LogLevel.INFO:
          console.info(formatted, entry);
          break;
        case LogLevel.DEBUG:
          console.debug(formatted, entry);
          break;
      }
    } else {
      // SPEC-ERR-LOG-004: Em produção - apenas ERROR e WARN no console
      if (entry.level === LogLevel.ERROR) {
        console.error(formatted, entry.error || {});
        // TODO: Enviar para serviço de monitoramento (Sentry, etc)
        this.sendToMonitoring(entry);
      } else if (entry.level === LogLevel.WARN) {
        console.warn(formatted);
      }
      // INFO e DEBUG são silenciosos em produção
    }
  }

  /**
   * Placeholder para integração futura com serviço de monitoramento
   * SPEC-ERR-LOG-004: Serviço de monitoramento (ERROR apenas)
   */
  private sendToMonitoring(_entry: LogEntry): void {
    // TODO: Integrar com Sentry, DataDog, New Relic, etc
    // Por enquanto, apenas um placeholder
    if (typeof window !== 'undefined' && (window as any).sentryDSN) {
      // Sentry.captureException(entry);
    }
  }

  /**
   * Log methods for each level
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.ERROR, message, error, context);
    this.output(entry);
  }

  public warn(message: string, context?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.WARN, message, undefined, context);
    this.output(entry);
  }

  public info(message: string, context?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.INFO, message, undefined, context);
    this.output(entry);
  }

  public debug(message: string, context?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.DEBUG, message, undefined, context);
    this.output(entry);
  }

  /**
   * Log with custom level
   */
  public log(level: LogLevel, message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.formatLogEntry(level, message, error, context);
    this.output(entry);
  }

  /**
   * Create a child logger with additional context
   */
  public child(additionalContext: Record<string, any>): {
    error: (message: string, error?: Error, context?: Record<string, any>) => void;
    warn: (message: string, context?: Record<string, any>) => void;
    info: (message: string, context?: Record<string, any>) => void;
    debug: (message: string, context?: Record<string, any>) => void;
  } {
    const parentLogger = this;
    return {
      error(message: string, error?: Error, context?: Record<string, any>) {
        parentLogger.error(message, error, { ...additionalContext, ...context });
      },
      warn(message: string, context?: Record<string, any>) {
        parentLogger.warn(message, { ...additionalContext, ...context });
      },
      info(message: string, context?: Record<string, any>) {
        parentLogger.info(message, { ...additionalContext, ...context });
      },
      debug(message: string, context?: Record<string, any>) {
        parentLogger.debug(message, { ...additionalContext, ...context });
      }
    };
  }

  /**
   * Utility to measure and log performance
   */
  public time(label: string): { end: () => void } {
    const start = performance.now();
    const logger = this;

    return {
      end() {
        const duration = performance.now() - start;
        logger.debug(`${label} took ${duration.toFixed(2)}ms`, { duration, label });
      }
    };
  }
}

// Export convenience functions for default logger
const defaultLogger = Logger.getInstance('app');

export const logger = {
  error: defaultLogger.error.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  debug: defaultLogger.debug.bind(defaultLogger),
  time: defaultLogger.time.bind(defaultLogger),
  child: defaultLogger.child.bind(defaultLogger),

  // Factory for category-specific loggers
  getLogger: (category: string) => Logger.getInstance(category)
};

// Category-specific logger exports for common use cases
export const authLogger = Logger.getInstance('auth');
export const jqelLogger = Logger.getInstance('jqel');
export const sseLogger = Logger.getInstance('sse');
export const moduleLogger = Logger.getInstance('module');
export const routerLogger = Logger.getInstance('router');

/**
 * Example usage:
 *
 * // Default logger
 * import { logger } from '@/lib/logger';
 * logger.info('Application started');
 * logger.error('Failed to load', error, { userId: '123' });
 *
 * // Category-specific logger
 * import { authLogger } from '@/lib/logger';
 * authLogger.info('User logged in', { userId: '123' });
 *
 * // Custom category
 * const myLogger = logger.getLogger('custom-feature');
 * myLogger.debug('Processing item', { itemId: '456' });
 *
 * // Performance measurement
 * const timer = logger.time('API call');
 * await fetchData();
 * timer.end();
 *
 * // Child logger with context
 * const requestLogger = logger.child({ requestId: 'abc123' });
 * requestLogger.info('Processing request'); // Will include requestId in context
 */