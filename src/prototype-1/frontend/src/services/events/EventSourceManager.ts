/**
 * EventSource Manager
 *
 * Manages SSE (Server-Sent Events) connection for real-time event delivery.
 *
 * SPEC References:
 * - SPEC-EV-SSE-001: Frontend connects via SSE to receive events
 * - SPEC-EV-SSE-004: SSE reconnects automatically if connection drops
 * - SPEC-EV-SSE-025: Browser reconnects automatically in 3-5 seconds
 * - SPEC-EV-SSE-026: Frontend MAY implement custom reconnection logic
 */

import type {
  PlatformEvent,
  EventType,
  EventHandler,
  EventSourceOptions,
} from './types';
import { ConnectionState } from './types';

/**
 * EventSource Manager Class
 *
 * Manages SSE connection lifecycle, auto-reconnection, and event dispatch.
 */
export class EventSourceManager {
  private eventSource: EventSource | null = null;
  private url: string;
  private token: string | null = null;
  private autoReconnect: boolean;
  private reconnectDelay: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: number | null = null;
  private state: ConnectionState;
  private handlers: Map<EventType, Set<EventHandler>>;
  private onStateChange?: (state: ConnectionState) => void;
  private onError?: (error: Error) => void;

  constructor(options: EventSourceOptions) {
    this.url = options.url;
    this.token = options.token || null;
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectDelay = options.reconnectDelay ?? 3000; // 3 seconds
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 0; // 0 = infinite
    this.state = ConnectionState.DISCONNECTED;
    this.handlers = new Map();
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Update connection state
   */
  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChange) {
        this.onStateChange(newState);
      }
    }
  }

  /**
   * Connect to SSE endpoint
   *
   * SPEC-EV-SSE-005: Frontend connects to GET /api/events/stream
   * SPEC-EV-SSE-006: Connection includes authentication (JWT)
   * SPEC-EV-SSE-007: JWT in header, query param, or cookie
   */
  connect(): void {
    if (this.eventSource) {
      console.warn('[SSE] Already connected or connecting');
      return;
    }

    this.setState(ConnectionState.CONNECTING);
    this.reconnectAttempts = 0;

    try {
      // Build URL with token as query param (EventSource doesn't support headers)
      const connectionUrl = this.token
        ? `${this.url}?token=${encodeURIComponent(this.token)}`
        : this.url;

      console.log('[SSE] Connecting to:', this.url);

      // Create EventSource connection
      this.eventSource = new EventSource(connectionUrl);

      // Handle connection opened
      this.eventSource.addEventListener('open', () => {
        console.log('[SSE] Connection established');
        this.setState(ConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
      });

      // Handle incoming messages
      this.eventSource.addEventListener('message', (event: MessageEvent) => {
        this.handleMessage(event);
      });

      // Handle errors
      this.eventSource.addEventListener('error', (error: Event) => {
        this.handleError(error);
      });

      // Handle specific event types if backend sends them
      this.eventSource.addEventListener('notification', (event: MessageEvent) => {
        this.handleMessage(event);
      });

      this.eventSource.addEventListener('task', (event: MessageEvent) => {
        this.handleMessage(event);
      });

      this.eventSource.addEventListener('data_changed', (event: MessageEvent) => {
        this.handleMessage(event);
      });
    } catch (error) {
      console.error('[SSE] Connection error:', error);
      this.setState(ConnectionState.ERROR);
      if (this.onError && error instanceof Error) {
        this.onError(error);
      }
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.eventSource) {
      console.log('[SSE] Disconnecting...');
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  /**
   * Reconnect (disconnect then connect)
   */
  reconnect(): void {
    console.log('[SSE] Manual reconnect triggered');
    this.disconnect();
    this.connect();
  }

  /**
   * Update authentication token
   */
  setToken(token: string | null): void {
    const tokenChanged = this.token !== token;
    this.token = token;

    // Reconnect if token changed and currently connected
    if (tokenChanged && this.isConnected()) {
      console.log('[SSE] Token changed, reconnecting...');
      this.reconnect();
    }
  }

  /**
   * Handle incoming message
   *
   * SPEC-EV-SSE-021: Format is "data: <json>\n\n"
   * SPEC-EV-FR-001: Frontend uses event to invalidate queries
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const platformEvent: PlatformEvent = JSON.parse(event.data);

      console.log('[SSE] Event received:', platformEvent.type, platformEvent.id);

      // Dispatch to registered handlers
      const handlers = this.handlers.get(platformEvent.type);
      if (handlers && handlers.size > 0) {
        handlers.forEach((handler) => {
          try {
            handler(platformEvent);
          } catch (error) {
            console.error('[SSE] Handler error:', error);
          }
        });
      }

      // Also dispatch to wildcard handlers (if any)
      const wildcardHandlers = this.handlers.get('*' as EventType);
      if (wildcardHandlers && wildcardHandlers.size > 0) {
        wildcardHandlers.forEach((handler) => {
          try {
            handler(platformEvent);
          } catch (error) {
            console.error('[SSE] Wildcard handler error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[SSE] Failed to parse event:', error, event.data);
    }
  }

  /**
   * Handle connection error
   *
   * SPEC-EV-SSE-004: SSE reconnects automatically
   * SPEC-EV-SSE-025: Reconnect in 3-5 seconds
   */
  private handleError(error: Event): void {
    console.error('[SSE] Connection error:', error);

    // Check if connection was open (this is a real error)
    if (this.eventSource?.readyState === EventSource.CLOSED) {
      this.setState(ConnectionState.ERROR);
      this.eventSource = null;

      if (this.onError) {
        this.onError(new Error('SSE connection closed'));
      }

      // Schedule reconnection
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule automatic reconnection
   *
   * SPEC-EV-SSE-026: Frontend MAY implement custom reconnection logic
   */
  private scheduleReconnect(): void {
    if (!this.autoReconnect) {
      console.log('[SSE] Auto-reconnect disabled');
      return;
    }

    // Check max attempts
    if (
      this.maxReconnectAttempts > 0 &&
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      console.error(
        '[SSE] Max reconnection attempts reached:',
        this.maxReconnectAttempts
      );
      this.setState(ConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setState(ConnectionState.RECONNECTING);

    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5); // Max 5x delay
    console.log(
      `[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.connect();
    }, delay);
  }

  /**
   * Register event handler
   *
   * @param eventType - Event type to listen for (or '*' for all events)
   * @param handler - Handler function
   */
  on(eventType: EventType | '*', handler: EventHandler): void {
    if (!this.handlers.has(eventType as EventType)) {
      this.handlers.set(eventType as EventType, new Set());
    }
    this.handlers.get(eventType as EventType)?.add(handler);
  }

  /**
   * Unregister event handler
   *
   * @param eventType - Event type
   * @param handler - Handler function to remove
   */
  off(eventType: EventType | '*', handler: EventHandler): void {
    const handlers = this.handlers.get(eventType as EventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType as EventType);
      }
    }
  }

  /**
   * Remove all handlers for an event type
   */
  removeAllHandlers(eventType?: EventType): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get number of registered handlers
   */
  getHandlerCount(eventType?: EventType): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0;
    }
    let total = 0;
    this.handlers.forEach((handlers) => {
      total += handlers.size;
    });
    return total;
  }
}
