# Task Plan: 1.5.3 - Implementar Reconnection Automática

## Context and Objective

This task implements automatic reconnection logic for Server-Sent Events (SSE) connections as specified in SPEC-events.md (SPEC-EV-SSE-013:028). SSE connections can drop due to network issues, backend restarts, or timeouts. When reconnection occurs, clients need to recover missed events to maintain data consistency.

**Current State:**
- No SSE infrastructure exists yet (Task 1.5.1 creates the endpoint)
- Task 1.5.2 implements heartbeat/timeout detection
- Existing retry patterns in AuthProvider and useJQELQuery provide reference implementations

**What Will Be Implemented:**
- Client-side EventSource reconnection management
- Last-Event-ID tracking and header transmission
- Missed events recovery via Redis Streams
- Exponential backoff for reconnection attempts
- Connection state management (connecting, connected, disconnecting, disconnected)
- Integration with TanStack Query invalidation

**Business Value:**
- Ensures zero data loss during network interruptions
- Provides seamless user experience during backend deployments
- Reduces support burden from "missing updates" issues
- Enables reliable real-time features (notifications, chat, collaborative editing)

**User Impact:**
- Users on mobile/unstable networks get consistent updates
- No manual page refresh needed after temporary disconnections
- Transparent recovery from backend restarts
- Real-time features work reliably across network conditions

## Dependencies

### Prerequisite Tasks
- Task 1.5.1 - Criar endpoint /api/events (SSE) - **MUST complete first** (provides endpoint)
- Task 1.5.2 - Implementar heartbeat e keepalive - **MUST complete first** (detects disconnections)
- Task 1.4.4 - Configurar Redis Pub/Sub - **Already complete** (provides infrastructure)
- Task 1.4.8 - Implementar invalidação de cache - **Already complete** (cache invalidation pattern)

### Files/Modules Affected

**Backend (Server-Side Reconnection Support):**
- **CREATE:**
  - `backend/src/routes/events.routes.ts` - SSE endpoint with Last-Event-ID support
  - `backend/src/services/sseService.ts` - SSE connection manager
  - `backend/src/services/eventRecovery.service.ts` - Redis Streams recovery logic
  - `backend/src/types/sse.types.ts` - SSE type definitions

**Frontend (Client-Side Reconnection Logic):**
- **CREATE:**
  - `frontend/src/services/events/sseClient.ts` - EventSource wrapper with reconnection
  - `frontend/src/services/events/eventRecovery.ts` - Missed events recovery
  - `frontend/src/services/events/connectionState.ts` - Connection state machine
  - `frontend/src/hooks/useSSEConnection.ts` - React hook for SSE connection
  - `frontend/src/providers/SSEProvider.tsx` - Global SSE connection provider
  - `frontend/src/types/sse.ts` - SSE type definitions

**Modified:**
- `backend/src/app.ts` - Mount events routes
- `frontend/src/App.tsx` - Wrap app in SSEProvider

### Enables Tasks
- Task 1.5.4 - Implementar Notification events (uses SSE connection)
- Task 1.5.5 - Implementar Task events (uses SSE connection)
- Task 1.5.6 - Criar EventSource connection manager (builds on this foundation)
- Task 1.5.7 - Integrar com TanStack Query invalidation (uses event recovery)

### External Dependencies
- **ioredis v5.4.1** - Already installed (Redis Streams for event buffering)
- **EventSource API** - Native browser API (no package needed)
- **TanStack Query v5** - Already installed (cache invalidation)
- No new npm packages required

## Patterns Identified in Codebase

### Similar Components/Modules

1. **AuthProvider Token Renewal with Retry** - `frontend/src/providers/AuthProvider.tsx:99-128`
   - **Pattern:** Automatic renewal with exponential backoff retry
   - **Implementation:**
     - Ref-based retry counter: `renewalAttemptsRef.current`
     - Exponential backoff: `RETRY_BASE_DELAY_MS * Math.pow(2, attempts - 1)`
     - Max attempts before giving up: `MAX_RENEWAL_ATTEMPTS = 3`
     - Cleanup on unmount: `cancelRenewal()` in useEffect cleanup
   - **Relevance:** Direct inspiration for SSE reconnection retry logic

2. **JQEL Query Retry Logic** - `frontend/src/services/jqel/hooks/useJQELQuery.ts:12-57`
   - **Pattern:** Smart retry based on error classification
   - **Implementation:**
     - `shouldRetry(failureCount, error)` - Determines if retry should occur
     - `calculateRetryDelay(attemptIndex, error)` - Exponential backoff calculation
     - Capped max delay: `Math.min(delay, MAX_DELAY_MS)`
     - Development logging: `if (import.meta.env.DEV) { console.log(...) }`
   - **Relevance:** Pattern for calculating reconnection delays

3. **Redis Service Connection Management** - `backend/src/services/redis.service.ts:17-80`
   - **Pattern:** Lazy connection with automatic retry
   - **Implementation:**
     - Connection promise tracking: `this.connecting`
     - Retry strategy: `retryStrategy(times) => Math.min(times * 50, 2000)`
     - Event listeners: `on('error')`, `on('connect')`, `on('close')`
     - Safe multi-call: Subsequent calls wait for initial connection
   - **Relevance:** Connection lifecycle management pattern

4. **TanStack Query Cache Invalidation** - `frontend/src/services/jqel/invalidation.ts`
   - **Pattern:** Three-tier invalidation scoping
   - **Implementation:**
     - Specific: Invalidate exact query
     - Entity: Invalidate all queries for entity type
     - Schema: Invalidate all queries for schema
   - **Relevance:** How SSE events will trigger cache invalidation

### Conventions to Follow

