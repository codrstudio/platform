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
   * Channel Hierarchy (Fase 2): Uses pattern matching to listen to multiple channels
   *
   * CRITICAL: This method MUST NEVER throw errors or crash SSE service
   * If Redis is unavailable, SSE connections still work (just no real-time events)
   */
  private async subscribeToEvents(): Promise<void> {
    try {
      // Check if Redis is available before attempting subscription
      if (!redisService.isAvailable()) {
        console.warn('[SSE] Redis unavailable at startup - real-time events disabled')
        console.log('[SSE] SSE connections will work normally, just no events from Redis')
        return
      }

      await redisService.psubscribe(
        ['platform:events', 'platform:events:*'],
        (message: string, channel: string) => {
          // Wrap event processing in try-catch to prevent crashes
          try {
            const event: PlatformEvent = JSON.parse(message)

            // Route based on channel
            if (channel === 'platform:events') {
              // Global broadcast
              this.broadcastToAll(event)
            } else if (channel.startsWith('platform:events:portal:')) {
              // Portal-scoped
              const portalId = channel.split(':')[3]
              this.broadcastToPortal(portalId, event)
            } else if (channel.startsWith('platform:events:user:')) {
              // User-specific
              const userId = channel.split(':')[3]
              this.sendToUser(userId, event)
            }
          } catch (error) {
            console.error('[SSE] Failed to process event from Redis:', error instanceof Error ? error.message : error)
            // Continue operation - one bad event should not crash SSE
          }
        }
      )

      console.log('[SSE] Redis subscription established successfully')
    } catch (error) {
      // CRITICAL: Graceful degradation - SSE MUST work without Redis
      console.error('[SSE] Failed to subscribe to Redis:', error instanceof Error ? error.message : error)
      console.warn('[SSE] Real-time events from Redis are disabled')
      console.log('[SSE] SSE connections will work normally for direct pushes')
      // Do NOT re-throw - let SSE service continue operating
    }
  }

  /**
   * Broadcast event to ALL connected users
   * Channel Hierarchy (Fase 2) - Global broadcast
   */
  private broadcastToAll(event: PlatformEvent): void {
    for (const connection of this.connections.values()) {
      this.sendEvent(connection.response, event)
    }
  }

  /**
   * Broadcast event to all users in a specific portal
   * Channel Hierarchy (Fase 2) - Portal-scoped broadcast
   *
   * TODO: Query portal users via JQEL or config
   * For now, broadcasts to all connected users (placeholder)
   */
  private broadcastToPortal(portalId: string, event: PlatformEvent): void {
    // Placeholder implementation - broadcast to all
    // Future: Filter connections by portal membership
    console.log(`[SSE] Portal broadcast to ${portalId} (currently broadcasts to all)`)
    this.broadcastToAll(event)
  }

  /**
   * Send event to a specific user
   * Channel Hierarchy (Fase 2) - User-specific event
   */
  private sendToUser(userId: string, event: PlatformEvent): void {
    const connection = this.connections.get(userId)

    if (connection) {
      this.sendEvent(connection.response, event)
    } else {
      // User offline, event should be stored in Redis Stream for recovery
      console.log(`[SSE] User ${userId} offline, event should be in stream`)
    }
  }


  /**
   * Register new SSE connection
   * SPEC-EV-SSE-015 to SPEC-EV-SSE-018
   *
   * Note: userId is treated as an opaque string identifier.
   * It accepts both authenticated users (user_*) and guest sessions (guest_*).
   * No validation is performed on the userId format.
   *
   * IMPORTANT: SSE headers must be set BEFORE calling this method.
   * This is now handled in the route handler to support event recovery.
   */
  registerConnection(userId: string, res: Response): void {
    // Close existing connection if any (SPEC-EV-SSE-016: one connection per user)
    if (this.connections.has(userId)) {
      console.log(`[SSE] Replacing existing connection for user ${userId}`)
      this.closeConnection(userId, 'replaced-by-new-connection')
    }

    // Store connection
    const connection: SSEConnection = {
      userId,
      response: res as unknown as NodeJS.WritableStream,
      connectedAt: new Date(),
    }

    this.connections.set(userId, connection)

    // SPEC-EV-SSE-018: Remove connection on close
    res.on('close', () => {
      console.log(`[SSE] Client closed connection for user ${userId} (client-initiated)`)
      this.closeConnection(userId, 'client-closed')
    })

    // Log errors in the connection
    res.on('error', (error: Error) => {
      console.error(`[SSE] Connection error for user ${userId}:`, error.message)
      this.closeConnection(userId, `error: ${error.message}`)
    })

    // Log when the connection is finished
    res.on('finish', () => {
      console.log(`[SSE] Connection finished for user ${userId} (response.end() called)`)
    })

    // Send initial connection event
    this.sendComment(res, `Connected as user ${userId}`)

    console.log(`[SSE] Connection established for user ${userId}`)
  }

  /**
   * Close connection for a user
   * SPEC-EV-SSE-020
   *
   * @param userId - User identifier
   * @param reason - Why the connection is being closed (for logging)
   */
  closeConnection(userId: string, reason = 'unknown'): void {
    const connection = this.connections.get(userId)
    if (connection) {
      const connectionDuration = Date.now() - connection.connectedAt.getTime()
      const durationSeconds = Math.floor(connectionDuration / 1000)

      try {
        connection.response.end()
        console.log(`[SSE] Connection closed for user ${userId} - Reason: ${reason} - Duration: ${durationSeconds}s`)
      } catch (error) {
        console.error(`[SSE] Error closing connection for user ${userId}:`, error)
      }
      this.connections.delete(userId)
    }
  }

  /**
   * Send event to a specific response
   * SPEC-EV-SSE-021
   */
  private sendEvent(res: NodeJS.WritableStream, event: PlatformEvent): void {
    try {
      const data = JSON.stringify(event)
      const writeSuccess = res.write(`data: ${data}\n\n`)

      if (!writeSuccess) {
        console.warn('[SSE] Write buffer full, data is being buffered')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error'
      console.error(`[SSE] Error sending event: ${errorMessage}`, error)
    }
  }

  /**
   * Send comment (for heartbeat)
   */
  private sendComment(res: Response, comment: string): void {
    try {
      const writeSuccess = res.write(`: ${comment}\n\n`)

      if (!writeSuccess) {
        console.warn('[SSE] Write buffer full when sending comment, data is being buffered')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error'
      console.error(`[SSE] Error sending comment: ${errorMessage}`, error)
    }
  }

  /**
   * Start heartbeat to keep connections alive
   * SPEC-EV-SSE-019
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const totalConnections = this.connections.size
      if (totalConnections > 0) {
        console.log(`[SSE] Heartbeat: ${totalConnections} active connections`)
      }

      for (const [userId, connection] of this.connections.entries()) {
        try {
          connection.response.write(': heartbeat\n\n')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'unknown error'
          console.error(`[SSE] Heartbeat failed for user ${userId}: ${errorMessage}`)
          this.closeConnection(userId, `heartbeat-failed: ${errorMessage}`)
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
    console.log(`[SSE] Closing all ${this.connections.size} connections`)
    for (const userId of this.connections.keys()) {
      this.closeConnection(userId, 'server-shutdown')
    }
    this.stopHeartbeat()
  }
}

// Singleton instance
export const sseService = new SSEService()
