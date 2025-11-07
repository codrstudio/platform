// useSSE Hook
// Based on SPEC-events.md (SPEC-EV-FR-*)

import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sseClient } from '@/services/sseClient'
import type { PlatformEvent, EventHandler, SSEConnectionState } from '@/types/event'

/**
 * useSSE Hook
 *
 * Connects to SSE stream and handles events
 * SPEC-EV-FR-001 to SPEC-EV-FR-006
 */
export function useSSE(userId: string | null) {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected')
  const [lastEvent, setLastEvent] = useState<PlatformEvent | null>(null)

  /**
   * Handle incoming event
   * SPEC-EV-FR-001: Invalidate queries
   * SPEC-EV-FR-002: Fetch data via JQEL (handled by TanStack Query)
   */
  const handleEvent = useCallback(
    (event: PlatformEvent) => {
      setLastEvent(event)

      // SPEC-EV-FR-001: Invalidate related queries based on event type
      if (event.type === 'notification') {
        queryClient.invalidateQueries({
          queryKey: ['platform', 'notifications'],
        })
      } else if (event.type === 'task') {
        queryClient.invalidateQueries({
          queryKey: ['platform', 'tasks'],
        })
      } else if (event.type === 'job-completed' || event.type === 'job-failed') {
        queryClient.invalidateQueries({
          queryKey: ['platform', 'jobs', event.data.jobId],
        })
      }

      // Optional: Show visual notification
      // SPEC-EV-FR-003: Display notification visual
      console.log('Event received:', event)
    },
    [queryClient]
  )

  /**
   * Fetch missed events on reconnect
   * SPEC-EV-FR-004 to SPEC-EV-FR-006
   */
  const fetchMissedEvents = useCallback(async () => {
    if (!userId) return

    const lastEventId = sseClient.getLastEventId()
    const missedEvents = await sseClient.fetchMissedEvents(userId, lastEventId)

    // SPEC-EV-FR-006: Process missed events as new events
    for (const event of missedEvents) {
      handleEvent(event)
    }
  }, [userId, handleEvent])

  /**
   * Connect to SSE on mount and handle reconnections
   */
  useEffect(() => {
    if (!userId) {
      sseClient.disconnect()
      setConnectionState('disconnected')
      return
    }

    // Connect to SSE
    sseClient.connect(userId)

    // Register event handler
    sseClient.on(handleEvent)

    // Fetch missed events on connect
    fetchMissedEvents()

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(sseClient.getConnectionState())
    }, 1000)

    // Cleanup on unmount
    return () => {
      sseClient.off(handleEvent)
      clearInterval(stateInterval)
      // Keep connection open (don't disconnect on unmount unless user logs out)
    }
  }, [userId, handleEvent, fetchMissedEvents])

  return {
    connectionState,
    lastEvent,
    isConnected: connectionState === 'connected',
  }
}

/**
 * useEventListener Hook
 *
 * Listen to specific event types
 */
export function useEventListener(handler: EventHandler) {
  useEffect(() => {
    sseClient.on(handler)

    return () => {
      sseClient.off(handler)
    }
  }, [handler])
}