**Naming Conventions:**
- Services: PascalCase with `.service.ts` suffix (`EventRecoveryService`)
- Hooks: camelCase with `use` prefix (`useSSEConnection`)
- Providers: PascalCase with `Provider` suffix (`SSEProvider`)
- Types: PascalCase (`SSEConnectionState`, `SSEEvent`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RECONNECT_ATTEMPTS`, `RECONNECT_BASE_DELAY_MS`)

**File Structure:**
```
frontend/src/
├── services/
│   └── events/
│       ├── sseClient.ts          # EventSource wrapper
│       ├── eventRecovery.ts      # Recovery logic
│       └── connectionState.ts    # State machine
├── hooks/
│   └── useSSEConnection.ts       # React hook
├── providers/
│   └── SSEProvider.tsx           # Context provider
└── types/
    └── sse.ts                    # Type definitions

backend/src/
├── routes/
│   └── events.routes.ts          # SSE endpoint
├── services/
│   ├── sseService.ts             # Connection manager
│   └── eventRecovery.service.ts  # Redis Streams recovery
└── types/
    └── sse.types.ts              # Type definitions
```

**Import/Export Patterns:**
```typescript
// Named exports for services
export class SSEConnectionManager { ... }

// Default export for routes
export default router;

// Named exports for hooks
export function useSSEConnection() { ... }

// Named exports for providers
export function SSEProvider({ children }: { children: ReactNode }) { ... }
```

**State Management:**
- Use React Context for global SSE connection state
- Use refs for connection state that doesn't trigger re-renders
- Use state for UI-relevant connection status

**Error Handling:**
- Log all connection errors with context
- Provide user-facing connection status (connected, reconnecting, offline)
- Don't spam console in production (use conditional logging)
- Graceful degradation: App works without SSE (no real-time updates)

### Reusable Code Examples

**Exponential Backoff from AuthProvider:**
```typescript
// File: frontend/src/providers/AuthProvider.tsx:120-122
const retryDelay = RETRY_BASE_DELAY_MS * Math.pow(2, renewalAttemptsRef.current - 1);
console.log(`Retrying renewal in ${retryDelay}ms`);
```

**Retry Delay Calculation from useJQELQuery:**
```typescript
// File: frontend/src/services/jqel/hooks/useJQELQuery.ts:43-49
function calculateRetryDelay(attemptIndex: number, _error: JQELError): number {
  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS = 30000;
  const delay = BASE_DELAY_MS * Math.pow(2, attemptIndex);
  const cappedDelay = Math.min(delay, MAX_DELAY_MS);
  return cappedDelay;
}
```

**Connection State Management from RedisService:**
```typescript
// File: backend/src/services/redis.service.ts:46-80
async connect(): Promise<void> {
  if (this.client) return;
  if (this.connecting) return this.connecting;

  this.connecting = (async () => {
    try {
      this.client = new Redis(this.getRedisConfig());
      // Event listeners
      this.client.on('error', (err) => { console.error('Error:', err); });
      this.client.on('connect', () => { console.log('Connected'); });
      // Test connection
      await this.client.ping();
      this.connecting = null;
    } catch (error) {
      this.connecting = null;
      throw error;
    }
  })();

  return this.connecting;
}
```

## Critical Context

### Documentation

**SPEC-EV-SSE-013:028** - SSE Reconnection Requirements
- URL: `spec/SPEC-events.md:180-220`
- **Key Requirements:**
  - Response MUST have header `Connection: keep-alive` (SPEC-EV-SSE-013)
  - Browser reconecta automaticamente em 3-5 segundos (SPEC-EV-SSE-025)
  - Frontend PODE implementar lógica customizada de reconexão (SPEC-EV-SSE-026)
  - Ao reconectar, Frontend DEVE buscar eventos perdidos via JQEL (SPEC-EV-SSE-027)
  - Frontend DEVE armazenar timestamp do último evento recebido (SPEC-EV-SSE-028)

**SPEC-EV-ST-001:016** - Redis Streams for Event Buffering
- URL: `spec/SPEC-events.md:106-147`
- **Key Requirements:**
  - Stream DEVE ter nome `events:<userId>` para cada usuário (SPEC-EV-ST-005)
  - Stream DEVE manter últimas 1000 mensagens OU 24 horas (SPEC-EV-ST-006)
  - Frontend PODE consultar Stream ao reconectar (SPEC-EV-ST-013)
  - Consulta DEVE usar timestamp do último evento recebido (SPEC-EV-ST-014)
  - Consulta DEVE ser via JQEL (schema `system` ou `backend`) (SPEC-EV-ST-015)

**SPEC-EV-PL-001:017** - Event Payload Structure
- URL: `spec/SPEC-events.md:222-284`
- **Key Requirements:**
  - Evento DEVE incluir campo `id` (string, único) (SPEC-EV-PL-003)
  - Evento DEVE incluir campo `timestamp` (ISO 8601 string) (SPEC-EV-PL-005)
  - Formato SSE: `data: <json>\n\n` (SPEC-EV-SSE-021)

**EventSource API Documentation**
- URL: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- **Key Points:**
  - `EventSource.readyState`: CONNECTING (0), OPEN (1), CLOSED (2)
  - Auto-reconnect: Browser automatically reconnects after 3-5 seconds
  - `Last-Event-ID` header: Sent automatically on reconnect if event had `id` field
  - Events: `onopen`, `onmessage`, `onerror`
  - Close connection: `eventSource.close()`

**Redis Streams Documentation**
- URL: https://redis.io/docs/data-types/streams/
- **Key Points:**
  - `XADD stream * field value` - Add entry with auto-generated ID
  - `XRANGE stream start end` - Get entries by ID range
  - `XREAD COUNT count STREAMS stream id` - Read from stream starting at ID
  - Stream ID format: `<timestamp>-<sequence>` (e.g., `1730808600000-0`)
  - Special ID `-` means earliest, `+` means latest, `$` means only new

### Gotchas and Pitfalls

- ⚠️ **EventSource auto-reconnect is NOT customizable:**
  - Browser always reconnects after 3-5 seconds (you can't change this)
  - To implement custom backoff, must close EventSource and create new instance
  - Pattern: Track reconnect attempts manually, close/create new EventSource

- ⚠️ **Last-Event-ID header requires specific SSE format:**
  - Must send `id: <event-id>\ndata: <json>\n\n` (not just `data:`)
  - Browser only remembers last ID if event included `id:` field
  - Backend must parse `Last-Event-ID` header on reconnect
  - ID should be Redis Stream ID or timestamp for recovery

- ⚠️ **Missed events recovery window is limited:**
  - Redis Streams keep last 1000 events OR 24 hours (SPEC-EV-ST-006)
  - If client offline > 24 hours, some events may be lost
  - Recovery query must be efficient (avoid full table scans)
  - Consider fallback: Full refresh if too many missed events

- ⚠️ **Connection state race conditions:**
  - Reconnection can overlap with manual disconnect
  - Multiple reconnect attempts can trigger simultaneously
  - Solution: Use connection state machine (CONNECTING, CONNECTED, DISCONNECTING, DISCONNECTED)
  - Use refs to track "should reconnect" vs "user requested disconnect"

- ⚠️ **Memory leaks with EventSource:**
  - EventSource keeps connection open indefinitely if not closed
  - Must call `eventSource.close()` on component unmount
  - Must remove event listeners before closing
  - Pattern: Track EventSource instance in ref, cleanup in useEffect

- ⚠️ **Redis Streams timestamp precision:**
  - Redis Stream IDs are `<timestamp-ms>-<sequence>`
  - JavaScript Date.now() returns milliseconds (compatible)
  - ISO 8601 strings need conversion: `new Date(isoString).getTime()`
  - Always use millisecond timestamps for consistency

- ⚠️ **Cross-tab SSE connections:**
  - Each browser tab creates separate SSE connection
  - Can overwhelm backend with N connections per user
  - Solution (future): BroadcastChannel to share one connection (SPEC-EV-SSE-017)
  - For MVP: Accept multiple connections, optimize later

- ⚠️ **401 errors on reconnect:**
  - JWT may expire during long disconnection
  - EventSource can't modify headers after creation (no token renewal)
  - Solution: Close connection on 401, trigger auth renewal, reconnect after
  - Pattern: Listen to `error` event, check response status

### Existing Patterns to Follow

**Connection Lifecycle Pattern:**
```typescript
// Pattern: State machine with refs
const connectionStateRef = useRef<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
const eventSourceRef = useRef<EventSource | null>(null);
const reconnectAttemptsRef = useRef<number>(0);
const lastEventIdRef = useRef<string | null>(null);

// Pattern: Cleanup function
const disconnect = useCallback(() => {
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }
  connectionStateRef.current = 'disconnected';
}, []);

