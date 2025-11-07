// Event Emitter Utility
// Helper functions to emit platform events

import { randomUUID } from 'crypto'
import { redisService } from '../services/redis.service.js'
import type { ConfigChangedEvent } from '../types/event.types.js'

/**
 * Emit config-changed event
 * Broadcasts to all users via Redis Pub/Sub
 */
export async function emitConfigChanged(
  entity: 'realm' | 'portal',
  entityId: string,
  action: 'create' | 'update' | 'delete',
  changes?: Record<string, unknown>
): Promise<void> {
  const event: ConfigChangedEvent = {
    type: 'config-changed',
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    category: 'system',
    priority: 'normal',
    data: {
      entity,
      entityId,
      action,
      changes,
    },
  }

  try {
    // Publish to Redis Pub/Sub (all connected users will receive)
    await redisService.publish('platform:events', event)
    console.log(`[Event] config-changed: ${entity}/${entityId} ${action}`)
  } catch (error) {
    console.error('[Event] Failed to emit config-changed:', error)
    // Don't throw - event emission should not interrupt the main flow
  }
}
