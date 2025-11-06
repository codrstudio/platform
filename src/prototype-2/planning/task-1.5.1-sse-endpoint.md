# Task Plan: 1.5.1 - Criar endpoint /api/events (SSE)

## Context and Objective

This task implements the Server-Sent Events (SSE) endpoint `/api/events/stream` that enables real-time, unidirectional communication from backend to frontend. SSE provides a persistent HTTP connection over which the server can push events to connected clients.

**What will be implemented:**
- HTTP GET endpoint at `/api/events/stream` for SSE connections
- JWT-based authentication for SSE connections
- Redis Pub/Sub integration to receive events from Backbone (n8n)
- Connection management (tracking, heartbeat, cleanup)
- Proper SSE headers and event formatting

**Why it's needed:**
SSE is the foundation for real-time features in the platform. It enables:
- Immediate notification delivery to users
- Task updates without polling
- Data invalidation triggers for TanStack Query
- Live collaboration features

**Business value:**
- Real-time user experience without page refreshes
- Reduced server load (no polling)
- Immediate feedback for async operations
- Foundation for future modules (notifications, tasks, chat)

**User impact:**
Users see updates instantly as they happen, creating a responsive, modern application experience.

## Dependencies

### Prerequisite Tasks
- **1.3 - Authentication System**: JWT validation is required to authenticate SSE connections
- **1.4 - JQEL System**: RedisService already exists and will be reused

### Files/Modules Affected
**Files to Create:**
- `src/prototype-2/backend/src/routes/events.routes.ts` - SSE endpoint route handler
- `src/prototype-2/backend/src/services/sse.service.ts` - SSE connection management
- `src/prototype-2/backend/src/types/events.types.ts` - Event payload types

**Files to Modify:**
- `src/prototype-2/backend/src/app.ts` - Mount events routes
- `src/prototype-2/backend/src/services/redis.service.ts` - Add Pub/Sub methods
- `src/prototype-2/backend/src/config/env.ts` - Already has SSE_HEARTBEAT_INTERVAL

### Enables Tasks
- **1.5.2 - Implementar heartbeat e keepalive**: Builds on connection management
- **1.5.3 - Implementar reconnection automática**: Uses event stream established here
- **1.5.4 - Configurar Redis Pub/Sub**: Extends Redis integration
- **1.5.5 - Configurar Redis Streams**: Adds buffering on top of Pub/Sub

### External Dependencies
- `ioredis` - Already installed, used for Redis Pub/Sub
- `jsonwebtoken` - Already installed, used for JWT validation
- `express` - Already installed, provides Response streaming

## Patterns Identified in Codebase

### Similar Components/Modules

**Authentication Pattern (auth.routes.ts):**
- All routes validate JWT before processing
- Error responses follow consistent format with `code` and `message`
- Use try/catch with next(error) for centralized error handling

**Service Pattern (redis.service.ts, jwt.service.ts):**
- Singleton pattern with exported instance
- Lazy initialization with async connect()
- Comprehensive JSDoc comments
- Error handling with console.error for logging

**Route Registration Pattern (app.ts):**
```typescript
// File: src/prototype-2/backend/src/app.ts (lines 62-73)
app.use('/api', healthRoutes);
app.use('/api/1/auth', authRateLimiter);
app.use('/api/1/auth', authRoutes);
app.use('/api/jqel', jqelRoutes);
// Future routes will be mounted here:
// app.use('/api/events', eventsRoutes);
```

### Conventions to Follow

**Naming Conventions:**
- Route files: `{feature}.routes.ts` (e.g., `events.routes.ts`)
- Service files: `{feature}.service.ts` (e.g., `sse.service.ts`)
- Type files: `{feature}.types.ts` (e.g., `events.types.ts`)
- Exported instances: lowercase (e.g., `sseService`, `redisService`)
- Classes: PascalCase (e.g., `SSEService`, `RedisService`)

**File Structure:**
```
src/prototype-2/backend/src/
├── routes/
│   └── {feature}.routes.ts
├── services/
│   └── {feature}.service.ts
├── types/
│   └── {feature}.types.ts
└── app.ts
```

**Import/Export Patterns:**
```typescript
// Services export singleton instance
export class MyService { /* ... */ }
export const myService = new MyService();

// Routes export default router
const router = Router();
// ... route definitions
export default router;

// Types export interfaces/types only
export interface MyType { /* ... */ }
```

**State Management:**
- Services manage their own state as class properties
- Use private properties with public methods for encapsulation
- Singleton pattern ensures single source of truth

**Error Handling:**
```typescript
// Route handlers use try/catch with next(error)
router.get('/endpoint', async (req, res, next) => {
  try {
    // ... logic
  } catch (error) {
    console.error('❌ Error in /endpoint:', error);
    next(error); // Pass to centralized error handler
  }
});

// Services throw errors with descriptive messages
throw new Error('Descriptive error message');
```

### Reusable Code Examples

