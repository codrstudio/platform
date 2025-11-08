// Robust SSE Client Service
// Based on SPEC-events.md (SPEC-EV-SSE-*, SPEC-EV-FR-*)
// Implements foolproof algorithm that maintains stable connections

import type { PlatformEvent, EventHandler, SSEConnectionState } from '@/types/event'

/**
 * Robust SSE Client
 *
 * Key Features:
 * - Connection lock prevents race conditions
 * - Distinguishes initial onerror (normal) from real errors
 * - Only reconnects when truly necessary (readyState === CLOSED)
 * - Singleton pattern ensures single connection
 * - Clear state machine for predictable behavior
 *
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028
 * SPEC-EV-FR-001 to SPEC-EV-FR-006
 */
class RobustSSEClient {
  // Core properties
  private eventSource: EventSource | null = null
  private eventHandlers: Set<EventHandler> = new Set()
  private connectionState: SSEConnectionState = 'disconnected'

  // Connection management
  private connectionLock = false
  private initialConnectionComplete = false
  private lastEventId: string = '0'

  // Reconnection control
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds (SPEC-EV-SSE-025)
  private reconnectTimer: NodeJS.Timeout | null = null

  // Heartbeat monitoring (optional, for detecting stale connections)
  private heartbeatTimer: NodeJS.Timeout | null = null
  private missedHeartbeats = 0
  private heartbeatInterval = 30000 // 30 seconds

  /**
   * Ensure a valid token exists (user or guest)
   * Returns existing user token or creates a new guest token
   */
  private async ensureToken(): Promise<string> {
    let token = sessionStorage.getItem('access_token')

    if (!token) {
      // No token found, request guest JWT
      try {
        const response = await fetch('/api/1/auth/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Failed to get guest token')
        }

        const data = await response.json()
        token = data.access_token

        if (token) {
          sessionStorage.setItem('access_token', token)
        } else {
          throw new Error('Guest token response missing access_token')
        }
      } catch (error) {
        console.error('[SSE] Failed to obtain guest token', error)
        throw error
      }
    }

    if (!token) {
      throw new Error('Unable to obtain authentication token')
    }

