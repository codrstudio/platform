# Task Plan: 1.5.6 - Implementar recuperação offline

## Context and Objective

This task implements offline event recovery for the SSE (Server-Sent Events) real-time event system. When clients reconnect after being offline or losing connection, they need to retrieve missed events that were published while they were disconnected.

**Business Value:**
- Users never miss critical notifications or tasks, even during network interruptions
- Seamless user experience with automatic recovery on reconnect
- Prevents data loss during temporary connectivity issues

**How It Integrates:**
- Builds on task 1.5.5 (Redis Streams) which provides persistent event storage
- Works with task 1.5.3 (SSE reconnection) which detects when clients reconnect
- Integrates with JQEL system for fetching missed events
- Frontend uses Last-Event-ID to track the last successfully received event

**User Impact:**
- Mobile users with intermittent connectivity get all events when they reconnect
- Desktop users who close browser tab and reopen get updates
- No manual page refresh needed to see missed updates

## Dependencies

### Prerequisite Tasks
- **1.5.5 - Redis Streams**: MUST be complete - provides event buffering and XREAD capability
- **1.5.3 - SSE Reconnection**: MUST be complete - provides reconnection detection mechanism
- **1.5.1 - SSE Server**: MUST be complete - provides GET /api/events/stream endpoint
- **1.4.7 - JQEL Queries**: MUST be complete - provides data fetching mechanism

### Files/Modules Affected

**Backend (Modified):**
- `src/backend/src/services/sseService.ts` - Add recovery endpoint and Last-Event-ID support
- `src/backend/src/services/redis.service.ts` - Add XREAD and XRANGE operations for Streams
- `src/backend/src/routes/events.routes.ts` - Add GET /api/events/missed endpoint
- `src/backend/src/types/jqel.types.ts` - May need event recovery types

**Frontend (Modified):**
- `src/frontend/src/services/events/sseClient.ts` - Track Last-Event-ID, request recovery
- `src/frontend/src/providers/SSEProvider.tsx` - Orchestrate recovery on reconnect
- `src/frontend/src/hooks/useEventRecovery.ts` - New hook for recovery logic
- `src/frontend/src/types/events.ts` - Event recovery types

**Backend (Created):**
- `src/backend/src/services/eventRecovery.service.ts` - Core recovery logic

**Frontend (Created):**
- `src/frontend/src/services/events/recoveryClient.ts` - Recovery API client

### Enables Tasks
- 1.5.7 - Notification Events (can rely on guaranteed delivery)
- 1.5.8 - Task Events (can rely on guaranteed delivery)
- 1.5.10 - Frontend SSE Client (enhanced with recovery)

### External Dependencies
- ioredis - Redis client (already installed)
- Redis server running with Streams support (Redis 5.0+)
- EventSource API (browser native)

## Patterns Identified in Codebase

### Similar Components/Modules

**Token Renewal Pattern (AuthProvider.tsx):**
- `src/frontend/src/providers/AuthProvider.tsx` - Automatic retry with exponential backoff
- **Relevance:** Shows how to implement automatic recovery with retry logic
- **Pattern to Follow:** Exponential backoff (1s, 2s, 4s, 8s, 16s, capped at 30s)
- **Key Code:**
  ```typescript
  const RETRY_BASE_DELAY_MS = 1000;
  const delay = RETRY_BASE_DELAY_MS * Math.pow(2, renewalAttemptsRef.current);
  const cappedDelay = Math.min(delay, MAX_DELAY_MS);
  ```

**JQEL Query Hook (useJQELQuery.ts):**
- `src/frontend/src/services/jqel/hooks/useJQELQuery.ts` - Smart retry on failures
- **Relevance:** Shows how to handle retry logic for data fetching
- **Pattern to Follow:** Don't retry 4xx errors, retry 5xx up to 3 times
- **Key Code:**
  ```typescript
  function shouldRetry(failureCount: number, error: JQELError): boolean {
    if (error.code >= 400 && error.code < 500) return false; // Client errors
    if (error.code >= 500) return failureCount < 3; // Server errors
    return failureCount < 3;
  }
  ```

**Redis Service (redis.service.ts):**
- `src/backend/src/services/redis.service.ts` - Singleton Redis client
- **Relevance:** Shows existing Redis operations and connection management
- **Pattern to Follow:** Lazy connection, async/await, error handling
- **Key Code:**
  ```typescript
  async get(key: string): Promise<string | null> {
    await this.connect();
    return this.client!.get(key);
  }
  ```

### Conventions to Follow

**Naming Conventions:**
- Service classes: `EventRecoveryService` (PascalCase)
- Service instances: `eventRecoveryService` (camelCase, singleton export)
- Hook names: `useEventRecovery` (camelCase with `use` prefix)
- Functions: `fetchMissedEvents`, `parseLastEventId` (camelCase)

**File Structure:**
- Services in `src/services/` directory
- Hooks in `src/hooks/` directory
- Types in `src/types/` directory
- One service class per file, export singleton instance

**Import/Export Patterns:**
```typescript
// Service
export class EventRecoveryService { ... }
export const eventRecoveryService = new EventRecoveryService();

// Hook
export function useEventRecovery() { ... }

// Types
export interface EventRecoveryResult { ... }
```

**State Management:**
- Use React Context for global state (SSEProvider)
- Use hooks for component-level logic (useEventRecovery)
- Use TanStack Query for server state (if applicable)
- Use refs for values that shouldn't trigger re-renders (lastEventIdRef)

**Error Handling:**
```typescript
try {
  // Operation
} catch (error) {
  console.error('Descriptive error message:', error);
  // Handle or throw
}
```

### Reusable Code Examples

