// Redis Service
// Based on SPEC-events.md (SPEC-EV-PS-*, SPEC-EV-ST-*)

import { createClient } from 'redis'
import { env } from '../config/env.js'
import type { PlatformEvent } from '../types/event.types.js'

type RedisClientType = ReturnType<typeof createClient>

/**
 * Redis Service
 * SPEC-EV-AR-005 to SPEC-EV-AR-007
 */
class RedisService {
  private client: RedisClientType
  private subscriber: RedisClientType
  private publisher: RedisClientType
  private isConnected = false

  constructor() {
    const redisConfig = {
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      database: env.REDIS_DB,
    }

    // Main client for general operations
    this.client = createClient(redisConfig)

    // Dedicated subscriber (Redis Pub/Sub requirement)
    this.subscriber = createClient(redisConfig)

    // Dedicated publisher
    this.publisher = createClient(redisConfig)

    this.setupErrorHandlers()
    this.connect()
  }

  private async connect(): Promise<void> {
    // Graceful failure: Don't try to reconnect if already connected
    if (this.isConnected) {
      return
    }

    try {
      // Check if clients are already connected before trying to connect
      const connectPromises = []

      if (!this.client.isOpen) {
        connectPromises.push(this.client.connect())
      }
      if (!this.subscriber.isOpen) {
        connectPromises.push(this.subscriber.connect())
      }
      if (!this.publisher.isOpen) {
        connectPromises.push(this.publisher.connect())
      }

      if (connectPromises.length > 0) {
        await Promise.all(connectPromises)
      }

      this.isConnected = true
      console.log('[Redis] Connected successfully')
    } catch (error) {
      console.error('[Redis] Failed to connect:', error instanceof Error ? error.message : error)
      console.log('[Redis] System will continue without Redis support')
      this.isConnected = false
    }
  }

  private setupErrorHandlers(): void {
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    this.subscriber.on('error', (err) => {
      console.error('Redis Subscriber Error:', err)
    })

    this.publisher.on('error', (err) => {
      console.error('Redis Publisher Error:', err)
    })
  }

