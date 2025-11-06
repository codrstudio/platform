import { redisService } from './redis.service.js';
import type { PlatformEvent } from '../types/events.types.js';

/**
 * Event Recovery Result
 */
export interface EventRecoveryResult {
  events: PlatformEvent[];
  hasMore: boolean;
  lastId: string;
  recoveryWindow: {
    startId: string;
    endId: string;
    startTime: string;
    endTime: string;
  };
}

/**
 * Event Recovery Service
 *
 * Fetches missed events from Redis Streams for offline recovery.
 *
 * SPEC References:
 * - SPEC-EV-ST-002: Store events for offline users
 * - SPEC-EV-ST-003: Allow recovery of missed events
 * - SPEC-EV-ST-006: 24h/1000 event window
 * - SPEC-EV-ST-013:016: Recovery mechanism
 * - SPEC-EV-FR-004:006: Frontend recovery
 */
export class EventRecoveryService {
  private readonly MAX_RECOVERY_COUNT = 1000;
  private readonly MAX_RECOVERY_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch missed events for a user
   *
   * @param userId - User ID to fetch events for
   * @param lastEventId - Last event ID received by client
   * @param maxCount - Maximum events to return (default: 1000)
   * @returns Recovery result with events
   * @throws Error if lastEventId is invalid or too old
   */
  async fetchMissedEvents(
    userId: string,
    lastEventId: string,
    maxCount?: number
  ): Promise<EventRecoveryResult> {
    const streamKey = `events:${userId}`;
    const count = Math.min(maxCount || this.MAX_RECOVERY_COUNT, this.MAX_RECOVERY_COUNT);

    // Validate event ID format (Redis Stream ID: timestamp-sequence)
    if (!this.isValidStreamId(lastEventId)) {
      throw new Error(`Invalid lastEventId format: ${lastEventId}`);
    }

    // Check if event is within recovery window (24 hours)
    const lastEventAge = this.getStreamIdAge(lastEventId);
    if (lastEventAge > this.MAX_RECOVERY_AGE_MS) {
      throw new Error(
        `LastEventId too old: ${Math.floor(lastEventAge / 1000 / 60 / 60)}h ago (max: 24h)`
      );
    }

    try {
      // Fetch events from Redis Stream
      const entries = await redisService.xread(streamKey, lastEventId, count);

      // Parse events
      const events: PlatformEvent[] = entries.map(([id, data]) => {
        // Parse stored JSON (from XADD)
        const parsedData = JSON.parse(data.data || '{}');
        return {
          id,
          type: parsedData.type || data.type,
          userId: parsedData.userId || data.userId,
          timestamp: parsedData.timestamp || data.timestamp,
          category: parsedData.category || data.category,
          priority: parsedData.priority || data.priority,
          data: parsedData.data,
        };
      });

      // Determine if more events exist
      const hasMore = events.length === count;

      // Get recovery window info
      const lastId = events.length > 0 ? events[events.length - 1].id : lastEventId;
      const startTime = this.streamIdToTimestamp(lastEventId);
      const endTime = events.length > 0 ? this.streamIdToTimestamp(lastId) : startTime;

      return {
        events,
        hasMore,
        lastId,
        recoveryWindow: {
          startId: lastEventId,
          endId: lastId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Event Recovery Error:', {
        userId,
        lastEventId,
        error,
      });
      throw error;
    }
  }

  /**
   * Validate Redis Stream ID format
   * Format: <timestamp>-<sequence> (e.g., "1730800800000-0")
   */
  private isValidStreamId(id: string): boolean {
    return /^\d+-\d+$/.test(id);
  }

  /**
   * Extract timestamp from Redis Stream ID
   */
  private streamIdToTimestamp(id: string): number {
    const [timestamp] = id.split('-');
    return parseInt(timestamp, 10);
  }

  /**
   * Calculate age of stream ID in milliseconds
   */
  private getStreamIdAge(id: string): number {
    const timestamp = this.streamIdToTimestamp(id);
    return Date.now() - timestamp;
  }
}

// Export singleton instance
export const eventRecoveryService = new EventRecoveryService();
