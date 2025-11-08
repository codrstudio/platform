// Event Context
// Global SSE connection management

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useSSE } from '@/hooks/useSSE'
import { sseClient } from '@/services/sseClient'
import type { PlatformEvent, SSEConnectionState } from '@/types/event'

interface EventContextValue {
  connectionState: SSEConnectionState
  lastEvent: PlatformEvent | null
  isConnected: boolean
  reconnectAfterLogin: (newToken: string) => void
}

const EventContext = createContext<EventContextValue | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const { connectionState, lastEvent, isConnected } = useSSE()

  /**
   * Reconnect SSE after user login
   * Replaces guest JWT with user JWT
   */
  const reconnectAfterLogin = useCallback((newToken: string) => {
    sseClient.reconnectAfterLogin(newToken)
  }, [])

  return (
    <EventContext.Provider
      value={{
        connectionState,
        lastEvent,
        isConnected,
        reconnectAfterLogin,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}
