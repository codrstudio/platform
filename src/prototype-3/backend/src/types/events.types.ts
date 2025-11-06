/**
 * Server-Sent Events (SSE) Types
 *
 * SPEC-EV-PL-001 to SPEC-EV-PL-017: Event payload structure
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028: SSE protocol requirements
 */

/**
 * Event types supported by the platform
 * SPEC-EV-PL-013
 */
export type EventType = 'notification' | 'task' | 'data_changed' | 'job-completed' | 'job-failed' | 'job-progress';

/**
 * Event priority levels
 * SPEC-EV-PL-007
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Base event payload structure
 * SPEC-EV-PL-001 to SPEC-EV-PL-008
 */
export interface BaseEvent {
  /** Event type - SPEC-EV-PL-002 */
  type: EventType;

  /** Unique event ID - SPEC-EV-PL-003 */
  id: string;

  /** Target user ID or array of user IDs - SPEC-EV-PL-004 */
  userId?: string;
  userIds?: string[];

  /** ISO 8601 timestamp - SPEC-EV-PL-005 */
  timestamp: string;

  /** Event category - SPEC-EV-PL-006 */
  category?: string;

  /** Event priority - SPEC-EV-PL-007 */
  priority?: EventPriority;

  /** Additional metadata - SPEC-EV-PL-008 */
  [key: string]: any;
}

/**
 * Notification event
 * SPEC-EV-CO-005 to SPEC-EV-CO-008
 */
export interface NotificationEvent extends BaseEvent {
  type: 'notification';
  category?: string;
}

/**
 * Task event (requires user action)
 * SPEC-EV-CO-009 to SPEC-EV-CO-013
 */
export interface TaskEvent extends BaseEvent {
  type: 'task';
  category?: string;
  data?: {
    status?: 'pending' | 'completed' | 'cancelled';
    [key: string]: any;
  };
}

/**
 * Data change event (triggers cache invalidation)
 * SPEC-DA-EV-001 to SPEC-DA-EV-008
 */
export interface DataChangedEvent extends BaseEvent {
  type: 'data_changed';
  data: {
    schema: string;
    entity: string;
    ids?: (string | number)[];
  };
}

/**
 * Job completion event
 * SPEC-EV-QUEUE-001 to SPEC-EV-QUEUE-003
 */
export interface JobCompletedEvent extends BaseEvent {
  type: 'job-completed';
  data: {
    jobId: string;
    queueName: string;
    status: 'completed';
    progress: number;
    result: any;
  };
}

/**
 * Job failure event
 * SPEC-EV-QUEUE-004 to SPEC-EV-QUEUE-005
 */
export interface JobFailedEvent extends BaseEvent {
  type: 'job-failed';
  data: {
    jobId: string;
    queueName: string;
    status: 'failed';
    error: string;
  };
}

/**
 * Job progress event
 * SPEC-EV-QUEUE-006
 */
export interface JobProgressEvent extends BaseEvent {
  type: 'job-progress';
  data: {
    jobId: string;
    queueName: string;
    progress: number;
  };
}

/**
 * Union type of all event types
 */
export type PlatformEvent =
  | NotificationEvent
  | TaskEvent
  | DataChangedEvent
  | JobCompletedEvent
  | JobFailedEvent
  | JobProgressEvent;

/**
 * SSE connection metadata
 * SPEC-EV-SSE-015
 */
export interface SSEConnection {
  userId: string;
  connectedAt: number;
  lastHeartbeat: number;
}

/**
 * SSE heartbeat message
 * SPEC-EV-SSE-019
 */
export interface SSEHeartbeat {
  type: 'heartbeat';
  timestamp: string;
}
