/**
 * useSSE Hook
 *
 * React hook for consuming SSE events from the SSEProvider context.
 * Provides utilities for subscribing to events and managing connection state.
 *
 * SPEC References:
 * - SPEC-EV-FR-001: Frontend uses event to invalidate queries
 * - SPEC-EV-FR-002: Frontend fetches complete data via JQEL after invalidation
 */

import { useContext, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SSEContext } from '../../providers/SSEProvider';
import type { EventType, EventHandler, PlatformEvent, DataChangedEvent } from './types';

/**
 * Hook to access SSE context
 *
 * @throws Error if used outside SSEProvider
 */
export function useSSE() {
  const context = useContext(SSEContext);

  if (!context) {
    throw new Error('useSSE must be used within SSEProvider');
  }

  return context;
}

/**
 * Hook to subscribe to specific event types
 *
 * Automatically handles cleanup on unmount.
 *
 * @param eventType - Event type to listen for
 * @param handler - Handler function
 * @param deps - Dependencies array (like useEffect)
 *
 * @example
 * useSSEEvent('notification', (event) => {
 *   console.log('Notification received:', event);
 * });
 */
export function useSSEEvent(
  eventType: EventType,
  handler: EventHandler,
  deps: React.DependencyList = []
): void {
  const { on, off } = useSSE();
  const handlerRef = useRef(handler);

  // Keep handler ref updated
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler: EventHandler = (event) => {
      handlerRef.current(event);
    };

    on(eventType, wrappedHandler);

    return () => {
      off(eventType, wrappedHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, on, off, ...deps]);
}

/**
 * Hook to auto-invalidate TanStack Query on data_changed events
 *
 * SPEC-EV-FR-001: Frontend uses event to invalidate queries
 * SPEC-EV-FR-002: Frontend fetches complete data via JQEL after invalidation
 *
 * @param options - Configuration options
 *
 * @example
 * // Invalidate all queries when any data changes
 * useSSEQueryInvalidation();
 *
 * @example
 * // Invalidate only specific entities
 * useSSEQueryInvalidation({
 *   entities: ['portal', 'module'],
 * });
 */
export function useSSEQueryInvalidation(options?: {
  /** Only invalidate queries for these entities */
  entities?: string[];
  /** Custom invalidation logic */
  onInvalidate?: (event: DataChangedEvent) => void;
}): void {
  const queryClient = useQueryClient();
  const { entities, onInvalidate } = options || {};

  useSSEEvent('data_changed', (event: PlatformEvent) => {
    const dataEvent = event as DataChangedEvent;

    // Check if we should process this event
    if (entities && !entities.includes(dataEvent.entity)) {
      return; // Skip this entity
    }

    console.log(
      `[SSE] Data changed: ${dataEvent.entity} (${dataEvent.operation})`,
      dataEvent.changedIds
    );

    // Custom invalidation logic if provided
    if (onInvalidate) {
      onInvalidate(dataEvent);
      return;
    }

    // Default: Invalidate all queries for this entity
    // Uses JQEL query key pattern: ['jqel', schema, entity, ...]
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        // Check if this is a JQEL query for the changed entity
        return (
          Array.isArray(queryKey) &&
          queryKey[0] === 'jqel' &&
          queryKey.length >= 3 &&
          queryKey[2] === dataEvent.entity
        );
      },
    });
  });
}

/**
 * Hook to get connection status
 *
 * @returns Connection state information
 *
 * @example
 * const { isConnected, state } = useSSEConnection();
 * if (!isConnected) {
 *   return <div>Connecting to real-time updates...</div>;
 * }
 */
export function useSSEConnection() {
  const { state, isConnected, connect, disconnect, reconnect } = useSSE();

  return {
    state,
    isConnected,
    connect: useCallback(connect, [connect]),
    disconnect: useCallback(disconnect, [disconnect]),
    reconnect: useCallback(reconnect, [reconnect]),
  };
}

/**
 * Hook to show notification when specific event type is received
 *
 * Useful for displaying toast notifications or alerts.
 *
 * @param eventType - Event type to listen for
 * @param showNotification - Function to show notification
 *
 * @example
 * useSSENotification('notification', (event) => {
 *   toast.info((event as NotificationEvent).message);
 * });
 */
export function useSSENotification(
  eventType: EventType,
  showNotification: (event: PlatformEvent) => void
): void {
  useSSEEvent(eventType, (event) => {
    showNotification(event);
  });
}

/**
 * Hook to get last event timestamp
 *
 * Useful for syncing state or recovering missed events.
 *
 * SPEC-EV-SSE-028: Frontend stores timestamp of last event received
 * SPEC-EV-FR-004: On reconnect, frontend fetches missed events via JQEL
 *
 * @example
 * const lastEventTimestamp = useSSELastEvent();
 * // Use this to fetch missed events after reconnection
 */
export function useSSELastEvent(): string | null {
  const { lastEventTimestamp } = useSSE();
  return lastEventTimestamp;
}