**JWT Validation from auth.routes.ts:**
```typescript
// File: src/prototype-2/backend/src/routes/auth.routes.ts (lines 373-433)
// Extract access_token with priority: header > body > cookie
let accessToken: string | undefined;

// Priority 1: Authorization header
const authHeader = req.headers.authorization;
if (authHeader && authHeader.startsWith('Bearer ')) {
  accessToken = authHeader.substring(7);
}

// Priority 2: Body (not applicable for GET)
// Priority 3: Query params (for SSE)
if (!accessToken && req.query.token) {
  accessToken = req.query.token as string;
}

// Validate presence
if (!accessToken) {
  res.status(401).json({
    code: 'missing_token',
    message: 'Access token is required',
  });
  return;
}

// Verify JWT
try {
  const payload = jwtService.verifyAccessToken(accessToken);
  const userId = payload.sub;
  // ... use userId
} catch (error: any) {
  if (error.message === 'Token expired') {
    res.status(401).json({
      code: 'token_expired',
      message: 'Access token has expired',
    });
    return;
  }
  res.status(401).json({
    code: 'invalid_token',
    message: 'Access token is invalid',
  });
  return;
}
```

**Redis Connection Pattern from redis.service.ts:**
```typescript
// File: src/prototype-2/backend/src/services/redis.service.ts (lines 46-80)
async connect(): Promise<void> {
  if (this.client) return;
  if (this.connecting) return this.connecting;

  this.connecting = (async () => {
    try {
      this.client = new Redis(this.getRedisConfig());

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
      });

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

**Express Response Type from health.routes.ts:**
```typescript
// File: src/prototype-2/backend/src/routes/health.routes.ts (lines 12-20)
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
  });
});
```

## Critical Context

### Documentation

**SPEC-events.md - SSE Protocol:**
- [SPEC-EV-SSE-001:004](D:\sources\codr.studio\platform\spec\SPEC-events.md#L150-L160) - SSE uses HTTP GET with persistent connection, unidirectional
- [SPEC-EV-SSE-005](D:\sources\codr.studio\platform\spec\SPEC-events.md#L164) - Frontend connects to `GET /api/events/stream`
- [SPEC-EV-SSE-006:010](D:\sources\codr.studio\platform\spec\SPEC-events.md#L166-L175) - Authentication via JWT (header, query, or cookie), validate before accepting
- [SPEC-EV-SSE-011:014](D:\sources\codr.studio\platform\spec\SPEC-events.md#L177-L184) - Required headers: `text/event-stream`, `no-cache`, `keep-alive`, `X-Accel-Buffering: no`
- [SPEC-EV-SSE-015:019](D:\sources\codr.studio\platform\spec\SPEC-events.md#L186-L197) - Connection management: Map userId to Response, single connection per user, remove on close, heartbeat every 30s
- [SPEC-EV-SSE-020:024](D:\sources\codr.studio\platform\spec\SPEC-events.md#L199-L209) - Event delivery: Redis → identify user → send via SSE, format `data: <json>\n\n`, async sending

**SPEC-events.md - Redis Pub/Sub:**
- [SPEC-EV-PS-001:004](D:\sources\codr.studio\platform\spec\SPEC-events.md#L75-L83) - Redis Pub/Sub for real-time delivery, online users only, no persistence
- [SPEC-EV-PS-005:008](D:\sources\codr.studio\platform\spec\SPEC-events.md#L85-L93) - Channel naming: `platform:events` (global), `platform:events:user:<userId>` (per-user), `platform:notifications`, `platform:tasks`

**SPEC-events.md - Event Payload:**
- [SPEC-EV-PL-001:008](D:\sources\codr.studio\platform\spec\SPEC-events.md#L224-L241) - Required fields: `type`, `id`, `userId`/`userIds`, `timestamp`; Optional: `category`, `priority`
- [SPEC-EV-PL-009:012](D:\sources\codr.studio\platform\spec\SPEC-events.md#L243-L251) - Events contain only metadata (<1KB), not full data; full data fetched via JQEL

### Gotchas and Pitfalls

**SSE Specific:**
- ⚠️ SSE connections keep the HTTP connection open indefinitely - must set proper headers to prevent buffering
- ⚠️ `X-Accel-Buffering: no` header is critical for nginx reverse proxies, prevents buffering that breaks SSE
- ⚠️ SSE format is strict: `data: <content>\n\n` - double newline is required to terminate event
- ⚠️ Connection close events must be handled to cleanup Map and prevent memory leaks
- ⚠️ Write errors (client disconnected) should not crash the server - catch and log
- ⚠️ Heartbeat (comment lines `:ping\n\n`) prevents proxy timeouts and detects dead connections

**Redis Pub/Sub:**
- ⚠️ Pub/Sub messages are fire-and-forget - if no subscribers, message is lost (expected behavior)
- ⚠️ Need separate Redis client for subscriptions (cannot use same client for commands and Pub/Sub)
- ⚠️ Subscription client is blocked once subscribed - cannot execute regular commands
- ⚠️ Message handler must parse JSON and handle parse errors gracefully

**Authentication:**
- ⚠️ GET requests cannot use body for token - must use header or query parameter
- ⚠️ Query parameter token is less secure (visible in logs) - prefer header when possible
- ⚠️ Token validation must happen before accepting connection, not after
- ⚠️ Expired token should reject connection immediately with 401

**Connection Management:**
- ⚠️ Multiple tabs/windows from same user should ideally share one connection (BroadcastChannel on frontend)
- ⚠️ If multiple connections allowed, must track all connections for a userId (Map<userId, Set<Response>>)
- ⚠️ Connection Map must be cleaned up on both normal close and error/crash

### Existing Patterns to Follow

**Service Singleton Pattern:**
- See `redis.service.ts` (line 17-240) - Class with private properties, async connect(), singleton export
- See `jwt.service.ts` (line 21-157) - Constructor reads from config, public methods, singleton export

**Route Structure:**
- See `health.routes.ts` (line 1-22) - Import Router, define routes, export default router
- See `auth.routes.ts` (line 27-161) - Use async handlers, try/catch with next(error), structured responses

**Error Handling:**
- See `errorHandler.middleware.ts` (line 26-69) - Centralized error handler processes all errors
- See `auth.routes.ts` (line 155-159) - Log error with context, call next(error)

**Environment Config:**
- See `env.ts` (line 192) - `sseHeartbeatInterval` already defined in config

## Technical Specification

### Architecture

```
src/prototype-2/backend/src/
├── routes/
│   ├── events.routes.ts          [NEW] - SSE endpoint route
│   ├── health.routes.ts
│   ├── auth.routes.ts
│   └── jqel.routes.ts
├── services/
│   ├── sse.service.ts            [NEW] - SSE connection management
│   ├── redis.service.ts          [MODIFY] - Add Pub/Sub methods
│   ├── jwt.service.ts            [EXISTS] - Reuse for auth
│   └── ...
├── types/
│   ├── events.types.ts           [NEW] - Event payload types
│   ├── auth.types.ts
│   └── jqel.types.ts
└── app.ts                        [MODIFY] - Mount events routes
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Backbone (n8n)                                                 │
│  - Publishes events to Redis Pub/Sub                           │
│  - Channel: platform:events or platform:events:user:<userId>   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ PUBLISH
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Redis Pub/Sub                                                  │
│  - Channels: platform:events, platform:events:user:<userId>    │
│  - No persistence (fire-and-forget)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ SUBSCRIBE (dedicated client)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  SSEService (Backend)                                           │
│  - Subscribes to Redis channels on startup                     │
│  - Receives message → Parse JSON → Identify userId             │
│  - Lookup connection by userId in Map                          │
│  - Format as SSE event: data: {...}\n\n                        │
│  - Write to Response stream                                    │
│  - Handle write errors (connection closed)                     │
│  - Periodic heartbeat: :ping\n\n every 30s                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ SSE Stream
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (EventSource)                                         │
│  - GET /api/events/stream?token=<jwt>                          │
│  - Receives events via SSE                                     │
│  - Parses JSON from data field                                 │
│  - Triggers TanStack Query invalidation                        │
└─────────────────────────────────────────────────────────────────┘
```

### Modules and Responsibilities

**events.routes.ts**
- Responsibility: HTTP endpoint for SSE connections
- Interface:
  - `GET /api/events/stream?token=<jwt>` - Establish SSE connection
  - Response: text/event-stream with keep-alive
  - Authentication: JWT from query param or Authorization header
- Dependencies: sseService, jwtService

**sse.service.ts**
- Responsibility: Manage SSE connections and Redis Pub/Sub
- Interface:
  - `initialize()` - Subscribe to Redis channels
  - `addConnection(userId, response)` - Register client connection
  - `removeConnection(userId)` - Cleanup connection
  - `sendEvent(userId, event)` - Send event to specific user
  - `sendHeartbeat(userId)` - Send keepalive ping
  - `getActiveConnections()` - Get count of active connections
- Dependencies: redisService

**redis.service.ts (additions)**
- Add Pub/Sub methods:
  - `subscribe(channel, handler)` - Subscribe to channel with message handler
  - `publish(channel, message)` - Publish message to channel
  - `createSubscriber()` - Create dedicated subscriber client

**events.types.ts**
- Type definitions:
  - `EventPayload` - Base event structure (type, id, userId, timestamp)
  - `NotificationEvent` - Notification-specific payload
  - `TaskEvent` - Task-specific payload
  - `SSEMessage` - SSE-formatted message structure

### State Management

**SSEService State:**
```typescript
class SSEService {
  // Connection tracking
  private connections: Map<string, Response>; // userId -> Express Response