// Pattern: useEffect cleanup
useEffect(() => {
  return () => disconnect();
}, [disconnect]);
```

**Exponential Backoff Pattern:**
```typescript
// Pattern: Exponential backoff with cap
const calculateReconnectDelay = (attemptIndex: number): number => {
  const BASE_DELAY_MS = 1000;  // 1 second
  const MAX_DELAY_MS = 30000;  // 30 seconds
  const delay = BASE_DELAY_MS * Math.pow(2, attemptIndex);
  return Math.min(delay, MAX_DELAY_MS);
};
```

**Event Recovery Pattern:**
```typescript
// Pattern: Query missed events via JQEL
const recoverMissedEvents = async (lastEventId: string) => {
  const response = await jqelQuery({
    schema: 'backend',
    select: 'missed_events',
    where: { lastEventId: { $gt: lastEventId } },
    options: { orderBy: [{ field: 'id', direction: 'asc' }] }
  });
  return response;
};
```

## Technical Specification

### Architecture

```
Backend Architecture:
====================
backend/src/
├── routes/
│   └── events.routes.ts              # SSE endpoint
│       - GET /api/events/stream      # SSE connection
│       - Parse Last-Event-ID header
│       - Authenticate with JWT
│       - Send initial recovery events
│       - Stream new events from Redis
├── services/
│   ├── sseService.ts                 # Connection manager
│   │   - Map<userId, Response[]>     # Active connections
│   │   - sendEvent(userId, event)    # Send to all user's connections
│   │   - closeConnection(userId)     # Cleanup
│   │   - getActiveConnections()      # Stats
│   │
│   └── eventRecovery.service.ts      # Redis Streams recovery
│       - getEventsSince(userId, lastId)  # Query Redis Streams
│       - parseStreamEntries()        # Convert Redis format to events
│       - cleanupOldEvents()          # Prune old stream entries
└── types/
    └── sse.types.ts                  # Type definitions

Frontend Architecture:
=====================
frontend/src/
├── services/events/
│   ├── sseClient.ts                  # EventSource wrapper
│   │   - connect()                   # Create connection
│   │   - disconnect()                # Close connection
│   │   - onMessage()                 # Event handler
│   │   - onError()                   # Error handler
│   │   - getConnectionState()        # Current state
│   │
│   ├── eventRecovery.ts              # Missed events recovery
│   │   - recoverMissedEvents(lastId) # Query via JQEL
│   │   - processRecoveredEvents()    # Apply to cache
│   │
│   └── connectionState.ts            # State machine
│       - State: disconnected | connecting | connected | reconnecting
│       - Transition rules
│       - State validation
├── hooks/
│   └── useSSEConnection.ts           # React hook
│       - connectionState             # Current state
│       - connect()                   # Manual connect
│       - disconnect()                # Manual disconnect
│       - isConnected                 # Boolean helper
├── providers/
│   └── SSEProvider.tsx               # Global provider
│       - SSEContext                  # React Context
│       - Automatic connection on mount
│       - Reconnection logic
│       - Event distribution to subscribers
└── types/
    └── sse.ts                        # Type definitions
```

### Data Flow

**Initial Connection:**
```
User logs in (JWT issued)
        ↓
SSEProvider mounts
        ↓
useSSEConnection() calls connect()
        ↓
Create EventSource with JWT in URL (?token=<jwt>)
        ↓
GET /api/events/stream
        ↓
Backend validates JWT → Extract userId
        ↓
Add Response to sseService connection map
        ↓
If Last-Event-ID header present → Query Redis Streams
        ↓
Send recovery events (if any)
        ↓
Subscribe to Redis Pub/Sub for new events
        ↓
Connection established (readyState = OPEN)
```

**Reconnection Flow:**
```
Connection drops (network issue, backend restart, timeout)
        ↓
EventSource fires 'error' event
        ↓
Client detects connectionState change → 'reconnecting'
        ↓
Calculate reconnect delay (exponential backoff)
        ↓
Wait for delay
        ↓
Close old EventSource
        ↓
Create new EventSource with Last-Event-ID
        ↓
Backend receives Last-Event-ID header
        ↓
Query Redis Streams: XREAD STREAMS events:<userId> <lastEventId>
        ↓
Send missed events (oldest to newest)
        ↓
Resume normal streaming
        ↓
Client processes recovery events → Invalidate TanStack Query cache
        ↓
Connection restored (readyState = OPEN)
```

**Event Processing:**
```
Backend publishes event to Redis Pub/Sub
        ↓
Backend listener receives event → Extract userId
        ↓
sseService.sendEvent(userId, event)
        ↓
Format as SSE: "id: <id>\ndata: <json>\n\n"
        ↓
Write to all user's Response objects
        ↓
Client EventSource receives event
        ↓
Store lastEventId in ref/localStorage
        ↓
Parse event payload
        ↓
If event type = "notification" → Invalidate notifications query
        ↓
If event type = "task" → Invalidate tasks query
        ↓
TanStack Query refetches → UI updates
```

### Modules and Responsibilities

**Module: backend/routes/events.routes.ts**
- **Responsibility:** SSE endpoint with authentication and recovery
- **Interface:**
  ```typescript
  router.get('/stream', authMiddleware, (req, res) => {
    // Extract userId from JWT
    // Parse Last-Event-ID header
    // Set SSE headers
    // Send recovery events
    // Stream new events
  });
  ```

**Module: backend/services/sseService.ts**
- **Responsibility:** Manage active SSE connections
- **Interface:**
  ```typescript
  class SSEService {
    addConnection(userId: string, res: Response): void
    removeConnection(userId: string, res: Response): void
    sendEvent(userId: string, event: SSEEvent): void
    sendEventToAll(event: SSEEvent): void
    getActiveConnections(): Map<string, Response[]>
    closeAllConnections(): void
  }
  ```

**Module: backend/services/eventRecovery.service.ts**
- **Responsibility:** Query Redis Streams for missed events
- **Interface:**
  ```typescript
  class EventRecoveryService {
    getEventsSince(userId: string, lastEventId: string): Promise<SSEEvent[]>
    parseStreamEntry(entry: any): SSEEvent
    cleanupOldEvents(userId: string): Promise<void>
  }
  ```

**Module: frontend/services/events/sseClient.ts**
- **Responsibility:** EventSource wrapper with reconnection
- **Interface:**
  ```typescript
  class SSEClient {
    connect(token: string): void
    disconnect(): void
    onMessage(handler: (event: SSEEvent) => void): void
    onError(handler: (error: Error) => void): void
    getConnectionState(): SSEConnectionState
  }
  ```

**Module: frontend/services/events/eventRecovery.ts**
- **Responsibility:** Query and process missed events
- **Interface:**
  ```typescript
  async function recoverMissedEvents(lastEventId: string): Promise<SSEEvent[]>
  function processRecoveredEvent(event: SSEEvent): void
  ```

**Module: frontend/hooks/useSSEConnection.ts**
- **Responsibility:** React hook for SSE connection
- **Interface:**
  ```typescript
  function useSSEConnection(): {
    connectionState: SSEConnectionState
    lastEventId: string | null
    connect: () => void
    disconnect: () => void
    isConnected: boolean
  }
  ```

**Module: frontend/providers/SSEProvider.tsx**
- **Responsibility:** Global SSE connection provider
- **Interface:**
  ```typescript
  function SSEProvider({ children }: { children: ReactNode }): JSX.Element
  ```

### State Management

**Backend State (in-memory):**
- `Map<userId, Response[]>` - Active SSE connections per user
- No persistent state needed (connections are ephemeral)

**Frontend State (React Context + Refs):**
```typescript
// UI state (triggers re-renders)
const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected');

