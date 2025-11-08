// File Processing Worker
// Based on SPEC-queues.md (SPEC-Q-PERF-002)
// Processes file-related jobs (PDF conversion, image processing, etc.)

import { Worker } from 'bullmq'
import { redisService } from '../services/redis.service.js'

/**
 * File Processing Worker
 * SPEC-Q-PERF-002: Concurrency = 5
 */
const worker = new Worker(
  'file-processing',
  async (job) => {
    console.log(`[File Processing] Processing job ${job.id}:`, job.data)

    const { fileId, operation } = job.data

    // Simulate processing stages with progress updates
    await job.updateProgress(25)
    console.log(`[File Processing] ${operation}: 25% complete`)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await job.updateProgress(50)
    console.log(`[File Processing] ${operation}: 50% complete`)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await job.updateProgress(75)
    console.log(`[File Processing] ${operation}: 75% complete`)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await job.updateProgress(100)
    console.log(`[File Processing] ${operation}: 100% complete`)

    return {
      success: true,
      fileId,
      operation,
      processedAt: new Date().toISOString(),
    }
  },
  {
    connection: redisService.getClient(),
    concurrency: 5, // SPEC-Q-PERF-002
  }
)

worker.on('completed', (job) => {
  console.log(`[File Processing] Job ${job.id} completed:`, job.returnvalue)
})

worker.on('failed', (job, err) => {
  console.error(`[File Processing] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[File Processing] Worker error:', err)
})

console.log('[File Processing] Worker started (concurrency: 5)')
