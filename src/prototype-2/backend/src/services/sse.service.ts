import { Response } from 'express';
import Redis from 'ioredis';
import { redisService } from './redis.service.js';
import { config } from '../config/env.js';
import type { PlatformEvent } from '../types/events.types.js';

/**
 * SSEService
 *
 * Manages Server-Sent Events (SSE) connections and Redis Pub/Sub integration.
 *
 * Responsibilities:
 * - Track active SSE connections per user
 * - Subscribe to Redis Pub/Sub channels
 * - Route events to appropriate connected users
 * - Send periodic heartbeats to keep connections alive
 * - Cleanup connections on disconnect
 *
 * SPEC References:
 * - SPEC-EV-SSE-015:019: Connection management
 * - SPEC-EV-SSE-020:024: Event delivery
 * - SPEC-EV-PS-005:008: Redis Pub/Sub channels
 */
export class SSEService {
  // Active SSE connections: userId -> Express Response
  // SPEC-EV-SSE-015: Backend must maintain Map of connections
  private connections: Map<string, Response> = new Map();

  // Heartbeat intervals: userId -> NodeJS.Timeout
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Dedicated Redis subscriber client (cannot use main client for Pub/Sub)
  private subscriber: Redis | null = null;

  // Initialization flag
  private initialized: boolean = false;

  /**
   * Initialize SSE service
   *
   * Subscribes to Redis Pub/Sub channels and sets up message handlers.
   * Safe to call multiple times - subsequent calls are ignored.
   *
   * SPEC-EV-PS-008: Backend must subscribe to appropriate channels
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('ℹ️  SSEService already initialized');
      return;
    }

    try {
      // Create dedicated subscriber client
      this.subscriber = redisService.createSubscriber();

      // Subscribe to global events channel
      // SPEC-EV-PS-005: Channel platform:events for global events
      await this.subscriber.subscribe('platform:events', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:events:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:events');
      });

      // Subscribe to notification channel
      // SPEC-EV-PS-007: Channel platform:notifications
      await this.subscriber.subscribe('platform:notifications', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:notifications:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:notifications');
      });

      // Subscribe to task channel
      // SPEC-EV-PS-007: Channel platform:tasks
      await this.subscriber.subscribe('platform:tasks', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:tasks:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:tasks');
      });

      // Set up message handler
      // SPEC-EV-PS-010: Message must be JSON
      this.subscriber.on('message', async (channel, message) => {
        await this.handleRedisMessage(channel, message);
      });

      this.initialized = true;
      console.log('✅ SSEService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SSEService:', error);
      throw error;
    }
  }

  /**
   * Handle incoming Redis Pub/Sub message
   *
   * SPEC-EV-SSE-020:024: Backend receives event → identifies user → sends via SSE
   * SPEC-EV-ST-001:002: Store events in Redis Streams for offline recovery
   */
  private async handleRedisMessage(_channel: string, message: string): Promise<void> {
    try {
      // SPEC-EV-PS-010: Message must be JSON
      const event: PlatformEvent = JSON.parse(message);

      // SPEC-EV-PL-004: Event must include userId
      if (!event.userId) {
        console.warn('⚠️  Event missing userId, cannot route:', event);
        return;
      }

      // SPEC-EV-ST-002: Store event in Redis Stream for offline recovery
      const streamKey = `events:${event.userId}`;
      try {
        const streamId = await redisService.xadd(streamKey, event);
        // Update event ID with stream ID if not already set
        if (!event.id) {
          event.id = streamId;
        }
      } catch (error) {
        console.error(`❌ Failed to store event in stream ${streamKey}:`, error);
        // Continue with delivery even if stream storage fails
      }

      // SPEC-EV-SSE-022: Check if user is connected
      const connection = this.connections.get(event.userId);

      if (!connection) {
        // SPEC-EV-SSE-023: If user offline, event stays in Stream for recovery
        console.log(`ℹ️  User ${event.userId} not connected, event stored for recovery:`, event.type);
        return;
      }

      // SPEC-EV-SSE-024: Sending must be async (non-blocking)
      this.sendEventToConnection(connection, event);
    } catch (error) {
      console.error('❌ Error handling Redis message:', error, message);
    }
  }