  /**
   * Subscribe to Redis Pub/Sub channel
   * SPEC-EV-PS-005 to SPEC-EV-PS-008
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }

    // Graceful failure: If still not connected, skip subscription
    if (!this.isConnected) {
      console.warn(`[Redis] Cannot subscribe to channel "${channel}" - Redis unavailable`)
      return
    }

    await this.subscriber.subscribe(channel, (message) => {
      callback(message)
    })
  }

  /**
   * Publish event to Redis Pub/Sub
   * SPEC-EV-PS-009 to SPEC-EV-PS-012
   */
  async publish(channel: string, event: PlatformEvent): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect()
      }

      // Graceful failure: If still not connected, log and return
      if (!this.isConnected) {
        console.warn(`[Redis] Cannot publish to channel "${channel}" - Redis unavailable`)
        return
      }

      const message = JSON.stringify(event)
      await this.publisher.publish(channel, message)
    } catch (error) {
      // SPEC-EV-PS-012: Error should not interrupt workflow
      console.error('[Redis] Failed to publish event:', error instanceof Error ? error.message : error)
    }
  }

  /**
   * Add event to Redis Stream (for offline users)
   * SPEC-EV-ST-005 to SPEC-EV-ST-012
   */
  async addToStream(streamKey: string, event: PlatformEvent): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect()
      }

      // Graceful failure: If still not connected, log and return
      if (!this.isConnected) {
        console.warn(`[Redis] Cannot add to stream "${streamKey}" - Redis unavailable`)
        return
      }

      // SPEC-EV-ST-008: MAXLEN ~ 1000 (approximate for performance)
      await this.client.xAdd(
        streamKey,
        '*', // Auto-generate ID
        { event: JSON.stringify(event) },
        { TRIM: { strategy: 'MAXLEN', threshold: 1000, strategyModifier: '~' } }
      )
    } catch (error) {
      console.error('[Redis] Failed to add event to stream:', error instanceof Error ? error.message : error)
    }
  }

  /**
   * Get events from stream since timestamp
   * SPEC-EV-ST-013 to SPEC-EV-ST-016
   *
   * Returns events with streamId added to metadata for recovery tracking
   */
  async getStreamEvents(
    streamKey: string,
    lastEventId: string = '0'
  ): Promise<PlatformEvent[]> {
    try {
      if (!this.isConnected) {
        await this.connect()
      }

      // Read from stream starting after lastEventId
      const result = await this.client.xRead(
        { key: streamKey, id: lastEventId },
        { COUNT: 100 }
      )

      if (!result || result.length === 0) {
        return []
      }

      const events: PlatformEvent[] = []

      for (const stream of result) {
        for (const message of stream.messages) {
          const eventJson = message.message.event
          if (eventJson) {
            const event = JSON.parse(eventJson as string) as PlatformEvent

            // Add stream ID to metadata for recovery
            event.metadata = event.metadata || {}
            event.metadata.streamId = message.id

            events.push(event)
          }
        }
      }

      return events
    } catch (error) {
      console.error('Failed to get stream events:', error)
      return []
    }
  }

  /**
   * Set value in Redis with expiration
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }

    // Graceful failure
    if (!this.isConnected) {
      console.warn(`[Redis] Cannot SET key "${key}" - Redis unavailable`)
      return
    }

    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value)
    } else {
      await this.client.set(key, value)
    }
  }

  /**
   * Get value from Redis
   */
  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      await this.connect()
    }

    // Graceful failure
    if (!this.isConnected) {
      console.warn(`[Redis] Cannot GET key "${key}" - Redis unavailable`)
      return null
    }

    return await this.client.get(key)
  }

  /**
   * Delete key from Redis
   */
  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }

    // Graceful failure
    if (!this.isConnected) {
      console.warn(`[Redis] Cannot DEL key "${key}" - Redis unavailable`)
      return
    }

    await this.client.del(key)
  }

  /**
   * Publish event to global channel
   * Channel Hierarchy (Fase 2) - Global broadcasts
   */
  async publishGlobal(event: PlatformEvent): Promise<void> {
    await this.publish('platform:events', event)
  }

  /**
   * Publish event to portal-specific channel
   * Channel Hierarchy (Fase 2) - Portal-scoped events
   */
  async publishToPortal(portalId: string, event: PlatformEvent): Promise<void> {
    const channel = `platform:events:portal:${portalId}`
    await this.publish(channel, event)
  }

  /**
   * Publish event to user-specific channel
   * Channel Hierarchy (Fase 2) - User-specific events
   */
  async publishToUser(userId: string, event: PlatformEvent): Promise<void> {
    const channel = `platform:events:user:${userId}`
    await this.publish(channel, event)
  }

  /**
   * Subscribe to multiple channels using pattern matching (PSUBSCRIBE)
   * Used for Channel Hierarchy to listen to global, portal, and user events
   */
  async psubscribe(
    patterns: string[],
    callback: (message: string, channel: string) => void
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }

    // Graceful failure: If still not connected, skip subscription
    if (!this.isConnected) {
      console.warn(`[Redis] Cannot psubscribe to patterns - Redis unavailable`)
      return
    }

    await this.subscriber.pSubscribe(patterns, (message, channel) => {
      callback(message, channel)
    })
  }

  /**
   * Check if Redis is available
   * Returns true if Redis is connected and ready to use
   */
  isAvailable(): boolean {
    return this.isConnected
  }

  /**
   * Get Redis client for external use (e.g., BullMQ)
   * Returns connection configuration compatible with BullMQ
   */
  getClient(): { host: string; port: number; password?: string; db: number } {
    return {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      db: env.REDIS_DB,
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.client.quit()
    await this.subscriber.quit()
    await this.publisher.quit()
    this.isConnected = false
  }
}

// Singleton instance
export const redisService = new RedisService()
