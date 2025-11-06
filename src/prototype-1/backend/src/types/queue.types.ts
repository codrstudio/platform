/**
 * Queue System Types
 *
 * Type definitions for BullMQ job system
 *
 * SPEC References:
 * - SPEC-Q-JOB-002: Job structure
 * - SPEC-Q-JOB-005: Job status
 * - SPEC-Q-JOB-007: Job query response
 */

/**
 * Job Status
 *
 * SPEC-Q-JOB-005: Job status states
 */
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

/**
 * Job Priority Levels
 *
 * SPEC-Q-PRIO-003: Priority levels
 * - 1-3: Low priority (reports, cleanup)
 * - 4-6: Normal (general processing)
 * - 7-8: High (user requests)
 * - 9-10: Urgent (critical, security)
 */
export type JobPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Job Options
 *
 * SPEC-Q-JOB-002: Job configuration options
 */
export interface JobOptions {
  /**
   * Job priority (1-10, higher = more important)
   * SPEC-Q-PRIO-001: Jobs PODEM ter prioridade 1-10
   * SPEC-Q-PRIO-002: Prioridade padrão: 5 (normal)
   */
  priority?: JobPriority;

  /**
   * Delay in milliseconds before processing
   * SPEC-Q-SCHED-001: Jobs PODEM ser agendados para futuro via delay (ms)
   */
  delay?: number;

  /**
   * Maximum number of retry attempts
   * SPEC-ERR-JOB-RETRY-003: Max tentativas configurável (padrão: 3-10)
   */
  attempts?: number;

  /**
   * Backoff strategy for retries
   * SPEC-ERR-JOB-RETRY-002: Backoff exponencial DEVE ser padrão
   */
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number; // milliseconds
  };

  /**
   * Cron pattern for repeating jobs
   * SPEC-Q-SCHED-004: Filas PODEM ter jobs recorrentes (cron pattern)
   * SPEC-Q-SCHED-005: Cron jobs DEVEM usar sintaxe cron padrão
   */
  repeat?: {
    cron: string; // e.g., '0 2 * * *' for daily at 2am
  };
}

/**
 * Job Data Structure
 *
 * SPEC-Q-JOB-002: Job DEVE incluir name, data, options
 */
export interface JobData<T = any> {
  /**
   * Job name/type identifier
   */
  name: string;

  /**
   * Job payload data
   */
  data: T;

  /**
   * Job configuration options
   */
  options?: JobOptions;
}

/**
 * Job Query Response
 *
 * SPEC-Q-JOB-007: Response format for GET /api/jobs/:jobId
 */
export interface JobQueryResponse<T = any> {
  /**
   * Job ID (UUID)
   */
  id: string;

  /**
   * Current job status
   * SPEC-Q-JOB-005: Status states
   */
  state: JobStatus;

  /**
   * Job progress (0-100)
   * SPEC-Q-JOB-009: Progresso DEVE ser 0-100
   */
  progress: number;

  /**
   * Original job data
   */
  data: T;

  /**
   * Job result (if completed)
   */
  returnvalue?: any;

  /**
   * Failure reason (if failed)
   */
  failedReason?: string;

  /**
   * Number of attempts made
   */
  attemptsMade: number;

  /**
   * Job creation timestamp (ISO 8601)
   */
  timestamp: string;
}

/**
 * Job Creation Request Body
 *
 * POST /api/jobs/:queueName
 */
export interface CreateJobRequest<T = any> {
  /**
   * Job name/type
   */
  name: string;

  /**
   * Job data payload
   */
  data: T;

  /**
   * Optional job configuration
   */
  options?: JobOptions;
}

/**
 * Job Creation Response
 *
 * SPEC-Q-JOB-003: API DEVE retornar jobId imediatamente
 */
export interface CreateJobResponse {
  /**
   * Created job ID
   */
  jobId: string;
}

// --- Queue-Specific Job Data Types ---

/**
 * File Processing Job Data
 *
 * Used by 'file-processing' queue
 */
export interface FileProcessingJobData {
  fileId: string;
  fileUrl: string;
  userId: string;
  operation: 'thumbnail' | 'compress' | 'convert';
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  };
}

/**
 * Notification Job Data
 *
 * Used by 'notifications' queue
 */
export interface NotificationJobData {
  userId: string;
  type: 'email' | 'push' | 'sms';
  template?: string;
  data: {
    subject?: string;
    body: string;
    to?: string;
    [key: string]: any;
  };
}

/**
 * External API Job Data
 *
 * Used by 'external-api' queue
 */
export interface ExternalApiJobData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  userId?: string;
  callbackUrl?: string; // Webhook URL to call when complete
}

/**
 * Scheduled Task Job Data
 *
 * Used by 'scheduled' queue
 */
export interface ScheduledTaskJobData {
  taskType: 'cleanup' | 'backup' | 'report' | 'maintenance';
  params?: Record<string, any>;
}
