// useSSE Hook
// Based on SPEC-events.md (SPEC-EV-FR-*)
// Simplified implementation using singleton pattern with stable references

import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sseClient } from '@/services/sseClient'
import type { PlatformEvent, EventHandler, SSEConnectionState } from '@/types/event'
import { toastError, toastSuccess } from '@/lib/toast'

/**
 * useSSE Hook
 *
 * Simplified implementation that:
 * - Connects once and maintains stable connection
 * - Uses useRef to avoid useEffect dependency issues
 * - Doesn't disconnect on unmount (connection persists)
 * - Only shows toasts for real connection state changes
 *
 * SPEC-EV-FR-001 to SPEC-EV-FR-006
 */
export function useSSE() {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected')
  const [lastEvent, setLastEvent] = useState<PlatformEvent | null>(null)
  const prevConnectionStateRef = useRef<SSEConnectionState>('disconnected')

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
      } else if (event.type === 'config-changed' && 'data' in event) {
        // Handle config-changed events (Realm System)
        const eventData = event.data as {
          entity: 'realm' | 'portal'
          entityId: string
          action: 'create' | 'update' | 'delete'
        }
        const { entity, entityId, action } = eventData

        if (entity === 'realm') {
          // Invalidate all realm queries
          queryClient.invalidateQueries({ queryKey: ['realms'] })

          // If specific realm, also invalidate its detail query
          if (action !== 'create') {
            queryClient.invalidateQueries({ queryKey: ['realm', entityId] })
          }

          // Realms affect portals, so invalidate portal queries too
          queryClient.invalidateQueries({ queryKey: ['portals'] })
        } else if (entity === 'portal') {
          // Invalidate all portal queries
          queryClient.invalidateQueries({ queryKey: ['portals'] })

          // If specific portal, also invalidate its detail query
          if (action !== 'create') {
            queryClient.invalidateQueries({ queryKey: ['portal', entityId] })
          }
        }
      }
    },
    [queryClient]
  )

  // Store handler in ref so we can update it without re-running effect
  const handleEventRef = useRef(handleEvent)
  handleEventRef.current = handleEvent

  /**
   * Connect to SSE on mount and setup handlers
   * Uses empty dependency array to run only once
   * Connection persists across component unmounts
   */
  useEffect(() => {
    // Create wrapper that calls the current handler from ref
    // This wrapper reference never changes, solving the dependency issue
    const stableEventHandler: EventHandler = (event) => {
      handleEventRef.current(event)
    }

    // Connect to SSE (will skip if already connected)
    sseClient.connect()

    // Register stable event handler
    sseClient.on(stableEventHandler)

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      const currentState = sseClient.getConnectionState()
      setConnectionState(currentState)
    }, 500) // Check state every 500ms

    // Cleanup: Only remove handler and interval, DON'T disconnect
    return () => {
      sseClient.off(stableEventHandler)
      clearInterval(stateInterval)
      // NOTE: We intentionally don't disconnect here
      // Connection should persist across navigation
    }
  }, []) // Empty dependency array - run once on mount

  /**
   * Show toast notifications on connection state changes
   * Only show when transitioning between meaningful states
   */
  useEffect(() => {
    const prevState = prevConnectionStateRef.current

    // Only show toasts for meaningful transitions
    if (prevState !== connectionState) {
      // Lost connection
      if (prevState === 'connected' && connectionState === 'reconnecting') {
        toastError('Conexão perdida', {
          description: 'Tentando reconectar automaticamente...',
        })
      }

      // Reconnected successfully
      if (prevState === 'reconnecting' && connectionState === 'connected') {
        toastSuccess('Reconectado', {
          description: 'Conexão restabelecida com sucesso',
        })
      }

      // Failed after max attempts
      if (prevState === 'reconnecting' && connectionState === 'disconnected') {
        toastError('Conexão falhou', {
          description: 'Não foi possível restabelecer a conexão',
        })
      }
    }

    // Update ref for next comparison
    prevConnectionStateRef.current = connectionState
  }, [connectionState])

  return {
    connectionState,
    lastEvent,
    isConnected: connectionState === 'connected',
    reconnectAttempts: sseClient.getReconnectAttempts(),
    maxReconnectAttempts: sseClient.getMaxReconnectAttempts(),
  }
}

/**
 * useEventListener Hook
 *
 * Listen to specific event types
 * Uses stable reference pattern to avoid re-registration
 */
export function useEventListener(handler: EventHandler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    // Create stable wrapper
    const stableHandler: EventHandler = (event) => {
      handlerRef.current(event)
    }

    sseClient.on(stableHandler)

    return () => {
      sseClient.off(stableHandler)
    }
  }, []) // Empty deps - register once
}