  // Redis subscriber client (separate from main client)
  private subscriber: Redis | null;

  // Heartbeat interval tracking
  private heartbeatIntervals: Map<string, NodeJS.Timeout>; // userId -> interval ID

  // Initialization state
  private initialized: boolean;
}
```

**Why Map for connections:**
- Fast O(1) lookup by userId
- Easy cleanup on disconnect
- Can extend to `Map<userId, Set<Response>>` for multi-tab support later

**Why separate subscriber client:**
- Redis Pub/Sub blocks the client - cannot execute commands while subscribed
- Main redisService.client is used for data operations
- Subscriber client is dedicated to message receiving only

### Libraries and Tools

**ioredis (Already Installed)**
- Version: Latest from package.json
- Used for Redis Pub/Sub
- Create separate client for subscriptions with `new Redis(config)`
- Subscribe: `client.subscribe('channel', callback)`
- Message handler: `client.on('message', (channel, message) => {...})`

**jsonwebtoken (Already Installed)**
- Version: Latest from package.json
- Reuse `jwtService.verifyAccessToken(token)` for authentication
- Catches TokenExpiredError and JsonWebTokenError

**Express Response (Built-in)**
- `res.setHeader()` - Set SSE headers
- `res.write()` - Send SSE events (non-blocking)
- `res.on('close', callback)` - Detect client disconnect
- `res.flushHeaders()` - Immediately send headers to prevent buffering

## Implementation Blueprint

### Ordered Steps

#### 1. Create Event Type Definitions
**Create:** `src/prototype-2/backend/src/types/events.types.ts`

```typescript
/**
 * Base event payload structure
 * Following SPEC-EV-PL-001:008
 */