**Redis Streams XREAD (to be added to redis.service.ts):**
```typescript
// File: src/backend/src/services/redis.service.ts (add this method)

/**
 * Read events from Redis Stream starting from a specific ID
 *
 * @param streamKey - Stream key (e.g., "events:user123")
 * @param startId - Start reading after this ID (use "0-0" for all events)
 * @param count - Maximum number of events to read
 * @returns Array of stream entries [id, fields]
 */
async xread(
  streamKey: string,
  startId: string = '0-0',
  count: number = 100
): Promise<Array<[string, Record<string, string>]>> {
  await this.connect();

  const result = await this.client!.xread(
    'COUNT', count,
    'STREAMS', streamKey, startId
  );

  if (!result || result.length === 0) {
    return [];
  }

  // Result format: [[streamKey, [[id, [field1, value1, field2, value2, ...]]]]]
  const [, entries] = result[0];

  return entries.map(([id, fields]) => {
    // Convert flat array to object: [k1, v1, k2, v2] -> {k1: v1, k2: v2}
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return [id, obj];
  });
}

/**
 * Read events from Redis Stream within a range of IDs
 *
 * @param streamKey - Stream key
 * @param startId - Start ID (inclusive, use "-" for beginning)
 * @param endId - End ID (inclusive, use "+" for end)
 * @param count - Maximum number of events
 * @returns Array of stream entries
 */
async xrange(
  streamKey: string,
  startId: string = '-',
  endId: string = '+',
  count?: number
): Promise<Array<[string, Record<string, string>]>> {
  await this.connect();

  const args: (string | number)[] = [streamKey, startId, endId];
  if (count) {
    args.push('COUNT', count);
  }

  const result = await this.client!.xrange(...args);

  return result.map(([id, fields]) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return [id, obj];
  });
}
```

**Exponential Backoff Pattern (from AuthProvider and useJQELQuery):**
```typescript
// File: Pattern to follow for retry logic

const BASE_DELAY_MS = 1000; // 1 second
const MAX_DELAY_MS = 30000; // 30 seconds
const MAX_ATTEMPTS = 3;

function calculateRetryDelay(attemptIndex: number): number {
  const delay = BASE_DELAY_MS * Math.pow(2, attemptIndex);
  return Math.min(delay, MAX_DELAY_MS);
}

function shouldRetry(attemptCount: number, error: Error): boolean {
  // Don't retry if max attempts reached
  if (attemptCount >= MAX_ATTEMPTS) return false;

  // Don't retry client errors (4xx)
  if ('code' in error && error.code >= 400 && error.code < 500) {
    return false;
  }

  // Retry server errors and network errors
  return true;
}
```

**EventSource with Last-Event-ID (SSE standard pattern):**
```typescript
// File: Frontend pattern for tracking last event

let lastEventId: string | null = null;

// EventSource automatically sends Last-Event-ID header on reconnect
const eventSource = new EventSource('/api/events/stream');

eventSource.addEventListener('message', (event) => {
  // Store the last successfully received event ID
  lastEventId = event.lastEventId || event.data.id;

  // Process event
  processEvent(JSON.parse(event.data));
});

eventSource.addEventListener('open', async () => {
  // On reconnect, fetch missed events
  if (lastEventId) {
    await fetchMissedEvents(lastEventId);
  }
});
```

## Critical Context

### Documentation

