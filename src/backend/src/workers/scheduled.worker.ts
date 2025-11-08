// Scheduled Worker
// Based on SPEC-queues.md
// Processes scheduled/delayed jobs and cron tasks

import { Worker } from 'bullmq'
import { redisService } from '../services/redis.service.js'

/**
 * Scheduled Worker
 * Handles cron jobs, delayed tasks, scheduled reports
 */
const worker = new Worker(
  'scheduled',
  async (job) => {
    console.log(`[Scheduled] Processing job ${job.id}:`, job.data)

    const { task, scheduledFor } = job.data

    // Simulate scheduled task execution
    await job.updateProgress(50)
    console.log(`[Scheduled] Executing task: ${task}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await job.updateProgress(100)
    console.log(`[Scheduled] Task completed`)

    return {
      success: true,
      task,
      scheduledFor,
      executedAt: new Date().toISOString(),
    }
  },
  {
    connection: redisService.getClient(),
    concurrency: 5, // Moderate concurrency for scheduled tasks
  }
)

worker.on('completed', (job) => {
  console.log(`[Scheduled] Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`[Scheduled] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[Scheduled] Worker error:', err)
})

console.log('[Scheduled] Worker started (concurrency: 5)')
