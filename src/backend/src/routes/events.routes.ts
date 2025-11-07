// Events Routes
// Based on SPEC-events.md and SPEC-channels.md (SPEC-CH-EV-*)

import { Router, type Request, type Response } from 'express'
import { sseService } from '../services/sse.service.js'
import { redisService } from '../services/redis.service.js'
import type { PlatformEvent } from '../types/event.types.js'

const router = Router()

/**
 * GET /api/events/stream
 *
 * SSE endpoint for real-time events
 * SPEC-EV-SSE-005 to SPEC-EV-SSE-010
 * SPEC-CH-EV-015 to SPEC-CH-EV-020
 */
router.get('/stream', (req: Request, res: Response) => {
  try {
    // SPEC-EV-SSE-006 to SPEC-EV-SSE-009: Validate JWT
    // For now, we'll get userId from query param or header
    // In production, extract from validated JWT
    const userId =
      (req.query.userId as string) ||
      req.headers['x-user-id'] as string ||
      req.body?.userId

    if (!userId) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing userId',
      })
      return
    }

    // Register SSE connection (this keeps the connection open)
    sseService.registerConnection(userId, res)

    // Connection will remain open until client disconnects
    // No explicit return needed as connection stays open
  } catch (error: unknown) {
    console.error('SSE Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/events/history
 *
 * Retrieve missed events from Redis Stream
 * SPEC-EV-ST-013 to SPEC-EV-ST-016
 * SPEC-EV-FR-004 to SPEC-EV-FR-006
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string)
    const lastEventId = (req.query.lastEventId as string) || '0'

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing userId',
      })
    }

    // Get events from user's stream
    const streamKey = `events:${userId}`
    const events = await redisService.getStreamEvents(streamKey, lastEventId)

    return res.status(200).json({
      code: 200,
      data: events,
      count: events.length,
    })
  } catch (error: unknown) {
    console.error('Event History Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * POST /api/events/publish
 *
 * Publish event (for testing purposes - in production, n8n publishes directly to Redis)
 * SPEC-EV-PS-009 to SPEC-EV-PS-012
 */
router.post('/publish', async (req: Request, res: Response) => {
  try {
    const event: PlatformEvent = req.body

    // Validate event structure
    if (!event.type || !event.id || !event.timestamp) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid event structure: missing required fields',
      })
    }

    if (!event.userId && !event.userIds) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid event structure: missing userId or userIds',
      })
    }

    // Publish to Redis Pub/Sub (for online users)
    await redisService.publish('platform:events', event)

    // Add to Redis Stream (for offline users)
    const userIds = event.userIds || (event.userId ? [event.userId] : [])
    for (const userId of userIds) {
      const streamKey = `events:${userId}`
      await redisService.addToStream(streamKey, event)
    }

    return res.status(200).json({
      code: 200,
      message: 'Event published successfully',
    })
  } catch (error: unknown) {
    console.error('Publish Event Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({
      code: 500,
      message: errorMessage,
    })
  }
})

/**
 * GET /api/events/stats
 *
 * Get event system statistics (for monitoring)
 */
router.get('/stats', (_req: Request, res: Response) => {
  return res.status(200).json({
    code: 200,
    data: {
      activeConnections: sseService.getConnectionCount(),
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
