/**
 * Platform Event System Types
 *
 * SPEC References:
 * - SPEC-EV-PL-001:017: Event payload structure and fields
 * - SPEC-EV-CO-002:013: Event types (notification, task)
 */

/**
 * Base platform event structure
 *
 * SPEC-EV-PL-001:008: Required and optional fields
 */
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled';
  id: string; // SPEC-EV-PL-003: Unique identifier
  userId?: string; // SPEC-EV-PL-004: Single user target
  userIds?: string[]; // SPEC-EV-PL-004: Multiple user targets
  timestamp: string; // SPEC-EV-PL-005: ISO 8601 timestamp
  category?: string; // SPEC-EV-PL-006: Event category
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // SPEC-EV-PL-007
  data?: Record<string, any>; // SPEC-EV-PL-008: Additional metadata
}

/**
 * Notification event
 *
 * SPEC-EV-CO-005:008: Informational, passive events
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error';
  severity?: 'low' | 'normal' | 'high' | 'critical'; // Display urgency
  title?: string; // Optional short title for display
  message?: string; // Optional message body
  actionUrl?: string; // Optional link for "View Details"
  iconName?: string; // Optional Lucide icon name
}

/**
 * Task event
 *
 * SPEC-EV-CO-009:013: Interactive events requiring user action
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'; // SPEC-EV-CO-010
  category?: string; // e.g., 'email_approval', 'data_validation'
  data?: TaskEventData;
}

/**
 * Task event data structure
 *
 * SPEC-EV-QUEUE-001:011: Task/job event data
 */
export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  currentStep?: string;
  estimatedDuration?: number;
  result?: any;
  duration?: number;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
  retryCount?: number;
  reason?: string;
  cancelledBy?: 'user' | 'system' | 'timeout';
  metadata?: Record<string, any>;
}

/**
 * Queue job event
 *
 * SPEC-EV-QUEUE-008: Job status events
 */
export interface JobEvent extends PlatformEvent {
  type: 'job-completed' | 'job-failed' | 'job-progress';
  data: {
    jobId: string;
    queueName: string;
    status: 'completed' | 'failed' | 'running';
    progress?: number;
    result?: any;
    error?: string;
  };
}

/**
 * Channel name constants
 *
 * SPEC-EV-PS-005:007: Pub/Sub channel naming
 */
export const EVENT_CHANNELS = {
  GLOBAL: 'platform:events', // SPEC-EV-PS-005: Global events
  NOTIFICATIONS: 'platform:notifications', // SPEC-EV-PS-007: Notification-specific
  TASKS: 'platform:tasks', // SPEC-EV-PS-007: Task-specific
  USER_PREFIX: 'platform:events:user:', // SPEC-EV-PS-006: User-specific prefix
} as const;

/**
 * Event handler function signature
 */
export type EventHandler = (event: PlatformEvent) => void | Promise<void>;

/**
 * Event validation result
 */
export interface EventValidation {
  valid: boolean;
  error?: string;
  field?: string;
}

/**
 * SSE message format
 */
export interface SSEMessage {
  data: string; // JSON-stringified EventPayload
}