export interface EventPayload {
  type: 'notification' | 'task' | 'job-completed' | 'job-failed' | 'job-progress';
  id: string;
  userId: string; // Target user ID
  timestamp: string; // ISO 8601 format
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Notification event
 * Following SPEC-EV-PL-016
 */
export interface NotificationEvent extends EventPayload {
  type: 'notification';
}

/**
 * Task event
 * Following SPEC-EV-PL-017
 */
export interface TaskEvent extends EventPayload {
  type: 'task';
}

/**
 * Queue job event
 * Following SPEC-EV-QUEUE-008
 */
export interface JobEvent extends EventPayload {
  type: 'job-completed' | 'job-failed' | 'job-progress';
  data: {
    jobId: string;
    queueName: string;
    status: 'completed' | 'failed' | 'running';
    progress?: number;
    result?: any;
    error?: string;
  };
}

/**
 * SSE message format
 */
export interface SSEMessage {
  data: string; // JSON-stringified EventPayload
}
```

**Details:** Type-safe event structures ensure consistency between Backbone, Backend, and Frontend

---

#### 2. Add Redis Pub/Sub Methods
**Modify:** `src/prototype-2/backend/src/services/redis.service.ts`

Add after existing methods (before disconnect method):

```typescript
/**
 * Create a dedicated Redis client for Pub/Sub subscriptions
 *
 * IMPORTANT: Once a client is subscribed, it cannot execute regular commands.
 * This is why we create a separate client for subscriptions.
 *
 * @returns New Redis client instance configured for subscriptions
 */
createSubscriber(): Redis {
  return new Redis(this.getRedisConfig());
}

/**
 * Publish message to Redis channel
 *
 * @param channel - Channel name (e.g., "platform:events")
 * @param message - Message to publish (will be stringified if object)
 */
async publish(channel: string, message: string | object): Promise<void> {
  await this.connect();
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  await this.client!.publish(channel, payload);
}
```

**Why separate subscriber:**
- Redis Pub/Sub blocks the client - cannot mix with regular commands
- Main client stays available for SET/GET operations
- Subscriber client is created and managed by SSEService

---

#### 3. Create SSE Service
**Create:** `src/prototype-2/backend/src/services/sse.service.ts`

```typescript
import { Response } from 'express';
import Redis from 'ioredis';
import { redisService } from './redis.service.js';
import { config } from '../config/env.js';
import type { EventPayload } from '../types/events.types.js';

/**
 * SSEService
 *
 * Manages Server-Sent Events (SSE) connections and Redis Pub/Sub integration.
 *
 * Responsibilities:
 * - Track active SSE connections per user
 * - Subscribe to Redis Pub/Sub channels
 * - Route events to appropriate connected users
 * - Send periodic heartbeats to keep connections alive
 * - Cleanup connections on disconnect
 *
 * SPEC References:
 * - SPEC-EV-SSE-015:019: Connection management
 * - SPEC-EV-SSE-020:024: Event delivery
 * - SPEC-EV-PS-005:008: Redis Pub/Sub channels
 */
export class SSEService {
  // Active SSE connections: userId -> Express Response
  // SPEC-EV-SSE-015: Backend must maintain Map of connections
  private connections: Map<string, Response> = new Map();

  // Heartbeat intervals: userId -> NodeJS.Timeout
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Dedicated Redis subscriber client (cannot use main client for Pub/Sub)
  private subscriber: Redis | null = null;

