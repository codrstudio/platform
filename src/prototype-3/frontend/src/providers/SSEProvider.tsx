import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sseClient } from '../services/events/sseClient';
import type { PlatformEvent, SSEConnectionState, DataChangedEvent, ConfigChangedEvent } from '../types/events';
import { useAuth } from './AuthProvider';
import { handleConfigChanged } from '../services/events/configHandler';

/**
 * SSE Provider - Real-time Events
 *
 * SPEC-EV-FR-001 to SPEC-EV-FR-006: Frontend event processing
 * SPEC-DA-EV-001 to SPEC-DA-EV-008: Cache invalidation via events
 * SPEC-EV-SSE-025 to SPEC-EV-SSE-028: Reconnection and recovery
 */

interface SSEContextValue {
  state: SSEConnectionState;
  lastEvent: PlatformEvent | null;
  lastEventTime: number | null;
  subscribe: (handler: (event: PlatformEvent) => void) => () => void;
}

const SSEContext = createContext<SSEContextValue | undefined>(undefined);

interface SSEProviderProps {
  children: ReactNode;
}

/**
 * SSE Provider Component
 *
 * Manages SSE connection lifecycle and automatic cache invalidation
 * SPEC-EV-FR-001: Invalidate queries on data_changed events
 * SPEC-DA-EV-005: Global listener for data events
 */
export function SSEProvider({ children }: SSEProviderProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<SSEConnectionState>('disconnected');
  const [lastEvent, setLastEvent] = useState<PlatformEvent | null>(null);
  const [lastEventTime, setLastEventTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if not authenticated
      sseClient.disconnect();
      return;
    }

    // Connect when authenticated
    sseClient.connect();

    // Subscribe to state changes
    const unsubscribeState = sseClient.onStateChange((newState) => {
      setState(newState);
    });

    // Subscribe to events
    const unsubscribeEvents = sseClient.subscribe((event) => {
      setLastEvent(event);
      setLastEventTime(Date.now());

      // Handle data_changed events for cache invalidation
      // SPEC-DA-EV-001 to SPEC-DA-EV-008
      if (event.type === 'data_changed') {
        handleDataChangedEvent(event as DataChangedEvent);
      }

      // Handle config_changed events for configuration hot reload
      // SPEC-CF-AS-013: Backend broadcasts config changes via Redis Pub/Sub
      if (event.type === 'config_changed') {
        handleConfigChanged(event as ConfigChangedEvent, queryClient);
      }
    });

    // Subscribe to errors
    const unsubscribeErrors = sseClient.onError((error) => {
      console.error('[SSE Provider] Error:', error);
    });

    // Cleanup on unmount or auth change
    return () => {
      unsubscribeState();
      unsubscribeEvents();
      unsubscribeErrors();
      sseClient.disconnect();
    };
  }, [isAuthenticated]);

  /**
   * Handle data_changed events
   * SPEC-DA-EV-003: Invalidate related queries
   * SPEC-DA-EV-007: Three-tier invalidation strategy
   */
  const handleDataChangedEvent = (event: DataChangedEvent) => {
    const { schema, entity, ids } = event.data;

    if (ids && ids.length > 0) {
      // SPEC-DA-EV-007: Specific - invalidate individual records
      ids.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: [schema, entity, { id }],
        });
      });
      console.log(`[SSE] Invalidated ${ids.length} specific records: ${schema}.${entity}`);
    } else {
      // SPEC-DA-EV-007: Broad - invalidate entire entity
      queryClient.invalidateQueries({
        queryKey: [schema, entity],
      });
      console.log(`[SSE] Invalidated all queries for: ${schema}.${entity}`);
    }

    // SPEC-DA-EV-002: Refetch happens automatically after invalidation
    console.log('[SSE] Cache invalidation complete, queries will refetch');
  };

  /**
   * Allow components to subscribe to events
   */
  const subscribe = (handler: (event: PlatformEvent) => void) => {
    return sseClient.subscribe(handler);
  };

  const value: SSEContextValue = {
    state,
    lastEvent,
    lastEventTime,
    subscribe,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

/**
 * useSSEContext hook
 *
 * Access SSE context from components
 */
export function useSSEContext(): SSEContextValue {
  const context = useContext(SSEContext);

  if (!context) {
    throw new Error('useSSEContext must be used within SSEProvider');
  }

  return context;
}
