# Task Plan: 1.5.9 - Criar EventSource connection manager

## Context and Objective

This task implements the frontend SSE (Server-Sent Events) client that connects to the backend `/api/events/stream` endpoint and manages real-time event delivery to the application.

**What will be implemented:**
- EventSource wrapper service managing persistent SSE connections
- JWT authentication integration with AuthProvider
- Automatic reconnection with exponential backoff
- Last-Event-ID tracking for offline recovery
- Connection state management (connecting, connected, disconnected, error)
- Event handler registration system
- Integration with TanStack Query for cache invalidation

**Why it's needed:**
The frontend SSE client is the final piece of the real-time events system. It enables:
- Push notifications from backend to frontend
- Live task status updates
- Real-time data invalidation for TanStack Query
- Immediate user feedback for async operations
- Foundation for collaborative features

**How it integrates:**
- Uses JWT tokens from AuthProvider for authentication
- Sends events to registered handlers (e.g., notifications module)
- Triggers TanStack Query invalidation based on event types
- Integrates with error logging system
- Reconnects automatically on token refresh

**Business value:**
- Real-time user experience without polling
- Reduced server load (no repeated API calls)
- Immediate feedback for background operations
- Better collaboration between users
- Foundation for future real-time modules

**User impact:**
Users receive instant notifications and updates as they happen, creating a responsive, modern application experience without page refreshes or manual reloading.

## Dependencies

### Prerequisite Tasks
- **1.3 - Authentication System**: JWT tokens from AuthProvider required for SSE auth
- **1.4 - JQEL System**: TanStack Query setup for cache invalidation
- **1.5.1 - Backend SSE endpoint**: `/api/events/stream` must be implemented
- **1.5.2-1.5.8 - Backend SSE features**: Heartbeat, reconnection, event types implemented

### Files/Modules Affected

**Files to Create:**
- `frontend/src/services/events/sseClient.ts` - EventSource wrapper service
- `frontend/src/services/events/eventHandlers.ts` - Event handler registry
- `frontend/src/services/events/index.ts` - Public exports
- `frontend/src/providers/SSEProvider.tsx` - SSE context provider
- `frontend/src/hooks/useSSE.ts` - Hook to access SSE context
- `frontend/src/hooks/useEventHandler.ts` - Hook to register event handlers
- `frontend/src/types/events.ts` - Frontend event types

**Files to Modify:**
- `frontend/src/App.tsx` - Wrap with SSEProvider
- `frontend/src/providers/AuthProvider.tsx` - Trigger SSE reconnect on token refresh
- `frontend/src/services/jqel/invalidation.ts` - Add event-driven invalidation

### Enables Tasks
- **1.6.1 - Notifications Module**: Will consume SSE events via useEventHandler
- **1.6.2 - Tasks Module**: Will listen to task events for status updates
- **3.2 - Chat Module**: Will use SSE for real-time messaging
- **Dashboard widgets**: Will update in real-time based on events

### External Dependencies
- Built-in `EventSource` API (browser native, no library needed)
- React 19 (already installed) - For context and hooks
- TanStack Query (already installed) - For cache invalidation

## Patterns Identified in Codebase

### Similar Components/Modules

