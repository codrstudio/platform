// SSE Service
// Based on SPEC-events.md (SPEC-EV-SSE-*)

import type { Response } from 'express'
import type { PlatformEvent, SSEConnection } from '../types/event.types.js'
import { redisService } from './redis.service.js'

/**
 * SSE Service
 * Manages Server-Sent Events connections
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028
 */
class SSEService {
  private connections: Map<string, SSEConnection> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private readonly HEARTBEAT_INTERVAL = 30000 // 30 seconds (SPEC-EV-SSE-019)

  constructor() {
    this.startHeartbeat()
    this.subscribeToEvents()
  }

  /**
   * Subscribe to Redis Pub/Sub for platform events
   * SPEC-EV-PS-005, SPEC-EV-AR-001
   */
  private async subscribeToEvents(): Promise<void> {
    try {
      await redisService.subscribe('platform:events', (message: string) => {
        try {
          const event: PlatformEvent = JSON.parse(message)
          this.broadcastEvent(event)
        } catch (error) {
          console.error('[SSE] Failed to parse event from Redis:', error instanceof Error ? error.message : error)
        }
      })
    } catch (error) {
      // Graceful failure: SSE can work without Redis (just no real-time events)
      console.warn('[SSE] Cannot subscribe to Redis events - real-time updates disabled')
      console.log('[SSE] Connections will still work for direct pushes')
    }
  }

  /**
   * Broadcast event to appropriate user(s)
   * SPEC-EV-SSE-020 to SPEC-EV-SSE-024
   */
  private broadcastEvent(event: PlatformEvent): void {
    const targetUserIds = event.userIds || (event.userId ? [event.userId] : [])

    for (const userId of targetUserIds) {
      const connection = this.connections.get(userId)

      // SPEC-EV-SSE-022: Check if user is connected
      if (connection) {
        this.sendEvent(connection.response, event)
      } else {
        // SPEC-EV-SSE-023: User offline, event stays in Stream
        console.log(`User ${userId} offline, event stored in stream`)
      }
    }
  }

  /**
   * Register new SSE connection
   * SPEC-EV-SSE-015 to SPEC-EV-SSE-018
   */
  registerConnection(userId: string, res: Response): void {
    // Close existing connection if any (SPEC-EV-SSE-016: one connection per user)
    if (this.connections.has(userId)) {
      this.closeConnection(userId)
    }

    // SPEC-EV-SSE-011 to SPEC-EV-SSE-014: Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // For nginx
    })

    // Store connection
    const connection: SSEConnection = {
      userId,
      response: res as unknown as NodeJS.WritableStream,
      connectedAt: new Date(),
    }

    this.connections.set(userId, connection)

    // SPEC-EV-SSE-018: Remove connection on close
    res.on('close', () => {
      this.closeConnection(userId)
    })

    // Send initial connection event
    this.sendComment(res, `Connected as user ${userId}`)

    console.log(`SSE connection established for user ${userId}`)
  }

  /**
   * Close connection for a user
   * SPEC-EV-SSE-020
   */
  closeConnection(userId: string): void {
    const connection = this.connections.get(userId)
    if (connection) {
      try {
        connection.response.end()
      } catch (error) {
        console.error(`Error closing connection for user ${userId}:`, error)
      }
      this.connections.delete(userId)
      console.log(`SSE connection closed for user ${userId}`)
    }
  }

  /**
   * Send event to a specific response
   * SPEC-EV-SSE-021
   */
  private sendEvent(res: NodeJS.WritableStream, event: PlatformEvent): void {
    try {
      const data = JSON.stringify(event)
      res.write(`data: ${data}\n\n`)
    } catch (error) {
      console.error('Error sending event:', error)
    }
  }

  /**
   * Send comment (for heartbeat)
   */
  private sendComment(res: Response, comment: string): void {
    try {
      res.write(`: ${comment}\n\n`)
    } catch (error) {
      console.error('Error sending comment:', error)
    }
  }

  /**
   * Start heartbeat to keep connections alive
   * SPEC-EV-SSE-019
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, connection] of this.connections.entries()) {
        try {
          connection.response.write(': heartbeat\n\n')
        } catch (error) {
          console.error(`Heartbeat failed for user ${userId}:`, error)
          this.closeConnection(userId)
        }
      }
    }, this.HEARTBEAT_INTERVAL)
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Get number of active connections
   */
  getConnectionCount(): number {
    return this.connections.size
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    for (const userId of this.connections.keys()) {
      this.closeConnection(userId)
    }
    this.stopHeartbeat()
  }
}

// Singleton instance
export const sseService = new SSEService()
