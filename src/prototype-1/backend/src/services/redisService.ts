/**
 * Redis Service
 *
 * Manages Redis connection for Pub/Sub and Streams.
 * Used for real-time event distribution to SSE clients.
 *
 * SPEC References:
 * - SPEC-EV-AR-005: System uses Redis as message broker
 * - SPEC-EV-AR-006: System uses Redis Pub/Sub for immediate delivery
 * - SPEC-EV-AR-007: System uses Redis Streams for event buffer
 * - SPEC-EV-PS-005: Channel `platform:events` for global events
 * - SPEC-EV-ST-005: Stream name `events:<userId>` for each user
 */

import Redis from 'ioredis';
import { logger } from '../middleware/logger.middleware.js';

/**
 * Redis client instances
 */
let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Event payload structure (matches frontend PlatformEvent)
 */
export interface RedisEventPayload {
  type: 'notification' | 'task' | 'data_changed';
  id: string;
  userId?: string;
  userIds?: string[];
  timestamp: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  refId?: string;
  refSchema?: string;
  refEntity?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Initialize Redis connection
 *
 * Creates two connections:
 * - Client: For publishing and stream operations
 * - Subscriber: Dedicated for Pub/Sub subscriptions
 */
export async function connectRedis(): Promise<void> {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  try {
    // Create main client for publishing and streams
    redisClient = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`[Redis] Reconnecting in ${delay}ms... (attempt ${times})`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Create dedicated subscriber client
    redisSubscriber = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    // Handle connection events
    redisClient.on('connect', () => {
      logger.info('[Redis] Connected');
    });

    redisClient.on('error', (err) => {
      logger.error('[Redis] Connection error:', err.message);
    });

    redisSubscriber.on('connect', () => {
      logger.info('[Redis] Subscriber connected');
    });

    redisSubscriber.on('error', (err) => {
      logger.error('[Redis] Subscriber error:', err.message);
    });

    // Wait for connections
    await Promise.all([redisClient.ping(), redisSubscriber.ping()]);

    logger.info('[Redis] Connections established');
  } catch (error) {
    logger.error('[Redis] Failed to connect:', error);
    throw error;
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
    if (redisSubscriber) {
      await redisSubscriber.quit();
      redisSubscriber = null;
    }
    logger.info('[Redis] Disconnected');
  } catch (error) {
    logger.error('[Redis] Error during disconnect:', error);
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis | null {
  return redisClient;
}

/**
 * Get Redis subscriber instance
 */
export function getRedisSubscriber(): Redis | null {
  return redisSubscriber;
}

/**
 * Publish event to Redis Pub/Sub channel
 *
 * SPEC-EV-PS-009: Backbone publishes events to Redis Pub/Sub
 * SPEC-EV-PS-010: Message is valid JSON
 * SPEC-EV-PS-011: Publication is async (doesn't block)
 *
 * @param channel - Pub/Sub channel name
 * @param payload - Event payload
 */
export async function publishEvent(
  channel: string,
  payload: RedisEventPayload
): Promise<void> {
  if (!redisClient) {
    throw new Error('[Redis] Not connected');
  }

  try {
    const message = JSON.stringify(payload);
    await redisClient.publish(channel, message);
    logger.info(`[Redis] Event published to channel: ${channel}`, {
      type: payload.type,
      id: payload.id,
    });
  } catch (error) {
    logger.error('[Redis] Failed to publish event:', error);
    throw error;
  }
}

/**
 * Subscribe to Redis Pub/Sub channel
 *
 * SPEC-EV-PS-008: Backend subscribes to appropriate channels
 *
 * @param channel - Channel name (supports patterns with *)
 * @param handler - Message handler function
 */
export async function subscribeChannel(
  channel: string,
  handler: (channel: string, message: string) => void
): Promise<void> {
  if (!redisSubscriber) {
    throw new Error('[Redis] Subscriber not connected');
  }

  try {
    // Check if pattern subscription (contains *)
    if (channel.includes('*')) {
      await redisSubscriber.psubscribe(channel);
      redisSubscriber.on('pmessage', (pattern, ch, message) => {
        if (pattern === channel) {
          handler(ch, message);
        }
      });
    } else {
      await redisSubscriber.subscribe(channel);
      redisSubscriber.on('message', (ch, message) => {
        if (ch === channel) {
          handler(ch, message);
        }
      });
    }

    logger.info(`[Redis] Subscribed to channel: ${channel}`);
  } catch (error) {
    logger.error(`[Redis] Failed to subscribe to ${channel}:`, error);
    throw error;
  }
}

/**
 * Unsubscribe from Redis Pub/Sub channel
 *
 * @param channel - Channel name
 */
export async function unsubscribeChannel(channel: string): Promise<void> {
  if (!redisSubscriber) {
    return;
  }

  try {
    if (channel.includes('*')) {
      await redisSubscriber.punsubscribe(channel);
    } else {
      await redisSubscriber.unsubscribe(channel);
    }
    logger.info(`[Redis] Unsubscribed from channel: ${channel}`);
  } catch (error) {
    logger.error(`[Redis] Failed to unsubscribe from ${channel}:`, error);
  }
}

/**
 * Add event to Redis Stream (for offline users)
 *
 * SPEC-EV-ST-005: Stream name `events:<userId>` for each user
 * SPEC-EV-ST-006: Keep last 1000 messages or 24 hours
 * SPEC-EV-ST-008: Use MAXLEN ~ 1000 (approximate for performance)
 * SPEC-EV-ST-009: Backbone adds events via XADD
 * SPEC-EV-ST-012: Each event has unique ID generated by Redis
 *
 * @param userId - User ID
 * @param payload - Event payload
 */
export async function addEventToStream(
  userId: string,
  payload: RedisEventPayload
): Promise<string> {
  if (!redisClient) {
    throw new Error('[Redis] Not connected');
  }

  try {
    const streamKey = `events:${userId}`;
    const message = JSON.stringify(payload);

    // XADD with MAXLEN ~ 1000 (approximate trimming for performance)
    // '*' lets Redis auto-generate the ID
    const eventId = await redisClient.xadd(
      streamKey,
      'MAXLEN',
      '~',
      '1000',
      '*',
      'data',
      message,
      'timestamp',
      payload.timestamp
    );

    if (!eventId) {
      throw new Error('Failed to add event to stream: no ID returned');
    }

    logger.info(`[Redis] Event added to stream: ${streamKey}`, {
      id: eventId,
      type: payload.type,
    });

    return eventId;
  } catch (error) {
    logger.error('[Redis] Failed to add event to stream:', error);
    throw error;
  }
}

/**
 * Read events from Redis Stream
 *
 * SPEC-EV-ST-013: Frontend queries stream on reconnect
 * SPEC-EV-ST-014: Query uses timestamp of last received event
 *
 * @param userId - User ID
 * @param lastId - Last event ID received (use '0' for all events)
 * @param count - Maximum number of events to read
 */
export async function readEventsFromStream(
  userId: string,
  lastId: string = '0',
  count: number = 100
): Promise<Array<{ id: string; payload: RedisEventPayload }>> {
  if (!redisClient) {
    throw new Error('[Redis] Not connected');
  }

  try {
    const streamKey = `events:${userId}`;

    // XREAD COUNT <count> STREAMS <key> <lastId>
    const results = await redisClient.xread(
      'COUNT',
      count,
      'STREAMS',
      streamKey,
      lastId
    );

    if (!results || results.length === 0) {
      return [];
    }

    // Parse results
    const events: Array<{ id: string; payload: RedisEventPayload }> = [];

    for (const [_key, messages] of results) {
      for (const [id, fields] of messages) {
        // Fields is an array: ['data', '<json>', 'timestamp', '<iso>']
        const dataIndex = fields.indexOf('data');
        if (dataIndex !== -1 && dataIndex + 1 < fields.length) {
          const dataJson = fields[dataIndex + 1];
          const payload = JSON.parse(dataJson);
          events.push({ id, payload });
        }
      }
    }

    logger.info(`[Redis] Read ${events.length} events from stream: ${streamKey}`);
    return events;
  } catch (error) {
    logger.error('[Redis] Failed to read from stream:', error);
    throw error;
  }
}

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redisClient) {
      return false;
    }
    await redisClient.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Redis connection info for health checks
 */
export function getRedisInfo(): {
  connected: boolean;
  host: string;
  port: number;
  db: number;
} {
  return {
    connected: redisClient !== null && redisClient.status === 'ready',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };
}
