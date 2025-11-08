// Events Routes
// Based on SPEC-events.md and SPEC-channels.md (SPEC-CH-EV-*)

import { Router, type Request, type Response } from 'express'
import { sseService } from '../services/sse.service.js'
import { redisService } from '../services/redis.service.js'
import { env } from '../config/env.js'
import type { PlatformEvent } from '../types/event.types.js'
import { validateJWT } from '../middleware/jwt-validation.middleware.js'

const router = Router()

/**
 * GET /api/events/stream
 *
 * SSE endpoint for real-time events
 * SPEC-EV-SSE-005 to SPEC-EV-SSE-010
 * SPEC-CH-EV-015 to SPEC-CH-EV-020
 * SPEC-EV-FR-004 to SPEC-EV-FR-006 (Recovery)
 *
 * Accepts JWT via:
 * - Query parameter: ?token=<jwt>
 * - Authorization header: Bearer <jwt>
 *
 * Supports recovery via:
 * - Query parameter: ?lastEventId=<id>
 *
 * JWT can be either:
 * - User JWT (from /api/1/auth/login)
 * - Guest JWT (from /api/1/auth/guest)
 */
router.get('/stream', async (req: Request, res: Response) => {
  try {
    // Get token from query param or Authorization header
    // Query param is preferred for EventSource compatibility
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '')
    const lastEventId = (req.query.lastEventId as string) || '0'

    if (!token) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing token',
      })
      return
    }

    // Validate JWT using middleware (SPEC-AU-JWT-001 to SPEC-AU-JWT-004)
    // Guest tokens (guest: true) do NOT validate expiration
    // User tokens (guest: false) validate expiration normally
    const validationResult = validateJWT(token, env.JWT_SECRET)

    if (!validationResult.valid) {
      res.status(401).json({
        code: 401,
        message: `Unauthorized: ${validationResult.error}`,
      })
      return
    }

    // Extract userId from JWT payload (SPEC-AU-JWT-005)
    const userId = validationResult.decoded!.sub

    if (!userId) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Invalid token payload',
      })
      return
    }

    // Setup SSE headers before sending any data
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // For nginx
    })

    console.log(`[SSE Route] Starting SSE stream for user ${userId} (lastEventId: ${lastEventId})`)

    // Send missed events (recovery) - SPEC-EV-FR-004
    if (lastEventId !== '0') {
      try {
        const streamKey = `events:${userId}`
        const missedEvents = await redisService.getStreamEvents(streamKey, lastEventId)

        console.log(`[SSE Recovery] Sending ${missedEvents.length} missed events to user ${userId}`)

        for (const event of missedEvents) {
          res.write(`data: ${JSON.stringify(event)}\n\n`)
        }
      } catch (error) {
        console.error('[SSE Recovery] Failed to fetch missed events:', error)
        // Continue with connection even if recovery fails
      }
    }

    // Log if request is aborted or times out
    req.on('aborted', () => {
      console.log(`[SSE Route] Request aborted by client for user ${userId}`)
    })

    req.on('timeout', () => {
      console.log(`[SSE Route] Request timeout for user ${userId}`)
    })

    // Register SSE connection (works for both user and guest)
    // This keeps the connection open and sends future events
    sseService.registerConnection(userId, res)

    // Connection will remain open until client disconnects
    // No explicit return needed as connection stays open
  } catch (error: unknown) {
    console.error('SSE Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    // Check if headers were already sent
    if (!res.headersSent) {
      res.status(500).json({
        code: 500,
        message: errorMessage,
      })
    } else {
      // If headers were sent, just close the connection
      res.end()
    }
  }
})

/**
 * GET /api/events/history
 *
 * Retrieve missed events from Redis Stream
 * SPEC-EV-ST-013 to SPEC-EV-ST-016
 * SPEC-EV-FR-004 to SPEC-EV-FR-006
 *
 * Accepts JWT via:
 * - Query parameter: ?token=<jwt>
 * - Authorization header: Bearer <jwt>
 *
 * JWT can be either:
 * - User JWT (from /api/1/auth/login)
 * - Guest JWT (from /api/1/auth/guest)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    // Get token from query param or Authorization header
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '')
    const lastEventId = (req.query.lastEventId as string) || '0'

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized: Missing token',
      })
    }

    // Validate JWT (SPEC-AU-JWT-001 to SPEC-AU-JWT-004)
    const validationResult = validateJWT(token, env.JWT_SECRET)

    if (!validationResult.valid) {
      return res.status(401).json({
        code: 401,
        message: `Unauthorized: ${validationResult.error}`,
      })
    }

    // Extract userId from JWT payload
    const userId = validationResult.decoded!.sub

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized: Invalid token payload',
      })
    }

    // Get events from user's stream
    // Graceful degradation: Returns empty array if Redis is unavailable
    const streamKey = `events:${userId}`
    const events = await redisService.getStreamEvents(streamKey, lastEventId)

    return res.status(200).json({
      code: 200,
      data: events,
      count: events.length,
    })
  } catch (error: unknown) {
    console.error('Event History Error:', error)

    // Return empty events array instead of 500 for better resilience
    return res.status(200).json({
      code: 200,
      data: [],
      count: 0,
      warning: 'Failed to retrieve history, returning empty result',
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

    // Validate target-specific requirements
    if (event.target === 'portal' && !event.portalId) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid event structure: portal target requires portalId',
      })
    }

    if (event.target === 'user' && !event.userId && !event.userIds) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid event structure: user target requires userId or userIds',
      })
    }

    // Legacy validation: if no target specified, require userId/userIds
    if (!event.target && !event.userId && !event.userIds) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid event structure: missing userId or userIds',
      })
    }

    // Publish to Redis Pub/Sub using channel hierarchy (Fase 2)
    if (event.target === 'global') {
      // Global broadcast to all users
      await redisService.publishGlobal(event)
    } else if (event.target === 'portal' && event.portalId) {
      // Portal-scoped broadcast
      await redisService.publishToPortal(event.portalId, event)
    } else if (event.target === 'user' && event.userId) {
      // User-specific event
      await redisService.publishToUser(event.userId, event)
    } else {
      // Fallback: legacy behavior using userId/userIds
      await redisService.publish('platform:events', event)
    }

    // Add to Redis Stream (for offline users) - only for user-targeted events
    if (event.target === 'user' || event.userId || event.userIds) {
      const userIds = event.userIds || (event.userId ? [event.userId] : [])
      for (const userId of userIds) {
        const streamKey = `events:${userId}`
        await redisService.addToStream(streamKey, event)
      }
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
