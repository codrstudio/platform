/**
 * SSE (Server-Sent Events) Service
 *
 * Manages SSE connections and event distribution to connected clients.
 * Listens to Redis Pub/Sub and forwards events via SSE.
 *
 * SPEC References:
 * - SPEC-EV-SSE-015: Backend maintains Map of connections (userId → Response)
 * - SPEC-EV-SSE-016: One connection per user is sufficient
 * - SPEC-EV-SSE-018: Backend removes connection on close
 * - SPEC-EV-SSE-019: Backend sends heartbeat periodically (every 30s)
 * - SPEC-EV-SSE-020: Backend receives from Redis → Identifies user → Sends via SSE
 */

import type { Response } from 'express';
import { logger } from '../middleware/logger.middleware.js';
import {
  subscribeChannel,
  type RedisEventPayload,
  addEventToStream,
} from './redisService.js';

/**
 * SSE connection tracking
 *
 * Maps userId to their SSE Response object.
 * SPEC-EV-SSE-015: Backend maintains Map<userId, Response>
 */
const connections = new Map<string, Response>();

/**
 * Heartbeat interval (30 seconds)
 *
 * SPEC-EV-SSE-019: Send heartbeat every 30s
 */
const HEARTBEAT_INTERVAL = 30000;

/**
 * Heartbeat timer reference
 */
let heartbeatTimer: NodeJS.Timeout | null = null;

/**
 * Register a new SSE connection
 *
 * SPEC-EV-SSE-016: One connection per user is sufficient
 *
 * @param userId - User ID
 * @param res - Express Response object
 */
export function addConnection(userId: string, res: Response): void {
  // Close previous connection if exists
  const existingConnection = connections.get(userId);
  if (existingConnection) {
    logger.warn(`[SSE] Replacing existing connection for user: ${userId}`);
    try {
      existingConnection.end();
    } catch {
      // Ignore errors when closing old connection
    }
  }

  // Register new connection
  connections.set(userId, res);
  logger.info(`[SSE] Connection registered for user: ${userId}`);
  logger.info(`[SSE] Active connections: ${connections.size}`);

  // Handle connection close
  // SPEC-EV-SSE-018: Remove connection on close
  res.on('close', () => {
    removeConnection(userId);
  });

  // Start heartbeat if not already running
  startHeartbeat();
}

/**
 * Remove an SSE connection
 *
 * SPEC-EV-SSE-018: Backend removes connection on close
 *
 * @param userId - User ID
 */
export function removeConnection(userId: string): void {
  const removed = connections.delete(userId);
  if (removed) {
    logger.info(`[SSE] Connection removed for user: ${userId}`);
    logger.info(`[SSE] Active connections: ${connections.size}`);
  }

  // Stop heartbeat if no connections
  if (connections.size === 0) {
    stopHeartbeat();
  }
}

/**
 * Get connection for a user
 *
 * @param userId - User ID
 * @returns Response object or undefined
 */
export function getConnection(userId: string): Response | undefined {
  return connections.get(userId);
}

/**
 * Check if user is connected
 *
 * SPEC-EV-SSE-022: Backend verifies if user is connected
 *
 * @param userId - User ID
 */
export function isUserConnected(userId: string): boolean {
  return connections.has(userId);
}

/**
 * Get number of active connections
 */
export function getConnectionCount(): number {
  return connections.size;
}

/**
 * Get all connected user IDs
 */
export function getConnectedUsers(): string[] {
  return Array.from(connections.keys());
}

/**
 * Send event to specific user
 *
 * SPEC-EV-SSE-020: Receive from Redis → Identify user → Send via SSE
 * SPEC-EV-SSE-021: Format is "data: <json>\n\n"
 * SPEC-EV-SSE-024: Sending is async (doesn't block)
 *
 * @param userId - Target user ID
 * @param event - Event payload
 */
export function sendEventToUser(userId: string, event: RedisEventPayload): void {
  const res = connections.get(userId);

  if (!res) {
    // User is offline
    // SPEC-EV-SSE-023: If user offline, event stays in Stream
    logger.debug(`[SSE] User ${userId} is offline, event saved to stream`);
    return;
  }

  try {
    // Format: data: <json>\n\n
    // SPEC-EV-SSE-021
    const data = JSON.stringify(event);
    res.write(`data: ${data}\n\n`);

    logger.debug(`[SSE] Event sent to user ${userId}:`, {
      type: event.type,
      id: event.id,
    });
  } catch (error) {
    logger.error(`[SSE] Failed to send event to user ${userId}:`, error);
    // Remove broken connection
    removeConnection(userId);
  }
}

