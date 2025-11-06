import { Response } from 'express';
import { createClient, type RedisClientType } from 'redis';
import { redisService } from './redis.service.js';
import { getRedisUrl } from '../config/env.js';
import type { PlatformEvent, SSEConnection } from '../types/events.types.js';

/**
 * SSE Service
 *
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028: SSE protocol implementation
 * SPEC-EV-PS-001 to SPEC-EV-PS-012: Redis Pub/Sub integration
 * SPEC-EV-AR-001 to SPEC-EV-AR-009: Architecture requirements
 */

class SSEService {
  private connections = new Map<string, Response>();
  private connectionMetadata = new Map<string, SSEConnection>();
  private subscriber: RedisClientType | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds - SPEC-EV-SSE-019
  private readonly REDIS_CHANNEL = 'platform:events'; // SPEC-EV-PS-005

  /**
   * Initialize SSE service with Redis subscriber
   * SPEC-EV-PS-008: Backend must subscribe to appropriate channels
   */
  async initialize(): Promise<void> {
    if (this.subscriber) {
      console.log('[SSE] Already initialized');
      return;
    }

    try {
      // Create dedicated Redis client for Pub/Sub
      // SPEC-EV-N8-006: Reuse connection pool
      const redisUrl = getRedisUrl();
      this.subscriber = createClient({ url: redisUrl });

      this.subscriber.on('error', (err) => {
        console.error('[SSE] Redis subscriber error:', err);
      });

      await this.subscriber.connect();
      console.log('[SSE] Redis subscriber connected');

      // Subscribe to platform events channel
      // SPEC-EV-PS-005: Global events channel
      await this.subscriber.subscribe(this.REDIS_CHANNEL, (message) => {
        this.handleRedisMessage(message);
      });

      console.log(`[SSE] Subscribed to channel: ${this.REDIS_CHANNEL}`);

      // Start heartbeat
      this.startHeartbeat();
    } catch (error) {
      console.error('[SSE] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Shutdown SSE service
   */
  async shutdown(): Promise<void> {
    console.log('[SSE] Shutting down...');

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    this.connections.forEach((res, userId) => {
      res.end();
      console.log(`[SSE] Connection closed for user: ${userId}`);
    });
    this.connections.clear();
    this.connectionMetadata.clear();

    // Unsubscribe and disconnect Redis subscriber
    if (this.subscriber) {
      try {
        await this.subscriber.unsubscribe(this.REDIS_CHANNEL);
        await this.subscriber.quit();
        this.subscriber = null;
        console.log('[SSE] Redis subscriber disconnected');
      } catch (error) {
        console.error('[SSE] Error disconnecting subscriber:', error);
      }
    }
  }

  /**
   * Add new SSE connection for a user
   * SPEC-EV-SSE-005: Connection endpoint
   * SPEC-EV-SSE-011 to SPEC-EV-SSE-014: Response headers
   * SPEC-EV-SSE-015: Connection management
   */
  addConnection(userId: string, res: Response): void {
    // Close existing connection if any (SPEC-EV-SSE-016: One connection per user)
    if (this.connections.has(userId)) {
      const oldRes = this.connections.get(userId);
      oldRes?.end();
      console.log(`[SSE] Replaced existing connection for user: ${userId}`);
    }

    // Set SSE headers - SPEC-EV-SSE-011 to SPEC-EV-SSE-014
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // For nginx

    // Store connection
    this.connections.set(userId, res);

    // Store metadata - SPEC-EV-SSE-015
    const now = Date.now();
    this.connectionMetadata.set(userId, {
      userId,
      connectedAt: now,
      lastHeartbeat: now,
    });

    // Handle client disconnect - SPEC-EV-SSE-018
    res.on('close', () => {
      this.removeConnection(userId);
    });

    // Send initial connection message
    this.sendEvent(userId, {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    });

    console.log(`[SSE] Connection established for user: ${userId} (total: ${this.connections.size})`);
  }

  /**
   * Remove SSE connection
   * SPEC-EV-SSE-018
   */
  removeConnection(userId: string): void {
    this.connections.delete(userId);
    this.connectionMetadata.delete(userId);
    console.log(`[SSE] Connection removed for user: ${userId} (total: ${this.connections.size})`);
  }

  /**
   * Send event to specific user
   * SPEC-EV-SSE-020 to SPEC-EV-SSE-024
   */
  sendEvent(userId: string, event: PlatformEvent | { type: 'heartbeat'; timestamp: string }): boolean {
    const res = this.connections.get(userId);

    if (!res) {
      // User not connected - SPEC-EV-SSE-023
      return false;
    }

    try {
      // SSE format: data: <json>\n\n - SPEC-EV-SSE-021
      const data = `data: ${JSON.stringify(event)}\n\n`;
      res.write(data);

      // Update metadata
      const metadata = this.connectionMetadata.get(userId);
      if (metadata && event.type === 'heartbeat') {
        metadata.lastHeartbeat = Date.now();
      }

      return true;
    } catch (error) {
      console.error(`[SSE] Error sending event to user ${userId}:`, error);
      this.removeConnection(userId);
      return false;
    }
  }

  /**
   * Broadcast event to all connected users
   */
  broadcastEvent(event: PlatformEvent): void {
    let successCount = 0;
    this.connections.forEach((_, userId) => {
      if (this.sendEvent(userId, event)) {
        successCount++;
      }
    });
    console.log(`[SSE] Broadcast event to ${successCount}/${this.connections.size} users`);
  }

  /**
   * Handle message from Redis Pub/Sub
   * SPEC-EV-AR-001: Backbone → Redis → Backend → Frontend
   * SPEC-EV-PS-010 to SPEC-EV-PS-012: Message handling
   */
  private handleRedisMessage(message: string): void {
    try {
      // SPEC-EV-PS-010: Message must be valid JSON
      const event = JSON.parse(message) as PlatformEvent;

      // SPEC-EV-PL-015: Ignore unknown event types (forward compatibility)
      if (!this.isValidEventType(event.type)) {
        console.warn(`[SSE] Unknown event type: ${event.type}, ignoring`);
        return;
      }

      // Route to specific users or broadcast
      if (event.userId) {
        // Single user target
        this.sendEvent(event.userId, event);
      } else if (event.userIds && Array.isArray(event.userIds)) {
        // Multiple users target
        event.userIds.forEach((userId) => {
          this.sendEvent(userId, event);
        });
      } else {
        // Broadcast to all users
        this.broadcastEvent(event);
      }
    } catch (error) {
      console.error('[SSE] Error handling Redis message:', error);
    }
  }

  /**
   * Validate event type
   * SPEC-EV-PL-013 to SPEC-EV-PL-015
   */
  private isValidEventType(type: string): boolean {
    const validTypes = ['notification', 'task', 'data_changed', 'job-completed', 'job-failed', 'job-progress'];
    return validTypes.includes(type);
  }

  /**
   * Send heartbeat to all connected clients
   * SPEC-EV-SSE-019: Periodic heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeatEvent = {
        type: 'heartbeat' as const,
        timestamp: new Date().toISOString(),
      };

      this.connections.forEach((_, userId) => {
        this.sendEvent(userId, heartbeatEvent);
      });

      console.log(`[SSE] Heartbeat sent to ${this.connections.size} users`);
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    users: Array<{ userId: string; connectedAt: number; lastHeartbeat: number }>;
  } {
    return {
      totalConnections: this.connections.size,
      users: Array.from(this.connectionMetadata.values()),
    };
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.connections.has(userId);
  }
}

// Singleton instance
export const sseService = new SSEService();
