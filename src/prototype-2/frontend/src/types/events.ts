/**
 * Platform Event Types - Frontend
 *
 * SPEC References:
 * - SPEC-EV-PL-001:017: Event payload structure
 * - SPEC-EV-CO-002:013: Event types
 */

/**
 * Base platform event (matches backend types)
 * Must be kept in sync with backend/src/types/events.types.ts
 */
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled';
  id: string;
  userId?: string;
  userIds?: string[];
  timestamp: string; // ISO 8601
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
}

/**
 * Notification event
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error';
  severity?: 'low' | 'normal' | 'high' | 'critical';
  title?: string;
  message?: string;
  actionUrl?: string;
  iconName?: string;
}

/**
 * Task event
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  data?: TaskEventData;
}

export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  result?: any;
  error?: string;
}

/**
 * SSE connection states
 * SPEC-EV-FE-006: Connection state tracking
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * SSE error types
 */
export interface SSEError extends Error {
  code?: string;
  recoverable: boolean;
}

/**
 * Event handler function signature
 */
export type EventHandler = (event: PlatformEvent) => void | Promise<void>;

/**
 * Event handler unsubscribe function
 */
export type UnsubscribeFunction = () => void;