  // Initialization flag
  private initialized: boolean = false;

  /**
   * Initialize SSE service
   *
   * Subscribes to Redis Pub/Sub channels and sets up message handlers.
   * Safe to call multiple times - subsequent calls are ignored.
   *
   * SPEC-EV-PS-008: Backend must subscribe to appropriate channels
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('ℹ️ SSEService already initialized');
      return;
    }

    try {
      // Create dedicated subscriber client
      this.subscriber = redisService.createSubscriber();

      // Subscribe to global events channel
      // SPEC-EV-PS-005: Channel platform:events for global events
      await this.subscriber.subscribe('platform:events', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:events:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:events');
      });

      // Subscribe to notification channel
      // SPEC-EV-PS-007: Channel platform:notifications
      await this.subscriber.subscribe('platform:notifications', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:notifications:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:notifications');
      });

      // Subscribe to task channel
      // SPEC-EV-PS-007: Channel platform:tasks
      await this.subscriber.subscribe('platform:tasks', (err) => {
        if (err) {
          console.error('❌ Failed to subscribe to platform:tasks:', err);
          throw err;
        }
        console.log('✅ Subscribed to Redis channel: platform:tasks');
      });

      // Set up message handler
      // SPEC-EV-PS-010: Message must be JSON
      this.subscriber.on('message', (channel, message) => {
        this.handleRedisMessage(channel, message);
      });

      this.initialized = true;
      console.log('✅ SSEService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SSEService:', error);
      throw error;
    }
  }

  /**
   * Handle incoming Redis Pub/Sub message
   *
   * SPEC-EV-SSE-020:024: Backend receives event → identifies user → sends via SSE
   */
  private handleRedisMessage(channel: string, message: string): void {
    try {
      // SPEC-EV-PS-010: Message must be JSON
      const event: EventPayload = JSON.parse(message);

      // SPEC-EV-PL-004: Event must include userId
      if (!event.userId) {
        console.warn('⚠️ Event missing userId, cannot route:', event);
        return;
      }

      // SPEC-EV-SSE-022: Check if user is connected
      const connection = this.connections.get(event.userId);

      if (!connection) {
        // SPEC-EV-SSE-023: If user offline, event stays only in Stream
        // (Stream implementation is Task 1.5.5)
        console.log(`ℹ️ User ${event.userId} not connected, event not delivered:`, event.type);
        return;
      }

      // SPEC-EV-SSE-024: Sending must be async (non-blocking)
      this.sendEventToConnection(connection, event);
    } catch (error) {
      console.error('❌ Error handling Redis message:', error, message);
    }
  }

  /**
   * Add SSE connection for a user
   *
   * Registers the connection, sets up cleanup on close, and starts heartbeat.
   *
   * SPEC-EV-SSE-015: Backend must maintain Map of connections
   * SPEC-EV-SSE-018: Backend must remove connection on close
   * SPEC-EV-SSE-019: Backend must send heartbeat periodically
   *
   * @param userId - User ID from JWT
   * @param res - Express Response object for SSE streaming
   */
  addConnection(userId: string, res: Response): void {
    // SPEC-EV-SSE-016: One connection per user should be sufficient
    // If connection already exists, close old one before replacing
    const existingConnection = this.connections.get(userId);
    if (existingConnection) {
      console.log(`ℹ️ Replacing existing SSE connection for user ${userId}`);
      this.removeConnection(userId);
    }

    // Register connection
    this.connections.set(userId, res);
    console.log(`✅ SSE connection established for user ${userId}`);
    console.log(`📊 Active SSE connections: ${this.connections.size}`);

    // SPEC-EV-SSE-018: Remove connection on close
    res.on('close', () => {
      console.log(`ℹ️ SSE connection closed for user ${userId}`);
      this.removeConnection(userId);
    });

    // SPEC-EV-SSE-019: Send heartbeat periodically (default: 30s)
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(userId);
    }, config.sseHeartbeatInterval);

