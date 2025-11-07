// Event Context
// Global SSE connection management

import { createContext, useContext, type ReactNode } from 'react'
import { useSSE } from '@/hooks/useSSE'
import { useAuth } from '@/contexts/AuthContext'
import type { PlatformEvent, SSEConnectionState } from '@/types/event'

interface EventContextValue {
  connectionState: SSEConnectionState
  lastEvent: PlatformEvent | null
  isConnected: boolean
}

const EventContext = createContext<EventContextValue | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ? String(user.id) : null
  const { connectionState, lastEvent, isConnected } = useSSE(userId)

  return (
    <EventContext.Provider
      value={{
        connectionState,
        lastEvent,
        isConnected,
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