// Connection tracking (no re-render)
const eventSourceRef = useRef<EventSource | null>(null);
const lastEventIdRef = useRef<string | null>(null);
const reconnectAttemptsRef = useRef<number>(0);
const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
const shouldReconnectRef = useRef<boolean>(true); // User vs automatic disconnect

// Persistent state (survive page refresh)
localStorage.setItem('lastEventId', eventId); // For recovery after full page reload
```

**Connection State Machine:**
```
States: disconnected → connecting → connected
                ↓                      ↓
            reconnecting ←←←← (error detected)
                ↓
        (max attempts) → disconnected
```

### Libraries and Tools

- **ioredis v5.4.1** - Redis client for Streams
  - Feature: `XADD` - Add events to stream
  - Feature: `XREAD` - Read events from stream with start ID
  - Feature: `MAXLEN ~` - Auto-trim old entries
  - Already installed for Pub/Sub

- **EventSource API** - Native browser API
  - Feature: Auto-reconnect with exponential backoff
  - Feature: Last-Event-ID header support
  - Feature: Event listeners (onopen, onmessage, onerror)
  - No package needed (built into browsers)

- **TanStack Query v5** - Cache invalidation
  - Feature: `queryClient.invalidateQueries()` - Invalidate after events
  - Already installed and configured

**No new dependencies required.**

## Implementation Blueprint

### Ordered Steps

#### Step 1: Create Backend Type Definitions
**File:** `backend/src/types/sse.types.ts`

**Details:** Define TypeScript interfaces for SSE events and connection management.

**Code:**
```typescript
/**
 * SSE Event payload
 * Based on SPEC-EV-PL-001:017
 */
export interface SSEEvent {
  /** Unique event ID (Redis Stream ID or UUID) */
  id: string;

  /** Event type (notification, task, job-completed, etc.) */
  type: string;

  /** Target user ID */
  userId: string;

  /** Event timestamp (ISO 8601) */
  timestamp: string;

  /** Event category (system, email_approval, etc.) */
  category?: string;

  /** Event priority (low, normal, high, urgent) */
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  /** Event-specific data */
  data?: Record<string, any>;
}

/**
 * SSE connection metadata
 */
export interface SSEConnection {
  userId: string;
  connectionId: string;
  connectedAt: Date;
  lastEventId: string | null;
}
```

#### Step 2: Implement Event Recovery Service
**File:** `backend/src/services/eventRecovery.service.ts`

**Details:** Query Redis Streams to retrieve missed events for reconnecting clients.

**Pattern:** Follow RedisService pattern for connection management.

**Code:**
```typescript
import { redisService } from './redis.service.js';
import type { SSEEvent } from '../types/sse.types.js';

/**
 * EventRecoveryService
 *
 * Retrieves missed events from Redis Streams for reconnecting clients.
 * Based on SPEC-EV-ST-013:016
 */
export class EventRecoveryService {
  /**
   * Get events since lastEventId for user
   *
   * @param userId - User ID
   * @param lastEventId - Last received event ID (Redis Stream ID format)
   * @returns Array of missed events (oldest to newest)
   */
  async getEventsSince(userId: string, lastEventId: string): Promise<SSEEvent[]> {
    const streamKey = `events:${userId}`;

    try {
      // XREAD STREAMS events:user123 1730808600000-0
      // Returns entries newer than lastEventId
      const client = redisService.getClient();
      const result = await client.xread(
        'STREAMS',
        streamKey,
        lastEventId
      );

      if (!result || result.length === 0) {
        return []; // No missed events
      }

      // Parse Redis Streams result
      const [_streamName, entries] = result[0];
      return entries.map((entry) => this.parseStreamEntry(entry));
    } catch (error) {
      console.error(`Failed to recover events for user ${userId}:`, error);
      return []; // Graceful degradation
    }
  }

  /**
   * Parse Redis Stream entry to SSEEvent
   *
   * Redis format: [id, [field1, value1, field2, value2, ...]]
   * We store: ['event', '<json>']
   */
  private parseStreamEntry(entry: any): SSEEvent {
    const [id, fields] = entry;

    // Fields is array: ['event', '{"type":"notification",...}']
    const eventJson = fields[1];
    const event = JSON.parse(eventJson);

    // Use Redis Stream ID as event ID (for continuity)
    return {
      ...event,
      id: id,
    };
  }

  /**
   * Cleanup old events from stream
   * Called periodically to maintain MAXLEN limit
   *
   * @param userId - User ID
   */
  async cleanupOldEvents(userId: string): Promise<void> {
    const streamKey = `events:${userId}`;

    try {
      const client = redisService.getClient();
      // XTRIM with MAXLEN keeps last 1000 events
      await client.xtrim(streamKey, 'MAXLEN', '~', 1000);
    } catch (error) {
      console.error(`Failed to cleanup events for user ${userId}:`, error);
    }
  }
}

export const eventRecoveryService = new EventRecoveryService();
```

**Rationale:**
- Uses Redis XREAD to get events after lastEventId
- Returns empty array on error (graceful degradation)
- Parses Redis format to SSEEvent structure
- XTRIM ensures stream doesn't grow unbounded

#### Step 3: Implement SSE Connection Manager
**File:** `backend/src/services/sseService.ts`

**Details:** Manage active SSE connections and send events to connected clients.

**Pattern:** Follow RedisService singleton pattern.

**Code:**
```typescript
import { Response } from 'express';
import type { SSEEvent, SSEConnection } from '../types/sse.types.js';

/**
 * SSEService
 *
 * Manages active Server-Sent Events connections.
 * Sends events to connected clients via Response objects.
 * Based on SPEC-EV-SSE-015:024
 */
export class SSEService {
  // Map of userId to array of Response objects (multiple tabs per user)
  private connections: Map<string, Response[]> = new Map();

  /**
   * Add new SSE connection
   *
   * @param userId - User ID from JWT
   * @param res - Express Response object
   */
  addConnection(userId: string, res: Response): void {
    const userConnections = this.connections.get(userId) || [];
    userConnections.push(res);
    this.connections.set(userId, userConnections);

    console.log(`SSE connection added for user ${userId} (total: ${userConnections.length})`);

    // Cleanup on connection close
    res.on('close', () => {
      this.removeConnection(userId, res);
    });
  }

