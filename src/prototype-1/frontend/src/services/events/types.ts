/**
 * Event System Types
 *
 * Defines types for the platform's real-time event system using SSE + Redis.
 *
 * SPEC References:
 * - SPEC-EV-CO-002: System supports Notifications and Tasks
 * - SPEC-EV-PL-001 to SPEC-EV-PL-017: Event payload structure
 */

/**
 * Event types supported by the platform
 * SPEC-EV-PL-013: type MUST be one of: notification, task
 * SPEC-EV-PL-014: Other types MAY be added in future
 */
export type EventType = 'notification' | 'task' | 'data_changed';

/**
 * Event category (for filtering and routing)
 * SPEC-EV-PL-006: Event MAY include category field
 */
export type EventCategory =
  | 'system'
  | 'email_approval'
  | 'data_update'
  | 'workflow'
  | 'user_action'
  | string; // Allow custom categories

/**
 * Event priority levels
 * SPEC-EV-PL-007: Event MAY include priority field
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Base platform event structure
 *
 * SPEC-EV-PL-002: Event MUST include field type
 * SPEC-EV-PL-003: Event MUST include field id (unique)
 * SPEC-EV-PL-004: Event MUST include userId OR userIds
 * SPEC-EV-PL-005: Event MUST include timestamp (ISO 8601)
 * SPEC-EV-PL-009: Event MUST NOT contain complete data
 * SPEC-EV-PL-010: Event MUST contain only reference to data (ID)
 */
export interface PlatformEvent {
  /** Event type - determines how frontend processes it */
  type: EventType;

  /** Unique event identifier */
  id: string;

  /** Target user ID (if single user) */
  userId?: string;

  /** Target user IDs (if multiple users) */
  userIds?: string[];

  /** Event timestamp (ISO 8601 format) */
  timestamp: string;

  /** Event category for filtering */
  category?: EventCategory;

  /** Priority level */
  priority?: EventPriority;

  /** Reference to data entity (ID only, fetch via JQEL) */
  refId?: string;

  /** Schema for JQEL query (if data needs to be fetched) */
  refSchema?: string;

  /** Entity for JQEL query */
  refEntity?: string;

  /** Additional metadata (keep minimal, < 1KB total payload) */
  metadata?: Record<string, unknown>;
}

/**
 * Notification event (passive, informational)
 *
 * SPEC-EV-CO-003: Notifications inform user (passive)
 * SPEC-EV-CO-005: Notification is informative, unidirectional
 * SPEC-EV-CO-006: Notification does NOT require action
 * SPEC-EV-CO-007: Notification MAY be marked as viewed
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';

  /** Short notification title (optional) */
  title?: string;

  /** Notification message (optional, kept minimal) */
  message?: string;

  /** Whether notification has been viewed */
  viewed?: boolean;
}

/**
 * Task event (active, requires user action)
 *
 * SPEC-EV-CO-004: Tasks require action (active, interactive, has status)
 * SPEC-EV-CO-009: Task is event that requires user action
 * SPEC-EV-CO-010: Task MUST have status
 * SPEC-EV-CO-011: Task MUST allow interaction
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';

  /** Task status */
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

  /** Actions available for this task */
  actions?: string[]; // e.g., ['approve', 'reject', 'retry']

  /** Deadline timestamp (ISO 8601) */
  deadline?: string;
}

/**
 * Data changed event (triggers query invalidation)
 *
 * SPEC-EV-FR-001: Frontend uses event to invalidate queries
 */
export interface DataChangedEvent extends PlatformEvent {
  type: 'data_changed';

  /** Entity that changed (for targeted invalidation) */
  entity: string;

  /** Operation type */
  operation: 'insert' | 'update' | 'delete';

  /** IDs of changed records */
  changedIds?: string[];
}

/**
 * Event handler function type
 */
export type EventHandler = (event: PlatformEvent) => void;

/**
 * SSE connection state
 *
 * SPEC-EV-SSE-004: SSE reconnects automatically if connection drops
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * EventSource manager options
 */
export interface EventSourceOptions {
  /** URL for SSE connection */
  url: string;

  /** JWT token for authentication */
  token?: string;

  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;

  /** Reconnect delay in milliseconds */
  reconnectDelay?: number;

  /** Maximum reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;

  /** Callback when connection state changes */
  onStateChange?: (state: ConnectionState) => void;

  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

/**
 * SSE Provider context value
 */
export interface SSEContextValue {
  /** Current connection state */
  state: ConnectionState;

  /** Whether SSE is connected */
  isConnected: boolean;

  /** Last received event timestamp */
  lastEventTimestamp: string | null;

  /** Subscribe to specific event types */
  on: (eventType: EventType, handler: EventHandler) => void;

  /** Unsubscribe from event types */
  off: (eventType: EventType, handler: EventHandler) => void;

  /** Manually connect to SSE */
  connect: () => void;

  /** Manually disconnect from SSE */
  disconnect: () => void;

  /** Reconnect SSE connection */
  reconnect: () => void;
}
