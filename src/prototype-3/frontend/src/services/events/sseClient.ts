import type { PlatformEvent, SSEConnectionState } from '../../types/events';
import { tokenStorage } from '../auth/tokenStorage';

/**
 * SSE Client Service
 *
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028: SSE protocol implementation
 * SPEC-EV-FR-001 to SPEC-EV-FR-006: Frontend event processing
 */

export type SSEEventHandler = (event: PlatformEvent) => void;
export type SSEStateHandler = (state: SSEConnectionState) => void;
export type SSEErrorHandler = (error: Error) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private maxReconnectDelay = 30000; // 30 seconds
  private baseReconnectDelay = 1000; // 1 second
  private lastEventId: string | null = null;
  private lastEventTime: number | null = null;

  private eventHandlers: Set<SSEEventHandler> = new Set();
  private stateHandlers: Set<SSEStateHandler> = new Set();
  private errorHandlers: Set<SSEErrorHandler> = new Set();

  private currentState: SSEConnectionState = 'disconnected';

  /**
   * Connect to SSE stream
   * SPEC-EV-SSE-005: GET /api/events/stream
   * SPEC-EV-SSE-006 to SPEC-EV-SSE-007: JWT authentication
   */
  connect(): void {
    if (this.eventSource) {
      console.warn('[SSE] Already connected or connecting');
      return;
    }

    try {
      // Get JWT token - SPEC-EV-SSE-006
      const token = tokenStorage.getAccessToken();

      if (!token) {
        throw new Error('No access token available');
      }

      // Update state
      this.setState('connecting');

      // Build SSE URL with token as query param
      // SPEC-EV-SSE-007: JWT can be in query param (EventSource doesn't support custom headers)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/events/stream?token=${encodeURIComponent(token)}`;

      // Create EventSource connection
      // SPEC-EV-SSE-002: SSE uses HTTP GET with persistent connection
      this.eventSource = new EventSource(url);

      // Handle connection open
      this.eventSource.onopen = () => {
        console.log('[SSE] Connection established');
        this.setState('connected');
        this.reconnectAttempt = 0; // Reset reconnect counter
      };

      // Handle incoming messages
      // SPEC-EV-SSE-021: Format is "data: <json>\n\n"
      this.eventSource.onmessage = (event) => {
        this.handleMessage(event);
      };

      // Handle errors
      // SPEC-EV-SSE-004: SSE reconnects automatically if connection drops
      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.handleError(new Error('SSE connection error'));

        // EventSource will automatically try to reconnect
        // But we'll handle our own reconnect logic for better control
        this.disconnect();
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[SSE] Failed to connect:', error);
      this.setState('error');
      this.handleError(error as Error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.setState('disconnected');
      console.log('[SSE] Disconnected');
    }
  }

  /**
   * Schedule reconnection attempt with exponential backoff
   * SPEC-EV-SSE-025 to SPEC-EV-SSE-026: Reconnection logic
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempt),
      this.maxReconnectDelay
    );

    console.log(`[SSE] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempt + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempt++;
      this.connect();
    }, delay);
  }

  /**
   * Handle incoming SSE message
   * SPEC-EV-FR-001: Use event to invalidate queries
   * SPEC-EV-FR-003: Display visual notification
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as PlatformEvent;

      // Store last event metadata
      // SPEC-EV-SSE-028: Store timestamp for recovery
      if ('id' in data) {
        this.lastEventId = data.id;
      }
      this.lastEventTime = Date.now();

      // SPEC-EV-PL-015: Ignore unknown event types (forward compatibility)
      if (!this.isValidEventType(data.type)) {
        console.warn(`[SSE] Unknown event type: ${data.type}, ignoring`);
        return;
      }

      // Notify all event handlers
      this.eventHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[SSE] Error in event handler:', error);
        }
      });
    } catch (error) {
      console.error('[SSE] Failed to parse event data:', error);
    }
  }

  /**
   * Validate event type
   * SPEC-EV-PL-013 to SPEC-EV-PL-015
   */
  private isValidEventType(type: string): boolean {
    const validTypes = [
      'notification',
      'task',
      'data_changed',
      'job-completed',
      'job-failed',
      'job-progress',
      'heartbeat',
    ];
    return validTypes.includes(type);
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error('[SSE] Error in error handler:', err);
      }
    });
  }

  /**
   * Update connection state
   */
  private setState(state: SSEConnectionState): void {
    if (this.currentState === state) {
      return;
    }

    this.currentState = state;
    this.stateHandlers.forEach((handler) => {
      try {
        handler(state);
      } catch (error) {
        console.error('[SSE] Error in state handler:', error);
      }
    });
  }

  /**
   * Subscribe to events
   */
  subscribe(handler: SSEEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(handler: SSEStateHandler): () => void {
    this.stateHandlers.add(handler);
    // Immediately call with current state
    handler(this.currentState);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to errors
   */
  onError(handler: SSEErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Get current connection state
   */
  getState(): SSEConnectionState {
    return this.currentState;
  }

  /**
   * Get last event metadata
   * SPEC-EV-SSE-028: For event recovery
   */
  getLastEventMetadata(): { lastEventId: string | null; lastEventTime: number | null } {
    return {
      lastEventId: this.lastEventId,
      lastEventTime: this.lastEventTime,
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.currentState === 'connected';
  }
}

// Singleton instance
export const sseClient = new SSEClient();