  /**
   * Remove SSE connection
   *
   * @param userId - User ID
   * @param res - Express Response object to remove
   */
  removeConnection(userId: string, res: Response): void {
    const userConnections = this.connections.get(userId) || [];
    const filtered = userConnections.filter((conn) => conn !== res);

    if (filtered.length > 0) {
      this.connections.set(userId, filtered);
    } else {
      this.connections.delete(userId); // Remove user if no connections
    }

    console.log(`SSE connection removed for user ${userId} (remaining: ${filtered.length})`);
  }

  /**
   * Send event to specific user
   * Sends to all active connections for that user
   *
   * @param userId - Target user ID
   * @param event - Event to send
   */
  sendEvent(userId: string, event: SSEEvent): void {
    const userConnections = this.connections.get(userId);

    if (!userConnections || userConnections.length === 0) {
      // User offline - event stays in Redis Stream only
      return;
    }

    // Format as SSE with ID (enables Last-Event-ID header)
    const sseMessage = `id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`;

    // Send to all user's connections
    userConnections.forEach((res) => {
      try {
        res.write(sseMessage);
      } catch (error) {
        console.error(`Failed to send event to user ${userId}:`, error);
        // Connection will be cleaned up by 'close' event
      }
    });
  }

  /**
   * Send event to all connected users
   * Used for broadcast events
   *
   * @param event - Event to broadcast
   */
  sendEventToAll(event: SSEEvent): void {
    this.connections.forEach((_, userId) => {
      this.sendEvent(userId, event);
    });
  }

  /**
   * Send heartbeat to all connections
   * Keeps connection alive and detects dead connections
   */
  sendHeartbeat(): void {
    const heartbeatMessage = ': heartbeat\n\n'; // Comment line (starts with :)

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach((res) => {
        try {
          res.write(heartbeatMessage);
        } catch (error) {
          console.error(`Failed to send heartbeat to user ${userId}:`, error);
        }
      });
    });
  }

  /**
   * Get active connections count
   * For monitoring/debugging
   */
  getActiveConnections(): { totalUsers: number; totalConnections: number } {
    let totalConnections = 0;
    this.connections.forEach((connections) => {
      totalConnections += connections.length;
    });

    return {
      totalUsers: this.connections.size,
      totalConnections,
    };
  }

  /**
   * Close all connections
   * Called on server shutdown
   */
  closeAllConnections(): void {
    this.connections.forEach((userConnections) => {
      userConnections.forEach((res) => {
        try {
          res.end();
        } catch (error) {
          // Ignore errors on shutdown
        }
      });
    });
    this.connections.clear();
  }
}

export const sseService = new SSEService();
```

**Rationale:**
- Supports multiple connections per user (multi-tab)
- Gracefully handles send failures (connection cleanup)
- SSE format includes `id:` field for Last-Event-ID support
- Heartbeat uses SSE comment format (`: heartbeat\n\n`)

#### Step 4: Create SSE Endpoint
**File:** `backend/src/routes/events.routes.ts`

**Details:** Express route for SSE connections with authentication and recovery.

**Pattern:** Follow auth.routes.ts structure.

**Code:**
```typescript
import { Router, Request, Response } from 'express';
import { sseService } from '../services/sseService.js';
import { eventRecoveryService } from '../services/eventRecovery.service.js';

const router = Router();

/**
 * SSE stream endpoint
 * GET /api/events/stream
 *
 * Based on SPEC-EV-SSE-005:028
 *
 * Authenticates client, establishes SSE connection, sends missed events if any.
 * JWT can be in header, query param, or cookie (query param for EventSource compatibility).
 */
