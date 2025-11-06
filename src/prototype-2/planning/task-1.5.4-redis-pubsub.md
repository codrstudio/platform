# Task Plan: 1.5.4 - Configurar Redis Pub/Sub

## Context and Objective

This task implements Redis Pub/Sub functionality to enable real-time event distribution across backend instances. Redis Pub/Sub acts as the message broker that receives events from the Backbone (n8n) and delivers them to connected SSE clients in the Backend.

**Business Value**: Enables real-time notifications and updates across the platform without polling, improving user experience and reducing server load.

**User Impact**: Users receive immediate notifications and task updates, creating a responsive and engaging experience.

**Integration**: This component bridges the Backbone (n8n event publisher) and the SSE endpoint (task 1.5.1), forming the middle layer of the event distribution architecture.

## Dependencies

**Prerequisite Tasks:**
- Task 1.3: Authentication (for user identification in event routing)
- Task 1.4: JQEL System (for event recovery via queries)
- Redis service infrastructure (already implemented in `redis.service.ts`)

**Files/Modules Affected:**
- `src/prototype-2/backend/src/services/redis.service.ts` - Enhance with Pub/Sub methods
- `src/prototype-2/backend/src/services/eventDistributor.service.ts` - NEW: Event distribution logic
- `src/prototype-2/backend/src/types/event.types.ts` - NEW: Event type definitions
- `src/prototype-2/backend/src/app.ts` - Initialize event distributor

**Enables Tasks:**
- Task 1.5.1: SSE Server endpoint (consumes Pub/Sub events)
- Task 1.5.2: Redis Streams (complementary persistence layer)
- Task 1.5.3: Event Types implementation
- Task 1.5.5: Frontend SSE Client (ultimate consumer)

**External Dependencies:**
- `ioredis` (already installed) - Redis client library with full Pub/Sub support
- Redis server 6.0+ running and accessible

## Patterns Identified in Codebase

### Similar Components/Modules

**`src/prototype-2/backend/src/services/redis.service.ts`** - Existing Redis service providing:
- Singleton pattern for Redis client management
- Lazy connection initialization
- Error handling with retry strategy
- Typed method wrappers around ioredis
- Transaction support via `multi()`

**`src/prototype-2/backend/src/services/jqelRouter.service.ts`** - Service routing pattern:
- Clear separation of concerns (routing vs. processing)
- Singleton export pattern
- Structured error handling
- Extensive logging for debugging
- Schema-based routing logic

**`src/prototype-2/backend/src/services/n8nProxy.service.ts`** - External communication pattern:
- Timeout handling with AbortController
- Structured error mapping
- Type-safe method signatures
- Configuration via environment variables

### Conventions to Follow

**Naming Conventions:**
- Services: `{Feature}Service` class, lowercase singleton export
- Example: `class EventDistributorService` → `export const eventDistributor = new EventDistributorService()`
- Methods: Descriptive verb-noun pattern (e.g., `publishEvent`, `subscribeToChannel`)

**File Structure:**
- Services in `src/services/` with `.service.ts` suffix
- Types in `src/types/` with `.types.ts` suffix
- Single responsibility: One service per file

**Import/Export Patterns:**
```typescript
// Service file
export class ServiceName {
  // implementation
}

export const serviceName = new ServiceName();

// Type file
export interface TypeName {
  // definition
}

export const CONSTANTS = {
  // constants
} as const;
```

**State Management:**
- Singleton services with private state
- Lazy initialization in constructors or connect methods
- No global state outside service classes

**Error Handling:**
```typescript
try {
  // operation
} catch (error: any) {
  console.error('❌ Descriptive error message:', error);

  // Map to appropriate error type
  if (error.condition) {
    throw new Error('Specific user-friendly message');
  }

  throw error; // or return JResult
}
```

### Reusable Code Examples

