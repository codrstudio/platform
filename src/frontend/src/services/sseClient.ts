// SSE Client Service
// Based on SPEC-events.md (SPEC-EV-SSE-*, SPEC-EV-FR-*)

import type { PlatformEvent, EventHandler, SSEConnectionState } from '@/types/event'

/**
 * SSE Client
 * Manages Server-Sent Events connection with auto-reconnect
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028
 * SPEC-EV-FR-001 to SPEC-EV-FR-006
 */
class SSEClient {
  private eventSource: EventSource | null = null
  private eventHandlers: Set<EventHandler> = new Set()
  private connectionState: SSEConnectionState = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds (SPEC-EV-SSE-025)
  private lastEventId: string = '0'
  private userId: string | null = null

  /**
   * Connect to SSE stream
   * SPEC-EV-SSE-005 to SPEC-EV-SSE-010
   */
  connect(userId: string): void {
    if (this.eventSource && this.userId === userId) {
      console.log('SSE already connected')
      return
    }

    this.userId = userId
    this.connectionState = 'connecting'
    this.createConnection()
  }

  /**
   * Create EventSource connection
   */
  private createConnection(): void {
    if (!this.userId) {
      console.error('Cannot connect SSE without userId')
      return
    }

    try {
      // SPEC-EV-SSE-005: Connect to /api/events/stream
      // SPEC-EV-SSE-007: Pass userId as query param (in production, use JWT)
      const url = `/api/events/stream?userId=${encodeURIComponent(this.userId)}`
      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        console.log('SSE connection established')
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.eventSource.onerror = () => {
        console.error('SSE connection error')
        this.handleError()
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      this.handleError()
    }
  }

  /**
   * Handle incoming SSE message
   * SPEC-EV-FR-001 to SPEC-EV-FR-003
   */
  private handleMessage(data: string): void {
    try {
      const event: PlatformEvent = JSON.parse(data)

      // SPEC-EV-SSE-028: Store last event ID
      this.lastEventId = event.id

      // Notify all registered handlers
      for (const handler of this.eventHandlers) {
        handler(event)
      }
    } catch (error) {
      console.error('Failed to parse SSE event:', error)
    }
  }

  /**
   * Handle connection error and attempt reconnect
   * SPEC-EV-SSE-025 to SPEC-EV-SSE-027
   */
  private handleError(): void {
    this.connectionState = 'reconnecting'
    this.closeConnection()

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Reconnecting SSE (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      )

      setTimeout(() => {
        this.createConnection()
      }, this.reconnectDelay * this.reconnectAttempts) // Exponential backoff
    } else {
      console.error('Max reconnect attempts reached')
      this.connectionState = 'disconnected'
    }
  }

  /**
   * Close EventSource connection
   */
  private closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    this.closeConnection()
    this.connectionState = 'disconnected'
    this.userId = null
    this.reconnectAttempts = 0
  }

  /**
   * Register event handler
   */
  on(handler: EventHandler): void {
    this.eventHandlers.add(handler)
  }

  /**
   * Unregister event handler
   */
  off(handler: EventHandler): void {
    this.eventHandlers.delete(handler)
  }

  /**
   * Get current connection state
   */
  getConnectionState(): SSEConnectionState {
    return this.connectionState
  }

  /**
   * Get last event ID (for recovery)
   * SPEC-EV-ST-014, SPEC-EV-SSE-028
   */
  getLastEventId(): string {
    return this.lastEventId
  }

  /**
   * Fetch missed events from history
   * SPEC-EV-FR-004 to SPEC-EV-FR-006
   */
  async fetchMissedEvents(userId: string, lastEventId?: string): Promise<PlatformEvent[]> {
    try {
      const eventId = lastEventId || this.lastEventId
      const url = `/api/events/history?userId=${encodeURIComponent(userId)}&lastEventId=${encodeURIComponent(eventId)}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Failed to fetch missed events:', error)
      return []
    }
  }
}

// Singleton instance
export const sseClient = new SSEClient()