router.get('/stream', async (req: Request, res: Response) => {
  // Extract JWT from query param (EventSource can't set headers)
  const token = req.query.token as string | undefined;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  // Validate JWT and extract userId
  // TODO: Replace with actual JWT validation (Task 1.3 - jwt.service.ts)
  let userId: string;
  try {
    // PLACEHOLDER: Replace with jwtService.verifyAccessToken(token)
    // const decoded = jwtService.verifyAccessToken(token);
    // userId = decoded.sub;
    userId = 'user_123'; // Hardcoded for now
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Set SSE headers (SPEC-EV-SSE-011:014)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For nginx

  // CORS headers for SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Flush headers immediately
  res.flushHeaders();

  // Add connection to SSE service
  sseService.addConnection(userId, res);

  // Check for Last-Event-ID header (reconnection)
  const lastEventId = req.headers['last-event-id'] as string | undefined;

  if (lastEventId) {
    console.log(`SSE reconnection for user ${userId}, recovering since ${lastEventId}`);

    try {
      // Recover missed events from Redis Streams
      const missedEvents = await eventRecoveryService.getEventsSince(userId, lastEventId);

      console.log(`Recovered ${missedEvents.length} missed events for user ${userId}`);

      // Send missed events (oldest to newest)
      missedEvents.forEach((event) => {
        const sseMessage = `id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`;
        res.write(sseMessage);
      });
    } catch (error) {
      console.error(`Failed to recover events for user ${userId}:`, error);
      // Continue with connection - client will get new events only
    }
  }

  // Send initial connection confirmation
  const initialMessage = `id: ${Date.now()}-0\ndata: ${JSON.stringify({
    type: 'connection',
    status: 'connected',
    timestamp: new Date().toISOString(),
  })}\n\n`;
  res.write(initialMessage);

  // Connection will stay open
  // Events are sent via sseService.sendEvent(userId, event)
  // Heartbeat is sent via sseService.sendHeartbeat()
});

export default router;
```

**Rationale:**
- JWT in query param (EventSource limitation - can't set headers)
- Last-Event-ID header parsed for recovery
- SSE headers set per SPEC requirements
- Sends missed events before resuming normal streaming
- Connection cleanup handled by sseService

#### Step 5: Mount Events Routes in App
**File:** `backend/src/app.ts`

**Details:** Add events routes to Express app.

**Modify lines 74-76:**
```typescript
// JQEL data access endpoint (Task 1.4.1)
app.use('/api/jqel', jqelRoutes);

// SSE events endpoint (Task 1.5)
import eventsRoutes from './routes/events.routes.js';
app.use('/api/events', eventsRoutes);

// Future routes will be mounted here:
```

#### Step 6: Create Frontend Type Definitions
**File:** `frontend/src/types/sse.ts`

**Details:** Define TypeScript interfaces for SSE client-side.

**Code:**
```typescript
/**
 * SSE Event (matches backend)
 */
export interface SSEEvent {
  id: string;
  type: string;
  userId: string;
  timestamp: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
}

/**
 * SSE connection state
 */
export type SSEConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * SSE event handler
 */
export type SSEEventHandler = (event: SSEEvent) => void;

/**
 * SSE error handler
 */
export type SSEErrorHandler = (error: Error) => void;

/**
 * SSE connection options
 */
export interface SSEConnectionOptions {
  /** Access token (JWT) */
  token: string;

  /** Last event ID for recovery */
  lastEventId?: string;

  /** Event handler */
  onMessage?: SSEEventHandler;

  /** Error handler */
  onError?: SSEErrorHandler;

  /** Connection state change handler */
  onStateChange?: (state: SSEConnectionState) => void;
}
```

#### Step 7: Implement SSE Client
**File:** `frontend/src/services/events/sseClient.ts`

**Details:** EventSource wrapper with reconnection logic.

**Pattern:** Follow AuthProvider retry pattern.

**Code:**
```typescript
import type {
  SSEEvent,
  SSEConnectionState,
  SSEConnectionOptions,
  SSEEventHandler,
  SSEErrorHandler,
} from '../../types/sse';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * SSEClient
 *
 * EventSource wrapper with automatic reconnection and exponential backoff.
 * Based on SPEC-EV-SSE-025:028
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private connectionState: SSEConnectionState = 'disconnected';
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;
  private lastEventId: string | null = null;

  // Configuration
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_BASE_DELAY_MS = 1000; // 1 second
  private readonly RECONNECT_MAX_DELAY_MS = 30000; // 30 seconds

  // Event handlers
  private messageHandler: SSEEventHandler | null = null;
  private errorHandler: SSEErrorHandler | null = null;
  private stateChangeHandler: ((state: SSEConnectionState) => void) | null = null;

  // Connection options
  private token: string | null = null;

  /**
   * Connect to SSE endpoint
   */
  connect(options: SSEConnectionOptions): void {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      console.warn('SSE already connected or connecting');
      return;
    }

    this.token = options.token;
    this.lastEventId = options.lastEventId || this.lastEventId;
    this.messageHandler = options.onMessage || null;
    this.errorHandler = options.onError || null;
    this.stateChangeHandler = options.onStateChange || null;
    this.shouldReconnect = true;

    this.performConnect();
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.cancelReconnect();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setConnectionState('disconnected');
  }

  /**
   * Get current connection state
   */
  getConnectionState(): SSEConnectionState {
    return this.connectionState;
  }

  /**
   * Get last event ID
   */
  getLastEventId(): string | null {
    return this.lastEventId;
  }

  /**
   * Perform actual connection
   */
  private performConnect(): void {
    if (!this.token) {
      console.error('Cannot connect: No token provided');
      return;
    }

    // Build URL with token and lastEventId
    const url = new URL(`${API_BASE_URL}/api/events/stream`);
    url.searchParams.set('token', this.token);

    // Note: Last-Event-ID header is automatically sent by EventSource if events had id field
    // We don't need to manually set it

    this.setConnectionState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      this.eventSource = new EventSource(url.toString());

      // Connection opened
      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempts = 0; // Reset on successful connection
        this.setConnectionState('connected');
      };

      // Message received
      this.eventSource.onmessage = (e: MessageEvent) => {
        try {
          const event: SSEEvent = JSON.parse(e.data);

          // Store last event ID
          if (event.id) {
            this.lastEventId = event.id;
            localStorage.setItem('lastEventId', event.id);
          }

          // Call message handler
          if (this.messageHandler) {
            this.messageHandler(event);
          }
        } catch (error) {
          console.error('Failed to parse SSE event:', error);
        }
      };

      // Error occurred
      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);

        // Check if it's a 401 error (auth failure)
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          // Connection closed - trigger reconnection
          this.handleConnectionError(new Error('SSE connection closed'));
        }
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Handle connection error and trigger reconnection
   */
  private handleConnectionError(error: Error): void {
    // Call error handler
    if (this.errorHandler) {
      this.errorHandler(error);
    }

    // Check if should reconnect
    if (!this.shouldReconnect) {
      this.setConnectionState('disconnected');
      return;
    }

    // Check max reconnect attempts
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnect attempts reached, giving up');
      this.setConnectionState('error');
      this.shouldReconnect = false;
      return;
    }

    // Calculate reconnect delay (exponential backoff)
    const delay = this.calculateReconnectDelay();
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);

    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');

    // Schedule reconnection
    this.reconnectTimer = setTimeout(() => {
      this.performConnect();
    }, delay);
  }

  /**
   * Calculate reconnection delay with exponential backoff
   */
  private calculateReconnectDelay(): number {
    const delay = this.RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts);
    return Math.min(delay, this.RECONNECT_MAX_DELAY_MS);
  }

  /**
   * Cancel pending reconnection
   */
  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Set connection state and notify handler
   */
  private setConnectionState(state: SSEConnectionState): void {
    this.connectionState = state;
    if (this.stateChangeHandler) {
      this.stateChangeHandler(state);
    }
  }
}
```

**Rationale:**
- Exponential backoff matches JQEL query retry pattern
- Stores lastEventId in localStorage for recovery after page reload
- Handles 401 errors (auth failure)
- Max 10 reconnect attempts (configurable)
- Cleanup functions prevent memory leaks

#### Step 8: Create SSE Provider
**File:** `frontend/src/providers/SSEProvider.tsx`

**Details:** React Context provider for global SSE connection.

**Pattern:** Follow AuthProvider structure.

**Code:**
```typescript
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SSEClient } from '../services/events/sseClient';
import type { SSEEvent, SSEConnectionState } from '../types/sse';
import { useAuth } from './AuthProvider';

interface SSEContextValue {
  connectionState: SSEConnectionState;
  lastEventId: string | null;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const SSEContext = createContext<SSEContextValue | undefined>(undefined);

/**
 * SSEProvider
 *
 * Global SSE connection provider with automatic connection management.
 * Connects when user is authenticated, disconnects on logout.
 */
export function SSEProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected');
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  const sseClientRef = useRef<SSEClient>(new SSEClient());

  // Derived state
  const isConnected = connectionState === 'connected';

  // Handle SSE messages
  const handleMessage = useCallback((event: SSEEvent) => {
    console.log('SSE event received:', event);

    // Update lastEventId
    if (event.id) {
      setLastEventId(event.id);
    }

    // Invalidate TanStack Query cache based on event type
    if (event.type === 'notification') {
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform', 'notification'] });
    } else if (event.type === 'task') {
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform', 'task'] });
    } else if (event.type === 'job-completed' || event.type === 'job-failed') {
      queryClient.invalidateQueries({ queryKey: ['jqel', 'backend', 'job'] });
    }

    // Future: Dispatch custom events for modules to listen to
  }, [queryClient]);

