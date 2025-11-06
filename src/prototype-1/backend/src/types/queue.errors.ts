/**
 * Queue Error Types
 *
 * Custom error classes for queue/job operations
 *
 * SPEC References:
 * - SPEC-ERR-QUEUE-001 to SPEC-ERR-QUEUE-004: Queue error types
 * - SPEC-ERR-JOB-RETRY-001 to SPEC-ERR-JOB-RETRY-007: Retry strategies
 */

/**
 * Base Queue Error
 *
 * All queue-related errors extend this class
 */
export class QueueError extends Error {
  constructor(message: string, public readonly jobId?: string) {
    super(message);
    this.name = 'QueueError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Queue Timeout Error
 *
 * SPEC-ERR-QUEUE-001: Job timeout
 * - Timeout padrão: Configurável por fila (ex: 10min)
 * - Mensagem ao usuário: "Processamento demorou demais."
 * - Ação sugerida: Retry automático conforme configuração
 */
export class QueueTimeoutError extends QueueError {
  constructor(jobId: string, timeout: number) {
    super(`Job ${jobId} timed out after ${timeout}ms`, jobId);
    this.name = 'QueueTimeoutError';
  }
}

/**
 * Job Validation Error
 *
 * SPEC-ERR-QUEUE-004: Dados de job inválidos
 * - Mensagem ao usuário: "Dados inválidos para processamento."
 * - Ação sugerida: Não fazer retry, mover para failed
 */
export class JobValidationError extends QueueError {
  constructor(jobId: string, message: string, public readonly validationErrors?: any[]) {
    super(`Job ${jobId} validation failed: ${message}`, jobId);
    this.name = 'JobValidationError';
  }
}

/**
 * Job Dependency Error
 *
 * SPEC-ERR-QUEUE-003: Dependência externa indisponível
 * - Mensagem ao usuário: "Serviço temporariamente indisponível."
 * - Ação sugerida: Retry com backoff exponencial
 */
export class JobDependencyError extends QueueError {
  constructor(
    jobId: string,
    public readonly service: string,
    public readonly statusCode?: number,
  ) {
    super(`Job ${jobId} failed due to unavailable service: ${service}`, jobId);
    this.name = 'JobDependencyError';
  }
}

/**
 * Job Max Attempts Exceeded Error
 *
 * SPEC-ERR-QUEUE-002: Job falha após múltiplas tentativas
 * - Mensagem ao usuário: "Não foi possível processar. Tente novamente mais tarde."
 * - Ação sugerida: Job move para failed queue (análise manual)
 */
export class JobMaxAttemptsError extends QueueError {
  constructor(
    jobId: string,
    public readonly attempts: number,
    public readonly lastError?: Error,
  ) {
    super(`Job ${jobId} failed after ${attempts} attempts`, jobId);
    this.name = 'JobMaxAttemptsError';
    if (lastError) {
      this.stack = `${this.stack}\nCaused by: ${lastError.stack}`;
    }
  }
}

/**
 * Queue Not Found Error
 *
 * Thrown when trying to access a non-existent queue
 */
export class QueueNotFoundError extends QueueError {
  constructor(public readonly queueName: string) {
    super(`Queue '${queueName}' not found`);
    this.name = 'QueueNotFoundError';
  }
}

/**
 * Job Not Found Error
 *
 * Thrown when trying to access a non-existent job
 */
export class JobNotFoundError extends QueueError {
  constructor(jobId: string) {
    super(`Job '${jobId}' not found`, jobId);
    this.name = 'JobNotFoundError';
  }
}

/**
 * Determine if an error should trigger retry
 *
 * SPEC-ERR-JOB-RETRY-004 to SPEC-ERR-JOB-RETRY-006:
 * - Jobs com dados inválidos NÃO DEVEM ter retry
 * - Jobs com erro 4xx de API externa NÃO DEVEM ter retry
 * - Jobs com erro 5xx de API externa DEVEM ter retry
 *
 * @param error - Error instance
 * @returns true if job should be retried
 */
export function shouldRetryJob(error: Error): boolean {
  // Don't retry validation errors (SPEC-ERR-JOB-RETRY-004)
  if (error instanceof JobValidationError) {
    return false;
  }

  // Don't retry 4xx errors from external services (SPEC-ERR-JOB-RETRY-005)
  if (error instanceof JobDependencyError) {
    const statusCode = error.statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return false;
    }
  }

  // Retry 5xx errors (SPEC-ERR-JOB-RETRY-006)
  if (error instanceof JobDependencyError) {
    const statusCode = error.statusCode;
    if (statusCode && statusCode >= 500 && statusCode < 600) {
      return true;
    }
  }

  // Retry timeouts and other transient errors
  if (error instanceof QueueTimeoutError) {
    return true;
  }

  // Default: retry unknown errors
  return true;
}

/**
 * Get user-friendly error message
 *
 * Translates technical errors to user-friendly messages per SPEC-ERR-QUEUE-001 to 004
 *
 * @param error - Error instance
 * @returns User-friendly message
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  if (error instanceof QueueTimeoutError) {
    return 'Processamento demorou demais.'; // SPEC-ERR-QUEUE-001
  }

  if (error instanceof JobMaxAttemptsError) {
    return 'Não foi possível processar. Tente novamente mais tarde.'; // SPEC-ERR-QUEUE-002
  }

  if (error instanceof JobDependencyError) {
    return 'Serviço temporariamente indisponível.'; // SPEC-ERR-QUEUE-003
  }

  if (error instanceof JobValidationError) {
    return 'Dados inválidos para processamento.'; // SPEC-ERR-QUEUE-004
  }

  if (error instanceof QueueNotFoundError) {
    return 'Fila não encontrada.';
  }

  if (error instanceof JobNotFoundError) {
    return 'Job não encontrado.';
  }

  // Generic queue error
  if (error instanceof QueueError) {
    return 'Erro no processamento da fila.';
  }

  // Unknown error
  return 'Erro inesperado no processamento.';
}
