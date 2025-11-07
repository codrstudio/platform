// Event Types
// Based on SPEC-events.md (SPEC-EV-PL-*)

/**
 * Base Event Structure
 * SPEC-EV-PL-001 to SPEC-EV-PL-008
 */
export interface BaseEvent {
  type: 'notification' | 'task' | 'job-completed' | 'job-failed' | 'job-progress' | 'config-changed'
  id: string
  userId?: string
  userIds?: string[]
  timestamp: string // ISO 8601
  category?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: Record<string, unknown>
  data?: unknown
}

/**
 * Notification Event
 * SPEC-EV-CO-005 to SPEC-EV-CO-008
 */
export interface NotificationEvent extends BaseEvent {
  type: 'notification'
  userId: string
}

/**
 * Task Event
 * SPEC-EV-CO-009 to SPEC-EV-CO-013
 */
export interface TaskEvent extends BaseEvent {
  type: 'task'
  userId: string
  status?: 'pending' | 'completed' | 'cancelled'
}

/**
 * Job Event (for queue system)
 * SPEC-EV-QUEUE-001 to SPEC-EV-QUEUE-008
 */
export interface JobEvent extends BaseEvent {
  type: 'job-completed' | 'job-failed' | 'job-progress'
  userId: string
  data: {
    jobId: string
    queueName: string
    status: 'completed' | 'failed' | 'progress'
    progress?: number
    result?: unknown
    error?: string
  }
}

/**
 * Config Changed Event
 * Emitted when realm or portal configuration changes
 */
export interface ConfigChangedEvent extends BaseEvent {
  type: 'config-changed'
  data: {
    entity: 'realm' | 'portal'
    entityId: string
    action: 'create' | 'update' | 'delete'
    changes?: Record<string, unknown>
  }
}

/**
 * Union type for all events
 */
export type PlatformEvent = NotificationEvent | TaskEvent | JobEvent | ConfigChangedEvent

/**
 * Event Handler Type
 */
export type EventHandler = (event: PlatformEvent) => void

/**
 * SSE Connection State
 */
export type SSEConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