  // Handle SSE errors
  const handleError = useCallback((error: Error) => {
    console.error('SSE error:', error);

    // Check if it's auth error (401)
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.warn('SSE auth error, disconnecting');
      sseClientRef.current.disconnect();
    }
  }, []);

  // Connect to SSE
  const connect = useCallback(() => {
    if (!accessToken) {
      console.warn('Cannot connect SSE: No access token');
      return;
    }

    // Get last event ID from localStorage (for recovery after page reload)
    const storedLastEventId = localStorage.getItem('lastEventId');

    sseClientRef.current.connect({
      token: accessToken,
      lastEventId: storedLastEventId || undefined,
      onMessage: handleMessage,
      onError: handleError,
      onStateChange: setConnectionState,
    });
  }, [accessToken, handleMessage, handleError]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    sseClientRef.current.disconnect();
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  const value: SSEContextValue = {
    connectionState,
    lastEventId,
    connect,
    disconnect,
    isConnected,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

/**
 * useSSE hook
 *
 * Access SSE connection state and methods
 */
export function useSSE(): SSEContextValue {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within SSEProvider');
  }
  return context;
}
```

**Rationale:**
- Auto-connects when user is authenticated
- Auto-disconnects on logout
- Integrates with TanStack Query for cache invalidation
- Stores lastEventId in state for UI display

#### Step 9: Wrap App in SSEProvider
**File:** `frontend/src/App.tsx`

**Details:** Add SSEProvider to app root.

**Modify app providers:**
```typescript
import { SSEProvider } from './providers/SSEProvider';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <SSEProvider>
          {/* Rest of app */}
        </SSEProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

**Note:** SSEProvider must be inside AuthProvider (depends on auth state).

### Error Handling Strategy

**Error Types:**

1. **Network Errors (Connection Lost)**
   - **Cause:** WiFi disconnection, mobile network drop, cable unplugged
   - **Handling:**
     - EventSource fires `onerror` event
     - Close old connection, calculate backoff delay
     - Retry up to 10 times with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s, 30s, ...)
     - Show "Reconnecting..." status in UI
   - **Rationale:** Network issues are usually transient, retry with backoff

