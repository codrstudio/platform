# Task Plan: 1.5.7 - Implementar Notification events

## Context and Objective

This task implements **notification event handling** for the platform's real-time event system. Notifications are passive, informational events that inform users about system activities without requiring action. They form one of the two core event types (notifications and tasks) that drive the platform's real-time communication.

**What will be implemented:**
- Notification event creation helpers and utilities
- Notification publishing interface for Backbone (n8n)
- Notification severity levels and categorization
- Validation functions for notification payloads
- Integration with existing SSE infrastructure (tasks 1.5.1-1.5.6)
- Helper functions for common notification patterns

**Why it's needed:**
Notifications enable the platform to communicate asynchronously with users about:
- Background process completion ("Export finished")
- System events ("New message received")
- Status changes ("User logged in from new device")
- Error conditions ("Failed to send email")
- Success confirmations ("Data saved successfully")

Unlike tasks (task 1.5.8), notifications are **passive** - they inform but don't require user interaction.

**How it integrates:**
- **Backend SSE System (1.5.1-1.5.6)**: Already handles event delivery via Redis Pub/Sub and Streams
- **Event Types (events.types.ts)**: Base `NotificationEvent` interface already defined
- **Frontend (1.5.9-1.5.11)**: Will consume notifications via SSE and display to users
- **n8n Backbone**: Will use helper functions to publish notifications to Redis

**Business value:**
- Real-time user feedback without page refreshes
- Improved user experience with immediate status updates
- Foundation for notification center module (task 3.6)
- Audit trail of system activities
- Error visibility for debugging and monitoring

**User impact:**
Users receive immediate visual feedback about system activities, creating a responsive, transparent application experience. No need to refresh or poll for updates.

## Dependencies

### Prerequisite Tasks
- **1.5.1 - SSE Endpoint**: ✅ Complete - SSE connection infrastructure
- **1.5.2 - Heartbeat/Keepalive**: ✅ Complete - Connection management
- **1.5.3 - Reconnection**: ✅ Complete - Auto-reconnect support
- **1.5.4 - Redis Pub/Sub**: ✅ Complete - Event channel infrastructure
- **1.5.5 - Redis Streams**: ✅ Complete - Offline event buffering
- **1.5.6 - Offline Recovery**: ✅ Complete - Missed event recovery

### Files/Modules Affected

**Files to Create:**
- `src/prototype-2/backend/src/services/notificationService.ts` - Notification creation and publishing service
- `src/prototype-2/backend/src/utils/notificationHelpers.ts` - Helper functions for common notification patterns
- `src/prototype-2/backend/src/types/notification.types.ts` - Extended notification type definitions

**Files to Modify:**
- `src/prototype-2/backend/src/types/events.types.ts` - Extend `NotificationEvent` interface with severity and metadata
- `src/prototype-2/backend/src/services/index.ts` - Export notificationService (if this file exists)

**Files to Reference (No Changes):**
- `src/prototype-2/backend/src/services/sse.service.ts` - Event delivery mechanism (already complete)
- `src/prototype-2/backend/src/services/redis.service.ts` - Pub/Sub and Streams operations (already complete)
- `src/prototype-2/backend/src/services/eventRecovery.service.ts` - Recovery mechanism (already complete)

### Enables Tasks
- **1.5.8 - Task Events**: Similar implementation pattern for interactive events
- **1.5.9 - Frontend SSE Client**: Will consume notification events
- **1.5.10 - Frontend Event Handlers**: Will display notifications
- **3.6 - Notifications Module**: Full notification center UI

### External Dependencies
- `ioredis` - Already installed, used for Redis Pub/Sub and Streams
- `uuid` or similar - For generating unique notification IDs (if not using Redis Stream IDs)

## Patterns Identified in Codebase

### Similar Components/Modules

**Event Recovery Service (eventRecovery.service.ts):**
- Service pattern with singleton export
- TypeScript interfaces for structured results
- Event validation helpers
- Integration with Redis Streams

**SSE Service (sse.service.ts):**
- Singleton service pattern
- Private helper methods for internal operations
- Public API for external usage
- Integration with Redis Pub/Sub
- Event type discrimination based on `type` field

**Redis Service (redis.service.ts):**
- `publish(channel, message)` - Already supports JSON object publishing
- `xadd(streamKey, event)` - Already stores events in Streams
- Automatic JSON stringification of objects

### Conventions to Follow

