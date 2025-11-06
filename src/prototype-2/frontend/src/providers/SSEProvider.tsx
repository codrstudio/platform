/**
 * SSE Provider - React Context for SSE State
 *
 * Manages SSE connection lifecycle tied to authentication state.
 * Provides connection status and control methods to components.
 *
 * SPEC References:
 * - SPEC-EV-FE-006: Connection state tracking
 * - SPEC-EV-FR-001:006: Event processing integration
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { sseClient } from '../services/events';
import { useAuth } from './AuthProvider';
import type { ConnectionState, SSEError } from '../types/events';

interface SSEContextValue {
  connectionState: ConnectionState;
  lastEventId: string | null;
  error: SSEError | null;
  reconnect: () => void;
}

const SSEContext = createContext<SSEContextValue | undefined>(undefined);

/**
 * SSEProvider Component
 *
 * Manages SSE connection automatically based on auth state
 */
export function SSEProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuth();

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [error, setError] = useState<SSEError | null>(null);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Connect SSE with current token
      sseClient.connect(accessToken);
    } else {
      // Disconnect SSE when logged out
      sseClient.disconnect();
    }

    // Cleanup on unmount
    return () => {
      sseClient.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribeState = sseClient.onStateChange((state) => {
      setConnectionState(state);

      // Update last event ID when connected
      if (state === 'connected') {
        setLastEventId(sseClient.getLastEventId());
      }
    });

    const unsubscribeError = sseClient.onError((err) => {
      setError(err);
    });

    // Set initial state
    setConnectionState(sseClient.getConnectionState());
    setLastEventId(sseClient.getLastEventId());

    return () => {
      unsubscribeState();
      unsubscribeError();
    };
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    setError(null);
    sseClient.reconnect();
  }, []);

  const value = useMemo<SSEContextValue>(
    () => ({
      connectionState,
      lastEventId,
      error,
      reconnect
    }),
    [connectionState, lastEventId, error, reconnect]
  );

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

/**
 * Hook to access SSE context
 *
 * @throws Error if used outside SSEProvider
 */
export function useSSE(): SSEContextValue {
  const context = useContext(SSEContext);

  if (context === undefined) {
    throw new Error('useSSE must be used within an SSEProvider');
  }

  return context;
}
