/**
 * Queue System - BullMQ Integration
 *
 * Defines all platform queues according to SPEC-queues.md
 *
 * SPEC References:
 * - SPEC-A-Q-001 to SPEC-A-Q-014: Queue System requirements
 * - SPEC-Q-AR-001 to SPEC-Q-AR-009: Queue architecture
 * - SPEC-Q-JOB-001 to SPEC-Q-JOB-012: Job management
 */

import { Queue, QueueOptions } from 'bullmq';

// Redis connection configuration (reuses existing Redis instance)
// SPEC-A-S-023: BullMQ DEVE usar mesma infraestrutura Redis
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required for BullMQ
};

// Default queue options per SPEC-Q-RETRY-001 to SPEC-Q-RETRY-007
const defaultJobOptions = {
  attempts: 3, // SPEC-ERR-JOB-RETRY-003: Max tentativas configurável (padrão: 3-10)
  backoff: {
    type: 'exponential' as const,
    delay: 2000, // SPEC-ERR-JOB-RETRY-002: Backoff exponencial (2s, 4s, 8s...)
  },
  removeOnComplete: 100, // SPEC-A-Q-006: Jobs completados retidos por 100 execuções
  removeOnFail: 500,     // SPEC-A-Q-007: Jobs falhados retidos por 500 execuções
};

// SPEC-Q-AR-002: Filas obrigatórias
export const queues = {
  /**
   * File Processing Queue
   *
   * SPEC-Q-AR-002: Processamento de uploads/arquivos
   * Use cases: thumbnail generation, image compression, file conversion
   *
   * Config:
   * - Attempts: 3 (reasonable for file operations)
   * - Concurrency: 5 jobs (configured in worker)
   * - Backoff: 2s exponential
   */
  fileProcessing: new Queue('file-processing', {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  }),

  /**
   * Notifications Queue
   *
   * SPEC-Q-AR-002: Envio de emails e notificações
   * Use cases: email sending, push notifications, SMS
   *
   * Config:
   * - Attempts: 5 (email delivery can be flaky)
   * - Concurrency: 10 jobs (configured in worker)
   * - Backoff: 1s exponential (faster retry for notifications)
   */
  notifications: new Queue('notifications', {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 5, // SPEC-Q-RETRY-005: Notifications get more retries
      backoff: { type: 'exponential', delay: 1000 },
    },
  }),

  /**
   * External API Queue
   *
   * SPEC-Q-AR-002: Integração com APIs externas
   * Use cases: webhooks, third-party API calls, data synchronization
   *
   * Config:
   * - Attempts: 10 (external services can be unreliable)
   * - Concurrency: 3 jobs (rate limiting consideration)
   * - Backoff: 5s exponential (longer delay for external services)
   */
  externalApi: new Queue('external-api', {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 10, // SPEC-Q-RETRY-005: External APIs get more retries
      backoff: { type: 'exponential', delay: 5000 },
    },
  }),

  /**
   * Scheduled Tasks Queue
   *
   * SPEC-Q-AR-002: Tarefas agendadas (cron)
   * Use cases: cleanup jobs, backups, reports, maintenance
   *
   * Config:
   * - Attempts: 3 (scheduled tasks usually don't need many retries)
   * - Concurrency: 2 jobs (configured in worker)
   * - Backoff: 2s exponential
   * - Supports: Delayed jobs and cron patterns (SPEC-Q-SCHED-001 to 007)
   */
  scheduled: new Queue('scheduled', {
    connection: redisConnection,
    defaultJobOptions,
  }),
} as const;

// Export queue names for type safety
export type QueueName = keyof typeof queues;

// Export queue instance type
export type PlatformQueue = typeof queues[QueueName];

/**
 * Get queue by name
 *
 * SPEC-Q-AR-004: Naming convention kebab-case
 *
 * @param name - Queue name (kebab-case)
 * @returns Queue instance or undefined
 */
export function getQueue(name: string): PlatformQueue | undefined {
  return queues[name as QueueName];
}

/**
 * Get all queue names
 *
 * @returns Array of queue names
 */
export function getQueueNames(): QueueName[] {
  return Object.keys(queues) as QueueName[];
}

/**
 * Close all queues gracefully
 *
 * Called during server shutdown to ensure all jobs are properly saved
 */
export async function closeQueues(): Promise<void> {
  const closePromises = Object.values(queues).map(queue => queue.close());
  await Promise.all(closePromises);
}

// Log queue initialization
console.log(`✅ BullMQ Queues initialized: ${getQueueNames().join(', ')}`);