  /**
   * Add SSE connection for a user
   *
   * Registers the connection, sets up cleanup on close, and starts heartbeat.
   *
   * SPEC-EV-SSE-015: Backend must maintain Map of connections
   * SPEC-EV-SSE-018: Backend must remove connection on close
   * SPEC-EV-SSE-019: Backend must send heartbeat periodically
   *
   * @param userId - User ID from JWT
   * @param res - Express Response object for SSE streaming
   */
  addConnection(userId: string, res: Response): void {
    // SPEC-EV-SSE-016: One connection per user should be sufficient
    // If connection already exists, close old one before replacing
    const existingConnection = this.connections.get(userId);
    if (existingConnection) {
      console.log(`ℹ️  Replacing existing SSE connection for user ${userId}`);
      this.removeConnection(userId);
    }

    // Register connection
    this.connections.set(userId, res);
    console.log(`✅ SSE connection established for user ${userId}`);
    console.log(`📊 Active SSE connections: ${this.connections.size}`);

    // SPEC-EV-SSE-018: Remove connection on close
    res.on('close', () => {
      console.log(`ℹ️  SSE connection closed for user ${userId}`);
      this.removeConnection(userId);
    });

    // Send initial heartbeat immediately (don't wait for interval)
    res.write(':heartbeat\n\n');

    // SPEC-EV-SSE-019: Send heartbeat periodically (default: 30s)
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(userId);
    }, config.sseHeartbeatInterval);

    this.heartbeatIntervals.set(userId, heartbeatInterval);
  }

  /**
   * Remove SSE connection for a user
   *
   * Cleans up connection and heartbeat interval.
   * Safe to call multiple times.
   *
   * @param userId - User ID to disconnect
   */
  removeConnection(userId: string): void {
    // Clear heartbeat interval
    const heartbeatInterval = this.heartbeatIntervals.get(userId);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(userId);
    }

    // Remove connection
    const connection = this.connections.get(userId);
    if (connection) {
      try {
        connection.end(); // Close the connection gracefully
      } catch (error) {
        // Connection might already be closed, ignore error
      }
      this.connections.delete(userId);
      console.log(`✅ SSE connection removed for user ${userId}`);
      console.log(`📊 Active SSE connections: ${this.connections.size}`);
    }
  }

  /**
   * Send event to specific user's SSE connection
   *
   * SPEC-EV-SSE-021: Format SSE: data: <json>\n\n
   * SPEC-EV-SSE-024: Sending must be async (non-blocking)
   *
   * @param userId - Target user ID
   * @param event - Event payload
   */
  sendEvent(userId: string, event: PlatformEvent): void {
    const connection = this.connections.get(userId);

    if (!connection) {
      console.log(`ℹ️  Cannot send event to user ${userId}: not connected`);
      return;
    }

    this.sendEventToConnection(connection, event);
  }

  /**
   * Send event to a specific SSE connection
   *
   * SPEC-EV-SSE-021: Format SSE: data: <json>\n\n
   *
   * @param connection - Express Response stream
   * @param event - Event payload
   */
  private sendEventToConnection(connection: Response, event: PlatformEvent): void {
    try {
      // SPEC-EV-SSE-021: Format: id: <id>\ndata: <json>\n\n
      const eventData = JSON.stringify(event);
      const sseMessage = `id: ${event.id}\ndata: ${eventData}\n\n`;

      // Write to stream (non-blocking)
      connection.write(sseMessage);
    } catch (error) {
      // Connection might be closed, log but don't crash
      console.error('❌ Error sending event to connection:', error);
    }
  }

  /**
   * Send heartbeat ping to user's connection
   *
   * Heartbeat is sent as SSE comment (line starting with :)
   * This keeps the connection alive and detects dead connections.
   *
   * SPEC-EV-SSE-019: Backend must send heartbeat periodically
   *
   * @param userId - User ID
   */
  private sendHeartbeat(userId: string): void {
    const connection = this.connections.get(userId);

    if (!connection) {
      return;
    }

    try {
      // SSE comment format: :comment\n\n
      connection.write(':heartbeat\n\n');
    } catch (error) {
      // Connection closed, cleanup will happen via 'close' event
      console.warn(`⚠️  Failed to send heartbeat to user ${userId}:`, error);
    }
  }

  /**
   * Get count of active SSE connections
   *
   * @returns Number of active connections
   */
  getActiveConnections(): number {
    return this.connections.size;
  }

  /**
   * Shutdown SSE service
   *
   * Closes all connections and unsubscribes from Redis.
   * Call before application shutdown.
   */
  async shutdown(): Promise<void> {
    console.log('ℹ️  Shutting down SSEService...');

    // Close all connections
    for (const userId of this.connections.keys()) {
      this.removeConnection(userId);
    }

    // Unsubscribe from Redis
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }

    this.initialized = false;
    console.log('✅ SSEService shutdown complete');
  }
}

// Export singleton instance
export const sseService = new SSEService();
