// Queue Service
// Based on SPEC-queues.md (SPEC-Q-*)
// BullMQ integration for async job processing

import { Queue } from 'bullmq'
import { redisService } from './redis.service.js'

/**
 * File Processing Queue
 * SPEC-Q-AR-002: Mandatory queue for file operations
 * Handles: PDF conversion, image processing, document generation
 */
export const fileProcessingQueue = new Queue('file-processing', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 3, // SPEC-Q-RETRY-004
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs for debugging
  },
})

/**
 * Notifications Queue
 * SPEC-Q-AR-002: Mandatory queue for notification delivery
 * Handles: Email, SMS, push notifications
 */
export const notificationsQueue = new Queue('notifications', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 5, // More attempts for notifications
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s, 8s, 16s
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

/**
 * External API Queue
 * SPEC-Q-AR-002: Mandatory queue for external API calls
 * Handles: Third-party integrations, webhooks, API calls
 */
export const externalApiQueue = new Queue('external-api', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 10, // Many attempts for unreliable external APIs
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 10s, 20s, 40s, 80s, ...
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

/**
 * Scheduled Queue
 * SPEC-Q-AR-002: Mandatory queue for scheduled/delayed jobs
 * Handles: Cron jobs, delayed tasks, scheduled reports
 */
export const scheduledQueue = new Queue('scheduled', {
  connection: redisService.getClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

console.log('[Queue Service] Queues initialized')