**Naming Conventions:**
- Service files: `{feature}Service.ts` or `{feature}.service.ts`
- Helper files: `{feature}Helpers.ts` or `{feature}.helpers.ts`
- Type files: `{feature}.types.ts`
- Exported instances: camelCase (e.g., `notificationService`)
- Classes: PascalCase (e.g., `NotificationService`)
- Helper functions: camelCase with descriptive names (e.g., `createSuccessNotification`)

**File Structure:**
```
src/prototype-2/backend/src/
├── services/
│   ├── notificationService.ts       [NEW]
│   ├── sse.service.ts               [EXISTS]
│   └── redis.service.ts             [EXISTS]
├── utils/
│   └── notificationHelpers.ts       [NEW]
├── types/
│   ├── notification.types.ts        [NEW]
│   └── events.types.ts              [MODIFY]
```

**Import/Export Patterns:**
```typescript
// Services export singleton instance
export class NotificationService { /* ... */ }
export const notificationService = new NotificationService();

// Helpers export individual functions
export function createSuccessNotification(...) { /* ... */ }
export function createErrorNotification(...) { /* ... */ }

// Types export interfaces/types only
export interface NotificationMetadata { /* ... */ }
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
```

**State Management:**
- Services are stateless (no persistent state in notification service)
- All state lives in Redis (Pub/Sub + Streams)
- SSEService already manages connection state

**Error Handling:**
```typescript
// Services throw errors with descriptive messages
if (!notification.userId) {
  throw new Error('Notification must include userId');
}

// Async operations use try/catch
try {
  await redisService.publish(channel, notification);
} catch (error) {
  console.error('❌ Failed to publish notification:', error);
  throw error; // Re-throw for caller to handle
}
```

### Reusable Code Examples

**Redis Publishing Pattern from sse.service.ts:**
```typescript
// File: src/prototype-2/backend/src/services/sse.service.ts (lines 106-144)
private async handleRedisMessage(_channel: string, message: string): Promise<void> {
  try {
    const event: PlatformEvent = JSON.parse(message);

    if (!event.userId) {
      console.warn('⚠️  Event missing userId, cannot route:', event);
      return;
    }

    // Store event in Redis Stream for offline recovery
    const streamKey = `events:${event.userId}`;
    try {
      const streamId = await redisService.xadd(streamKey, event);
      if (!event.id) {
        event.id = streamId;
      }
    } catch (error) {
      console.error(`❌ Failed to store event in stream ${streamKey}:`, error);
    }

    // Deliver to online user
    const connection = this.connections.get(event.userId);
    if (!connection) {
      console.log(`ℹ️  User ${event.userId} not connected, event stored for recovery`);
      return;
    }

    this.sendEventToConnection(connection, event);
  } catch (error) {
    console.error('❌ Error handling Redis message:', error);
  }
}
```

**Event Type Definitions from events.types.ts:**
```typescript
// File: src/prototype-2/backend/src/types/events.types.ts (lines 14-33)
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-completed' | 'job-failed' | 'job-progress';
  id: string;
  userId?: string;
  userIds?: string[];
  timestamp: string; // ISO 8601
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
}

export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error';
}
```

**Redis Service Publish Method:**
```typescript
// File: src/prototype-2/backend/src/services/redis.service.ts (lines 218-234)
async publish(channel: string, message: string | object): Promise<number> {
  await this.connect();

  const payload = typeof message === 'string' ? message : JSON.stringify(message);

  try {
    const subscriberCount = await this.client!.publish(channel, payload);
    console.log(`ℹ️  Published to ${channel}: ${subscriberCount} subscribers`);
    return subscriberCount;
  } catch (error: any) {
    console.error(`❌ Failed to publish to ${channel}:`, error);
    throw error;
  }
}
```

## Critical Context

### Documentation