    this.heartbeatIntervals.set(userId, heartbeatInterval);
  }

  /**
   * Remove SSE connection for a user
   *
   * Cleans up connection and heartbeat interval.
   * Safe to call multiple times.
   *
   * @param userId - User ID to disconnect
   */
  removeConnection(userId: string): void {
    // Clear heartbeat interval
    const heartbeatInterval = this.heartbeatIntervals.get(userId);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(userId);
    }

    // Remove connection
    const connection = this.connections.get(userId);
    if (connection) {
      try {
        connection.end(); // Close the connection gracefully
      } catch (error) {
        // Connection might already be closed, ignore error
      }
      this.connections.delete(userId);
      console.log(`✅ SSE connection removed for user ${userId}`);
      console.log(`📊 Active SSE connections: ${this.connections.size}`);
    }
  }

  /**
   * Send event to specific user's SSE connection
   *
   * SPEC-EV-SSE-021: Format SSE: data: <json>\n\n
   * SPEC-EV-SSE-024: Sending must be async (non-blocking)
   *
   * @param userId - Target user ID
   * @param event - Event payload
   */
  sendEvent(userId: string, event: EventPayload): void {
    const connection = this.connections.get(userId);

    if (!connection) {
      console.log(`ℹ️ Cannot send event to user ${userId}: not connected`);
      return;
    }

    this.sendEventToConnection(connection, event);
  }

  /**
   * Send event to a specific SSE connection
   *
   * SPEC-EV-SSE-021: Format SSE: data: <json>\n\n
   *
   * @param connection - Express Response stream
   * @param event - Event payload
   */
  private sendEventToConnection(connection: Response, event: EventPayload): void {
    try {
      // SPEC-EV-SSE-021: Format: data: <json>\n\n
      const eventData = JSON.stringify(event);
      const sseMessage = `data: ${eventData}\n\n`;

      // Write to stream (non-blocking)
      connection.write(sseMessage);
    } catch (error) {
      // Connection might be closed, log but don't crash
      console.error('❌ Error sending event to connection:', error);
    }
  }

  /**
   * Send heartbeat ping to user's connection
   *
   * Heartbeat is sent as SSE comment (line starting with :)
   * This keeps the connection alive and detects dead connections.
   *
   * SPEC-EV-SSE-019: Backend must send heartbeat periodically
   *
   * @param userId - User ID
   */
  private sendHeartbeat(userId: string): void {
    const connection = this.connections.get(userId);

    if (!connection) {
      return;
    }

    try {
      // SSE comment format: :comment\n\n
      connection.write(':ping\n\n');
    } catch (error) {
      // Connection closed, cleanup will happen via 'close' event
      console.warn(`⚠️ Failed to send heartbeat to user ${userId}:`, error);
    }
  }

  /**
   * Get count of active SSE connections
   *
   * @returns Number of active connections
   */
  getActiveConnections(): number {
    return this.connections.size;
  }

  /**
   * Shutdown SSE service
   *
   * Closes all connections and unsubscribes from Redis.
   * Call before application shutdown.
   */
  async shutdown(): Promise<void> {
    console.log('ℹ️ Shutting down SSEService...');

    // Close all connections
    for (const userId of this.connections.keys()) {
      this.removeConnection(userId);
    }

    // Unsubscribe from Redis
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }

    this.initialized = false;
    console.log('✅ SSEService shutdown complete');
  }
}

// Export singleton instance
export const sseService = new SSEService();
```

**Details:**
- Singleton pattern matches existing services (redisService, jwtService)
- Map-based connection tracking for O(1) lookup
- Dedicated Redis subscriber client (Pub/Sub blocks regular commands)
- Heartbeat prevents proxy timeouts and detects dead connections
- Cleanup on connection close prevents memory leaks

**Pattern reference:** See `redis.service.ts` for singleton pattern, `jwt.service.ts` for service structure

---

#### 4. Create SSE Route Handler
**Create:** `src/prototype-2/backend/src/routes/events.routes.ts`

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service.js';
import { sseService } from '../services/sse.service.js';

const router = Router();

/**
 * GET /api/events/stream
 *
 * Establish Server-Sent Events (SSE) connection for real-time event delivery.
 *
 * SPEC References:
 * - SPEC-EV-SSE-005: Frontend must connect to GET /api/events/stream
 * - SPEC-EV-SSE-006:010: Authentication via JWT (header or query param)
 * - SPEC-EV-SSE-011:014: Required SSE headers
 *
 * Authentication:
 * - JWT from Authorization header (preferred)
 * - JWT from query parameter ?token=<jwt> (for EventSource compatibility)
 *
 * Response:
 * - Content-Type: text/event-stream
 * - Persistent HTTP connection
 * - Events formatted as: data: <json>\n\n
 * - Heartbeat comments: :ping\n\n
 */
router.get(
  '/stream',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // STEP 1: Extract access token
      // SPEC-EV-SSE-007: JWT can be in header, query param, or cookie
      let accessToken: string | undefined;

      // Priority 1: Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      // Priority 2: Query parameter (for EventSource which cannot set headers)
      if (!accessToken && req.query.token) {
        accessToken = req.query.token as string;
      }

      // Priority 3: Cookie
      if (!accessToken && req.cookies?.access_token) {
        accessToken = req.cookies.access_token;
      }

      // SPEC-EV-SSE-008: Backend must validate JWT before accepting connection
      if (!accessToken) {
        res.status(401).json({
          code: 'missing_token',
          message: 'Access token is required',
        });
        return;
      }

      // STEP 2: Validate JWT and extract userId
      // SPEC-EV-SSE-009: Backend must identify userId from JWT
      let userId: string;
      try {
        const payload = jwtService.verifyAccessToken(accessToken);
        userId = payload.sub;

        if (!userId) {
          res.status(401).json({
            code: 'invalid_token',
            message: 'Token does not contain user ID',
          });
          return;
        }
      } catch (error: any) {
        // SPEC-EV-SSE-010: Backend must reject connection if JWT invalid
        if (error.message === 'Token expired') {
          res.status(401).json({
            code: 'token_expired',
            message: 'Access token has expired',
          });
          return;
        }

        res.status(401).json({
          code: 'invalid_token',
          message: 'Access token is invalid',
        });
        return;
      }

      // STEP 3: Set SSE headers
      // SPEC-EV-SSE-011: Response must have header Content-Type: text/event-stream
      res.setHeader('Content-Type', 'text/event-stream');

      // SPEC-EV-SSE-012: Response must have header Cache-Control: no-cache
      res.setHeader('Cache-Control', 'no-cache');

      // SPEC-EV-SSE-013: Response must have header Connection: keep-alive
      res.setHeader('Connection', 'keep-alive');

      // SPEC-EV-SSE-014: Response may have header X-Accel-Buffering: no (for nginx)
      res.setHeader('X-Accel-Buffering', 'no');

      // Enable CORS for SSE (important for cross-origin requests)
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Flush headers immediately to establish connection
      res.flushHeaders();

      // STEP 4: Register SSE connection
      // SPEC-EV-SSE-015: Backend must maintain Map of connections
      sseService.addConnection(userId, res);

      // Send initial connection success comment
      res.write(':connected\n\n');

      console.log(`✅ SSE stream established for user ${userId}`);

      // Connection will remain open until:
      // - Client closes (res 'close' event)
      // - Server shuts down
      // - Write error occurs

    } catch (error) {
      console.error('❌ Error in /api/events/stream:', error);
      next(error);
    }
  }
);

export default router;
```