**Singleton Service Pattern:**
```typescript
// From: src/services/redis.service.ts
export class RedisService {
  private client: Redis | null = null;
  private connecting: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.client) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      try {
        this.client = new Redis(this.getRedisConfig());
        // setup event handlers
        await this.client.ping();
        this.connecting = null;
      } catch (error) {
        this.connecting = null;
        throw error;
      }
    })();

    return this.connecting;
  }
}

export const redisService = new RedisService();
```

**Event Handler Registration:**
```typescript
// From: src/services/redis.service.ts
this.client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

this.client.on('connect', () => {
  console.log('✅ Redis connected');
});
```

**Lazy Client Access Pattern:**
```typescript
// From: src/services/redis.service.ts
async get(key: string): Promise<string | null> {
  await this.connect(); // ensures connection exists
  return this.client!.get(key);
}
```

## Critical Context

### Documentation

**ioredis Pub/Sub Documentation:**
- [ioredis Pub/Sub API](https://github.com/redis/ioredis#pubsub) - Core Pub/Sub methods
- [Redis Pub/Sub Patterns](https://redis.io/docs/interact/pubsub/#pattern-matching-subscriptions) - Pattern-based subscriptions with `psubscribe`
- Key methods: `publish()`, `subscribe()`, `psubscribe()`, `unsubscribe()`, `on('message')`, `on('pmessage')`

**Redis Pub/Sub Characteristics:**
- [Redis Pub/Sub Reliability](https://redis.io/docs/interact/pubsub/#reliability) - Fire-and-forget delivery, no persistence
- Messages are lost if no subscribers are connected (expected behavior)
- Subscribers must be connected before messages are published
- Separate Redis connection required for Pub/Sub (cannot mix with regular commands)

### Gotchas and Pitfalls

**⚠️ Separate Connection for Pub/Sub:**
ioredis requires a dedicated connection for Pub/Sub operations. Once a connection enters "subscriber mode" (after calling `subscribe` or `psubscribe`), it cannot execute regular Redis commands. Solutions:
- Create a second Redis client specifically for subscribing
- Use the main client for publishing only (publishing works from any connection)
- See pattern: `const subscriber = redisService.getClient().duplicate()`

**⚠️ Message Loss is Expected:**
Redis Pub/Sub does not persist messages. If no subscribers are connected when a message is published, the message is lost. This is by design - use Redis Streams (task 1.5.2) for persistence and recovery.

**⚠️ Pattern Subscription Performance:**
Pattern subscriptions (`psubscribe`) are slower than exact subscriptions. For high-traffic channels, prefer exact channel names when possible. Only use patterns for user-specific channels (e.g., `platform:events:user:*`).

**⚠️ JSON Parsing Errors:**
Messages from Redis Pub/Sub are always strings. Always wrap JSON.parse in try/catch:
```typescript
try {
  const event = JSON.parse(message);
} catch (error) {
  console.error('Invalid JSON in Pub/Sub message:', message);
  return; // skip invalid messages
}
```

**⚠️ Memory Leaks from Event Listeners:**
Ensure proper cleanup of Redis event listeners. If subscribers are created/destroyed frequently, use `removeListener` to prevent memory leaks:
```typescript
subscriber.on('message', handler); // register
subscriber.removeListener('message', handler); // cleanup
```

### Existing Patterns to Follow

**Connection Management:**
- See `src/services/redis.service.ts` for Redis connection pattern
- Use lazy initialization with `connecting` Promise to prevent race conditions
- Implement retry strategy in Redis config

**Error Logging:**
- Use emoji prefixes for log levels (✅ success, ❌ error, ⚠️ warning, ℹ️ info)
- Include structured context in logs (JSON objects)
- See pattern in `jqelRouter.service.ts` lines 46-51

**Type Safety:**
- Define interfaces in separate `.types.ts` files
- Use `as const` for constant objects
- Export both types and singleton instances

## Technical Specification

### Architecture

```
src/prototype-2/backend/
├── src/
│   ├── services/
│   │   ├── redis.service.ts              # MODIFY: Add Pub/Sub methods
│   │   ├── eventDistributor.service.ts   # NEW: Pub/Sub event distribution
│   │   └── ...existing services
│   ├── types/
│   │   ├── event.types.ts                # NEW: Event payload types
│   │   └── ...existing types
│   └── app.ts                            # MODIFY: Initialize event distributor
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKBONE (n8n)                                                          │
│                                                                         │
│ Workflow emits event → PUBLISH to Redis channel                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ REDIS PUB/SUB                                                           │
│                                                                         │
│ Channels:                                                               │
│ - platform:events             ← Global events                          │
│ - platform:events:user:{id}   ← User-specific events                   │
│ - platform:notifications      ← Notification events (optional)         │
│ - platform:tasks              ← Task events (optional)                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Express)                                                       │
│                                                                         │
│ EventDistributor Service:                                              │
│ 1. Subscribe to channels on startup                                    │
│ 2. Listen for messages (on 'message' event)                            │
│ 3. Parse and validate JSON payload                                     │
│ 4. Route to SSE connections (task 1.5.1)                               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SSE ENDPOINT (task 1.5.1)                                               │
│                                                                         │
│ Send event to connected clients via Server-Sent Events                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Modules and Responsibilities

**1. RedisService (Enhanced)**
- **File**: `src/services/redis.service.ts`
- **Responsibility**: Low-level Redis operations including Pub/Sub
- **New Methods**:
  - `publish(channel: string, message: string): Promise<number>` - Publish message to channel
  - `createSubscriber(): Redis` - Create dedicated subscriber client
- **Interface**: Extends existing service with Pub/Sub primitives

**2. EventDistributorService (New)**
- **File**: `src/services/eventDistributor.service.ts`
- **Responsibility**: High-level event distribution logic
- **Methods**:
  - `initialize(): Promise<void>` - Setup subscriptions on startup
  - `subscribeToChannels(channels: string[]): void` - Subscribe to event channels
  - `handleMessage(channel: string, message: string): void` - Process incoming Pub/Sub messages
  - `publishEvent(event: PlatformEvent): Promise<void>` - Publish event (for testing/local use)
  - `shutdown(): Promise<void>` - Cleanup subscriptions
- **Interface**: Central event routing hub

**3. Event Types (New)**
- **File**: `src/types/event.types.ts`
- **Responsibility**: Type definitions for event payloads
- **Exports**:
  - `PlatformEvent` - Base event interface
  - `NotificationEvent` - Notification-specific event
  - `TaskEvent` - Task-specific event
  - `EVENT_CHANNELS` - Channel name constants

### State Management

**EventDistributor State:**
```typescript
class EventDistributorService {
  private subscriber: Redis | null = null;  // Dedicated Pub/Sub connection
  private initialized: boolean = false;     // Initialization flag
  private messageHandlers: Map<string, EventHandler[]>; // Channel → handlers

  // Initialization is triggered once on app startup
  // Subscriptions persist for application lifetime
  // Cleanup happens on graceful shutdown
}
```

**No Global State:**
- All state encapsulated in service singletons
- Event handlers registered via callbacks (SSE service will register handlers)
- No shared mutable state between modules

### Libraries and Tools

**ioredis (v5.x) - Already Installed**
- **Version**: ^5.3.2 (as per existing package.json)
- **Reason**: Feature-complete Redis client with full Pub/Sub support
- **Specific Features Used**:
  - `publish(channel, message)` - Publish messages
  - `subscribe(...channels)` - Subscribe to exact channels
  - `psubscribe(...patterns)` - Subscribe to channel patterns
  - `on('message', (channel, message) => {})` - Message handler
  - `on('pmessage', (pattern, channel, message) => {})` - Pattern message handler
  - `duplicate()` - Clone connection for subscriber

**No New Dependencies Required:**
All functionality can be implemented with existing ioredis installation.

## Implementation Blueprint

### Ordered Steps

#### 1. Define Event Types (Foundation)
**Create:** `src/types/event.types.ts`

**Details:**
Define TypeScript interfaces for all event payloads according to SPEC-EV-PL-001:017.

**Pattern:** See existing type files like `jqel.types.ts` for structure and naming conventions.

**Content:**
```typescript
/**
 * Platform Event System Types
 *
 * SPEC References:
 * - SPEC-EV-PL-001:017: Event payload structure and fields
 * - SPEC-EV-CO-002:013: Event types (notification, task)
 */

/**
 * Base platform event structure
 *
 * SPEC-EV-PL-001:008: Required and optional fields
 */
export interface PlatformEvent {
  type: 'notification' | 'task';  // SPEC-EV-PL-013
  id: string;                      // SPEC-EV-PL-003: Unique identifier
  userId?: string;                 // SPEC-EV-PL-004: Single user target
  userIds?: string[];              // SPEC-EV-PL-004: Multiple user targets
  timestamp: string;               // SPEC-EV-PL-005: ISO 8601 timestamp
  category?: string;               // SPEC-EV-PL-006: Event category
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // SPEC-EV-PL-007
  data?: Record<string, any>;      // SPEC-EV-PL-008: Additional metadata
}

/**
 * Notification event
 *
 * SPEC-EV-CO-005:008: Informational, passive events
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error';
}

/**
 * Task event
 *
 * SPEC-EV-CO-009:013: Interactive events requiring user action
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'completed' | 'cancelled';  // SPEC-EV-CO-010
  category?: string; // e.g., 'email_approval', 'data_validation'
}

/**
 * Channel name constants
 *
 * SPEC-EV-PS-005:007: Pub/Sub channel naming
 */
export const EVENT_CHANNELS = {
  GLOBAL: 'platform:events',              // SPEC-EV-PS-005: Global events
  NOTIFICATIONS: 'platform:notifications', // SPEC-EV-PS-007: Notification-specific
  TASKS: 'platform:tasks',                 // SPEC-EV-PS-007: Task-specific
  USER_PREFIX: 'platform:events:user:',    // SPEC-EV-PS-006: User-specific prefix
} as const;

/**
 * Event handler function signature
 */
export type EventHandler = (event: PlatformEvent) => void | Promise<void>;

/**
 * Event validation result
 */
export interface EventValidation {
  valid: boolean;
  error?: string;
  field?: string;
}
```

#### 2. Enhance RedisService with Pub/Sub Methods
**Modify:** `src/services/redis.service.ts`

**Details:**
Add Pub/Sub primitive methods to existing RedisService. Keep methods simple and low-level.

**Pattern:** Follow existing method structure in redis.service.ts (lines 88-106, 138-163).

**Changes:**
```typescript
// Add after existing methods (around line 207, before multi())

/**
 * Publish message to Redis Pub/Sub channel
 *
 * SPEC-EV-PS-009:012: Publish events asynchronously
 *
 * @param channel - Channel name
 * @param message - Message payload (will be stringified if object)
 * @returns Number of subscribers that received the message
 */
async publish(channel: string, message: string | object): Promise<number> {
  await this.connect();

  const payload = typeof message === 'string'
    ? message
    : JSON.stringify(message);

  try {
    const subscriberCount = await this.client!.publish(channel, payload);

    // Log for debugging (can be removed in production)
    console.log(`ℹ️  Published to ${channel}: ${subscriberCount} subscribers`);

    return subscriberCount;
  } catch (error: any) {
    console.error(`❌ Failed to publish to ${channel}:`, error);
    throw error;
  }
}

/**
 * Create a dedicated Redis client for subscribing
 *
 * IMPORTANT: Pub/Sub requires a separate connection because once a client
 * enters subscriber mode, it cannot execute regular commands.
 *
 * @returns Duplicated Redis client for subscription use
 * @throws Error if main client not connected
 */
createSubscriber(): Redis {
  if (!this.client) {
    throw new Error('Redis not connected. Call connect() first.');
  }

  // duplicate() creates a new connection with same configuration
  const subscriber = this.client.duplicate();

  subscriber.on('error', (err) => {
    console.error('❌ Redis Subscriber Error:', err);
  });

  subscriber.on('connect', () => {
    console.log('✅ Redis subscriber connected');
  });

  subscriber.on('end', () => {
    console.log('⚠️  Redis subscriber connection closed');
  });

  return subscriber;
}
```

#### 3. Create EventDistributor Service
**Create:** `src/services/eventDistributor.service.ts`

**Details:**
Implement high-level event distribution service that manages Pub/Sub subscriptions and routes messages to handlers (SSE connections).

**Pattern:** Follow service structure from `jqelRouter.service.ts` (singleton, error handling, logging).

**Content:**
```typescript
import type { Redis } from 'ioredis';
import { redisService } from './redis.service.js';
import type {
  PlatformEvent,
  EventHandler,
  EventValidation,
  NotificationEvent,
  TaskEvent
} from '../types/event.types.js';
import { EVENT_CHANNELS } from '../types/event.types.js';

/**
 * EventDistributorService
 *
 * Manages Redis Pub/Sub subscriptions and distributes events to registered handlers.
 * Handlers are typically SSE connections (task 1.5.1) that forward events to frontend.
 *
 * Architecture:
 * - Single subscriber connection for all channels
 * - Multiple handlers can register for events
 * - Validates events before distribution
 * - Handles malformed messages gracefully
 *
 * SPEC References:
 * - SPEC-EV-PS-001:012: Redis Pub/Sub usage
 * - SPEC-EV-AR-001:004: Event flow architecture
 */
export class EventDistributorService {
  private subscriber: Redis | null = null;
  private initialized: boolean = false;
  private handlers: Set<EventHandler> = new Set();

  /**
   * Initialize Pub/Sub subscriptions
   *
   * Called once during application startup.
   * Sets up subscriber client and channel subscriptions.
   *
   * SPEC-EV-PS-008: Backend subscribes to appropriate channels
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️  EventDistributor already initialized');
      return;
    }

    try {
      // Ensure main Redis connection exists
      await redisService.connect();

      // Create dedicated subscriber client
      this.subscriber = redisService.createSubscriber();

      // Subscribe to default channels
      await this.subscribeToChannels([
        EVENT_CHANNELS.GLOBAL,
        EVENT_CHANNELS.NOTIFICATIONS,
        EVENT_CHANNELS.TASKS,
      ]);

      // Setup message handler
      this.subscriber.on('message', (channel: string, message: string) => {
        this.handleMessage(channel, message);
      });

      // Setup pattern message handler (for user-specific channels)
      this.subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
        this.handleMessage(channel, message);
      });

      this.initialized = true;
      console.log('✅ EventDistributor initialized');
    } catch (error: any) {
      console.error('❌ Failed to initialize EventDistributor:', error);
      throw error;
    }
  }

  /**
   * Subscribe to Redis Pub/Sub channels
   *
   * @param channels - Array of channel names to subscribe to
   */
  async subscribeToChannels(channels: string[]): Promise<void> {
    if (!this.subscriber) {
      throw new Error('Subscriber not initialized. Call initialize() first.');
    }

    try {
      await this.subscriber.subscribe(...channels);
      console.log(`✅ Subscribed to channels: ${channels.join(', ')}`);
    } catch (error: any) {
      console.error('❌ Failed to subscribe to channels:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user-specific events
   *
   * SPEC-EV-PS-006: User-specific channel pattern
   *
   * @param userId - User ID to subscribe to
   */
  async subscribeToUser(userId: string): Promise<void> {
    if (!this.subscriber) {
      throw new Error('Subscriber not initialized. Call initialize() first.');
    }

    const channel = `${EVENT_CHANNELS.USER_PREFIX}${userId}`;

    try {
      await this.subscriber.subscribe(channel);
      console.log(`✅ Subscribed to user channel: ${channel}`);
    } catch (error: any) {
      console.error(`❌ Failed to subscribe to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from user-specific events
   *
   * @param userId - User ID to unsubscribe from
   */
  async unsubscribeFromUser(userId: string): Promise<void> {
    if (!this.subscriber) {
      return; // Already shutdown
    }

    const channel = `${EVENT_CHANNELS.USER_PREFIX}${userId}`;

    try {
      await this.subscriber.unsubscribe(channel);
      console.log(`✅ Unsubscribed from user channel: ${channel}`);
    } catch (error: any) {
      console.error(`❌ Failed to unsubscribe from user ${userId}:`, error);
    }
  }

  /**
   * Handle incoming Pub/Sub message
   *
   * Validates, parses, and distributes event to all registered handlers.
   *
   * SPEC-EV-PL-001:017: Event payload validation
   *
   * @param channel - Channel the message was received on
   * @param message - Raw message string (should be JSON)
   */
  private handleMessage(channel: string, message: string): void {
    try {
      // Parse JSON payload
      let event: PlatformEvent;
      try {
        event = JSON.parse(message);
      } catch (error) {
        console.error('❌ Invalid JSON in Pub/Sub message:', {
          channel,
          message: message.substring(0, 100), // Log first 100 chars
        });
        return; // Skip invalid messages
      }

      // Validate event structure
      const validation = this.validateEvent(event);
      if (!validation.valid) {
        console.error('❌ Invalid event payload:', {
          channel,
          error: validation.error,
          field: validation.field,
          event,
        });
        return; // Skip invalid events
      }

      // Log event reception (can be removed in production)
      console.log('ℹ️  Received event:', {
        channel,
        type: event.type,
        id: event.id,
        userId: event.userId,
        category: event.category,
      });

      // Distribute to all handlers
      this.distributeEvent(event);
    } catch (error: any) {
      console.error('❌ Error handling Pub/Sub message:', {
        channel,
        error: error.message,
      });
    }
  }

  /**
   * Validate event structure
   *
   * SPEC-EV-PL-001:017: Required and optional fields
   *
   * @param event - Event object to validate
   * @returns Validation result
   */
  private validateEvent(event: any): EventValidation {
    // Check required fields (SPEC-EV-PL-002:005)
    if (!event.type || typeof event.type !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid type field',
        field: 'type',
      };
    }

    if (!event.id || typeof event.id !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid id field',
        field: 'id',
      };
    }

    if (!event.timestamp || typeof event.timestamp !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid timestamp field',
        field: 'timestamp',
      };
    }

    // Check user targeting (SPEC-EV-PL-004)
    if (!event.userId && !event.userIds) {
      return {
        valid: false,
        error: 'Must specify userId or userIds',
        field: 'userId',
      };
    }

    // Validate type value (SPEC-EV-PL-013)
    if (!['notification', 'task'].includes(event.type)) {
      return {
        valid: false,
        error: 'Invalid event type. Must be notification or task',
        field: 'type',
      };
    }

    return { valid: true };
  }

  /**
   * Distribute event to all registered handlers
   *
   * @param event - Validated event to distribute
   */
  private distributeEvent(event: PlatformEvent): void {
    if (this.handlers.size === 0) {
      console.warn('⚠️  No handlers registered to receive event:', event.id);
      return;
    }

    // Call each handler (SSE connections will be handlers)
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error: any) {
        console.error('❌ Error in event handler:', {
          eventId: event.id,
          error: error.message,
        });
        // Continue with other handlers even if one fails
      }
    }
  }

  /**
   * Register event handler
   *
   * Handlers will be called for every received event.
   * Typically used by SSE service (task 1.5.1).
   *
   * @param handler - Function to call when event received
   */
  registerHandler(handler: EventHandler): void {
    this.handlers.add(handler);
    console.log(`ℹ️  Event handler registered (total: ${this.handlers.size})`);
  }

  /**
   * Unregister event handler
   *
   * @param handler - Handler function to remove
   */
  unregisterHandler(handler: EventHandler): void {
    this.handlers.delete(handler);
    console.log(`ℹ️  Event handler unregistered (remaining: ${this.handlers.size})`);
  }

  /**
   * Publish event to Redis Pub/Sub
   *
   * Used for local event emission or testing.
   * Production events should come from n8n Backbone.
   *
   * SPEC-EV-PS-009:012: Asynchronous publication
   *
   * @param event - Event to publish
   * @param channel - Optional channel (defaults to type-based channel)
   */
  async publishEvent(
    event: PlatformEvent,
    channel?: string
  ): Promise<void> {
    // Validate event
    const validation = this.validateEvent(event);
    if (!validation.valid) {
      throw new Error(`Invalid event: ${validation.error} (field: ${validation.field})`);
    }

    // Determine channel
    const targetChannel = channel || this.getChannelForEvent(event);

    // Publish via RedisService
    try {
      await redisService.publish(targetChannel, event);
      console.log('✅ Event published:', {
        channel: targetChannel,
        type: event.type,
        id: event.id,
      });
    } catch (error: any) {
      console.error('❌ Failed to publish event:', error);
      throw error;
    }
  }

  /**
   * Determine appropriate channel for event type
   *
   * @param event - Event to route
   * @returns Channel name
   */
  private getChannelForEvent(event: PlatformEvent): string {
    switch (event.type) {
      case 'notification':
        return EVENT_CHANNELS.NOTIFICATIONS;
      case 'task':
        return EVENT_CHANNELS.TASKS;
      default:
        return EVENT_CHANNELS.GLOBAL;
    }
  }

  /**
   * Shutdown event distributor
   *
   * Unsubscribes from all channels and disconnects subscriber.
   * Call during graceful application shutdown.
   */
  async shutdown(): Promise<void> {
    if (!this.subscriber) {
      return; // Already shutdown
    }

    try {
      // Unsubscribe from all channels
      await this.subscriber.unsubscribe();

      // Disconnect subscriber
      await this.subscriber.quit();

      this.subscriber = null;
      this.initialized = false;
      this.handlers.clear();

      console.log('✅ EventDistributor shutdown complete');
    } catch (error: any) {
      console.error('❌ Error during EventDistributor shutdown:', error);
    }
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const eventDistributor = new EventDistributorService();
```

#### 4. Initialize EventDistributor in Application
**Modify:** `src/app.ts`

**Details:**
Initialize event distributor during application startup, alongside Redis connection.

**Pattern:** See existing Redis initialization pattern in app.ts (lines 53-57).

**Changes:**
```typescript
// Add import at top (around line 8)
import { eventDistributor } from './services/eventDistributor.service.js';

// Modify SERVICES INITIALIZATION section (around line 54)

// Initialize Redis connection (lazy - will connect on first use)
redisService.connect().catch((error) => {
  console.error('❌ Failed to connect to Redis:', error);
  console.warn('⚠️  Token rotation and reuse detection will not work without Redis');
});

// Initialize Event Distributor for real-time events (Task 1.5.4)
// Note: This depends on Redis being available
eventDistributor.initialize().catch((error) => {
  console.error('❌ Failed to initialize EventDistributor:', error);
  console.warn('⚠️  Real-time events will not work without EventDistributor');
});
```

#### 5. Add Graceful Shutdown
**Modify:** `src/app.ts`

**Details:**
Add shutdown handlers to cleanup Redis Pub/Sub subscriptions gracefully.

**Pattern:** Standard Node.js process signal handling.

**Changes:**
```typescript
// Add at the very end of app.ts (after export default app)

/**
 * Graceful shutdown handler
 *
 * Cleanup connections before process exit:
 * - Close Redis Pub/Sub subscriber
 * - Disconnect main Redis client
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  Received ${signal}, starting graceful shutdown...`);

  try {
    // Shutdown event distributor (closes subscriber)
    await eventDistributor.shutdown();

    // Disconnect main Redis client
    await redisService.disconnect();

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kill command
```

## Validation Gates

### Type Checking
```bash
# From backend directory
cd src/prototype-2/backend
npm run type-check
```
**Expected**: No TypeScript errors in new files.

### Build Verification
```bash
# From backend directory
npm run build
```
**Expected**: Clean compilation to dist/, no errors.

### Runtime Validation

**1. Redis Connection Test:**
```bash
# Ensure Redis is running
redis-cli ping
# Should return: PONG

# Start backend
npm run dev
# Check logs for:
# ✅ Redis connected
# ✅ Redis subscriber connected
# ✅ EventDistributor initialized
# ✅ Subscribed to channels: platform:events, platform:notifications, platform:tasks
```

**2. Pub/Sub Functionality Test:**

Terminal 1 - Redis CLI subscriber (verify messages reach Redis):
```bash
redis-cli
SUBSCRIBE platform:events
# Wait for messages...
```

Terminal 2 - Publish test event:
```bash
redis-cli
PUBLISH platform:events '{"type":"notification","id":"test_001","userId":"user_123","timestamp":"2025-11-05T10:00:00Z","category":"test"}'
# Should show: (integer) 2  (two subscribers: Redis CLI + Backend)
```

Terminal 3 - Backend logs:
```bash
# Should show:
# ℹ️  Received event: { channel: 'platform:events', type: 'notification', id: 'test_001', ... }
# ⚠️  No handlers registered to receive event: test_001
```

**3. Event Validation Test:**

Publish invalid event (missing required fields):
```bash
redis-cli
PUBLISH platform:events '{"type":"notification"}'
# Backend should log:
# ❌ Invalid event payload: { error: 'Missing or invalid id field', field: 'id', ... }
```

### Manual Testing Checklist

- [ ] Backend starts without errors
- [ ] Redis connection established (check logs for "✅ Redis connected")
- [ ] Subscriber connection established (check logs for "✅ Redis subscriber connected")
- [ ] EventDistributor initialized (check logs for "✅ EventDistributor initialized")
- [ ] Channels subscribed (check logs for "✅ Subscribed to channels")
- [ ] Valid events received and logged
- [ ] Invalid events rejected with error logs
- [ ] Graceful shutdown works (Ctrl+C cleanly closes connections)

### Integration Testing (with task 1.5.1 SSE)

After task 1.5.1 is complete:
- [ ] SSE handler registers with EventDistributor
- [ ] Events from Redis reach SSE clients
- [ ] Frontend receives events in real-time

## References

**SPEC Documents:**
- `spec/SPEC-events.md` (SPEC-EV-PS-001:012) - Redis Pub/Sub requirements
- `spec/SPEC-events.md` (SPEC-EV-PL-001:017) - Event payload structure
- `spec/SPEC-events.md` (SPEC-EV-AR-001:009) - Event system architecture

**Codebase Examples:**
- `src/services/redis.service.ts` - Redis connection patterns, singleton service
- `src/services/jqelRouter.service.ts` - Service structure, error handling, logging
- `src/services/n8nProxy.service.ts` - External communication patterns
- `src/types/jqel.types.ts` - Type definition patterns

**External Documentation:**
- [ioredis Pub/Sub](https://github.com/redis/ioredis#pubsub) - Core API reference
- [Redis Pub/Sub Guide](https://redis.io/docs/interact/pubsub/) - Pub/Sub patterns and reliability
- [Redis Pub/Sub Pattern Matching](https://redis.io/docs/interact/pubsub/#pattern-matching-subscriptions) - Using psubscribe

**Related Tasks:**
- Task 1.5.1: SSE Server (will consume Pub/Sub events)
- Task 1.5.2: Redis Streams (complementary persistence layer)
- Task 1.5.3: Event Types (notification/task implementation)
