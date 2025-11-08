// External API Worker
// Based on SPEC-queues.md
// Processes external API calls and third-party integrations

import { Worker } from 'bullmq'
import { redisService } from '../services/redis.service.js'

/**
 * External API Worker
 * Handles third-party API calls, webhooks, integrations
 */
const worker = new Worker(
  'external-api',
  async (job) => {
    console.log(`[External API] Processing job ${job.id}:`, job.data)

    const { endpoint, method } = job.data

    // Simulate API call
    await job.updateProgress(30)
    console.log(`[External API] Calling ${method} ${endpoint}`)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    await job.updateProgress(70)
    console.log(`[External API] Processing response`)
    await new Promise((resolve) => setTimeout(resolve, 500))

    await job.updateProgress(100)
    console.log(`[External API] Call completed`)

    return {
      success: true,
      endpoint,
      method,
      statusCode: 200,
      calledAt: new Date().toISOString(),
    }
  },
  {
    connection: redisService.getClient(),
    concurrency: 3, // Lower concurrency to respect external API rate limits
  }
)

worker.on('completed', (job) => {
  console.log(`[External API] Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`[External API] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[External API] Worker error:', err)
})

console.log('[External API] Worker started (concurrency: 3)')
