// Notifications Worker
// Based on SPEC-queues.md
// Processes notification delivery jobs (email, SMS, push)

import { Worker } from 'bullmq'
import { redisService } from '../services/redis.service.js'

/**
 * Notifications Worker
 * Handles email, SMS, push notification delivery
 */
const worker = new Worker(
  'notifications',
  async (job) => {
    console.log(`[Notifications] Processing job ${job.id}:`, job.data)

    const { type, recipient } = job.data

    // Simulate notification delivery
    await job.updateProgress(50)
    console.log(`[Notifications] Sending ${type} to ${recipient}`)
    await new Promise((resolve) => setTimeout(resolve, 500))

    await job.updateProgress(100)
    console.log(`[Notifications] ${type} sent successfully`)

    return {
      success: true,
      type,
      recipient,
      sentAt: new Date().toISOString(),
    }
  },
  {
    connection: redisService.getClient(),
    concurrency: 10, // Higher concurrency for fast notification delivery
  }
)

worker.on('completed', (job) => {
  console.log(`[Notifications] Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`[Notifications] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[Notifications] Worker error:', err)
})

console.log('[Notifications] Worker started (concurrency: 10)')