2. **Authentication Errors (401)**
   - **Cause:** JWT expired during long connection, user logged out
   - **Handling:**
     - Detect 401 in error handler
     - Close SSE connection immediately (don't retry)
     - Trigger auth token renewal via AuthProvider
     - Reconnect after new token acquired
   - **Rationale:** Auth errors need token refresh, not connection retry

3. **Server Errors (Backend Down)**
   - **Cause:** Backend crash, deployment, Redis unavailable
   - **Handling:**
     - Retry with exponential backoff (same as network errors)
     - After 10 attempts, show "Server unavailable" message
     - Allow manual reconnect button
   - **Rationale:** Backend restarts usually complete within minutes

4. **Recovery Errors (Redis Streams Query Fails)**
   - **Cause:** Redis unavailable, corrupt stream data
   - **Handling:**
     - Log error but continue with connection
     - Client gets new events only (no recovery)
     - Show warning: "Some updates may be missed, refresh page if needed"
   - **Rationale:** Partial recovery is better than no connection

5. **Max Reconnect Attempts Exceeded**
   - **Cause:** Extended outage (> 10 attempts = ~17 minutes with backoff)
   - **Handling:**
     - Stop automatic reconnection
     - Show "Connection failed" message with manual reconnect button
     - Clear reconnection state on manual attempt
   - **Rationale:** Prevent infinite retry loop, give user control

**Error Display Pattern:**

**Backend Console:**
```typescript
// Successful recovery
console.log(`Recovered 15 missed events for user ${userId}`);

// Recovery failure (graceful degradation)
console.error(`Failed to recover events for user ${userId}:`, error);
// Continue with connection - client will get new events only
```

**Frontend UI:**
```typescript
// In SSEProvider or useSSE hook
const { connectionState, connect } = useSSE();

// UI display
{connectionState === 'reconnecting' && (
  <div className="text-yellow-600">
    <Icon name="wifi-off" /> Reconnecting...
  </div>
)}

{connectionState === 'error' && (
  <div className="text-red-600">
    <Icon name="alert-circle" /> Connection failed
    <button onClick={connect}>Retry</button>
  </div>
)}
```

### Files to Create

**Backend:**
1. `backend/src/types/sse.types.ts` - SSE type definitions (~40 lines)
2. `backend/src/services/eventRecovery.service.ts` - Redis Streams recovery (~120 lines)
3. `backend/src/services/sseService.ts` - Connection manager (~150 lines)
4. `backend/src/routes/events.routes.ts` - SSE endpoint (~100 lines)

**Frontend:**
5. `frontend/src/types/sse.ts` - SSE type definitions (~50 lines)
6. `frontend/src/services/events/sseClient.ts` - EventSource wrapper (~250 lines)
7. `frontend/src/providers/SSEProvider.tsx` - React provider (~150 lines)

**Total:** 7 new files, ~860 lines of code

### Files to Modify

1. `backend/src/app.ts` - Add events routes import and mount (+3 lines)
2. `frontend/src/App.tsx` - Wrap app in SSEProvider (+3 lines)

## Validation Gates

### Linting and Type Checking

```bash
# Backend
cd src/prototype-2/backend
npm run type-check   # Must pass with no errors
npm run lint         # Must pass with no warnings

# Frontend
cd src/prototype-2/frontend
npm run type-check   # Must pass with no errors
npm run lint         # Must pass with no warnings
```

**Expected Results:**
- No TypeScript errors in any new files
- No ESLint warnings
- All imports resolve correctly
- No circular dependencies

### Build Verification

```bash
# Backend
cd src/prototype-2/backend
npm run build        # Must succeed

# Frontend
cd src/prototype-2/frontend
npm run build        # Must succeed
```

**Expected Results:**
- Backend compiles to dist/ without errors
- Frontend builds without errors
- Bundle size increase < 5KB (minimal SSE client code)

### Manual Testing

**Test Scenario 1: Initial Connection**
1. Start Redis, backend, frontend
2. Login to app
3. Open browser DevTools → Network tab → Filter "stream"
4. **Expected:** See `GET /api/events/stream` with Status 200 (pending)
5. **Expected:** Response type "text/event-stream"
6. **Expected:** Console log: "SSE connection established"
7. **Expected:** Connection state: "connected"

**Test Scenario 2: Receive Event**
1. With SSE connected, publish test event to Redis:
   ```bash
   redis-cli PUBLISH platform:events '{"type":"notification","id":"test_123","userId":"user_123","timestamp":"2025-11-05T10:30:00Z"}'
   ```
2. **Expected:** Frontend receives event
3. **Expected:** Console log: "SSE event received: {type: 'notification', ...}"
4. **Expected:** TanStack Query invalidates notifications cache
5. **Expected:** lastEventId state updated to "test_123"

**Test Scenario 3: Reconnection After Network Drop**
1. SSE connected
2. DevTools → Network tab → "Offline" mode
3. **Expected:** Connection drops, EventSource fires error
4. **Expected:** Console log: "Reconnecting in 1000ms (attempt 1/10)"
5. **Expected:** Connection state: "reconnecting"
6. Wait 1 second
7. **Expected:** Reconnection attempt (fails while offline)
8. **Expected:** Console log: "Reconnecting in 2000ms (attempt 2/10)"
9. DevTools → "Online" mode
10. Wait for next reconnect
11. **Expected:** Connection restored
12. **Expected:** Console log: "SSE connection established"
13. **Expected:** Connection state: "connected"

**Test Scenario 4: Missed Events Recovery**
1. SSE connected, lastEventId stored (e.g., "1730808600000-5")
2. Add events to Redis Stream while connected:
   ```bash
   redis-cli XADD events:user_123 * event '{"type":"notification","userId":"user_123","timestamp":"2025-11-05T10:31:00Z"}'
   ```
3. Disconnect client (close tab)
4. Add more events to stream (simulate missed events):
   ```bash
   redis-cli XADD events:user_123 * event '{"type":"notification","userId":"user_123","timestamp":"2025-11-05T10:32:00Z"}'
   redis-cli XADD events:user_123 * event '{"type":"task","userId":"user_123","timestamp":"2025-11-05T10:33:00Z"}'
   ```
5. Reconnect client (reload page)
6. **Expected:** SSE sends Last-Event-ID header
7. **Expected:** Backend queries Redis Streams
8. **Expected:** Console log: "Recovered 2 missed events for user user_123"
9. **Expected:** Client receives 2 events before new events
10. **Expected:** TanStack Query invalidates relevant caches

**Test Scenario 5: Authentication Error (401)**
1. SSE connected
2. Manually expire access token (or wait for expiration)
3. Backend receives next heartbeat/event with expired token
4. **Expected:** Backend rejects with 401
5. **Expected:** Frontend detects auth error
6. **Expected:** SSE disconnects immediately (no retry)
7. **Expected:** AuthProvider triggers token renewal
8. **Expected:** After renewal, SSE reconnects with new token

**Test Scenario 6: Max Reconnect Attempts**
1. SSE connected
2. Stop backend server (simulate extended outage)
3. **Expected:** Client retries: 1s, 2s, 4s, 8s, 16s, 30s, 30s, 30s, 30s, 30s (10 attempts)
4. **Expected:** After 10 attempts, console log: "Max reconnect attempts reached, giving up"
5. **Expected:** Connection state: "error"
6. **Expected:** No more automatic reconnections
7. Manual reconnect button in UI
8. Click reconnect button
9. **Expected:** Reconnect attempts reset, tries again

### Console Output Validation

**Development Mode (expected logs):**
```
✅ SSE connection established
SSE event received: {type: 'notification', id: '1730808600000-5', ...}
⚠️ SSE connection error: Error: SSE connection closed
Reconnecting in 1000ms (attempt 1/10)
Reconnecting in 2000ms (attempt 2/10)
✅ SSE connection established
Recovered 2 missed events for user user_123
```

**Production Mode:**
- Minimal logs (only errors)
- No reconnection attempt logs
- Cleaner user experience

### Redis Validation

**Verify Redis Streams:**
```bash
# Check stream exists
redis-cli EXISTS events:user_123
# Should return: 1

# Check stream length
redis-cli XLEN events:user_123
# Should return: <number of events>

# View stream entries
redis-cli XRANGE events:user_123 - +
# Should return: Array of [id, [field, value]] pairs

# Read events since specific ID
redis-cli XREAD STREAMS events:user_123 1730808600000-5
# Should return: Events after that ID
```

### Performance Checks

**Connection Metrics:**
- Time to establish connection: < 500ms
- Time to receive first event after publish: < 100ms
- Reconnection time (after network restore): < 5 seconds
- Recovery query time: < 200ms (for < 100 missed events)

**Memory Usage:**
- EventSource instance: ~10KB
- SSE client state: ~1KB
- No memory leaks after 100 reconnections

## References

### Specifications
- **SPEC-events.md (SPEC-EV-SSE-013:028)** - `spec/SPEC-events.md:180-220`
  - SSE reconnection requirements
  - Last-Event-ID header handling
  - Browser auto-reconnect behavior

- **SPEC-events.md (SPEC-EV-ST-001:016)** - `spec/SPEC-events.md:106-147`
  - Redis Streams for event buffering
  - Stream naming conventions
  - Event recovery queries

- **SPEC-events.md (SPEC-EV-PL-001:017)** - `spec/SPEC-events.md:222-284`
  - Event payload structure
  - Event ID and timestamp requirements

### Codebase Examples
- **AuthProvider retry logic:** `frontend/src/providers/AuthProvider.tsx:99-128`
- **JQEL query retry logic:** `frontend/src/services/jqel/hooks/useJQELQuery.ts:12-57`
- **Redis connection management:** `backend/src/services/redis.service.ts:17-80`
- **TanStack Query invalidation:** `frontend/src/services/jqel/invalidation.ts`

### External Documentation
- **EventSource API:** https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- **Redis Streams:** https://redis.io/docs/data-types/streams/
- **Server-Sent Events Spec:** https://html.spec.whatwg.org/multipage/server-sent-events.html
- **ioredis Streams Guide:** https://github.com/redis/ioredis#streams

## Pre-Implementation Checklist

- [x] Researched SPEC requirements (SPEC-EV-SSE-*, SPEC-EV-ST-*)
- [x] Analyzed existing retry patterns (AuthProvider, useJQELQuery)
- [x] Reviewed Redis Streams API for event recovery
- [x] Studied EventSource API limitations and auto-reconnect behavior
- [x] Documented connection state machine
- [x] Identified all files to create and modify
- [x] Created comprehensive validation test scenarios
- [x] Defined error handling strategies for all error types

## Success Criteria

**Implementation Complete When:**
1. Backend SSE endpoint accepts connections with JWT authentication
2. Backend parses Last-Event-ID header and queries Redis Streams
3. Backend sends missed events on reconnection
4. Frontend SSEClient establishes EventSource connection
5. Frontend implements exponential backoff reconnection (1s, 2s, 4s, ...)
6. Frontend stores lastEventId in localStorage
7. Frontend sends Last-Event-ID header on reconnect
8. Frontend processes recovered events and invalidates TanStack Query cache
9. SSEProvider auto-connects when authenticated
10. SSEProvider auto-disconnects on logout
11. All TypeScript compilation passes without errors
12. All builds succeed without errors
13. Manual testing confirms:
    - Initial connection works
    - Events are received and processed
    - Reconnection works after network drop
    - Missed events are recovered
    - Exponential backoff delays are correct
    - Max reconnect attempts stops retry loop
    - 401 errors trigger auth renewal

**Quality Markers:**
- Code follows existing patterns (AuthProvider, useJQELQuery)
- No memory leaks (EventSource closed on unmount)
- Graceful degradation (app works without SSE)
- Comprehensive error handling (network, auth, server errors)
- Efficient Redis Streams queries (< 200ms for < 100 events)
- Type-safe implementation throughout
- Clear console logging in development
- Minimal production logs

**Alignment with SPEC:**
- SSE headers set correctly (SPEC-EV-SSE-011:014) ✓
- Last-Event-ID header parsed (SPEC-EV-SSE-025:028) ✓
- Missed events recovered via Redis Streams (SPEC-EV-ST-013:016) ✓
- Event payload includes id and timestamp (SPEC-EV-PL-003:005) ✓
- Reconnection is automatic with custom logic (SPEC-EV-SSE-026) ✓
- Integration with TanStack Query (SPEC-EV-FR-001:006) ✓