**Details:**
- GET endpoint (SSE requires GET, not POST)
- JWT from query param for EventSource compatibility (cannot set headers)
- SSE headers prevent buffering and enable streaming
- Connection registered with SSEService for event routing
- No explicit response.end() - connection stays open

**Pattern reference:** See `auth.routes.ts` for JWT validation pattern, `health.routes.ts` for route structure

---

#### 5. Mount SSE Routes in Express App
**Modify:** `src/prototype-2/backend/src/app.ts`

Add import at top (after other route imports):
```typescript
import eventsRoutes from './routes/events.routes.js';
```

Replace the comment on line 76 with route mounting:
```typescript
// SSE events endpoint (Task 1.5.1)
app.use('/api/events', eventsRoutes);
```

Add SSE service initialization after Redis connection (around line 54):
```typescript
// Initialize SSE service (Redis Pub/Sub for real-time events)
sseService.initialize().catch((error) => {
  console.error('❌ Failed to initialize SSEService:', error);
  console.warn('⚠️  Real-time events will not work without SSEService');
});
```

**Details:** Mount events routes at `/api/events`, initialize SSEService on startup

---

#### 6. Handle Graceful Shutdown
**Modify:** `src/prototype-2/backend/src/app.ts` or create `src/prototype-2/backend/src/server.ts`

Add graceful shutdown handler (if not already exists):

```typescript
// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');

  // Close SSE connections
  await sseService.shutdown();

  // Close Redis connections
  await redisService.disconnect();

  console.log('✅ Graceful shutdown complete');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');

  // Close SSE connections
  await sseService.shutdown();

  // Close Redis connections
  await redisService.disconnect();

  console.log('✅ Graceful shutdown complete');
  process.exit(0);
});
```

**Details:** Cleanup SSE connections and Redis subscribers on process termination

---

### Error Handling Strategy

**Error Types:**

1. **Authentication Errors (401)**
   - Missing token: `{ code: 'missing_token', message: '...' }`
   - Invalid token: `{ code: 'invalid_token', message: '...' }`
   - Expired token: `{ code: 'token_expired', message: '...' }`

2. **Redis Connection Errors (500)**
   - Subscription failure: Log error, reject SSE connections until resolved
   - Message parse errors: Log error, skip malformed message
   - Publish errors: Log error, event not delivered (Pub/Sub is fire-and-forget)

3. **SSE Write Errors**
   - Connection closed: Caught in try/catch, cleanup via 'close' event
   - Write after close: Ignored, logged as warning
   - Multiple writes: Non-blocking, queued by Node.js

**Error Display Pattern:**

```typescript
// Authentication errors - return JSON before establishing SSE
try {
  const payload = jwtService.verifyAccessToken(token);
} catch (error: any) {
  if (error.message === 'Token expired') {
    res.status(401).json({
      code: 'token_expired',
      message: 'Access token has expired',
    });
    return;
  }
  // ... other cases
}

// SSE write errors - log and ignore (connection cleanup happens via 'close')
try {
  connection.write(sseMessage);
} catch (error) {
  console.error('❌ Error sending event:', error);
  // Don't throw - connection cleanup happens via 'close' event
}

// Redis errors - log and continue (don't block initialization)
subscriber.on('error', (err) => {
  console.error('❌ Redis Subscriber Error:', err);
  // Don't throw - keep other connections alive
});
```