**SPEC-events.md - Notification Concepts:**
- [SPEC-EV-CO-005](D:\sources\codr.studio\platform\spec\SPEC-events.md#L24) - Notification is informational, unidirectional event
- [SPEC-EV-CO-006](D:\sources\codr.studio\platform\spec\SPEC-events.md#L26) - Notification does NOT require user action
- [SPEC-EV-CO-007](D:\sources\codr.studio\platform\spec\SPEC-events.md#L28) - Notification may be marked as viewed
- [SPEC-EV-CO-008](D:\sources\codr.studio\platform\spec\SPEC-events.md#L30) - Examples: "Processing started", "Email sent", "Error in log"

**SPEC-events.md - Event Payload:**
- [SPEC-EV-PL-001:008](D:\sources\codr.studio\platform\spec\SPEC-events.md#L224-241) - Required fields: type, id, userId/userIds, timestamp; Optional: category, priority
- [SPEC-EV-PL-009:012](D:\sources\codr.studio\platform\spec\SPEC-events.md#L243-251) - Events contain only metadata (<1KB), not full data
- [SPEC-EV-PL-016](D:\sources\codr.studio\platform\spec\SPEC-events.md#L262-272) - Notification format example

**SPEC-events.md - Redis Channels:**
- [SPEC-EV-PS-007](D:\sources\codr.studio\platform\spec\SPEC-events.md#L90-91) - May exist channel: `platform:notifications`

**SPEC-events.md - Architecture:**
- [SPEC-EV-AR-003](D:\sources\codr.studio\platform\spec\SPEC-events.md#L54) - Full data must NOT travel via events
- [SPEC-EV-AR-004](D:\sources\codr.studio\platform\spec\SPEC-events.md#L56) - Events must contain only minimal metadata

### Gotchas and Pitfalls

**Notification-Specific:**
- ⚠️ Notifications are passive - they inform, not request action (contrast with tasks)
- ⚠️ Notification category should match frontend display expectations (system, info, success, warning, error)
- ⚠️ Keep payload small (<1KB) - store full data in database, send only ID and minimal metadata
- ⚠️ Timestamp must be ISO 8601 format for consistent parsing across systems
- ⚠️ Notification ID must be unique - use Redis Stream ID or generate UUID
- ⚠️ Priority levels affect frontend display (urgent = popup, normal = badge, low = background)

**Publishing:**
- ⚠️ Redis Pub/Sub is fire-and-forget - if no subscribers, message is lost (expected)
- ⚠️ Always publish to BOTH Pub/Sub AND Streams for offline recovery
- ⚠️ Publishing should be async and non-blocking - don't wait for delivery confirmation
- ⚠️ Failed publishing should be logged but not crash the workflow

**Validation:**
- ⚠️ Must validate `userId` exists before publishing (cannot route without it)
- ⚠️ Must validate `type` is exactly "notification" (for type safety)
- ⚠️ Should validate category matches expected values (prevents typos)
- ⚠️ Should validate timestamp is valid ISO 8601 string

**Integration:**
- ⚠️ SSE service already handles delivery - notification service only creates and publishes
- ⚠️ Don't duplicate Redis Stream storage - SSE service already does this on message receipt
- ⚠️ Use `platform:notifications` channel (already subscribed by SSE service)
- ⚠️ Frontend expects specific structure - breaking changes will break clients

### Existing Patterns to Follow

**Service Singleton Pattern:**
- See `sse.service.ts` (lines 24-322) - Class with private methods, public API, singleton export
- See `eventRecovery.service.ts` (lines 20-139) - Service with validation helpers, singleton export

**Helper Function Pattern:**
- Create pure functions that construct valid notification objects
- Export individual functions (not a class) for easy importing
- Use TypeScript for type safety and autocomplete

**Error Handling:**
- See `sse.service.ts` (lines 106-144) - Try/catch with console.error, continue on non-critical errors
- See `redis.service.ts` (lines 218-234) - Log error context, re-throw for caller

**Validation Pattern:**
- See `eventRecovery.service.ts` (lines 117-135) - Validation methods with boolean returns
- Use early returns for invalid cases
- Provide descriptive error messages

## Technical Specification

### Architecture

```
src/prototype-2/backend/src/
├── services/
│   ├── notificationService.ts       [NEW] - Create and publish notifications
│   ├── sse.service.ts               [EXISTS] - Handles delivery (no changes)
│   └── redis.service.ts             [EXISTS] - Pub/Sub operations (no changes)
├── utils/
│   └── notificationHelpers.ts       [NEW] - Common notification patterns
├── types/
│   ├── notification.types.ts        [NEW] - Extended notification types
│   └── events.types.ts              [MODIFY] - Extend NotificationEvent
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  n8n Workflow (Backbone)                                        │
│  - Import: notificationService, notificationHelpers            │
│  - Create: createSuccessNotification("Process complete")       │
│  - Publish: notificationService.publish(notification)          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ notificationService.publish()
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  NotificationService                                            │
│  - Validate notification payload                               │
│  - Generate ID if missing (UUID or timestamp-based)            │
│  - Ensure timestamp is ISO 8601                                │
│  - Publish to Redis channel: platform:notifications            │
│  - NO Stream storage (SSE service does this on receipt)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ redisService.publish()
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Redis Pub/Sub                                                  │
│  - Channel: platform:notifications                             │
│  - Message: JSON-stringified NotificationEvent                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Subscription (already configured)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  SSEService (Already Complete)                                  │
│  - Receives notification via Pub/Sub subscription              │
│  - Stores in Redis Stream: events:<userId>                     │
│  - Looks up user connection                                    │
│  - Sends via SSE if user online                                │
│  - Stores for recovery if user offline                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ SSE Stream
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Future - Tasks 1.5.9-1.5.11)                        │
│  - Receives notification event                                 │
│  - Displays toast/badge/notification center entry              │
│  - Marks as viewed when acknowledged                           │
└─────────────────────────────────────────────────────────────────┘
```

### Modules and Responsibilities

**notificationService.ts**
- Responsibility: Create and publish notification events
- Interface:
  - `publish(notification)` - Publish notification to Redis
  - `publishToUser(userId, notification)` - Convenience method with userId
  - `publishToUsers(userIds, notification)` - Broadcast to multiple users
  - `validate(notification)` - Validate notification payload
- Dependencies: redisService
- Does NOT handle delivery (SSE service does this)
- Does NOT store in Streams (SSE service does this on message receipt)

**notificationHelpers.ts**
- Responsibility: Factory functions for common notification types
- Interface:
  - `createSuccessNotification(userId, message, metadata?)` - Green/success notification
  - `createErrorNotification(userId, message, error?, metadata?)` - Red/error notification
  - `createInfoNotification(userId, message, metadata?)` - Blue/info notification
  - `createWarningNotification(userId, message, metadata?)` - Yellow/warning notification
  - `createSystemNotification(userId, message, metadata?)` - System-level notification
- Returns: Valid `NotificationEvent` objects ready to publish
- Pure functions (no side effects)

**notification.types.ts**
- Extended type definitions:
  - `NotificationSeverity` - Type alias for severity levels
  - `NotificationCategory` - Type alias for categories
  - `NotificationMetadata` - Common metadata structure
  - `CreateNotificationOptions` - Options for helper functions

**events.types.ts (modifications)**
- Extend `NotificationEvent` interface:
  - Add `severity?: NotificationSeverity` field
  - Add `title?: string` field (optional short title)
  - Add `message?: string` field (optional message body)
  - Refine `category` to use `NotificationCategory` type

### State Management

**NotificationService State:**
```typescript
class NotificationService {
  // NO STATE - Service is stateless
  // All state managed by:
  // - Redis Pub/Sub (transient messages)
  // - Redis Streams (event buffer, managed by SSE service)
  // - SSE connections (managed by SSE service)
}
```

**Why stateless:**
- Publishing is fire-and-forget (Pub/Sub characteristic)
- Delivery and storage handled by SSE service
- No need to track notification history in-memory
- State would not survive service restart anyway

### Libraries and Tools

**ioredis (Already Installed)**
- Used via `redisService.publish()`
- No direct usage in notification service

**uuid (May Need to Install)**
- For generating unique notification IDs
- Alternative: Use timestamp-based IDs (`Date.now() + '-' + Math.random()`)
- Alternative: Let Redis Stream generate ID on storage

**TypeScript**
- Strict type checking for notification payloads
- Discriminated unions for notification types
- Autocomplete for helper functions

## Implementation Blueprint

### Ordered Steps

#### 1. Extend Event Type Definitions

**Modify:** `src/prototype-2/backend/src/types/events.types.ts`

Add after existing `NotificationEvent` interface (around line 33):

```typescript
/**
 * Extended notification event with severity and display fields
 *
 * SPEC-EV-CO-005:008: Notification is informational, passive event
 */
export interface NotificationEvent extends PlatformEvent {
  type: 'notification';
  category?: 'system' | 'info' | 'success' | 'warning' | 'error'; // Already exists
  severity?: 'low' | 'normal' | 'high' | 'critical'; // NEW: Display urgency
  title?: string; // NEW: Optional short title for display
  message?: string; // NEW: Optional message body
  actionUrl?: string; // NEW: Optional link for "View Details"
  iconName?: string; // NEW: Optional Lucide icon name
}
```

**Details:**
- `severity` controls frontend display behavior (badge vs toast vs modal)
- `title` and `message` provide display content
- `actionUrl` enables click-through to related page
- `iconName` allows custom icons (e.g., "Mail", "Check", "AlertTriangle")

---

#### 2. Create Extended Notification Types

**Create:** `src/prototype-2/backend/src/types/notification.types.ts`

```typescript
/**
 * Notification Type Definitions
 *
 * Extended types for notification creation and validation.
 */

import type { NotificationEvent } from './events.types.js';

/**
 * Notification severity levels
 *
 * Controls display urgency in frontend:
 * - low: Background notification, minimal UI
 * - normal: Standard toast/badge
 * - high: Prominent toast, sound/vibration
 * - critical: Modal dialog, requires acknowledgment
 */
export type NotificationSeverity = 'low' | 'normal' | 'high' | 'critical';

/**
 * Notification category
 *
 * Controls visual styling (color, icon):
 * - system: Platform/system events (blue)
 * - info: Informational messages (blue)
 * - success: Successful operations (green)
 * - warning: Warnings/cautions (yellow)
 * - error: Errors/failures (red)
 */
export type NotificationCategory = 'system' | 'info' | 'success' | 'warning' | 'error';

/**
 * Options for creating notifications
 */
export interface CreateNotificationOptions {
  userId: string; // Target user ID
  title?: string; // Short title (e.g., "Email Sent")
  message: string; // Notification message body
  category?: NotificationCategory; // Visual category (default: 'info')
  severity?: NotificationSeverity; // Display urgency (default: 'normal')
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Event priority (SPEC-EV-PL-007)
  actionUrl?: string; // Optional click-through URL
  iconName?: string; // Optional Lucide icon name
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Notification validation result
 */
export interface NotificationValidation {
  valid: boolean;
  errors: string[];
}
```

**Details:**
- Clear documentation of each field's purpose
- Separate concerns: category (visual), severity (urgency), priority (event importance)
- Options interface simplifies helper function signatures

---

#### 3. Create Notification Service

**Create:** `src/prototype-2/backend/src/services/notificationService.ts`

```typescript
import { redisService } from './redis.service.js';
import type { NotificationEvent } from '../types/events.types.js';
import type { NotificationValidation } from '../types/notification.types.js';

/**
 * NotificationService
 *
 * Creates and publishes notification events to Redis.
 *
 * Responsibilities:
 * - Validate notification payloads
 * - Generate unique IDs
 * - Publish to Redis Pub/Sub
 * - Does NOT handle delivery (SSE service does this)
 * - Does NOT store in Streams (SSE service does this)
 *
 * SPEC References:
 * - SPEC-EV-CO-005:008: Notification concepts
 * - SPEC-EV-PL-001:012: Event payload structure
 * - SPEC-EV-PS-007: platform:notifications channel
 */
export class NotificationService {
  private readonly CHANNEL = 'platform:notifications';

  /**
   * Publish notification to Redis Pub/Sub
   *
   * SPEC-EV-PS-007: Publish to platform:notifications channel
   * SPEC-EV-AR-003:004: Events contain only minimal metadata
   *
   * @param notification - Notification event to publish
   * @returns Number of subscribers that received the notification
   * @throws Error if validation fails or publishing fails
   */
  async publish(notification: NotificationEvent): Promise<number> {
    // Validate notification
    const validation = this.validate(notification);
    if (!validation.valid) {
      throw new Error(`Invalid notification: ${validation.errors.join(', ')}`);
    }

    // Ensure ID exists (generate if missing)
    if (!notification.id) {
      notification.id = this.generateId();
    }

    // Ensure timestamp exists (generate if missing)
    if (!notification.timestamp) {
      notification.timestamp = new Date().toISOString();
    }

    try {
      // Publish to Redis Pub/Sub
      // SSE service will receive via subscription and handle delivery + storage
      const subscriberCount = await redisService.publish(this.CHANNEL, notification);

      console.log(
        `✅ Notification published: ${notification.id} (${subscriberCount} subscribers)`
      );

      return subscriberCount;
    } catch (error: any) {
      console.error('❌ Failed to publish notification:', {
        notificationId: notification.id,
        userId: notification.userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Publish notification to specific user (convenience method)
   *
   * @param userId - Target user ID
   * @param notification - Notification without userId
   * @returns Number of subscribers
   */
  async publishToUser(
    userId: string,
    notification: Omit<NotificationEvent, 'userId' | 'type'>
  ): Promise<number> {
    return this.publish({
      ...notification,
      type: 'notification',
      userId,
    } as NotificationEvent);
  }

  /**
   * Publish notification to multiple users (broadcast)
   *
   * @param userIds - Array of target user IDs
   * @param notification - Notification template
   * @returns Array of subscriber counts per user
   */
  async publishToUsers(
    userIds: string[],
    notification: Omit<NotificationEvent, 'userId' | 'type'>
  ): Promise<number[]> {
    const results = await Promise.all(
      userIds.map((userId) => this.publishToUser(userId, notification))
    );

    console.log(`✅ Notification broadcast to ${userIds.length} users`);

    return results;
  }

  /**
   * Validate notification payload
   *
   * SPEC-EV-PL-001:008: Required fields validation
   *
   * @param notification - Notification to validate
   * @returns Validation result with errors
   */
  validate(notification: Partial<NotificationEvent>): NotificationValidation {
    const errors: string[] = [];

    // SPEC-EV-PL-002: Must have type field
    if (!notification.type) {
      errors.push('Missing required field: type');
    } else if (notification.type !== 'notification') {
      errors.push(`Invalid type: expected 'notification', got '${notification.type}'`);
    }

    // SPEC-EV-PL-004: Must have userId or userIds
    if (!notification.userId && !notification.userIds) {
      errors.push('Missing required field: userId or userIds');
    }

    // Validate category if provided
    if (notification.category) {
      const validCategories = ['system', 'info', 'success', 'warning', 'error'];
      if (!validCategories.includes(notification.category)) {
        errors.push(`Invalid category: ${notification.category}`);
      }
    }

    // Validate priority if provided
    if (notification.priority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(notification.priority)) {
        errors.push(`Invalid priority: ${notification.priority}`);
      }
    }

    // Validate timestamp format if provided
    if (notification.timestamp && !this.isValidISODate(notification.timestamp)) {
      errors.push(`Invalid timestamp format: ${notification.timestamp} (must be ISO 8601)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate unique notification ID
   *
   * Uses timestamp + random suffix for uniqueness.
   * Format: notif_<timestamp>_<random>
   *
   * @returns Unique notification ID
   */
  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `notif_${timestamp}_${random}`;
  }

  /**
   * Validate ISO 8601 date string
   *
   * @param dateString - Date string to validate
   * @returns True if valid ISO 8601 format
   */
  private isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
```

**Details:**
- Stateless service focused only on publish operation
- SSE service handles delivery and storage (separation of concerns)
- Validation ensures data integrity before publishing
- Multiple publish methods for convenience (single user, multiple users)
- ID generation ensures uniqueness

**Pattern reference:** See `sse.service.ts` for singleton pattern, `eventRecovery.service.ts` for validation

---

#### 4. Create Notification Helper Functions

**Create:** `src/prototype-2/backend/src/utils/notificationHelpers.ts`

```typescript
import type { NotificationEvent } from '../types/events.types.js';
import type { CreateNotificationOptions } from '../types/notification.types.js';

/**
 * Notification Helper Functions
 *
 * Factory functions for creating common notification types.
 * Pure functions that return valid NotificationEvent objects.
 *
 * Usage in n8n workflows:
 * ```javascript
 * const { createSuccessNotification } = require('./utils/notificationHelpers');
 * const notification = createSuccessNotification(userId, 'Export completed', {
 *   actionUrl: '/exports/12345',
 *   metadata: { exportId: '12345' }
 * });
 * await notificationService.publish(notification);
 * ```
 */

/**
 * Create base notification with defaults
 */
function createNotification(options: CreateNotificationOptions): NotificationEvent {
  const {
    userId,
    title,
    message,
    category = 'info',
    severity = 'normal',
    priority = 'normal',
    actionUrl,
    iconName,
    metadata,
  } = options;

  return {
    type: 'notification',
    id: '', // Will be generated by service if empty
    userId,
    timestamp: new Date().toISOString(),
    category,
    severity,
    priority,
    title,
    message,
    actionUrl,
    iconName,
    data: metadata,
  };
}

/**
 * Create success notification (green)
 *
 * Used for: Successful operations, confirmations
 * Examples: "File uploaded", "Email sent", "Changes saved"
 *
 * @param userId - Target user ID
 * @param message - Success message
 * @param options - Additional options
 */
export function createSuccessNotification(
  userId: string,
  message: string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  return createNotification({
    userId,
    message,
    category: 'success',
    severity: 'normal',
    iconName: 'CheckCircle',
    ...options,
  });
}

/**
 * Create error notification (red)
 *
 * Used for: Failed operations, errors
 * Examples: "Failed to send email", "Upload failed", "Invalid data"
 *
 * @param userId - Target user ID
 * @param message - Error message
 * @param error - Optional error object (will be logged, not sent to user)
 * @param options - Additional options
 */
export function createErrorNotification(
  userId: string,
  message: string,
  error?: Error | string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  // Log error for debugging (don't send full error to frontend)
  if (error) {
    console.error('❌ Error notification:', {
      userId,
      message,
      error: error instanceof Error ? error.message : error,
    });
  }

  return createNotification({
    userId,
    message,
    category: 'error',
    severity: 'high',
    priority: 'high',
    iconName: 'AlertCircle',
    ...options,
  });
}

/**
 * Create info notification (blue)
 *
 * Used for: Informational messages, status updates
 * Examples: "Processing started", "New message", "User joined"
 *
 * @param userId - Target user ID
 * @param message - Info message
 * @param options - Additional options
 */
export function createInfoNotification(
  userId: string,
  message: string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  return createNotification({
    userId,
    message,
    category: 'info',
    severity: 'normal',
    iconName: 'Info',
    ...options,
  });
}

/**
 * Create warning notification (yellow)
 *
 * Used for: Warnings, cautions, non-critical issues
 * Examples: "Quota almost full", "Session expiring soon", "Deprecated feature"
 *
 * @param userId - Target user ID
 * @param message - Warning message
 * @param options - Additional options
 */
export function createWarningNotification(
  userId: string,
  message: string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  return createNotification({
    userId,
    message,
    category: 'warning',
    severity: 'normal',
    priority: 'normal',
    iconName: 'AlertTriangle',
    ...options,
  });
}

/**
 * Create system notification
 *
 * Used for: System-level events, platform updates
 * Examples: "System maintenance scheduled", "New feature available"
 *
 * @param userId - Target user ID
 * @param message - System message
 * @param options - Additional options
 */
export function createSystemNotification(
  userId: string,
  message: string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  return createNotification({
    userId,
    message,
    category: 'system',
    severity: 'low',
    iconName: 'Settings',
    ...options,
  });
}

/**
 * Create critical notification (modal-level urgency)
 *
 * Used for: Critical alerts requiring immediate attention
 * Examples: "Security alert", "Payment failed", "Account locked"
 *
 * @param userId - Target user ID
 * @param message - Critical message
 * @param options - Additional options
 */
export function createCriticalNotification(
  userId: string,
  message: string,
  options?: Partial<Omit<CreateNotificationOptions, 'userId' | 'message' | 'category'>>
): NotificationEvent {
  return createNotification({
    userId,
    message,
    category: 'error',
    severity: 'critical',
    priority: 'urgent',
    iconName: 'AlertOctagon',
    ...options,
  });
}
```

**Details:**
- Pure functions (no side effects)
- Sensible defaults for each notification type
- Icon names match Lucide React icon library
- Error logging for debugging (don't expose error details to frontend)
- Flexible options for customization

---

#### 5. Export Services (Optional)

**Modify:** `src/prototype-2/backend/src/services/index.ts` (if this file exists)

Add export:
```typescript
export { notificationService } from './notificationService.js';
```

If file doesn't exist, skip this step. Services can be imported directly.

---

### Error Handling Strategy

**Error Types:**

1. **Validation Errors**
   - Missing required fields (userId, type)
   - Invalid field values (category, priority)
   - Malformed timestamp
   - **Handling:** Throw descriptive error, log details

2. **Publishing Errors**
   - Redis connection failure
   - Channel publish failure
   - **Handling:** Log error with context, re-throw for caller

3. **Integration Errors**
   - SSE service not initialized (subscriber not listening)
   - Redis down
   - **Handling:** Log warning, publish will fail gracefully (Pub/Sub characteristic)

**Error Display Pattern:**

```typescript
// Validation errors - throw early
const validation = this.validate(notification);
if (!validation.valid) {
  throw new Error(`Invalid notification: ${validation.errors.join(', ')}`);
}

// Publishing errors - log and re-throw
try {
  await redisService.publish(channel, notification);
} catch (error: any) {
  console.error('❌ Failed to publish notification:', {
    notificationId: notification.id,
    userId: notification.userId,
    error: error.message,
  });
  throw error; // Caller decides how to handle
}

// Helper function errors - log but don't expose to user
if (error) {
  console.error('❌ Error notification:', {
    userId,
    message,
    error: error instanceof Error ? error.message : error,
  });
}
```

**Pattern reference:** See `redis.service.ts` for error logging, `sse.service.ts` for graceful degradation

---

### Files to Create

1. **`src/prototype-2/backend/src/services/notificationService.ts`**
   - NotificationService class
   - Publish methods (single, multiple users)
   - Validation logic
   - ID generation
   - Singleton export

2. **`src/prototype-2/backend/src/utils/notificationHelpers.ts`**
   - Factory functions for common notification types
   - Pure functions (no side effects)
   - Sensible defaults
   - Icon name mappings

3. **`src/prototype-2/backend/src/types/notification.types.ts`**
   - NotificationSeverity type
   - NotificationCategory type
   - CreateNotificationOptions interface
   - NotificationValidation interface

---

### Files to Modify

1. **`src/prototype-2/backend/src/types/events.types.ts`**
   - Extend `NotificationEvent` interface
   - Add: `severity`, `title`, `message`, `actionUrl`, `iconName` fields

2. **`src/prototype-2/backend/src/services/index.ts`** (if exists)
   - Export notificationService

---

## Validation Gates

### Development Testing

```bash
# Terminal 1 - Start Redis (required)
redis-server

# Terminal 2 - Start Backend with SSE
cd src/prototype-2/backend
npm run dev

# Terminal 3 - Test notification publishing
node
```

```javascript
// In Node.js REPL (Terminal 3)
const { notificationService } = require('./dist/services/notificationService.js');
const { createSuccessNotification } = require('./dist/utils/notificationHelpers.js');

// Create and publish success notification
const notification = createSuccessNotification('user_123', 'Test notification', {
  title: 'Test',
  actionUrl: '/test'
});

await notificationService.publish(notification);
// Expected: "✅ Notification published: notif_<id> (1 subscribers)"

// Test validation
const invalid = { type: 'notification' }; // Missing userId
await notificationService.publish(invalid);
// Expected: Error "Invalid notification: Missing required field: userId or userIds"
```

```bash
# Terminal 4 - Monitor Redis Pub/Sub
redis-cli SUBSCRIBE platform:notifications

# Expected: See published notification JSON
```

```bash
# Terminal 5 - Connect SSE and verify delivery
curl -N "http://localhost:3000/api/events/stream?token=<JWT>"

# Expected: Receive notification event when published
```

### Type Checking

```bash
cd src/prototype-2/backend
npm run type-check

# Expected: No TypeScript errors
```

### Build Verification

```bash
cd src/prototype-2/backend
npm run build

# Expected: Successful compilation to dist/
# Files created:
# - dist/services/notificationService.js
# - dist/utils/notificationHelpers.js
# - dist/types/notification.types.d.ts
# - dist/types/events.types.d.ts (updated)
```

### Manual Testing Checklist

**Validation:**
- [ ] Notification without userId is rejected
- [ ] Notification without type is rejected
- [ ] Invalid category value is rejected
- [ ] Invalid priority value is rejected
- [ ] Invalid timestamp format is rejected
- [ ] Valid notification passes validation

**Publishing:**
- [ ] Notification is published to Redis channel
- [ ] SSE service receives notification
- [ ] Notification is stored in Redis Stream
- [ ] Online user receives notification via SSE
- [ ] Offline user notification stored for recovery

**Helper Functions:**
- [ ] createSuccessNotification creates green notification
- [ ] createErrorNotification creates red notification
- [ ] createInfoNotification creates blue notification
- [ ] createWarningNotification creates yellow notification
- [ ] createSystemNotification creates system notification
- [ ] createCriticalNotification has urgent priority
- [ ] All helpers set appropriate icons

**Integration:**
- [ ] Notification appears in SSE stream
- [ ] Notification has unique ID
- [ ] Notification has ISO 8601 timestamp
- [ ] Multiple users receive broadcast notifications
- [ ] Error notifications log error details (not sent to user)

### Unit Testing (Future Enhancement)

```typescript
// Example test structure (not implemented in this task)
describe('NotificationService', () => {
  describe('validate', () => {
    it('should reject notification without userId', () => {
      const result = notificationService.validate({
        type: 'notification',
        timestamp: new Date().toISOString(),
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: userId or userIds');
    });
  });

  describe('publish', () => {
    it('should publish notification to Redis', async () => {
      const notification = createInfoNotification('user_123', 'Test');
      await expect(notificationService.publish(notification)).resolves.toBeDefined();
    });
  });
});
```

---

## References

**Specifications:**
- [SPEC-events.md](D:\sources\codr.studio\platform\spec\SPEC-events.md) - Complete event system specification
  - Lines 22-30: Notification concepts (SPEC-EV-CO-005:008)
  - Lines 224-284: Event payload structure
  - Lines 85-93: Redis Pub/Sub channels (SPEC-EV-PS-007)

**Codebase Examples:**
- `src/prototype-2/backend/src/services/sse.service.ts` - Event delivery mechanism
- `src/prototype-2/backend/src/services/redis.service.ts` - Redis Pub/Sub operations
- `src/prototype-2/backend/src/services/eventRecovery.service.ts` - Validation pattern
- `src/prototype-2/backend/src/types/events.types.ts` - Event type definitions

**External Documentation:**
- [Redis Pub/Sub Documentation](https://redis.io/docs/manual/pubsub/) - Redis Pub/Sub concepts
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601) - Timestamp format standard
- [Lucide Icons](https://lucide.dev/) - Icon library for frontend display