**AuthProvider Pattern (`frontend/src/providers/AuthProvider.tsx`):**
- Context provider with React.Context
- Singleton service instance (exported separately)
- Automatic initialization on mount
- Token renewal integration with exponential backoff
- Cleanup on unmount to prevent memory leaks
- Pattern:
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Initialize on mount
    initialize();
    return () => cleanup(); // Cleanup on unmount
  }, []);

  const value = useMemo(() => ({ state, methods }), [state]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
```

**JQEL Client Service (`frontend/src/services/jqel/client.ts`):**
- Simple exported functions (no class)
- Environment variable for API base URL
- Error handling with typed errors
- Pattern:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function jqelQuery<T>(query: JQELQuery): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/api/jqel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  return parseJQELResponse<T>(response);
}
```

**Error Handling (`frontend/src/services/jqel/errors.ts`):**
- Custom error classes extending Error
- Helper methods for error type checking
- Integration with error logger
- Pattern:
```typescript
export class JQELError extends Error {
  code: number;
  field?: string;

  constructor(jresult: JResult) {
    super(jresult.message || 'JQEL query failed');
    this.name = 'JQELError';
    this.code = jresult.code;
  }

  isServerError(): boolean {
    return this.code >= 500 && this.code < 600;
  }
}
```

**Optimistic Mutation Hooks (`frontend/src/hooks/jqel/useOptimisticMutation.ts`):**
- Custom hook wrapping TanStack mutation
- Snapshot/rollback pattern
- Error handling with callbacks
- Pattern:
```typescript
export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      const snapshot = await onMutate?.(variables);
      return { snapshot };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.snapshot) {
        rollback(context.snapshot);
      }
      onError?.(error, variables, context);
    },
    onSuccess,
  });
}
```

### Conventions to Follow

**Naming Conventions:**
- Service files: `camelCase.ts` (e.g., `sseClient.ts`)
- Provider components: `PascalCase.tsx` (e.g., `SSEProvider.tsx`)
- Hooks: `use[Feature].ts` (e.g., `useSSE.ts`, `useEventHandler.ts`)
- Types: `camelCase.ts` (e.g., `events.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `SSE_ENDPOINT`)

**File Structure:**
```
frontend/src/
├── services/
│   └── events/
│       ├── sseClient.ts        # EventSource wrapper
│       ├── eventHandlers.ts    # Handler registry
│       └── index.ts            # Public exports
├── providers/
│   └── SSEProvider.tsx         # Context provider
├── hooks/
│   ├── useSSE.ts               # SSE context hook
│   └── useEventHandler.ts      # Event handler hook
└── types/
    └── events.ts               # Event type definitions
```

**Import/Export Patterns:**
- Services export functions and instances
- Providers export default component + named hook
- Hooks export function
- Types export interfaces/types only
- Use barrel exports (index.ts) for public API

**State Management:**
- Context for global SSE state (connection status, error state)
- Local state for connection management in service
- No external state library needed
- Event handlers stored in Map for O(1) lookup

**Error Handling:**
- Log all errors with errorLogger
- Distinguish network errors from application errors
- Retry with exponential backoff for transient failures
- Expose error state via context for UI feedback

### Reusable Code Examples

**Token Renewal Integration (from AuthProvider.tsx):**
```typescript
// File: frontend/src/providers/AuthProvider.tsx (lines 130-161)
const performRenewal = useCallback(async () => {
  if (isRenewingRef.current) {
    console.warn('Renewal already in progress, skipping');
    return;
  }

  isRenewingRef.current = true;

  try {
    console.log('Performing automatic token renewal');
    const response = await authClient.refreshTokens(refreshToken);

    updateAuthState(response);
    scheduleRenewal(response.expires_in);
    renewalAttemptsRef.current = 0;

    console.log('Token renewal successful');
  } catch (error) {
    handleRenewalFailure(error as Error);
  } finally {
    isRenewingRef.current = false;
  }
}, [refreshToken, handleRenewalFailure]);
```

**Exponential Backoff (from AuthProvider.tsx):**
```typescript
// File: frontend/src/providers/AuthProvider.tsx (lines 121-127)
const retryDelay = RETRY_BASE_DELAY_MS * Math.pow(2, renewalAttemptsRef.current - 1);
console.log(`Retrying renewal in ${retryDelay}ms`);

renewalTimerRef.current = setTimeout(() => {
  performRenewal();
}, retryDelay);
```

**Cleanup on Unmount (from AuthProvider.tsx):**
```typescript
// File: frontend/src/providers/AuthProvider.tsx (lines 284-288)
useEffect(() => {
  return () => {
    cancelRenewal();
  };
}, [cancelRenewal]);
```

**Environment Variable Access:**
```typescript
// File: frontend/src/services/jqel/client.ts (line 7)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Critical Context

### Documentation

**SPEC-events.md - Frontend SSE Client:**
- [SPEC-EV-FE-001:007](D:\sources\codr.studio\platform\spec\SPEC-events.md#L314-L330) - Frontend SSE client requirements
  - SPEC-EV-FE-001: Frontend must use EventSource for SSE
  - SPEC-EV-FE-002: Include JWT in connection (Authorization or query param)
  - SPEC-EV-FE-003: Implement automatic reconnection
  - SPEC-EV-FE-004: Track Last-Event-ID for offline recovery
  - SPEC-EV-FE-005: Implement exponential backoff (1s, 2s, 4s, max 30s)
  - SPEC-EV-FE-006: Handle connection states (connecting, connected, error)
  - SPEC-EV-FE-007: Provide event handler registration

**SPEC-events.md - Event Processing:**
- [SPEC-EV-FR-001:006](D:\sources\codr.studio\platform\spec\SPEC-events.md#L313-L330) - Frontend event processing
  - SPEC-EV-FR-001: Use events to invalidate TanStack Query
  - SPEC-EV-FR-002: Fetch full data via JQEL after invalidation
  - SPEC-EV-FR-003: Display visual notification on event
  - SPEC-EV-FR-004: Recover missed events on reconnect via JQEL
  - SPEC-EV-FR-005: Use timestamp of last event for recovery
  - SPEC-EV-FR-006: Process recovered events as new events

**SPEC-events.md - SSE Reconnection:**
- [SPEC-EV-SSE-025:028](D:\sources\codr.studio\platform\spec\SPEC-events.md#L212-L219) - Reconnection behavior
  - SPEC-EV-SSE-025: Browser auto-reconnects in 3-5s
  - SPEC-EV-SSE-026: Frontend may implement custom reconnection
  - SPEC-EV-SSE-027: Fetch missed events via JQEL on reconnect
  - SPEC-EV-SSE-028: Store timestamp of last event received

### Gotchas and Pitfalls

**EventSource API:**
- ⚠️ EventSource cannot set custom headers - must send JWT via query parameter
- ⚠️ EventSource auto-reconnects on connection loss (3-5s delay)
- ⚠️ EventSource only supports GET requests
- ⚠️ Browser closes connection on 204/205/304 status codes (no reconnect)
- ⚠️ Connection remains open until explicitly closed or page unloaded
- ⚠️ Multiple instances drain battery - share one connection across app

**Authentication:**
- ⚠️ JWT in query parameter is less secure (visible in logs) but required for EventSource
- ⚠️ Token expiration closes connection - must reconnect with new token
- ⚠️ Token refresh should trigger SSE reconnection with new token
- ⚠️ Handle race condition: token refresh vs SSE reconnection

**Reconnection:**
- ⚠️ Exponential backoff prevents server overload
- ⚠️ Max delay prevents indefinite waiting (cap at 30s)
- ⚠️ Reset retry count on successful connection
- ⚠️ Don't reconnect if user logged out

**Event Handling:**
- ⚠️ Events arrive asynchronously - handlers must be non-blocking
- ⚠️ Event order not guaranteed across channels
- ⚠️ Duplicate events possible - handlers should be idempotent
- ⚠️ Unknown event types should be ignored (forward compatibility)

**Memory Leaks:**
- ⚠️ EventSource must be closed on unmount/logout
- ⚠️ Event listeners must be removed
- ⚠️ Reconnection timers must be cleared
- ⚠️ Handler registry must be cleaned up

**Browser Compatibility:**
- ⚠️ EventSource supported in all modern browsers
- ⚠️ IE11 does NOT support EventSource (use polyfill if needed)
- ⚠️ Mobile browsers may close connections when app backgrounded

### Existing Patterns to Follow

**Provider Pattern:**
- See `frontend/src/providers/AuthProvider.tsx` for context provider structure
- Initialize on mount, cleanup on unmount
- Use refs for timers and flags to avoid re-renders
- Expose state and methods via context value

**Service Singleton:**
- See `frontend/src/services/jqel/client.ts` for simple service functions
- Export functions, not classes
- Keep state minimal (connection, handlers)

**Error Logging:**
- See `frontend/src/services/logging/errorLogger.ts` for logging pattern
- Use structured logging with category and context
- Development vs production logging levels

**Hook Pattern:**
- See `frontend/src/hooks/jqel/useOptimisticMutation.ts` for custom hook pattern
- Use useContext to access provider state
- Throw error if used outside provider
- Return typed interface

## Technical Specification

### Architecture

```
frontend/src/
├── services/
│   └── events/
│       ├── sseClient.ts          [NEW] - EventSource wrapper
│       ├── eventHandlers.ts      [NEW] - Handler registry
│       └── index.ts              [NEW] - Barrel exports
├── providers/
│   └── SSEProvider.tsx           [NEW] - SSE context provider
├── hooks/
│   ├── useSSE.ts                 [NEW] - SSE context hook
│   └── useEventHandler.ts        [NEW] - Event handler hook
├── types/
│   └── events.ts                 [NEW] - Event types
└── App.tsx                       [MODIFY] - Wrap with SSEProvider
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  Backend SSE Endpoint                                   │
│  GET /api/events/stream?token=<jwt>                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ SSE Stream (EventSource)
                   ▼
┌─────────────────────────────────────────────────────────┐
│  SSEClient (EventSource Wrapper)                        │
│  - Open connection with JWT                             │
│  - Listen to "message" events                           │
│  - Parse JSON event data                                │
│  - Track Last-Event-ID                                  │
│  - Manage reconnection with backoff                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Parsed PlatformEvent
                   ▼
┌─────────────────────────────────────────────────────────┐
│  EventHandler Registry                                  │
│  - Dispatch event to registered handlers                │
│  - Filter by event type (notification, task, etc.)      │
│  - Call handlers asynchronously                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├──────────────────┬──────────────────┐
                   ▼                  ▼                  ▼
         ┌────────────────┐  ┌──────────────┐  ┌──────────────┐
         │ Notifications  │  │ TanStack     │  │ Custom       │
         │ Module         │  │ Query        │  │ Handlers     │
         │                │  │ Invalidation │  │              │
         └────────────────┘  └──────────────┘  └──────────────┘
                                     │
                                     │ invalidateQueries()
                                     ▼
                          ┌──────────────────────┐
                          │ UI Re-fetches Data   │
                          │ via JQEL             │
                          └──────────────────────┘
```

### Modules and Responsibilities

**sseClient.ts**
- Responsibility: Manage EventSource connection lifecycle
- Interface:
  ```typescript
  class SSEClient {
    connect(token: string): void;
    disconnect(): void;
    reconnect(): void;
    getConnectionState(): ConnectionState;
    on(type: string, handler: EventHandler): () => void;
    getLastEventId(): string | null;
  }
  ```

**eventHandlers.ts**
- Responsibility: Registry for event handlers
- Interface:
  ```typescript
  type EventHandler = (event: PlatformEvent) => void | Promise<void>;

  function registerHandler(type: string, handler: EventHandler): () => void;
  function dispatchEvent(event: PlatformEvent): Promise<void>;
  function clearHandlers(): void;
  ```

**SSEProvider.tsx**
- Responsibility: React context provider for SSE state
- Interface:
  ```typescript
  interface SSEContextValue {
    connectionState: ConnectionState;
    lastEventId: string | null;
    error: Error | null;
    connect: () => void;
    disconnect: () => void;
    reconnect: () => void;
  }

  function SSEProvider({ children }: { children: ReactNode }): JSX.Element;
  ```

**useSSE.ts**
- Responsibility: Hook to access SSE context
- Interface:
  ```typescript
  function useSSE(): SSEContextValue;
  ```

**useEventHandler.ts**
- Responsibility: Hook to register event handlers
- Interface:
  ```typescript
  function useEventHandler(
    type: string | string[],
    handler: EventHandler,
    deps?: DependencyList
  ): void;
  ```

### State Management

**SSEClient State:**
```typescript
class SSEClient {
  private eventSource: EventSource | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private lastEventId: string | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentToken: string | null = null;
}
```

**SSEProvider State:**
```typescript
interface SSEProviderState {
  connectionState: ConnectionState;
  lastEventId: string | null;
  error: Error | null;
}
```

**Event Handler Registry:**
```typescript
// Map of event type -> Set of handlers
const handlers = new Map<string, Set<EventHandler>>();
```

### Libraries and Tools

**EventSource API (Browser Native):**
- No external library needed
- Built into all modern browsers
- Automatic reconnection (can be customized)
- `new EventSource(url)` - Create connection
- `eventSource.addEventListener('message', handler)` - Listen to events
- `eventSource.close()` - Close connection

**React 19 (v19.2.0):**
- `createContext()` - Create SSE context
- `useContext()` - Access SSE context
- `useState()` - Manage connection state
- `useEffect()` - Handle lifecycle (connect/disconnect)
- `useCallback()` - Stable handler references
- `useMemo()` - Optimize context value

**TanStack Query (v5+):**
- `useQueryClient()` - Access query client
- `queryClient.invalidateQueries()` - Invalidate based on events
- Hierarchical query keys for targeted invalidation

## Implementation Blueprint

### Ordered Steps

#### 1. Create Event Type Definitions
**Create:** `frontend/src/types/events.ts`

```typescript
/**
 * Platform Event Types - Frontend
 *
 * SPEC References:
 * - SPEC-EV-PL-001:017: Event payload structure
 * - SPEC-EV-CO-002:013: Event types
 */

/**
 * Base platform event (matches backend types)
 * Must be kept in sync with backend/src/types/events.types.ts
 */
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled';
  id: string;
  userId?: string;
  userIds?: string[];
  timestamp: string; // ISO 8601
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
}

/**
 * Notification event
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error';
  severity?: 'low' | 'normal' | 'high' | 'critical';
  title?: string;
  message?: string;
  actionUrl?: string;
  iconName?: string;
}

/**
 * Task event
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  data?: TaskEventData;
}

export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  result?: any;
  error?: string;
}

/**
 * SSE connection states
 * SPEC-EV-FE-006: Connection state tracking
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * SSE error types
 */
export interface SSEError extends Error {
  code?: string;
  recoverable: boolean;
}

/**
 * Event handler function signature
 */
export type EventHandler = (event: PlatformEvent) => void | Promise<void>;

/**
 * Event handler unsubscribe function
 */
export type UnsubscribeFunction = () => void;
```

**Details:** Type-safe event structures synchronized with backend

---

#### 2. Create Event Handler Registry
**Create:** `frontend/src/services/events/eventHandlers.ts`

```typescript
/**
 * Event Handler Registry
 *
 * Manages registration and dispatch of event handlers.
 * Handlers are organized by event type for efficient dispatch.
 *
 * SPEC References:
 * - SPEC-EV-FE-007: Event handler registration
 * - SPEC-EV-FR-001:006: Event processing
 */

import type { PlatformEvent, EventHandler, UnsubscribeFunction } from '../../types/events';
import { logError, logWarning } from '../logging/errorLogger';

/**
 * Global event handler registry
 * Map: event type -> Set of handlers
 */
const handlerRegistry = new Map<string, Set<EventHandler>>();

/**
 * Wildcard handlers (called for all events)
 */
const wildcardHandlers = new Set<EventHandler>();

/**
 * Register event handler for specific event type
 *
 * SPEC-EV-FE-007: Provide event handler registration
 *
 * @param type - Event type to listen for (e.g., 'notification', 'task')
 * @param handler - Handler function to call when event received
 * @returns Unsubscribe function to remove handler
 *
 * @example
 * const unsubscribe = registerHandler('notification', (event) => {
 *   console.log('Received notification:', event);
 * });
 *
 * // Later, to unsubscribe:
 * unsubscribe();
 */
export function registerHandler(type: string, handler: EventHandler): UnsubscribeFunction {
  // Get or create handler set for this type
  if (!handlerRegistry.has(type)) {
    handlerRegistry.set(type, new Set());
  }

  const handlers = handlerRegistry.get(type)!;
  handlers.add(handler);

  // Return unsubscribe function
  return () => {
    handlers.delete(handler);

    // Clean up empty sets
    if (handlers.size === 0) {
      handlerRegistry.delete(type);
    }
  };
}

/**
 * Register wildcard handler (called for all events)
 *
 * @param handler - Handler function
 * @returns Unsubscribe function
 */
export function registerWildcardHandler(handler: EventHandler): UnsubscribeFunction {
  wildcardHandlers.add(handler);

  return () => {
    wildcardHandlers.delete(handler);
  };
}

/**
 * Dispatch event to registered handlers
 *
 * SPEC-EV-FR-001:003: Process events and trigger actions
 *
 * @param event - Platform event to dispatch
 */
export async function dispatchEvent(event: PlatformEvent): Promise<void> {
  // SPEC-EV-PL-015: Ignore unknown event types (forward compatibility)
  if (!event.type) {
    logWarning('Event missing type field, skipping', 'event-handlers', { event });
    return;
  }

  // Get handlers for this event type
  const typeHandlers = handlerRegistry.get(event.type) || new Set();
  const allHandlers = [...typeHandlers, ...wildcardHandlers];

  if (allHandlers.length === 0) {
    // No handlers registered - this is normal, not an error
    return;
  }

  // Call all handlers asynchronously (non-blocking)
  const promises = allHandlers.map(async (handler) => {
    try {
      await handler(event);
    } catch (error) {
      // Handler error should not break other handlers
      logError(error as Error, {
        category: 'event-handler',
        level: 'ERROR',
        context: {
          eventType: event.type,
          eventId: event.id
        }
      });
    }
  });

  // Wait for all handlers to complete
  await Promise.allSettled(promises);
}

/**
 * Clear all event handlers
 * Call on logout or cleanup
 */
export function clearHandlers(): void {
  handlerRegistry.clear();
  wildcardHandlers.clear();
}

/**
 * Get count of registered handlers (for debugging)
 */
export function getHandlerCount(): { byType: Map<string, number>; wildcard: number } {
  const byType = new Map<string, number>();

  for (const [type, handlers] of handlerRegistry.entries()) {
    byType.set(type, handlers.size);
  }

  return {
    byType,
    wildcard: wildcardHandlers.size
  };
}
```

**Details:** Registry manages handler lifecycle and dispatch logic

---

#### 3. Create SSE Client Service
**Create:** `frontend/src/services/events/sseClient.ts`

```typescript
/**
 * SSE Client - EventSource Wrapper
 *
 * Manages SSE connection to backend with automatic reconnection,
 * JWT authentication, and Last-Event-ID tracking.
 *
 * SPEC References:
 * - SPEC-EV-FE-001:007: Frontend SSE client requirements
 * - SPEC-EV-SSE-025:028: Reconnection behavior
 */

import type { PlatformEvent, ConnectionState, SSEError } from '../../types/events';
import { dispatchEvent } from './eventHandlers';
import { logError, logInfo, logWarning } from '../logging/errorLogger';

const SSE_ENDPOINT = '/api/events/stream';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// SPEC-EV-FE-005: Exponential backoff configuration
const RECONNECT_BASE_DELAY_MS = 1000; // 1 second
const RECONNECT_MAX_DELAY_MS = 30000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10; // After this, require manual reconnect

/**
 * SSE Client Class
 *
 * Singleton service managing EventSource connection
 */
export class SSEClient {
  // EventSource instance
  private eventSource: EventSource | null = null;

  // Connection state
  private connectionState: ConnectionState = 'disconnected';
  private lastEventId: string | null = null;

  // Reconnection management
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;

  // Authentication
  private currentToken: string | null = null;

  // State change listeners
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private errorListeners = new Set<(error: SSEError) => void>();

  /**
   * Connect to SSE endpoint
   *
   * SPEC-EV-FE-001: Frontend must use EventSource
   * SPEC-EV-FE-002: Include JWT in connection
   *
   * @param token - JWT access token for authentication
   */
  connect(token: string): void {
    // Already connected with same token
    if (this.eventSource && this.currentToken === token && this.connectionState === 'connected') {
      logInfo('SSE already connected', 'sse-client');
      return;
    }

    // Disconnect existing connection if token changed
    if (this.eventSource && this.currentToken !== token) {
      logInfo('Token changed, reconnecting SSE', 'sse-client');
      this.disconnect();
    }

    this.currentToken = token;
    this.shouldReconnect = true;

    this.createConnection();
  }

  /**
   * Create EventSource connection
   *
   * SPEC-EV-FE-002: JWT in query parameter (EventSource can't set headers)
   * SPEC-EV-FE-004: Track Last-Event-ID for offline recovery
   */
  private createConnection(): void {
    if (!this.currentToken) {
      logWarning('Cannot connect SSE without token', 'sse-client');
      return;
    }

    // Clear any pending reconnect timer
    this.cancelReconnect();

    // Update state to connecting
    this.updateConnectionState('connecting');

    try {
      // Build SSE URL with JWT token
      // SPEC-EV-FE-002: JWT via query parameter
      const url = new URL(`${API_BASE_URL}${SSE_ENDPOINT}`);
      url.searchParams.set('token', this.currentToken);

      // Create EventSource
      this.eventSource = new EventSource(url.toString());

      // Set up event listeners
      this.setupEventListeners();

      logInfo('SSE connection initiated', 'sse-client', { url: SSE_ENDPOINT });
    } catch (error) {
      logError(error as Error, {
        category: 'sse-client',
        level: 'ERROR',
        context: { action: 'create-connection' }
      });

      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Setup EventSource event listeners
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Connection opened
    this.eventSource.onopen = () => {
      logInfo('SSE connection established', 'sse-client');
      this.updateConnectionState('connected');

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    };

    // Message received
    this.eventSource.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    // Connection error
    this.eventSource.onerror = (event: Event) => {
      this.handleConnectionError(new Error('SSE connection error'));
    };
  }

  /**
   * Handle incoming SSE message
   *
   * SPEC-EV-FE-004: Track Last-Event-ID
   * SPEC-EV-FR-001:006: Process events
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // SPEC-EV-FE-004: Track Last-Event-ID for recovery
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }

      // Parse event data
      // Backend sends: data: <json>\n\n
      const eventData: PlatformEvent = JSON.parse(event.data);

      // SPEC-EV-FR-001: Dispatch to handlers
      dispatchEvent(eventData).catch((error) => {
        logError(error, {
          category: 'sse-client',
          level: 'ERROR',
          context: { action: 'dispatch-event', eventType: eventData.type }
        });
      });

    } catch (error) {
      logError(error as Error, {
        category: 'sse-client',
        level: 'ERROR',
        context: { action: 'parse-message', data: event.data }
      });
    }
  }

  /**
   * Handle connection error
   *
   * SPEC-EV-FE-003: Implement automatic reconnection
   * SPEC-EV-FE-005: Exponential backoff
   */
  private handleConnectionError(error: Error): void {
    logWarning('SSE connection error', 'sse-client', { error: error.message });

    this.updateConnectionState('error');

    // Create SSE error
    const sseError: SSEError = Object.assign(error, {
      code: 'CONNECTION_ERROR',
      recoverable: this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS
    });

    // Notify error listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(sseError);
      } catch (err) {
        logError(err as Error, { category: 'sse-client', context: { action: 'error-listener' } });
      }
    });

    // Attempt reconnection if allowed
    if (this.shouldReconnect && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logError(new Error('Max reconnect attempts reached'), {
        category: 'sse-client',
        level: 'ERROR',
        context: { attempts: this.reconnectAttempts }
      });
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   *
   * SPEC-EV-FE-005: Exponential backoff (1s, 2s, 4s, ... max 30s)
   */
  private scheduleReconnect(): void {
    // Cancel any existing timer
    this.cancelReconnect();

    // Calculate delay with exponential backoff
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY_MS
    );

    this.reconnectAttempts++;

    logInfo(`Scheduling SSE reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`, 'sse-client');

    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) {
        this.createConnection();
      }
    }, delay);
  }

  /**
   * Cancel scheduled reconnection
   */
  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Disconnect from SSE endpoint
   *
   * Call on logout or cleanup
   */
  disconnect(): void {
    logInfo('Disconnecting SSE', 'sse-client');

    this.shouldReconnect = false;
    this.cancelReconnect();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.updateConnectionState('disconnected');
    this.currentToken = null;
  }

  /**
   * Manually trigger reconnection
   *
   * Resets retry count and attempts immediate connection
   */
  reconnect(): void {
    if (!this.currentToken) {
      logWarning('Cannot reconnect SSE without token', 'sse-client');
      return;
    }

    logInfo('Manual SSE reconnect triggered', 'sse-client');

    this.reconnectAttempts = 0;
    this.shouldReconnect = true;

    this.disconnect();
    this.createConnection();
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) return;

    this.connectionState = state;

    // Notify state listeners
    this.stateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logError(error as Error, { category: 'sse-client', context: { action: 'state-listener' } });
      }
    });
  }

  /**
   * Get current connection state
   *
   * SPEC-EV-FE-006: Connection state tracking
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get last event ID
   *
   * SPEC-EV-FE-004: Track Last-Event-ID for offline recovery
   */
  getLastEventId(): string | null {
    return this.lastEventId;
  }

  /**
   * Register connection state change listener
   *
   * @param listener - Callback for state changes
   * @returns Unsubscribe function
   */
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  /**
   * Register error listener
   *
   * @param listener - Callback for errors
   * @returns Unsubscribe function
   */
  onError(listener: (error: SSEError) => void): () => void {
    this.errorListeners.add(listener);

    return () => {
      this.errorListeners.delete(listener);
    };
  }
}

// Export singleton instance
export const sseClient = new SSEClient();
```

**Details:** Core SSE logic with automatic reconnection and error handling

---

#### 4. Create Barrel Exports
**Create:** `frontend/src/services/events/index.ts`

```typescript
/**
 * Events Service Public API
 */

export { sseClient, SSEClient } from './sseClient';
export {
  registerHandler,
  registerWildcardHandler,
  dispatchEvent,
  clearHandlers,
  getHandlerCount
} from './eventHandlers';
```

---

#### 5. Create SSE Provider
**Create:** `frontend/src/providers/SSEProvider.tsx`

```typescript
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

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
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
```

**Details:** Provider manages SSE lifecycle and exposes state via context

---

#### 6. Create useSSE Hook
**Create:** `frontend/src/hooks/useSSE.ts`

```typescript
/**
 * useSSE Hook
 *
 * Re-export from SSEProvider for convenience
 */

export { useSSE } from '../providers/SSEProvider';
```

---

#### 7. Create useEventHandler Hook
**Create:** `frontend/src/hooks/useEventHandler.ts`

```typescript
/**
 * useEventHandler Hook
 *
 * Register event handler that auto-cleanup on unmount
 *
 * SPEC References:
 * - SPEC-EV-FE-007: Event handler registration
 */

import { useEffect, useRef, type DependencyList } from 'react';
import { registerHandler, registerWildcardHandler } from '../services/events';
import type { EventHandler } from '../types/events';

/**
 * Register event handler with automatic cleanup
 *
 * @param type - Event type(s) to listen for ('*' for all events)
 * @param handler - Handler function
 * @param deps - Dependency array (like useEffect)
 *
 * @example
 * // Listen to notifications
 * useEventHandler('notification', (event) => {
 *   console.log('Notification:', event);
 * });
 *
 * @example
 * // Listen to multiple types
 * useEventHandler(['notification', 'task'], (event) => {
 *   console.log('Event:', event);
 * });
 *
 * @example
 * // Listen to all events
 * useEventHandler('*', (event) => {
 *   console.log('Any event:', event);
 * });
 */
export function useEventHandler(
  type: string | string[],
  handler: EventHandler,
  deps: DependencyList = []
): void {
  // Use ref to store handler to avoid re-registering on every render
  const handlerRef = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Wrapped handler that calls current ref
    const wrappedHandler: EventHandler = (event) => {
      return handlerRef.current(event);
    };

    // Handle wildcard
    if (type === '*') {
      const unsubscribe = registerWildcardHandler(wrappedHandler);
      return unsubscribe;
    }

    // Handle array of types
    if (Array.isArray(type)) {
      const unsubscribes = type.map(t => registerHandler(t, wrappedHandler));
      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    }

    // Handle single type
    const unsubscribe = registerHandler(type, wrappedHandler);
    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
```

**Details:** Convenient hook for event handler registration with cleanup

---

#### 8. Update App.tsx with SSEProvider
**Modify:** `frontend/src/App.tsx`

Add import:
```typescript
import { SSEProvider } from './providers/SSEProvider';
```

Wrap with SSEProvider (inside AuthProvider, after QueryClientProvider):
```typescript
export default function App() {
  return (
    <ErrorBoundary level="global">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SSEProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<PortalLoader portalId="main" />} />
                <Route path="/:portalId/*" element={<PortalLoader />} />
              </Routes>
            </BrowserRouter>
          </SSEProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

**Details:** SSEProvider needs AuthProvider for tokens, wraps app for global access

---

#### 9. Add TanStack Query Invalidation on Events
**Modify:** `frontend/src/services/jqel/invalidation.ts`

Add event-driven invalidation function:
```typescript
/**
 * Register event-driven query invalidation
 *
 * SPEC-EV-FR-001: Use events to invalidate TanStack Query
 *
 * @param queryClient - TanStack Query client
 */
export function setupEventInvalidation(queryClient: QueryClient): void {
  // Listen to all events
  registerWildcardHandler(async (event: PlatformEvent) => {
    // Invalidate based on event type
    switch (event.type) {
      case 'notification':
        // Invalidate notification queries
        await queryClient.invalidateQueries({
          queryKey: jqelKeys.entity('backend', 'notification')
        });
        break;

      case 'task':
        // Invalidate task queries
        await queryClient.invalidateQueries({
          queryKey: jqelKeys.entity('backend', 'task')
        });
        break;

      default:
        // For other events, invalidate all queries (safe default)
        // Modules can register specific handlers for optimization
        break;
    }
  });
}
```

Then call in `App.tsx` or `main.tsx`:
```typescript
import { setupEventInvalidation } from './services/jqel/invalidation';

// After creating queryClient
setupEventInvalidation(queryClient);
```

**Details:** Automatic query invalidation based on received events

---

### Error Handling Strategy

**Error Types:**

**Network Errors:**
- Connection timeout: Retry with exponential backoff
- Connection refused: Retry up to max attempts
- Connection dropped: Auto-reconnect via EventSource + custom logic

**Authentication Errors:**
- 401 Unauthorized: Token expired - wait for auth refresh, then reconnect
- 403 Forbidden: Permissions issue - disconnect and show error
- Invalid token format: Don't connect, wait for valid token

**SSE Protocol Errors:**
- Invalid JSON: Log error, skip event
- Unknown event type: Ignore (forward compatibility)
- Missing required fields: Log warning, attempt processing

**Error Display Pattern:**

```typescript
// Pattern: Error displayed via UI feedback (toast, banner)
function SSEConnectionStatus() {
  const { connectionState, error, reconnect } = useSSE();

  if (connectionState === 'error' && error) {
    return (
      <div role="alert" className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {error.recoverable
            ? 'Connection lost. Reconnecting...'
            : 'Connection failed. Please refresh the page.'}
        </p>
        {error.recoverable && (
          <button onClick={reconnect} className="text-sm font-medium text-primary">
            Retry Now
          </button>
        )}
      </div>
    );
  }

  return null;
}
```

### Files to Create

1. `frontend/src/types/events.ts` - Event type definitions
2. `frontend/src/services/events/eventHandlers.ts` - Handler registry
3. `frontend/src/services/events/sseClient.ts` - EventSource wrapper
4. `frontend/src/services/events/index.ts` - Barrel exports
5. `frontend/src/providers/SSEProvider.tsx` - React context provider
6. `frontend/src/hooks/useSSE.ts` - SSE context hook
7. `frontend/src/hooks/useEventHandler.ts` - Event handler hook

### Files to Modify

1. `frontend/src/App.tsx` - Wrap with SSEProvider
2. `frontend/src/services/jqel/invalidation.ts` - Add event-driven invalidation

## Validation Gates

**Type Checking:**
```bash
cd src/prototype-2/frontend
npm run type-check
```

**Build Verification:**
```bash
cd src/prototype-2/frontend
npm run build
```

**Development Testing:**
```bash
# Terminal 1 - Start backend (with SSE endpoint)
cd src/prototype-2/backend
npm run dev

# Terminal 2 - Start frontend
cd src/prototype-2/frontend
npm run dev

# Browser DevTools Console:
# - Check for "SSE connection established" log
# - Publish test event via Redis:
#   redis-cli PUBLISH platform:events '{"type":"notification","id":"test1","userId":"<yourUserId>","timestamp":"2025-11-06T10:00:00Z"}'
# - Verify event received in console
```

**Manual Testing Checklist:**
- [ ] SSE connects automatically on login
- [ ] SSE disconnects on logout
- [ ] Connection state updates reflected in UI
- [ ] Events received and dispatched to handlers
- [ ] Last-Event-ID tracked correctly
- [ ] Reconnection works on connection loss
- [ ] Exponential backoff delays increase (1s, 2s, 4s, 8s, 16s, 30s)
- [ ] Max reconnect attempts respected
- [ ] Manual reconnect works
- [ ] Token refresh triggers reconnection with new token
- [ ] Unknown event types ignored gracefully
- [ ] Handler cleanup works on component unmount
- [ ] No memory leaks (check DevTools Memory)

## References

**Specifications:**
- [SPEC-events.md](D:\sources\codr.studio\platform\spec\SPEC-events.md) - Complete events specification
  - Lines 313-330: Frontend SSE client requirements (SPEC-EV-FE-001:007)
  - Lines 212-219: Reconnection behavior (SPEC-EV-SSE-025:028)
  - Lines 224-284: Event payload structure (SPEC-EV-PL-001:017)
  - Lines 313-330: Event processing (SPEC-EV-FR-001:006)

**Codebase Examples:**
- `frontend/src/providers/AuthProvider.tsx` - Context provider pattern, token management, exponential backoff
- `frontend/src/services/jqel/client.ts` - Service pattern, environment variables
- `frontend/src/services/jqel/errors.ts` - Custom error classes, error handling
- `frontend/src/hooks/jqel/useOptimisticMutation.ts` - Custom hook pattern
- `frontend/src/services/logging/errorLogger.ts` - Structured logging pattern

**External Documentation:**
- [MDN - EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) - EventSource API reference
- [MDN - Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) - SSE protocol and usage
- [EventSource Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html) - WHATWG specification