/**
 * Send event to multiple users
 *
 * @param userIds - Array of user IDs
 * @param event - Event payload
 */
export function sendEventToUsers(userIds: string[], event: RedisEventPayload): void {
  for (const userId of userIds) {
    sendEventToUser(userId, event);
  }
}

/**
 * Send event to all connected users
 *
 * @param event - Event payload
 */
export function sendEventToAll(event: RedisEventPayload): void {
  const userIds = Array.from(connections.keys());
  logger.info(`[SSE] Broadcasting event to ${userIds.length} users`);
  sendEventToUsers(userIds, event);
}

/**
 * Start heartbeat timer
 *
 * SPEC-EV-SSE-019: Send heartbeat every 30s
 */
function startHeartbeat(): void {
  if (heartbeatTimer) {
    return; // Already running
  }

  logger.info('[SSE] Starting heartbeat (30s interval)');

  heartbeatTimer = setInterval(() => {
    const count = connections.size;
    if (count === 0) return;

    logger.debug(`[SSE] Sending heartbeat to ${count} connections`);

    // Send comment as heartbeat (comments are ignored by EventSource)
    for (const [userId, res] of connections.entries()) {
      try {
        res.write(': heartbeat\n\n');
      } catch (error) {
        logger.error(`[SSE] Heartbeat failed for user ${userId}:`, error);
        removeConnection(userId);
      }
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Stop heartbeat timer
 */
function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    logger.info('[SSE] Heartbeat stopped (no active connections)');
  }
}

/**
 * Start listening to Redis Pub/Sub and forward to SSE clients
 *
 * SPEC-EV-AR-001: Backbone publishes → Redis → Backend → Frontend
 * SPEC-EV-PS-005: Subscribe to `platform:events` channel
 *
 * @param channels - Redis channels to subscribe to
 */
export async function startListening(channels: string[] = ['platform:events']): Promise<void> {
  logger.info('[SSE] Starting Redis listener for channels:', channels);

  for (const channel of channels) {
    try {
      await subscribeChannel(channel, (ch, message) => {
        handleRedisMessage(ch, message);
      });
    } catch (error) {
      logger.error(`[SSE] Failed to subscribe to channel ${channel}:`, error);
    }
  }
}

/**
 * Handle incoming Redis Pub/Sub message
 *
 * SPEC-EV-SSE-020: Receive from Redis → Identify user → Send via SSE
 * SPEC-EV-SSE-022: Check if user is connected
 * SPEC-EV-SSE-023: If offline, event stays in Stream only
 *
 * @param channel - Redis channel
 * @param message - Message payload (JSON string)
 */
function handleRedisMessage(channel: string, message: string): void {
  try {
    const event: RedisEventPayload = JSON.parse(message);

    logger.debug(`[SSE] Received event from Redis channel ${channel}:`, {
      type: event.type,
      id: event.id,
    });

    // Determine target users
    let targetUsers: string[] = [];

    if (event.userId) {
      // Single user
      targetUsers = [event.userId];
    } else if (event.userIds && event.userIds.length > 0) {
      // Multiple users
      targetUsers = event.userIds;
    } else {
      // No specific user - broadcast to all (or skip)
      logger.warn('[SSE] Event has no userId or userIds, skipping:', event.id);
      return;
    }

    // Send to connected users
    for (const userId of targetUsers) {
      // Check if user is online
      // SPEC-EV-SSE-022
      if (isUserConnected(userId)) {
        // Send via SSE
        sendEventToUser(userId, event);
      } else {
        // User is offline, add to Stream for later retrieval
        // SPEC-EV-SSE-023
        addEventToStream(userId, event).catch((error) => {
          logger.error(`[SSE] Failed to add event to stream for user ${userId}:`, error);
        });
      }
    }
  } catch (error) {
    logger.error('[SSE] Failed to handle Redis message:', error, message);
  }
}

/**
 * Shutdown SSE service
 *
 * Closes all connections and stops heartbeat.
 */
export function shutdown(): void {
  logger.info('[SSE] Shutting down...');

  // Stop heartbeat
  stopHeartbeat();

  // Close all connections
  for (const [userId, res] of connections.entries()) {
    try {
      res.end();
    } catch {
      // Ignore errors
    }
    logger.info(`[SSE] Closed connection for user: ${userId}`);
  }

  connections.clear();
  logger.info('[SSE] Shutdown complete');
}