**Redis Streams Documentation:**
- [Redis XREAD](https://redis.io/commands/xread/) - Read from Streams with blocking/non-blocking
- [Redis XRANGE](https://redis.io/commands/xrange/) - Query range of entries by ID
- [Redis Streams Introduction](https://redis.io/docs/data-types/streams/) - Stream IDs, consumer groups
- **Relevance:** XREAD is used to fetch events after a specific ID (Last-Event-ID)
- **Key Concepts:**
  - Stream ID format: `<timestamp>-<sequence>` (e.g., "1609459200000-0")
  - Use `XREAD STREAMS mystream <lastId>` to get events after lastId
  - Count parameter limits returned events
  - Returns empty array if no new events

**SSE Last-Event-ID Specification:**
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format) - SSE format and Last-Event-ID
- [WHATWG: Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events) - Official SSE specification
- **Relevance:** Browser automatically includes `Last-Event-ID` header on reconnect
- **Key Concepts:**
  - Server sends `id: <eventId>` in SSE messages
  - Browser stores last received ID
  - On reconnect, browser sends `Last-Event-ID: <lastId>` header
  - Server can use this to resume from where client left off

**JQEL Integration:**
- `spec/SPEC-events.md` SPEC-EV-ST-013:016 - Frontend recovery via JQEL
- `spec/SPEC-events.md` SPEC-EV-FR-004:006 - Frontend recovery requirements
- **Relevance:** Recovery should optionally support JQEL queries for flexibility
- **Approach:** Prefer direct Redis Stream access for performance, JQEL as alternative

### Gotchas and Pitfalls

**Redis Stream ID Format:**
- Stream IDs are NOT simple integers: format is `<timestamp>-<sequence>`
- Example: `1730800000000-0`, `1730800000000-1`
- When querying with XREAD, use the EXACT last ID received, not a timestamp
- To get events AFTER an ID, Redis will return events with IDs > provided ID
- **Solution:** Store complete stream ID string, don't parse or modify it

**SSE Reconnection Race Condition:**
- Client may receive events via SSE AND via recovery simultaneously
- Example: User goes offline at event #5, comes back online, events #6-#10 queued
  - SSE reconnects and starts sending #6, #7, #8...
  - Recovery fetches #6, #7, #8, #9, #10
  - Result: Duplicate events #6, #7, #8
- **Solution:** Deduplicate events by ID in frontend before processing

**Redis Stream Expiration:**
- Streams configured with MAXLEN ~1000 (approx 1000 events)
- Older events auto-deleted to prevent memory bloat
- If client offline too long, missed events may be expired
- **Solution:**
  - Document recovery window (24 hours or 1000 events per SPEC-EV-ST-006)
  - Return "partial recovery" indicator if some events lost
  - Log warning if recovery incomplete

**Browser Last-Event-ID Header:**
- EventSource automatically includes `Last-Event-ID` header on reconnect
- But only if server sent `id:` field in SSE messages
- If server doesn't send `id:`, browser won't send `Last-Event-ID`
- **Solution:** Ensure SSE server ALWAYS sends `id: <streamId>` with each event

**Time Window for Recovery:**
- Must limit recovery to prevent overwhelming client
- Spec defines 24 hours OR 1000 events (SPEC-EV-ST-006)
- Recovery of 10,000 events would freeze browser
- **Solution:**
  - Enforce `COUNT` parameter in XREAD (max 1000)
  - Calculate age of last event ID, reject if > 24 hours
  - Return pagination info if more events exist

**Network Errors During Recovery:**
- Recovery fetch itself might fail
- Client could go offline again during recovery
- **Solution:** Retry recovery with exponential backoff (like token renewal)

### Existing Patterns to Follow

**Service Initialization Pattern:**
- See `src/backend/src/services/redis.service.ts` - Lazy connection pattern
- Services MUST check connection before operations
- Services SHOULD be singletons exported as instances

**Error Logging Pattern:**
- Console.error with descriptive prefix: `console.error('❌ Recovery Error:', error)`
- Include context: user ID, stream key, last event ID
- Dev environment: Verbose logging
- Production: Log errors only (not debug info)

**TypeScript Types Pattern:**
- Define interfaces for all service inputs/outputs
- Use `Record<string, any>` for flexible objects
- Use `string | null` for optional IDs
- Export types from `src/types/` files

**React Hook Pattern (from useJQELQuery):**
- Hook returns object with state and actions
- Use `useRef` for non-reactive state (lastEventIdRef)
- Use `useState` for UI-triggering state (isRecovering)
- Use `useCallback` for stable function references
- Use `useEffect` for side effects (recovery on reconnect)

## Technical Specification

### Architecture

```
Frontend                           Backend                           Redis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SSEProvider                   SSE Service                   Redis Streams
┌─────────────┐              ┌───────────────┐            ┌──────────────┐
│ lastEventId │              │ GET /events/  │            │ events:user1 │
│   stored    │              │     stream    │            │  • event1    │
│  in ref     │              │               │            │  • event2    │
└──────┬──────┘              │ Sends id:     │            │  • event3    │
       │                     │ with each     │            │  • event4    │
       │                     │ event         │            │  • event5    │
       │  1. Reconnect       └───────────────┘            └──────────────┘
       │     Detected                │                              │
       │                             │                              │
       │  2. Call Recovery           │                              │
       ├────────────────────────────►│ GET /api/events/missed       │
       │    ?lastEventId=event3      │      ?lastEventId=event3     │
       │                             │                              │
       │                             │  3. XREAD STREAMS            │
       │                             │     events:user1 event3      │
       │                             ├─────────────────────────────►│
       │                             │                              │
       │                             │  4. Returns [event4, event5] │
       │                             │◄─────────────────────────────┤
       │                             │                              │
       │  5. Returns {events: [...]}│                              │
       │◄────────────────────────────┤                              │
       │                             │                              │
       │  6. Process missed events   │                              │
       │     Deduplicate by ID       │                              │
       │     Invalidate queries      │                              │
       │                             │                              │
       │  7. Resume normal SSE       │                              │
       │◄────────────────────────────┤                              │
       │                             │                              │
```

### Data Flow

**Normal SSE Flow (for context):**
```
1. Frontend connects to GET /api/events/stream
2. Backend subscribes to Redis Pub/Sub for user
3. Event arrives → Backend sends via SSE with id: <streamId>
4. Frontend receives event, stores lastEventId
5. Frontend processes event (invalidate queries, show toast)
```

**Recovery Flow (this task):**
```
1. Frontend detects reconnection (SSE 'open' event)
2. Frontend checks if lastEventId exists in ref
3. If lastEventId exists:
   a. Call GET /api/events/missed?lastEventId=<id>
   b. Backend validates lastEventId format
   c. Backend checks if event is within 24h window
   d. Backend calls XREAD to fetch events after lastEventId
   e. Backend returns {events: [...], hasMore: boolean, lastId: string}
   f. Frontend deduplicates events by ID
   g. Frontend processes each missed event in order
   h. Frontend updates lastEventId to newest event
4. Frontend resumes normal SSE listening
```

**Edge Case: Recovery Failure:**
```
1. Recovery request fails (network error, 500, etc.)
2. Frontend retries with exponential backoff
3. After 3 attempts, log error and continue with SSE
4. User may have missed some events (acceptable - 24h window)
```

### Modules and Responsibilities

**Backend - EventRecoveryService**
- **File:** `src/backend/src/services/eventRecovery.service.ts`
- **Responsibility:** Fetch missed events from Redis Streams
- **Interface:**
  ```typescript
  class EventRecoveryService {
    fetchMissedEvents(
      userId: string,
      lastEventId: string,
      maxCount?: number
    ): Promise<EventRecoveryResult>
  }

  interface EventRecoveryResult {
    events: Array<{id: string, data: Record<string, any>}>;
    hasMore: boolean;
    lastId: string;
    recoveryWindow: {start: string, end: string};
  }
  ```

**Backend - RedisService Extension**
- **File:** `src/backend/src/services/redis.service.ts`
- **Responsibility:** Add XREAD and XRANGE methods
- **Interface:**
  ```typescript
  class RedisService {
    xread(
      streamKey: string,
      startId: string,
      count?: number
    ): Promise<Array<[string, Record<string, string>]>>

    xrange(
      streamKey: string,
      startId: string,
      endId: string,
      count?: number
    ): Promise<Array<[string, Record<string, string>]>>
  }
  ```

**Backend - Events Routes**
- **File:** `src/backend/src/routes/events.routes.ts`
- **Responsibility:** Expose recovery endpoint
- **Interface:**
  ```
  GET /api/events/missed?lastEventId=<id>&maxCount=<n>
  Headers: Authorization: Bearer <jwt>
  Response: {
    code: 200,
    data: [{
      events: [...],
      hasMore: boolean,
      lastId: string
    }]
  }
  ```

**Frontend - useEventRecovery Hook**
- **File:** `src/frontend/src/hooks/useEventRecovery.ts`
- **Responsibility:** Orchestrate recovery on reconnect
- **Interface:**
  ```typescript
  function useEventRecovery(
    lastEventId: string | null,
    onEventsRecovered: (events: Event[]) => void
  ): {
    recover: () => Promise<void>;
    isRecovering: boolean;
    error: Error | null;
  }
  ```

**Frontend - SSEProvider Extension**
- **File:** `src/frontend/src/providers/SSEProvider.tsx`
- **Responsibility:** Track lastEventId, trigger recovery
- **Interface:**
  ```typescript
  interface SSEContextValue {
    isConnected: boolean;
    lastEventId: string | null; // NEW
    addEventListener: (type: string, handler: Function) => void;
    removeEventListener: (type: string, handler: Function) => void;
  }
  ```

**Frontend - Recovery Client**
- **File:** `src/frontend/src/services/events/recoveryClient.ts`
- **Responsibility:** HTTP client for recovery API
- **Interface:**
  ```typescript
  async function fetchMissedEvents(
    lastEventId: string,
    maxCount?: number
  ): Promise<EventRecoveryResponse>
  ```

### State Management

**Backend State:**
- No persistent state needed
- Recovery is stateless: given lastEventId → return events after it
- Redis Stream holds persistent state

**Frontend State:**
```typescript
// In SSEProvider
const lastEventIdRef = useRef<string | null>(null);      // Non-reactive
const [isRecovering, setIsRecovering] = useState(false); // Reactive
const [recoveryError, setRecoveryError] = useState<Error | null>(null);
const recoveryAttemptsRef = useRef(0);                   // Non-reactive

// Updated on each event received
const handleMessage = (event: MessageEvent) => {
  const data = JSON.parse(event.data);
  lastEventIdRef.current = event.lastEventId || data.id;
  // ... process event
};

// Triggered on reconnect
const handleOpen = async () => {
  if (lastEventIdRef.current && !isRecovering) {
    await recoverMissedEvents();
  }
};
```

### Libraries and Tools

**ioredis** - v5.3.2 (already installed)
- **Reason:** Redis client with full Streams support
- **Specific Features:**
  - `xread()` - Read events from Stream
  - `xrange()` - Query range of events
  - `xadd()` - Add events (used by task 1.5.5)

**EventSource API** - Browser native
- **Reason:** Built-in SSE support with automatic reconnection
- **Specific Features:**
  - Automatic `Last-Event-ID` header on reconnect
  - `event.lastEventId` property
  - `open` event for reconnection detection

**TanStack Query** - v5.x (already installed)
- **Reason:** May be used for recovery if JQEL route is preferred
- **Note:** Direct fetch preferred for recovery (simpler, faster)

## Implementation Blueprint

### Ordered Steps

#### 1. Extend RedisService with Streams Read Operations

**Create/Modify:** `src/backend/src/services/redis.service.ts`

**Details:**
Add two new methods to RedisService class:
1. `xread()` - Read events after a specific ID (for recovery)
2. `xrange()` - Read events within a range (for debugging/admin)

**Implementation:**
```typescript
/**
 * Read events from Redis Stream starting after a specific ID
 * Used for offline event recovery
 *
 * SPEC Reference: SPEC-EV-ST-013:016
 *
 * @param streamKey - Stream key (e.g., "events:user_123")
 * @param startId - Last received event ID (read events AFTER this)
 * @param count - Maximum events to return (default: 1000)
 * @returns Array of [eventId, eventData] tuples
 */
async xread(
  streamKey: string,
  startId: string = '0-0',
  count: number = 1000
): Promise<Array<[string, Record<string, string>]>> {
  await this.connect();

  try {
    // XREAD COUNT <count> STREAMS <key> <startId>
    const result = await this.client!.xread(
      'COUNT', count,
      'STREAMS', streamKey, startId
    );

    // No new events
    if (!result || result.length === 0) {
      return [];
    }

    // Parse result: [[streamKey, [[id, [field1, value1, ...]]]]]
    const [, entries] = result[0];

    // Convert to clean format
    return entries.map(([id, fields]) => {
      const data: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        data[fields[i]] = fields[i + 1];
      }
      return [id, data];
    });
  } catch (error) {
    console.error('❌ Redis XREAD Error:', { streamKey, startId, error });
    throw error;
  }
}

/**
 * Read events from Redis Stream within a range
 * Used for debugging or admin queries
 *
 * @param streamKey - Stream key
 * @param startId - Start ID (inclusive, "-" for beginning)
 * @param endId - End ID (inclusive, "+" for end)
 * @param count - Maximum events (optional)
 * @returns Array of [eventId, eventData] tuples
 */
async xrange(
  streamKey: string,
  startId: string = '-',
  endId: string = '+',
  count?: number
): Promise<Array<[string, Record<string, string>]>> {
  await this.connect();

  try {
    const args: (string | number)[] = [streamKey, startId, endId];
    if (count) {
      args.push('COUNT', count);
    }

    const result = await this.client!.xrange(...args);

    return result.map(([id, fields]) => {
      const data: Record<string, string> = {};
      for (let i = 0; i < fields.length; i += 2) {
        data[fields[i]] = fields[i + 1];
      }
      return [id, data];
    });
  } catch (error) {
    console.error('❌ Redis XRANGE Error:', { streamKey, startId, endId, error });
    throw error;
  }
}
```

**Pattern Reference:** See existing `get()`, `set()` methods in redis.service.ts

**Validation:**
```bash
# After implementation, test manually:
npm run dev  # Start backend

# In another terminal (Redis CLI):
redis-cli

# Add test events to stream:
XADD events:testuser * type notification id evt1 timestamp 2025-11-05T10:00:00Z
XADD events:testuser * type notification id evt2 timestamp 2025-11-05T10:01:00Z
XADD events:testuser * type notification id evt3 timestamp 2025-11-05T10:02:00Z

# Get the stream ID of evt1 (will look like: 1730800800000-0)
XRANGE events:testuser - + COUNT 1

# Test XREAD via Node REPL:
node
> const { redisService } = require('./dist/services/redis.service.js');
> await redisService.xread('events:testuser', '<id-of-evt1>');
// Should return [evt2, evt3]
```

---

#### 2. Create EventRecoveryService

**Create:** `src/backend/src/services/eventRecovery.service.ts`

**Details:**
Core service for fetching missed events from Redis Streams. Handles:
- Validation of lastEventId format
- Time window enforcement (24 hours)
- Count limiting (max 1000 events)
- Error handling for expired/invalid IDs

**Implementation:**
```typescript
import { redisService } from './redis.service.js';
import type { JResult } from '../types/jqel.types.js';

/**
 * Event Recovery Result
 */
export interface EventRecoveryResult {
  events: Array<{
    id: string;
    type: string;
    userId: string;
    timestamp: string;
    category?: string;
    priority?: string;
  }>;
  hasMore: boolean;
  lastId: string;
  recoveryWindow: {
    startId: string;
    endId: string;
    startTime: string;
    endTime: string;
  };
}

/**
 * Event Recovery Service
 *
 * Fetches missed events from Redis Streams for offline recovery.
 *
 * SPEC References:
 * - SPEC-EV-ST-002: Store events for offline users
 * - SPEC-EV-ST-003: Allow recovery of missed events
 * - SPEC-EV-ST-006: 24h/1000 event window
 * - SPEC-EV-ST-013:016: Recovery mechanism
 * - SPEC-EV-FR-004:006: Frontend recovery
 */
export class EventRecoveryService {
  private readonly MAX_RECOVERY_COUNT = 1000;
  private readonly MAX_RECOVERY_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch missed events for a user
   *
   * @param userId - User ID to fetch events for
   * @param lastEventId - Last event ID received by client
   * @param maxCount - Maximum events to return (default: 1000)
   * @returns Recovery result with events
   * @throws Error if lastEventId is invalid or too old
   */
  async fetchMissedEvents(
    userId: string,
    lastEventId: string,
    maxCount?: number
  ): Promise<EventRecoveryResult> {
    const streamKey = `events:${userId}`;
    const count = Math.min(maxCount || this.MAX_RECOVERY_COUNT, this.MAX_RECOVERY_COUNT);

    // Validate event ID format (Redis Stream ID: timestamp-sequence)
    if (!this.isValidStreamId(lastEventId)) {
      throw new Error(`Invalid lastEventId format: ${lastEventId}`);
    }

    // Check if event is within recovery window (24 hours)
    const lastEventAge = this.getStreamIdAge(lastEventId);
    if (lastEventAge > this.MAX_RECOVERY_AGE_MS) {
      throw new Error(
        `LastEventId too old: ${Math.floor(lastEventAge / 1000 / 60 / 60)}h ago (max: 24h)`
      );
    }

    try {
      // Fetch events from Redis Stream
      const entries = await redisService.xread(streamKey, lastEventId, count);

      // Parse events
      const events = entries.map(([id, data]) => {
        // Parse stored JSON (from XADD in task 1.5.5)
        const parsedData = JSON.parse(data.data || '{}');
        return {
          id,
          type: parsedData.type || data.type,
          userId: parsedData.userId || data.userId,
          timestamp: parsedData.timestamp || data.timestamp,
          category: parsedData.category || data.category,
          priority: parsedData.priority || data.priority,
        };
      });

      // Determine if more events exist
      const hasMore = events.length === count;

      // Get recovery window info
      const lastId = events.length > 0 ? events[events.length - 1].id : lastEventId;
      const startTime = this.streamIdToTimestamp(lastEventId);
      const endTime = events.length > 0
        ? this.streamIdToTimestamp(lastId)
        : startTime;

      return {
        events,
        hasMore,
        lastId,
        recoveryWindow: {
          startId: lastEventId,
          endId: lastId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Event Recovery Error:', {
        userId,
        lastEventId,
        error,
      });
      throw error;
    }
  }

  /**
   * Validate Redis Stream ID format
   * Format: <timestamp>-<sequence> (e.g., "1730800800000-0")
   */
  private isValidStreamId(id: string): boolean {
    return /^\d+-\d+$/.test(id);
  }

  /**
   * Extract timestamp from Redis Stream ID
   */
  private streamIdToTimestamp(id: string): number {
    const [timestamp] = id.split('-');
    return parseInt(timestamp, 10);
  }

  /**
   * Calculate age of stream ID in milliseconds
   */
  private getStreamIdAge(id: string): number {
    const timestamp = this.streamIdToTimestamp(id);
    return Date.now() - timestamp;
  }
}

// Export singleton instance
export const eventRecoveryService = new EventRecoveryService();
```

**Pattern Reference:** See `jqelProcessor.service.ts` for service pattern

---

#### 3. Add Recovery Endpoint to Events Routes

**Modify:** `src/backend/src/routes/events.routes.ts`

**Details:**
Add GET /api/events/missed endpoint for recovery.
Must validate JWT and extract userId.

**Implementation:**
```typescript
import { Router } from 'express';
import { eventRecoveryService } from '../services/eventRecovery.service.js';
import { jwtService } from '../services/jwt.service.js';
import type { JResult } from '../types/jqel.types.js';

const router = Router();

// ... existing GET /stream route ...

/**
 * GET /api/events/missed
 *
 * Fetch missed events for offline recovery
 *
 * Query params:
 * - lastEventId: Last event ID received by client (REQUIRED)
 * - maxCount: Maximum events to return (optional, max: 1000)
 *
 * Headers:
 * - Authorization: Bearer <jwt> (REQUIRED)
 *
 * SPEC References:
 * - SPEC-EV-ST-013: Frontend can query Stream on reconnect
 * - SPEC-EV-FR-004:006: Recovery mechanism
 */
router.get('/missed', async (req, res) => {
  try {
    // Extract and validate JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResult: JResult = {
        code: 401,
        message: 'Missing or invalid authorization header',
      };
      return res.status(401).json(errorResult);
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyAccessToken(token);

    if (!payload || !payload.sub) {
      const errorResult: JResult = {
        code: 401,
        message: 'Invalid or expired token',
      };
      return res.status(401).json(errorResult);
    }

    const userId = payload.sub;

    // Validate query parameters
    const { lastEventId, maxCount } = req.query;

    if (!lastEventId || typeof lastEventId !== 'string') {
      const errorResult: JResult = {
        code: 400,
        message: 'Missing or invalid lastEventId query parameter',
        field: 'lastEventId',
      };
      return res.status(400).json(errorResult);
    }

    const parsedMaxCount = maxCount ? parseInt(maxCount as string, 10) : undefined;

    // Fetch missed events
    const result = await eventRecoveryService.fetchMissedEvents(
      userId,
      lastEventId,
      parsedMaxCount
    );

    // Return as JResult
    const successResult: JResult = {
      code: 200,
      data: [result], // JResult data is always array
    };

    res.status(200).json(successResult);
  } catch (error) {
    console.error('❌ Recovery Endpoint Error:', error);

    const errorResult: JResult = {
      code: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
    };

    res.status(500).json(errorResult);
  }
});

export default router;
```

**Pattern Reference:** See `jqel.routes.ts` for JWT validation pattern

**Validation:**
```bash
# Start backend
npm run dev

# Test recovery endpoint (need valid JWT)
curl -H "Authorization: Bearer <your-jwt>" \
  "http://localhost:3000/api/events/missed?lastEventId=1730800800000-0"

# Expected response:
{
  "code": 200,
  "data": [{
    "events": [...],
    "hasMore": false,
    "lastId": "1730800900000-0",
    "recoveryWindow": {...}
  }]
}
```

---

#### 4. Create Frontend Recovery Client

**Create:** `src/frontend/src/services/events/recoveryClient.ts`

**Details:**
HTTP client for calling the recovery endpoint.
Handles authentication token injection.

**Implementation:**
```typescript
import type { JResult } from '../../types/jqel';
import { tokenStorage } from '../auth/tokenStorage';

/**
 * Event Recovery Response
 */
export interface EventRecoveryResponse {
  events: Array<{
    id: string;
    type: string;
    userId: string;
    timestamp: string;
    category?: string;
    priority?: string;
  }>;
  hasMore: boolean;
  lastId: string;
  recoveryWindow: {
    startId: string;
    endId: string;
    startTime: string;
    endTime: string;
  };
}

/**
 * Recovery Error
 */
export class RecoveryError extends Error {
  constructor(
    message: string,
    public code: number,
    public field?: string
  ) {
    super(message);
    this.name = 'RecoveryError';
  }
}

/**
 * Fetch missed events from backend
 *
 * @param lastEventId - Last event ID received by client
 * @param maxCount - Maximum events to fetch (optional)
 * @returns Recovery response with events
 * @throws RecoveryError on failure
 */
export async function fetchMissedEvents(
  lastEventId: string,
  maxCount?: number
): Promise<EventRecoveryResponse> {
  const accessToken = tokenStorage.getAccessToken();

  if (!accessToken) {
    throw new RecoveryError('Not authenticated', 401);
  }

  const url = new URL('/api/events/missed', import.meta.env.VITE_API_URL);
  url.searchParams.set('lastEventId', lastEventId);
  if (maxCount) {
    url.searchParams.set('maxCount', maxCount.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const result: JResult<EventRecoveryResponse> = await response.json();

  if (result.code !== 200 || !result.data || result.data.length === 0) {
    throw new RecoveryError(
      result.message || 'Recovery failed',
      result.code,
      result.field
    );
  }

  return result.data[0];
}
```

**Pattern Reference:** See `src/services/auth/authClient.ts` for HTTP client pattern

---

#### 5. Create useEventRecovery Hook

**Create:** `src/frontend/src/hooks/useEventRecovery.ts`

**Details:**
React hook for recovery logic with retry and error handling.
Used by SSEProvider to orchestrate recovery on reconnect.

**Implementation:**
```typescript
import { useState, useCallback, useRef } from 'react';
import { fetchMissedEvents, RecoveryError } from '../services/events/recoveryClient';

/**
 * Event type (minimal structure for recovery)
 */
export interface RecoveredEvent {
  id: string;
  type: string;
  userId: string;
  timestamp: string;
  category?: string;
  priority?: string;
}

/**
 * Hook return value
 */
interface UseEventRecoveryResult {
  recover: () => Promise<void>;
  isRecovering: boolean;
  error: RecoveryError | null;
  attemptCount: number;
}

/**
 * Configuration
 */
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

/**
 * useEventRecovery
 *
 * Hook for recovering missed events on reconnect
 *
 * @param lastEventId - Last event ID received (null if no events received yet)
 * @param onEventsRecovered - Callback with recovered events
 * @returns Recovery controls
 */
export function useEventRecovery(
  lastEventId: string | null,
  onEventsRecovered: (events: RecoveredEvent[]) => void
): UseEventRecoveryResult {
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<RecoveryError | null>(null);
  const attemptCountRef = useRef(0);

  /**
   * Calculate exponential backoff delay
   */
  const calculateDelay = useCallback((attempt: number): number => {
    const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
    return Math.min(delay, MAX_RETRY_DELAY_MS);
  }, []);

  /**
   * Should retry based on error code and attempt count
   */
  const shouldRetry = useCallback((err: RecoveryError, attempts: number): boolean => {
    // Don't retry if max attempts reached
    if (attempts >= MAX_RETRY_ATTEMPTS) return false;

    // Don't retry client errors (4xx)
    if (err.code >= 400 && err.code < 500) return false;

    // Retry server errors and network errors
    return true;
  }, []);

  /**
   * Perform recovery with retry logic
   */
  const recover = useCallback(async () => {
    // Skip if no lastEventId (no events received yet)
    if (!lastEventId) {
      if (import.meta.env.DEV) {
        console.log('[Recovery] Skipped - no lastEventId');
      }
      return;
    }

    // Skip if already recovering
    if (isRecovering) {
      if (import.meta.env.DEV) {
        console.log('[Recovery] Skipped - already recovering');
      }
      return;
    }

    setIsRecovering(true);
    setError(null);
    attemptCountRef.current = 0;

    const attemptRecovery = async (): Promise<void> => {
      try {
        if (import.meta.env.DEV) {
          console.log(`[Recovery] Attempt ${attemptCountRef.current + 1}/${MAX_RETRY_ATTEMPTS}`, {
            lastEventId,
          });
        }

        const result = await fetchMissedEvents(lastEventId);

        if (import.meta.env.DEV) {
          console.log('[Recovery] Success:', {
            eventCount: result.events.length,
            hasMore: result.hasMore,
            window: result.recoveryWindow,
          });
        }

        // Process recovered events
        if (result.events.length > 0) {
          onEventsRecovered(result.events);
        }

        // Success - clear state
        setIsRecovering(false);
        setError(null);
        attemptCountRef.current = 0;

      } catch (err) {
        const recoveryError = err instanceof RecoveryError
          ? err
          : new RecoveryError('Unknown error', 500);

        console.error('[Recovery] Failed:', {
          attempt: attemptCountRef.current + 1,
          error: recoveryError.message,
          code: recoveryError.code,
        });

        // Check if should retry
        if (shouldRetry(recoveryError, attemptCountRef.current)) {
          attemptCountRef.current += 1;
          const delay = calculateDelay(attemptCountRef.current - 1);

          if (import.meta.env.DEV) {
            console.log(`[Recovery] Retrying in ${delay}ms...`);
          }

          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRecovery(); // Recursive retry
        } else {
          // No more retries - give up
          console.error('[Recovery] Giving up after', attemptCountRef.current + 1, 'attempts');
          setError(recoveryError);
          setIsRecovering(false);
          attemptCountRef.current = 0;
        }
      }
    };

    await attemptRecovery();
  }, [lastEventId, isRecovering, onEventsRecovered, shouldRetry, calculateDelay]);

  return {
    recover,
    isRecovering,
    error,
    attemptCount: attemptCountRef.current,
  };
}
```

**Pattern Reference:** See `AuthProvider.tsx` renewal logic for retry pattern

---

#### 6. Extend SSEProvider with Recovery Logic

**Modify:** `src/frontend/src/providers/SSEProvider.tsx`

**Details:**
Integrate useEventRecovery hook into SSEProvider.
Track lastEventId, trigger recovery on reconnect, deduplicate events.

**Implementation (key additions):**
```typescript
import { useEventRecovery } from '../hooks/useEventRecovery';
import type { RecoveredEvent } from '../hooks/useEventRecovery';

export function SSEProvider({ children }: { children: React.ReactNode }) {
  // ... existing state ...

  // NEW: Track last event ID
  const lastEventIdRef = useRef<string | null>(null);
  const [receivedEventIds] = useState<Set<string>>(new Set());

  // NEW: Recovery hook
  const { recover, isRecovering } = useEventRecovery(
    lastEventIdRef.current,
    handleRecoveredEvents
  );

  /**
   * Handle events recovered from offline
   * Deduplicate and process like normal events
   */
  function handleRecoveredEvents(events: RecoveredEvent[]) {
    if (import.meta.env.DEV) {
      console.log('[SSE] Processing recovered events:', events.length);
    }

    events.forEach(event => {
      // Deduplicate - skip if already received via SSE
      if (receivedEventIds.has(event.id)) {
        if (import.meta.env.DEV) {
          console.log('[SSE] Skipping duplicate event:', event.id);
        }
        return;
      }

      // Mark as received
      receivedEventIds.add(event.id);

      // Process like normal event (invalidate queries, etc.)
      processEvent(event);
    });

    // Clean up old IDs (keep last 1000)
    if (receivedEventIds.size > 1000) {
      const idsArray = Array.from(receivedEventIds);
      const toRemove = idsArray.slice(0, receivedEventIds.size - 1000);
      toRemove.forEach(id => receivedEventIds.delete(id));
    }
  }

  /**
   * Connect to SSE
   */
  const connect = useCallback(() => {
    // ... existing connection logic ...

    const eventSource = new EventSource(url, { withCredentials: true });

    // Handle messages - MODIFIED to track lastEventId
    eventSource.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Update last event ID
        const eventId = event.lastEventId || data.id;
        if (eventId) {
          lastEventIdRef.current = eventId;
          receivedEventIds.add(eventId);
        }

        // Process event
        processEvent(data);
      } catch (error) {
        console.error('[SSE] Message parse error:', error);
      }
    });

    // Handle open - MODIFIED to trigger recovery
    eventSource.addEventListener('open', async () => {
      console.log('[SSE] Connected');
      setIsConnected(true);

      // Trigger recovery if we have a lastEventId
      if (lastEventIdRef.current && !isRecovering) {
        if (import.meta.env.DEV) {
          console.log('[SSE] Triggering recovery for lastEventId:', lastEventIdRef.current);
        }
        await recover();
      }
    });

    // ... rest of connection logic ...
  }, [recover, isRecovering]);

  // ... rest of provider ...
}
```

**Pattern Reference:** See `AuthProvider.tsx` for context provider pattern

**Validation:**
```typescript
// Manual test in browser console:
// 1. Connect to SSE, receive some events
// 2. Close browser tab
// 3. Use Redis CLI to add more events to stream
// 4. Reopen tab
// 5. Should see recovery logs and all events processed
```

---

#### 7. Add Event Recovery Types

**Create/Modify:** `src/frontend/src/types/events.ts`

**Details:**
Define TypeScript types for recovery.

**Implementation:**
```typescript
/**
 * Event Recovery Types
 *
 * SPEC References:
 * - SPEC-EV-ST-013:016: Recovery mechanism
 * - SPEC-EV-FR-004:006: Frontend recovery
 */

export interface RecoveredEvent {
  id: string;
  type: 'notification' | 'task' | string;
  userId: string;
  timestamp: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface EventRecoveryWindow {
  startId: string;
  endId: string;
  startTime: string;
  endTime: string;
}

export interface EventRecoveryResult {
  events: RecoveredEvent[];
  hasMore: boolean;
  lastId: string;
  recoveryWindow: EventRecoveryWindow;
}

export interface RecoveryConfig {
  maxRetryAttempts: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
  maxRecoveryCount: number;
}
```

**Pattern Reference:** See `src/types/jqel.ts` for type definition patterns

---

### Error Handling Strategy

**Error Types:**

1. **Invalid Last Event ID (400)**
   - Cause: Malformed stream ID (not "timestamp-sequence" format)
   - Handling: Frontend logs error, continues with SSE (no recovery)
   - Display: Silent - logged to console only

2. **Last Event ID Too Old (400)**
   - Cause: Event older than 24 hours
   - Handling: Frontend logs warning, continues with SSE
   - Display: Optional toast: "Some events may be missed (offline > 24h)"

3. **Authentication Error (401)**
   - Cause: Invalid/expired JWT
   - Handling: Frontend triggers re-login flow
   - Display: Redirect to login page

4. **Network Error (fetch failure)**
   - Cause: No internet, server down
   - Handling: Retry with exponential backoff (up to 3 attempts)
   - Display: Silent retry, log final failure

5. **Server Error (500)**
   - Cause: Redis down, internal error
   - Handling: Retry with exponential backoff (up to 3 attempts)
   - Display: Toast on final failure: "Failed to recover events, please refresh"

**Error Logging Pattern:**
```typescript
// Backend
console.error('❌ Event Recovery Error:', {
  userId,
  lastEventId,
  error: error.message,
  stack: error.stack,
});

// Frontend
console.error('[Recovery] Failed:', {
  attempt: attemptCount,
  error: error.message,
  code: error.code,
  lastEventId,
});
```

**Graceful Degradation:**
- Recovery failures should NOT prevent SSE connection
- User continues to receive NEW events even if recovery fails
- Old events may be missed, but system remains functional

### Files to Create

1. `src/backend/src/services/eventRecovery.service.ts`
   - EventRecoveryService class
   - Fetch missed events from Redis Streams
   - Validate event IDs and time windows

2. `src/frontend/src/services/events/recoveryClient.ts`
   - HTTP client for recovery endpoint
   - RecoveryError class
   - fetchMissedEvents function

3. `src/frontend/src/hooks/useEventRecovery.ts`
   - React hook for recovery orchestration
   - Retry logic with exponential backoff
   - Error handling and state management

4. `src/frontend/src/types/events.ts` (if doesn't exist)
   - RecoveredEvent interface
   - EventRecoveryResult interface
   - RecoveryConfig interface

### Files to Modify

1. `src/backend/src/services/redis.service.ts`
   - Add `xread()` method for reading events after ID
   - Add `xrange()` method for reading event ranges

2. `src/backend/src/routes/events.routes.ts`
   - Add GET /api/events/missed endpoint
   - JWT validation and userId extraction
   - Call EventRecoveryService

3. `src/frontend/src/providers/SSEProvider.tsx`
   - Track lastEventId in ref
   - Integrate useEventRecovery hook
   - Deduplicate events by ID
   - Trigger recovery on reconnect

4. `src/backend/src/types/jqel.types.ts` (optional)
   - May need to add EventRecoveryResult type if using JQEL for recovery

## Validation Gates

### Manual Testing

```bash
# 1. Start Redis
redis-server

# 2. Start Backend
cd src/backend
npm run dev

# 3. Start Frontend
cd src/frontend
npm run dev

# 4. Test Recovery Scenario
# - Open browser to http://localhost:5173
# - Login and connect to SSE
# - Open DevTools Console
# - Receive a few events (check console logs)
# - Close browser tab
# - In Redis CLI, add events:
redis-cli
XADD events:<your-user-id> * data '{"type":"notification","id":"test1","userId":"<your-user-id>","timestamp":"2025-11-05T10:00:00Z"}'
XADD events:<your-user-id> * data '{"type":"notification","id":"test2","userId":"<your-user-id>","timestamp":"2025-11-05T10:01:00Z"}'

# - Reopen browser tab
# - Check console for recovery logs
# - Verify events test1 and test2 appear in UI
```

### Type Checking

```bash
# Backend
cd src/backend
npm run type-check

# Frontend
cd src/frontend
npm run type-check
```

### Build Verification

```bash
# Backend
cd src/backend
npm run build

# Frontend
cd src/frontend
npm run build
```

### Integration Tests (Manual Checklist)

- [ ] Recovery works with valid lastEventId
- [ ] Recovery rejects invalid lastEventId format (not timestamp-sequence)
- [ ] Recovery rejects lastEventId older than 24 hours
- [ ] Recovery returns correct events (only events after lastEventId)
- [ ] Recovery respects maxCount parameter (max 1000)
- [ ] Recovery deduplicates events received via SSE and recovery
- [ ] Recovery retries on network errors (up to 3 times)
- [ ] Recovery gives up on 4xx errors (no retry)
- [ ] Recovery continues SSE on failure (doesn't break connection)
- [ ] Recovery tracks lastEventId correctly across reconnects
- [ ] EventSource sends Last-Event-ID header on reconnect (check network tab)
- [ ] Multiple reconnects work correctly (lastEventId persists)

## References

**Specifications:**
- [SPEC-events.md](D:/sources/codr.studio/platform/spec/SPEC-events.md) - Full event system specification
  - SPEC-EV-ST-001:016 - Redis Streams requirements
  - SPEC-EV-SSE-001:028 - SSE protocol requirements
  - SPEC-EV-FR-004:006 - Frontend recovery requirements
  - SPEC-EV-PL-001:017 - Event payload structure

**Codebase Examples:**
- `src/backend/src/services/redis.service.ts` - Redis operations pattern
- `src/frontend/src/providers/AuthProvider.tsx` - Retry logic with exponential backoff
- `src/frontend/src/services/jqel/hooks/useJQELQuery.ts` - Smart retry pattern
- `src/backend/src/services/jqelProcessor.service.ts` - Service singleton pattern
- `src/frontend/src/hooks/useEventRecovery.ts` - React hook pattern (to be created)

**External Documentation:**
- [Redis XREAD Command](https://redis.io/commands/xread/) - Read from Streams
- [Redis XRANGE Command](https://redis.io/commands/xrange/) - Query event ranges
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) - SSE and Last-Event-ID
- [WHATWG: SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html) - Official SSE spec