**Pattern reference:** See `auth.routes.ts` (lines 373-433) for JWT validation errors, `errorHandler.middleware.ts` for centralized error handling

---

### Files to Create

1. **`src/prototype-2/backend/src/types/events.types.ts`**
   - Event payload type definitions
   - NotificationEvent, TaskEvent, JobEvent interfaces
   - SSEMessage format type

2. **`src/prototype-2/backend/src/services/sse.service.ts`**
   - SSEService class with connection management
   - Redis Pub/Sub subscription and message handling
   - Event routing and heartbeat logic
   - Singleton export pattern

3. **`src/prototype-2/backend/src/routes/events.routes.ts`**
   - GET /api/events/stream endpoint
   - JWT authentication (header or query param)
   - SSE headers configuration
   - Connection registration with SSEService

---

### Files to Modify

1. **`src/prototype-2/backend/src/services/redis.service.ts`**
   - Add: `createSubscriber()` method - creates dedicated Pub/Sub client
   - Add: `publish(channel, message)` method - publishes to Redis channel

2. **`src/prototype-2/backend/src/app.ts`**
   - Import: `eventsRoutes` from routes/events.routes.js
   - Import: `sseService` from services/sse.service.js
   - Add: `await sseService.initialize()` after Redis connection
   - Add: `app.use('/api/events', eventsRoutes)` in routes section
   - Add: Graceful shutdown handlers (SIGTERM, SIGINT)

---

## Validation Gates

### Development Testing

```bash
# Terminal 1 - Start Redis (required)
redis-server

# Terminal 2 - Start Backend
cd src/prototype-2/backend
npm run dev

# Terminal 3 - Test SSE endpoint (requires valid JWT)
# Get JWT from login first:
curl -X POST http://localhost:3000/api/1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use JWT to connect to SSE (replace TOKEN with actual JWT):
curl -N http://localhost:3000/api/events/stream?token=TOKEN

# Expected output:
# :connected
# :ping
# :ping
# ... (heartbeat every 30s)

# Terminal 4 - Publish test event to Redis
redis-cli PUBLISH platform:events '{"type":"notification","id":"test1","userId":"user_123","timestamp":"2025-11-05T10:00:00Z"}'

# Expected: Event appears in Terminal 3 if userId matches JWT
```

### Type Checking

```bash
# Backend type checking
cd src/prototype-2/backend
npm run type-check

# Expected: No TypeScript errors
```

### Build Verification

```bash
# Backend build
cd src/prototype-2/backend
npm run build

# Expected: Successful compilation to dist/
```

### Manual Testing Checklist

- [ ] SSE endpoint returns 401 without token
- [ ] SSE endpoint returns 401 with invalid token
- [ ] SSE endpoint returns 401 with expired token
- [ ] SSE endpoint establishes connection with valid token
- [ ] SSE connection receives heartbeat pings every 30s
- [ ] Published Redis events reach connected user
- [ ] Events NOT delivered to offline users (no error)
- [ ] Connection cleanup works (no memory leak after disconnect)
- [ ] Multiple connections for same user handled correctly
- [ ] Backend logs show subscription to Redis channels on startup
- [ ] Graceful shutdown closes all SSE connections

### Integration Testing

```bash
# Test Redis Pub/Sub integration
# 1. Start backend with SSE endpoint
# 2. Connect via curl with valid JWT
# 3. Publish event to Redis
# 4. Verify event received in curl output
# 5. Disconnect curl (Ctrl+C)
# 6. Verify backend logs show connection cleanup
```

---

## References

**Specifications:**
- [SPEC-events.md](D:\sources\codr.studio\platform\spec\SPEC-events.md) - Complete SSE and events specification
  - Lines 150-220: SSE protocol, headers, connection management
  - Lines 75-103: Redis Pub/Sub channels and publishing
  - Lines 224-284: Event payload structure and types

**Codebase Examples:**
- `src/prototype-2/backend/src/services/redis.service.ts` - Singleton service pattern, Redis connection
- `src/prototype-2/backend/src/services/jwt.service.ts` - Service structure, singleton export
- `src/prototype-2/backend/src/routes/auth.routes.ts` - JWT validation pattern, error handling
- `src/prototype-2/backend/src/routes/health.routes.ts` - Simple route structure
- `src/prototype-2/backend/src/app.ts` - Route mounting, middleware order
- `src/prototype-2/backend/src/middleware/errorHandler.middleware.ts` - Error handling pattern

**External Documentation:**
- [MDN - Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) - SSE protocol spec
- [ioredis Pub/Sub](https://github.com/redis/ioredis#pubsub) - Redis Pub/Sub with ioredis
- [Express Response Streaming](https://expressjs.com/en/api.html#res.write) - res.write() for SSE
