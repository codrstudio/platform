/**
 * SSE Client - EventSource Wrapper
 *
 * Manages SSE connection to backend with automatic reconnection,
 * JWT authentication, and Last-Event-ID tracking.
 *
 * SPEC References:
 * - SPEC-EV-FE-001:007: Frontend SSE client requirements
 * - SPEC-EV-SSE-025:028: Reconnection behavior
 */

import type { PlatformEvent, ConnectionState, SSEError } from '../../types/events';
import { dispatchEvent } from './eventHandlers';
import { logError, logInfo, logWarning } from '../logging/errorLogger';

const SSE_ENDPOINT = '/api/events/stream';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// SPEC-EV-FE-005: Exponential backoff configuration
const RECONNECT_BASE_DELAY_MS = 1000; // 1 second
const RECONNECT_MAX_DELAY_MS = 30000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10; // After this, require manual reconnect

/**
 * SSE Client Class
 *
 * Singleton service managing EventSource connection
 */
export class SSEClient {
  // EventSource instance
  private eventSource: EventSource | null = null;

  // Connection state
  private connectionState: ConnectionState = 'disconnected';
  private lastEventId: string | null = null;

  // Reconnection management
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = true;

  // Authentication
  private currentToken: string | null = null;

  // State change listeners
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private errorListeners = new Set<(error: SSEError) => void>();

  /**
   * Connect to SSE endpoint
   *
   * SPEC-EV-FE-001: Frontend must use EventSource
   * SPEC-EV-FE-002: Include JWT in connection
   *
   * @param token - JWT access token for authentication
   */
  connect(token: string): void {
    // Already connected with same token
    if (this.eventSource && this.currentToken === token && this.connectionState === 'connected') {
      logInfo('SSE already connected', 'sse-client');
      return;
    }

    // Disconnect existing connection if token changed
    if (this.eventSource && this.currentToken !== token) {
      logInfo('Token changed, reconnecting SSE', 'sse-client');
      this.disconnect();
    }

    this.currentToken = token;
    this.shouldReconnect = true;

    this.createConnection();
  }

  /**
   * Create EventSource connection
   *
   * SPEC-EV-FE-002: JWT in query parameter (EventSource can't set headers)
   * SPEC-EV-FE-004: Track Last-Event-ID for offline recovery
   */
  private createConnection(): void {
    if (!this.currentToken) {
      logWarning('Cannot connect SSE without token', 'sse-client');
      return;
    }

    // Clear any pending reconnect timer
    this.cancelReconnect();

    // Update state to connecting
    this.updateConnectionState('connecting');

    try {
      // Build SSE URL with JWT token
      // SPEC-EV-FE-002: JWT via query parameter
      const url = new URL(`${API_BASE_URL}${SSE_ENDPOINT}`);
      url.searchParams.set('token', this.currentToken);

      // Create EventSource
      this.eventSource = new EventSource(url.toString());

      // Set up event listeners
      this.setupEventListeners();

      logInfo('SSE connection initiated', 'sse-client', { url: SSE_ENDPOINT });
    } catch (error) {
      logError(error as Error, {
        category: 'sse-client',
        level: 'ERROR',
        context: { action: 'create-connection' }
      });

      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Setup EventSource event listeners
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Connection opened
    this.eventSource.onopen = () => {
      logInfo('SSE connection established', 'sse-client');
      this.updateConnectionState('connected');

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    };

    // Message received
    this.eventSource.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    // Connection error
    this.eventSource.onerror = () => {
      this.handleConnectionError(new Error('SSE connection error'));
    };
  }

  /**
   * Handle incoming SSE message
   *
   * SPEC-EV-FE-004: Track Last-Event-ID
   * SPEC-EV-FR-001:006: Process events
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // SPEC-EV-FE-004: Track Last-Event-ID for recovery
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }

      // Parse event data
      // Backend sends: data: <json>\n\n
      const eventData: PlatformEvent = JSON.parse(event.data);

      // SPEC-EV-FR-001: Dispatch to handlers
      dispatchEvent(eventData).catch((error) => {
        logError(error, {
          category: 'sse-client',
          level: 'ERROR',
          context: { action: 'dispatch-event', eventType: eventData.type }
        });
      });

    } catch (error) {
      logError(error as Error, {
        category: 'sse-client',
        level: 'ERROR',
        context: { action: 'parse-message', data: event.data }
      });
    }
  }

  /**
   * Handle connection error
   *
   * SPEC-EV-FE-003: Implement automatic reconnection
   * SPEC-EV-FE-005: Exponential backoff
   */
  private handleConnectionError(error: Error): void {
    logWarning('SSE connection error', 'sse-client', { error: error.message });

    this.updateConnectionState('error');

    // Create SSE error
    const sseError: SSEError = Object.assign(error, {
      code: 'CONNECTION_ERROR',
      recoverable: this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS
    });

    // Notify error listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(sseError);
      } catch (err) {
        logError(err as Error, { category: 'sse-client', context: { action: 'error-listener' } });
      }
    });

    // Attempt reconnection if allowed
    if (this.shouldReconnect && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logError(new Error('Max reconnect attempts reached'), {
        category: 'sse-client',
        level: 'ERROR',
        context: { attempts: this.reconnectAttempts }
      });
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   *
   * SPEC-EV-FE-005: Exponential backoff (1s, 2s, 4s, ... max 30s)
   */
  private scheduleReconnect(): void {
    // Cancel any existing timer
    this.cancelReconnect();

    // Calculate delay with exponential backoff
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY_MS
    );

    this.reconnectAttempts++;

    logInfo(`Scheduling SSE reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`, 'sse-client');

    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) {
        this.createConnection();
      }
    }, delay);
  }

  /**
   * Cancel scheduled reconnection
   */
  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Disconnect from SSE endpoint
   *
   * Call on logout or cleanup
   */
  disconnect(): void {
    logInfo('Disconnecting SSE', 'sse-client');

    this.shouldReconnect = false;
    this.cancelReconnect();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.updateConnectionState('disconnected');
    this.currentToken = null;
  }

  /**
   * Manually trigger reconnection
   *
   * Resets retry count and attempts immediate connection
   */
  reconnect(): void {
    if (!this.currentToken) {
      logWarning('Cannot reconnect SSE without token', 'sse-client');
      return;
    }

    logInfo('Manual SSE reconnect triggered', 'sse-client');

    this.reconnectAttempts = 0;
    this.shouldReconnect = true;

    this.disconnect();
    this.createConnection();
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) return;

    this.connectionState = state;

    // Notify state listeners
    this.stateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logError(error as Error, { category: 'sse-client', context: { action: 'state-listener' } });
      }
    });
  }

  /**
   * Get current connection state
   *
   * SPEC-EV-FE-006: Connection state tracking
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get last event ID
   *
   * SPEC-EV-FE-004: Track Last-Event-ID for offline recovery
   */
  getLastEventId(): string | null {
    return this.lastEventId;
  }

  /**
   * Register connection state change listener
   *
   * @param listener - Callback for state changes
   * @returns Unsubscribe function
   */
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  /**
   * Register error listener
   *
   * @param listener - Callback for errors
   * @returns Unsubscribe function
   */
  onError(listener: (error: SSEError) => void): () => void {
    this.errorListeners.add(listener);

    return () => {
      this.errorListeners.delete(listener);
    };
  }
}

// Export singleton instance
export const sseClient = new SSEClient();
