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
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
      ])
      this.isConnected = true
      console.log('✓ Redis connected successfully')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
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
      const message = JSON.stringify(event)
      await this.publisher.publish(channel, message)
    } catch (error) {
      // SPEC-EV-PS-012: Error should not interrupt workflow
      console.error('Failed to publish event:', error)
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
      // SPEC-EV-ST-008: MAXLEN ~ 1000 (approximate for performance)
      await this.client.xAdd(
        streamKey,
        '*', // Auto-generate ID
        { event: JSON.stringify(event) },
        { TRIM: { strategy: 'MAXLEN', threshold: 1000, strategyModifier: '~' } }
      )
    } catch (error) {
      console.error('Failed to add event to stream:', error)
    }
  }

  /**
   * Get events from stream since timestamp
   * SPEC-EV-ST-013 to SPEC-EV-ST-016
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
            events.push(JSON.parse(eventJson as string))
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
    return await this.client.get(key)
  }

  /**
   * Delete key from Redis
   */
  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }
    await this.client.del(key)
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