    return token
  }

  /**
   * Connect to SSE stream
   * Guards against race conditions and duplicate connections
   * SPEC-EV-SSE-005 to SPEC-EV-SSE-010
   */
  async connect(): Promise<void> {
    // Guard: Already connected
    if (this.connectionState === 'connected') {
      console.debug('[SSE] Already connected, skipping')
      return
    }

    // Guard: Currently connecting (prevent race conditions)
    if (this.connectionLock) {
      console.debug('[SSE] Connection already in progress, skipping')
      return
    }

    // Acquire connection lock
    this.connectionLock = true
    this.connectionState = 'connecting'
    console.log('[SSE] Connecting to SSE stream')

    try {
      await this.createConnection()
    } catch (error) {
      console.error('[SSE] Failed to create connection', error)
      this.connectionState = 'disconnected'
      this.scheduleReconnect()
    } finally {
      // Release connection lock
      this.connectionLock = false
    }
  }

  /**
   * Create EventSource connection
   * SPEC-EV-FR-004 to SPEC-EV-FR-006: Supports event recovery via lastEventId
   */
  private async createConnection(): Promise<void> {
    // Ensure we have a valid token (user or guest)
    const token = await this.ensureToken()

    // Get last event ID from localStorage for recovery
    const lastEventId = localStorage.getItem('sse_lastEventId') || '0'
    this.lastEventId = lastEventId

    // SPEC-EV-SSE-005: Connect to /api/events/stream
    // Pass JWT token and lastEventId as query params
    const url = `/api/events/stream?token=${encodeURIComponent(token)}&lastEventId=${encodeURIComponent(lastEventId)}`

    console.debug('[SSE] Creating EventSource connection', {
      lastEventId,
      url: url.replace(/token=[^&]+/, 'token=***')
    })

    this.eventSource = new EventSource(url)
    this.setupEventHandlers()
  }

  /**
   * Setup EventSource event handlers
   * Critical: Handles initial onerror correctly
   */
  private setupEventHandlers(): void {
    if (!this.eventSource) return

    // Handle connection open
    this.eventSource.onopen = () => {
      // Only log when truly open (readyState === 1)
      if (this.eventSource?.readyState === EventSource.OPEN) {
        console.log('[SSE] Connection established successfully')
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
        this.initialConnectionComplete = true
        this.startHeartbeatMonitor()
      }
    }

    // Handle incoming messages
    this.eventSource.onmessage = (event) => {
      this.handleMessage(event.data)
    }

    // Handle heartbeat events (if server sends them)
    this.eventSource.addEventListener('heartbeat', () => {
      this.missedHeartbeats = 0 // Reset heartbeat counter
    })

    // CRITICAL: Handle errors correctly
    // Understanding: onerror fires during initial connection (normal browser behavior)
    this.eventSource.onerror = () => {
      // IMPORTANT: Don't panic on first onerror during initial connection
      // This is normal browser behavior while establishing HTTP connection

      if (!this.initialConnectionComplete) {
        // First connection attempt - onerror is normal during handshake
        // Browser is establishing connection, just wait
        console.debug('[SSE] Initial connection in progress...')
        return // Don't do anything, let browser complete handshake
      }

      // We've connected before, so this is a real error
      // Check EventSource state to determine action
      const readyState = this.eventSource?.readyState

      switch (readyState) {
        case EventSource.CONNECTING:
          // Browser is auto-reconnecting - just update our state
          // DO NOT manually reconnect, browser is handling it
          if (this.connectionState === 'connected') {
            this.connectionState = 'reconnecting'
            console.log('[SSE] Connection interrupted, browser auto-reconnecting...')
          }
          break

        case EventSource.CLOSED:
          // Connection permanently closed - need manual reconnection
          console.warn('[SSE] Connection closed permanently, scheduling reconnect')
          this.cleanup()
          this.scheduleReconnect()
          break

        default:
          // Shouldn't happen, but log for debugging
          console.warn('[SSE] Unexpected readyState in error handler:', readyState)
      }
    }
  }

  /**
   * Handle incoming SSE message
   * SPEC-EV-FR-001 to SPEC-EV-FR-003
   */
  private handleMessage(data: string): void {
    try {
      const event: PlatformEvent = JSON.parse(data)

      // SPEC-EV-SSE-028: Store last Stream ID for recovery
      const streamId = event.metadata?.streamId || event.id
      if (streamId) {
        this.lastEventId = streamId as string
        localStorage.setItem('sse_lastEventId', streamId as string)
      }

      // Reset heartbeat counter on any message
      this.missedHeartbeats = 0

      // Notify all registered handlers
      for (const handler of this.eventHandlers) {
        try {
          handler(event)
        } catch (error) {
          console.error('[SSE] Error in event handler:', error)
        }
      }
    } catch (error) {
      console.error('[SSE] Failed to parse event:', error, { rawData: data })
    }
  }

  /**
   * Start heartbeat monitoring
   * Detects stale connections that appear open but aren't receiving data
   */
  private startHeartbeatMonitor(): void {
    this.stopHeartbeatMonitor()

    this.heartbeatTimer = setInterval(() => {
      this.missedHeartbeats++

      // If we miss 3 heartbeats, connection might be stale
      if (this.missedHeartbeats >= 3) {
        console.warn('[SSE] Heartbeat timeout - connection may be stale')
        this.forceReconnect()
      }
    }, this.heartbeatInterval)
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeatMonitor(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.missedHeartbeats = 0
  }

  /**
   * Schedule automatic reconnection
   * SPEC-EV-SSE-025 to SPEC-EV-SSE-027
   */
  private scheduleReconnect(): void {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Check if we should attempt reconnection
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = 'disconnected'
      console.error('[SSE] Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    this.connectionState = 'reconnecting'

    // Exponential backoff (capped at 3x base delay)
    const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3)

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  /**
   * Cleanup EventSource and related resources
   */
  private cleanup(): void {
    this.stopHeartbeatMonitor()

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.initialConnectionComplete = false
  }

  /**
   * Force reconnection (used for stale connections or auth changes)
   */
  private forceReconnect(): void {
    console.log('[SSE] Forcing reconnection')
    this.cleanup()
    this.reconnectAttempts = 0
    this.connect()
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    console.log('[SSE] Disconnecting')

    // Cancel any pending reconnection
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.cleanup()
    this.connectionState = 'disconnected'
    this.reconnectAttempts = 0
  }

  /**
   * Reconnect after user login
   * Replaces guest JWT with user JWT and reconnects SSE
   *
   * @param newToken - The new user JWT token from /api/1/auth/login
   */
  reconnectAfterLogin(newToken: string): void {
    console.log('[SSE] Reconnecting with new user token')

    // Update token in sessionStorage
    sessionStorage.setItem('access_token', newToken)

    // Force reconnection with new token
    this.forceReconnect()
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
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected'
  }

  /**
   * Get last event ID (for recovery)
   * SPEC-EV-ST-014, SPEC-EV-SSE-028
   */
  getLastEventId(): string {
    return this.lastEventId
  }

  /**
   * Get current reconnect attempt count
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  /**
   * Get max reconnect attempts
   */
  getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts
  }
}

// Singleton instance
export const sseClient = new RobustSSEClient()