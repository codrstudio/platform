/**
 * SSE Provider
 *
 * React context provider for Server-Sent Events (SSE) real-time communication.
 * Auto-connects when user is authenticated and manages connection lifecycle.
 *
 * SPEC References:
 * - SPEC-EV-SSE-001: Frontend connects via SSE to receive events
 * - SPEC-EV-SSE-006: Connection includes authentication (JWT)
 * - SPEC-EV-SSE-028: Frontend stores timestamp of last event received
 */

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EventSourceManager } from '../services/events/EventSourceManager';
import type {
  SSEContextValue,
  ConnectionState,
  EventType,
  EventHandler,
  PlatformEvent,
} from '../services/events/types';

/**
 * SSE Context
 */
export const SSEContext = createContext<SSEContextValue | null>(null);

/**
 * SSE Provider Props
 */
interface SSEProviderProps {
  children: React.ReactNode;

  /** SSE endpoint URL (default: /api/events/stream) */
  url?: string;

  /** Auto-connect when authenticated (default: true) */
  autoConnect?: boolean;

  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;

  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number;

  /** Max reconnect attempts, 0 = infinite (default: 0) */
  maxReconnectAttempts?: number;
}

/**
 * SSE Provider Component
 *
 * Wraps the application and provides SSE connection management.
 * Auto-connects when user is authenticated.
 *
 * @example
 * <SSEProvider>
 *   <App />
 * </SSEProvider>
 */
export function SSEProvider({
  children,
  url = '/api/events/stream',
  autoConnect = true,
  autoReconnect = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 0,
}: SSEProviderProps): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [lastEventTimestamp, setLastEventTimestamp] = useState<string | null>(null);
  const managerRef = useRef<EventSourceManager | null>(null);
  const handlersRef = useRef<Map<EventType, Set<EventHandler>>>(new Map());

  /**
   * Initialize EventSourceManager
   */
  useEffect(() => {
    // Create manager instance
    const manager = new EventSourceManager({
      url,
      token: null, // Will be set when authenticated
      autoReconnect,
      reconnectDelay,
      maxReconnectAttempts,
      onStateChange: (newState) => {
        console.log('[SSEProvider] State changed:', newState);
        setState(newState);
      },
      onError: (error) => {
        console.error('[SSEProvider] Error:', error);
      },
    });

    managerRef.current = manager;

    // Register global handler to track last event timestamp
    const timestampHandler: EventHandler = (event: PlatformEvent) => {
      if (event.timestamp) {
        setLastEventTimestamp(event.timestamp);
      }
    };
    manager.on('*', timestampHandler);

    // Cleanup on unmount
    return () => {
      console.log('[SSEProvider] Cleaning up...');
      manager.off('*', timestampHandler);
      manager.disconnect();
      managerRef.current = null;
    };
  }, [url, autoReconnect, reconnectDelay, maxReconnectAttempts]);

  /**
   * Auto-connect/disconnect based on authentication
   *
   * SPEC-EV-SSE-006: Connection includes authentication (JWT)
   */
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (isAuthenticated && user && autoConnect) {
      // User is authenticated, connect to SSE
      console.log('[SSEProvider] User authenticated, connecting to SSE...');

      // Get access token from auth context (assuming it's available)
      // In a real implementation, we'd get this from the auth service
      const token = localStorage.getItem('access_token');

      if (token) {
        manager.setToken(token);
        manager.connect();
      } else {
        console.warn('[SSEProvider] No access token found, cannot connect');
      }
    } else if (!isAuthenticated && manager.isConnected()) {
      // User logged out, disconnect
      console.log('[SSEProvider] User logged out, disconnecting from SSE...');
      manager.disconnect();
    }
  }, [isAuthenticated, user, autoConnect]);

  /**
   * Subscribe to event type
   */
  const on = useCallback((eventType: EventType, handler: EventHandler): void => {
    const manager = managerRef.current;
    if (!manager) return;

    // Register handler in manager
    manager.on(eventType, handler);

    // Track handler in local map for cleanup
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)?.add(handler);
  }, []);

  /**
   * Unsubscribe from event type
   */
  const off = useCallback((eventType: EventType, handler: EventHandler): void => {
    const manager = managerRef.current;
    if (!manager) return;

    // Unregister handler from manager
    manager.off(eventType, handler);

    // Remove from local tracking
    const handlers = handlersRef.current.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        handlersRef.current.delete(eventType);
      }
    }
  }, []);

  /**
   * Manually connect
   */
  const connect = useCallback((): void => {
    const manager = managerRef.current;
    if (!manager) return;

    const token = localStorage.getItem('access_token');
    if (token) {
      manager.setToken(token);
      manager.connect();
    } else {
      console.warn('[SSEProvider] Cannot connect: no access token');
    }
  }, []);

  /**
   * Manually disconnect
   */
  const disconnect = useCallback((): void => {
    const manager = managerRef.current;
    if (!manager) return;

    manager.disconnect();
  }, []);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback((): void => {
    const manager = managerRef.current;
    if (!manager) return;

    manager.reconnect();
  }, []);

  /**
   * Context value
   */
  const contextValue: SSEContextValue = {
    state,
    isConnected: state === 'connected',
    lastEventTimestamp,
    on,
    off,
    connect,
    disconnect,
    reconnect,
  };

  return <SSEContext.Provider value={contextValue}>{children}</SSEContext.Provider>;
}
