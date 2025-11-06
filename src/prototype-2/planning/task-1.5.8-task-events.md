# Task Plan: 1.5.8 - Implementar Task events

## Context and Objective

### What Will Be Implemented
Task events are a specialized type of platform event that represent asynchronous operations requiring user awareness or interaction. Unlike notification events (which are passive, informational-only), task events track the lifecycle of background jobs, long-running operations, and processes that may require user action or monitoring.

### Why It's Needed
Task events enable the platform to:
- Track progress of asynchronous operations (file uploads, data processing, batch operations)
- Notify users when long-running jobs complete or fail
- Provide real-time progress updates during multi-step workflows
- Allow user interaction with running jobs (cancel, retry, pause)
- Recover job status after disconnection/reconnection

### How It Integrates
Task events integrate with the existing SSE event system (tasks 1.5.1-1.5.6):
- **Backend**: Publishes task events to Redis Pub/Sub channels
- **SSE Service**: Routes task events to connected users via SSE streams
- **Redis Streams**: Buffers task events for offline recovery
- **Frontend** (future task 1.5.9-1.5.11): Receives and displays task progress/status

### Business Value
- **User Experience**: Users stay informed about background operations without polling
- **Transparency**: Clear visibility into job execution and failures
- **Resilience**: Jobs continue running even if user disconnects
- **Accountability**: Audit trail of all job executions and outcomes

### User Impact
Users can:
- See real-time progress of uploads, exports, batch operations
- Receive notifications when jobs complete successfully
- Be alerted immediately when jobs fail with actionable error information
- Resume monitoring jobs after reconnecting (offline recovery)
- Cancel or retry failed jobs (interaction support)

---

## Dependencies

### Prerequisite Tasks
- **1.5.1** - SSE endpoint (`/api/events/stream`) - ✅ Complete
- **1.5.2** - Heartbeat and keepalive - ✅ Complete (integrated in SSE service)
- **1.5.3** - Reconnection support (Last-Event-ID) - ✅ Complete
- **1.5.4** - Redis Pub/Sub configuration - ✅ Complete
- **1.5.5** - Redis Streams for buffering - ✅ Complete
- **1.5.6** - Offline recovery mechanism - ✅ Complete

### Files/Modules Affected

**Files to Modify:**
- `backend/src/types/events.types.ts` - Extend TaskEvent interface with job-specific fields
- `backend/src/services/sse.service.ts` - No changes needed (already routes task events)
- `backend/src/services/redis.service.ts` - No changes needed (publish already implemented)

**Files to Create:**
- `backend/src/services/taskEvents.service.ts` - Task event publishing helpers
- `backend/src/types/job.types.ts` - Job-specific type definitions
- `backend/src/utils/taskEventHelpers.ts` - Utility functions for task lifecycle

### Enables Tasks
- **1.5.9** - Frontend SSE client (will consume task events)
- **1.5.10** - Frontend event handlers (will process task events)
- **1.5.11** - TanStack Query integration with events (will invalidate on task completion)
- **3.7.x** - Tasks Module (will display and manage task events)

### External Dependencies
- `ioredis` (v5.3.2) - Already installed, Redis client for Pub/Sub
- No new external dependencies required

---

## Patterns Identified in Codebase

### Similar Components/Modules

#### Existing Event System
- **`backend/src/types/events.types.ts`** - Base event type definitions
  - Already defines `TaskEvent` interface with basic structure
  - Pattern: Type-safe event payloads with discriminated unions
  - Relevance: Task events extend this base structure

- **`backend/src/services/sse.service.ts`** - SSE connection and routing
  - Pattern: Maps userId to Express Response for streaming
  - Pattern: Stores events in Redis Stream before sending via SSE
  - Pattern: Handles offline users gracefully (events stay in Stream)
  - Relevance: Task events use identical delivery mechanism

- **`backend/src/services/redis.service.ts`** - Redis operations
  - Pattern: `publish(channel, message)` for Pub/Sub
  - Pattern: `xadd(streamKey, event)` for Stream buffering
  - Relevance: Task events use same Redis operations

### Conventions to Follow

#### Naming Conventions
```typescript
// Event type naming: descriptive present/past tense
type: 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled'

// Service naming: purpose + "Service"
taskEventsService

// Function naming: imperative verbs
publishTaskStarted()
publishTaskProgress()
publishTaskCompleted()
publishTaskFailed()
publishTaskCancelled()

// Type naming: purpose + type suffix
JobStatus, JobMetadata, TaskEventData
```

#### File Structure
```
backend/src/
├── types/
│   ├── events.types.ts       # Base event types (already exists)
│   └── job.types.ts           # Job-specific types (NEW)
├── services/
│   ├── sse.service.ts        # SSE routing (already exists)
│   ├── redis.service.ts      # Redis operations (already exists)
│   └── taskEvents.service.ts # Task event publishing (NEW)
└── utils/
    └── taskEventHelpers.ts   # Helper functions (NEW)
```

#### Import/Export Patterns
```typescript
// Named exports for services (singleton pattern)
export const taskEventsService = new TaskEventsService();

// Type exports
export type { JobStatus, JobMetadata, TaskEventPayload };

// Re-export from index when creating modules
export { taskEventsService } from './services/taskEvents.service.js';
```

#### State Management
- Task events are **stateless** - they represent immutable snapshots of job state
- Job state persistence is NOT part of this task (handled by queue system or n8n)
- Events only communicate state changes, not store state

#### Error Handling
```typescript
// Pattern from redis.service.ts and sse.service.ts
try {
  await redisService.publish(channel, event);
  console.log(`✅ Task event published: ${event.type}`);
} catch (error) {
  console.error(`❌ Failed to publish task event:`, error);
  // IMPORTANT: Do not throw - event publication failures should not crash workflows
  // Events are best-effort delivery
}
```

### Reusable Code Examples

#### Publishing Events via Redis (from redis.service.ts)
```typescript
// File: backend/src/services/redis.service.ts
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

#### Handling Events in SSE Service (from sse.service.ts)
```typescript
// File: backend/src/services/sse.service.ts
private async handleRedisMessage(_channel: string, message: string): Promise<void> {
  try {
    const event: PlatformEvent = JSON.parse(message);

    if (!event.userId) {
      console.warn('⚠️  Event missing userId, cannot route:', event);
      return;
    }

    // Store in Redis Stream for offline recovery
    const streamKey = `events:${event.userId}`;
    try {
      const streamId = await redisService.xadd(streamKey, event);
      if (!event.id) {
        event.id = streamId;
      }
    } catch (error) {
      console.error(`❌ Failed to store event in stream ${streamKey}:`, error);
      // Continue with delivery even if stream storage fails
    }

    // Send to connected user
    const connection = this.connections.get(event.userId);
    if (!connection) {
      console.log(`ℹ️  User ${event.userId} not connected, event stored for recovery`);
      return;
    }

    this.sendEventToConnection(connection, event);
  } catch (error) {
    console.error('❌ Error handling Redis message:', error, message);
  }
}
```

#### Event Type Definitions (from events.types.ts)
```typescript
// File: backend/src/types/events.types.ts
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

export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'completed' | 'cancelled';
  category?: string; // e.g., 'email_approval', 'data_validation'
}
```

---

## Critical Context

### Documentation

#### SPEC-events.md - Task Event Requirements
- **SPEC-EV-CO-009:013** - Task event definition and characteristics
  - Tasks require user action (interactive, not just informational)
  - Tasks have lifecycle status (pending → running → completed/failed/cancelled)
  - Tasks may contain embedded forms or interaction options
  - Examples: job progress, approval workflows, error recovery decisions

- **SPEC-EV-PL-001:017** - Event payload structure
  - Must be valid JSON
  - Must include: `type`, `id`, `userId`/`userIds`, `timestamp`
  - May include: `category`, `priority`, `data`
  - Payload must be small (< 1KB recommended)
  - Full data fetched separately via JQEL

- **SPEC-EV-PS-005:012** - Pub/Sub channels
  - Global: `platform:events`
  - Type-specific: `platform:tasks`
  - User-specific: `platform:events:user:<userId>`

- **SPEC-EV-ST-001:016** - Redis Streams for buffering
  - Stream per user: `events:<userId>`
  - Retention: 1000 messages OR 24 hours (whichever comes first)
  - Recovery via XREAD with Last-Event-ID

- **SPEC-EV-QUEUE-001:011** - Queue events integration
  - Workers emit SSE events when jobs complete/fail
  - Event types: `job-completed`, `job-failed`, `job-progress`
  - Must include `jobId`, `queueName`, `status`, optional `progress`/`result`/`error`

#### Redis Documentation
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/) - Fire-and-forget messaging
- [Redis Streams](https://redis.io/docs/data-types/streams/) - Persistent event log with recovery

### Gotchas and Pitfalls

#### Event Publishing
- ⚠️ **Best-effort delivery**: Event publication failures should NOT crash workflows
  - Log errors but continue execution
  - SSE system handles offline users gracefully (events in Stream)

- ⚠️ **Payload size limits**: Keep events small (< 1KB)
  - Do NOT send full job results in events
  - Send only references (jobId) and metadata (status, progress)
  - Frontend fetches full data via JQEL when needed

- ⚠️ **No duplicate channel subscriptions**: SSE service already subscribes to `platform:tasks`
  - Do NOT create new subscriptions in this task
  - Simply publish to existing channels

#### Job Status Tracking
- ⚠️ **Events are not state storage**: Task events represent state changes, not current state
  - For current job status, query via JQEL (schema `backend` or `system`)
  - Events are for notification and invalidation triggers

- ⚠️ **Progress calculation**: Progress must be 0-100 integer
  - Validate before publishing to avoid client-side errors
  - Use `Math.min(100, Math.max(0, Math.round(progress)))` pattern

#### Redis Stream IDs
- ⚠️ **Auto-generated IDs**: Redis generates Stream IDs automatically (`*` parameter)
  - Format: `<timestamp-ms>-<sequence>` (e.g., "1730808600000-0")
  - Use stream ID as event.id if not already set
  - See pattern in `sse.service.ts:121-124`

#### TypeScript Type Safety
- ⚠️ **Discriminated unions**: Use `type` field for type narrowing
  ```typescript
  // Correct pattern
  if (event.type === 'job-progress') {
    // TypeScript knows event.data.progress exists
    const progress = event.data.progress;
  }
  ```

### Existing Patterns to Follow

#### Service Initialization Pattern
- See `sse.service.ts:46-98` - Lazy initialization with safety checks
- See `redis.service.ts:46-80` - Connection pooling and retry logic

#### Error Logging Pattern
- ✅ Emoji prefixes: `✅` success, `❌` error, `ℹ️` info, `⚠️` warning
- ✅ Structured logs with context: `console.error('❌ Context:', { userId, jobId, error });`
- ✅ Don't throw on non-critical errors (event delivery is best-effort)

#### Channel Naming Pattern
- Defined in `events.types.ts:68-73`
- Use constants: `EVENT_CHANNELS.TASKS`, `EVENT_CHANNELS.GLOBAL`
- User-specific: `${EVENT_CHANNELS.USER_PREFIX}${userId}`

---

## Technical Specification

### Architecture

```
backend/src/
├── types/
│   ├── events.types.ts          # (MODIFY) Extend TaskEvent with job fields
│   └── job.types.ts              # (NEW) Job-specific type definitions
├── services/
│   ├── taskEvents.service.ts    # (NEW) Task event publishing service
│   ├── sse.service.ts           # (NO CHANGE) Already routes task events
│   └── redis.service.ts         # (NO CHANGE) Already has publish/xadd
└── utils/
    └── taskEventHelpers.ts      # (NEW) Helper utilities for task lifecycle
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  n8n Workflow / Backend Worker                                  │
│  - Job starts/progresses/completes/fails                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Call: taskEventsService.publishTaskStarted()
                      │       taskEventsService.publishTaskProgress()
                      │       taskEventsService.publishTaskCompleted()
                      │       taskEventsService.publishTaskFailed()
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  TaskEventsService                                              │
│  - Validates payload                                             │
│  - Adds timestamp, generates event ID                           │
│  - Publishes to Redis Pub/Sub (platform:tasks)                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Redis PUBLISH → channel: platform:tasks
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  Redis Pub/Sub                                                   │
│  - Delivers event to all subscribers immediately                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Message received by subscriber
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  SSEService.handleRedisMessage()                                │
│  1. Parse event JSON                                             │
│  2. Store in Redis Stream (events:<userId>) for recovery        │
│  3. Check if user connected                                      │
│  4. If connected: send via SSE (res.write())                    │
│  5. If offline: event remains in Stream for recovery            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ SSE data: {event}\n\n
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│  Frontend EventSource (future task 1.5.9)                       │
│  - Receives event                                                │
│  - Parses JSON                                                   │
│  - Invalidates TanStack Query cache                             │
│  - Updates UI with progress/status                              │
└─────────────────────────────────────────────────────────────────┘
```

### Modules and Responsibilities

#### TaskEventsService (`taskEvents.service.ts`)
**Responsibility**: Publish task lifecycle events to Redis Pub/Sub

**Public Methods**:
```typescript
// Publish job started event
publishTaskStarted(params: TaskStartedParams): Promise<void>

// Publish job progress event (with percentage)
publishTaskProgress(params: TaskProgressParams): Promise<void>

// Publish job completed event (success)
publishTaskCompleted(params: TaskCompletedParams): Promise<void>

// Publish job failed event (with error details)
publishTaskFailed(params: TaskFailedParams): Promise<void>

// Publish job cancelled event (user or system initiated)
publishTaskCancelled(params: TaskCancelledParams): Promise<void>

// Generic publish (internal use)
private publish(event: TaskEventPayload): Promise<void>
```

**Interface**:
- Accepts job metadata (jobId, userId, queueName, etc.)
- Validates inputs (required fields, progress range)
- Constructs properly formatted event payload
- Publishes to `platform:tasks` channel
- Logs success/failure without throwing

**Dependencies**:
- `redisService.publish()` - For Pub/Sub
- Event type definitions from `events.types.ts` and `job.types.ts`

#### Job Types Module (`job.types.ts`)
**Responsibility**: Define TypeScript types for job-related data

**Exports**:
```typescript
// Job execution status
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Job metadata
export interface JobMetadata {
  jobId: string;
  queueName: string;
  userId: string;
  startTime?: string; // ISO 8601
  endTime?: string;   // ISO 8601
}

// Task event payloads (parameters for publish methods)
export interface TaskStartedParams {
  jobId: string;
  userId: string;
  queueName: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface TaskProgressParams extends TaskStartedParams {
  progress: number; // 0-100
  message?: string; // Optional status message
}

export interface TaskCompletedParams extends TaskStartedParams {
  result?: any; // Keep small - full result fetched via JQEL
  metadata?: Record<string, any>;
}

export interface TaskFailedParams extends TaskStartedParams {
  error: string; // Error message
  errorCode?: string; // Machine-readable code
  retryable?: boolean; // Can user retry?
  metadata?: Record<string, any>;
}

export interface TaskCancelledParams extends TaskStartedParams {
  reason?: string; // Cancellation reason
  cancelledBy?: 'user' | 'system';
}

// Task event data structure (stored in event.data field)
export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: JobStatus;
  progress?: number;
  result?: any;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
  reason?: string;
  cancelledBy?: 'user' | 'system';
  metadata?: Record<string, any>;
}
```

#### Task Event Helpers (`taskEventHelpers.ts`)
**Responsibility**: Utility functions for task event construction and validation

**Functions**:
```typescript
// Generate unique event ID
export function generateEventId(prefix: string = 'evt'): string

// Validate progress value (0-100)
export function validateProgress(progress: number): number

// Create timestamp in ISO 8601 format
export function createTimestamp(): string

// Construct complete event payload
export function buildTaskEvent(
  type: TaskEventType,
  params: TaskEventParams
): TaskEventPayload

// Validate required fields
export function validateTaskEventParams(params: any): void
```

### State Management

**No state management required** - Task events are stateless notifications.

- Events represent immutable snapshots of job state at a point in time
- No in-memory state tracking in TaskEventsService
- Job state persistence handled by:
  - Queue system (e.g., Bull, BullMQ) OR
  - n8n workflow data store OR
  - Custom job tracking via JQEL (schema `backend` or `system`)

### Libraries and Tools

#### ioredis (v5.3.2) - Already Installed
**Usage**: Redis client for Pub/Sub and Streams
**Specific Features**:
- `client.publish(channel, message)` - Pub/Sub publishing
- `client.xadd(stream, ...)` - Add to Stream (handled by redisService)
- Already configured in `redis.service.ts`

**No new external dependencies required.**

---

## Implementation Blueprint

### Ordered Steps

#### Step 1: Extend Event Type Definitions
**File**: `backend/src/types/events.types.ts`

**Action**: Modify existing `TaskEvent` interface to include job-specific fields

**Details**:
```typescript
// Add to existing TaskEvent interface
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'; // Already exists
  category?: string; // Already exists

  // NEW: Add data field with task-specific structure
  data?: TaskEventData;
}

// Update PlatformEvent type union to include job event types
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled';
  // ... rest of interface
}
```

**Pattern**: See existing `JobEvent` interface in `events.types.ts:51-61` for reference structure

---

#### Step 2: Create Job Type Definitions
**File**: `backend/src/types/job.types.ts` (NEW)

**Action**: Create comprehensive job-related type definitions

**Details**:
```typescript
/**
 * Job Type Definitions
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task events and lifecycle
 * - SPEC-EV-QUEUE-001:011: Queue event integration
 */

// Job execution status
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Job metadata
export interface JobMetadata {
  jobId: string;
  queueName: string;
  userId: string;
  startTime?: string; // ISO 8601
  endTime?: string;   // ISO 8601
}

// Task event type discriminator
export type TaskEventType =
  | 'job-started'
  | 'job-progress'
  | 'job-completed'
  | 'job-failed'
  | 'job-cancelled';

// Base parameters for all task events
export interface BaseTaskParams {
  jobId: string;
  userId: string;
  queueName: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

// Task started event parameters
export interface TaskStartedParams extends BaseTaskParams {
  estimatedDuration?: number; // seconds
}

// Task progress event parameters
export interface TaskProgressParams extends BaseTaskParams {
  progress: number; // 0-100
  message?: string; // Human-readable status
  currentStep?: string; // "Processing file 2 of 10"
}

// Task completed event parameters
export interface TaskCompletedParams extends BaseTaskParams {
  result?: any; // Keep minimal - full result via JQEL
  duration?: number; // seconds
}

// Task failed event parameters
export interface TaskFailedParams extends BaseTaskParams {
  error: string; // Error message
  errorCode?: string; // Machine-readable error code
  retryable?: boolean; // Can job be retried?
  retryCount?: number; // Number of retries attempted
  stack?: string; // Stack trace (for debugging, not shown to user)
}

// Task cancelled event parameters
export interface TaskCancelledParams extends BaseTaskParams {
  reason?: string; // Cancellation reason
  cancelledBy?: 'user' | 'system' | 'timeout';
}

// Union type for all task event parameters
export type TaskEventParams =
  | TaskStartedParams
  | TaskProgressParams
  | TaskCompletedParams
  | TaskFailedParams
  | TaskCancelledParams;

// Task event data structure (stored in event.data field)
export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: JobStatus;

  // Progress-specific fields
  progress?: number;
  message?: string;
  currentStep?: string;
  estimatedDuration?: number;

  // Completion-specific fields
  result?: any;
  duration?: number;

  // Failure-specific fields
  error?: string;
  errorCode?: string;
  retryable?: boolean;
  retryCount?: number;

  // Cancellation-specific fields
  reason?: string;
  cancelledBy?: 'user' | 'system' | 'timeout';

  // Generic metadata
  metadata?: Record<string, any>;
}

// Complete task event payload (published to Redis)
export interface TaskEventPayload {
  type: TaskEventType;
  id: string;
  userId: string;
  timestamp: string; // ISO 8601
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data: TaskEventData;
}
```

**Pattern**: Similar to existing `JobEvent` interface but more comprehensive

---

#### Step 3: Create Task Event Helpers
**File**: `backend/src/utils/taskEventHelpers.ts` (NEW)

**Action**: Create utility functions for event construction and validation

**Details**:
```typescript
import type { TaskEventType, TaskEventParams, TaskEventPayload, TaskEventData } from '../types/job.types.js';

/**
 * Task Event Helper Functions
 *
 * Utilities for constructing, validating, and formatting task events.
 *
 * SPEC References:
 * - SPEC-EV-PL-001:012: Event payload structure
 * - SPEC-EV-PL-009:012: Payload size and content restrictions
 */

/**
 * Generate unique event ID
 *
 * Format: evt_<timestamp>_<random6chars>
 * Example: evt_1730808600000_a4f2e9
 */
export function generateEventId(prefix: string = 'evt'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate and normalize progress value
 *
 * Ensures progress is integer between 0-100.
 *
 * @param progress - Raw progress value
 * @returns Clamped integer 0-100
 * @throws Error if progress is NaN
 */
export function validateProgress(progress: number): number {
  if (isNaN(progress)) {
    throw new Error('Progress must be a number');
  }

  // Clamp to 0-100 and round to integer
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Create ISO 8601 timestamp
 *
 * @returns Current timestamp in ISO 8601 format
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate required task event parameters
 *
 * @param params - Event parameters to validate
 * @throws Error if required fields missing or invalid
 */
export function validateTaskEventParams(params: any): void {
  if (!params) {
    throw new Error('Task event parameters are required');
  }

  if (!params.jobId || typeof params.jobId !== 'string') {
    throw new Error('jobId is required and must be a string');
  }

  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string');
  }

  if (!params.queueName || typeof params.queueName !== 'string') {
    throw new Error('queueName is required and must be a string');
  }

  // Validate priority if provided
  if (params.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(params.priority)) {
      throw new Error(`Invalid priority: ${params.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }
  }
}

/**
 * Map event type to job status
 */
function getStatusForEventType(type: TaskEventType): string {
  switch (type) {
    case 'job-started':
      return 'running';
    case 'job-progress':
      return 'running';
    case 'job-completed':
      return 'completed';
    case 'job-failed':
      return 'failed';
    case 'job-cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

/**
 * Build complete task event payload
 *
 * Constructs fully-formed event ready for Redis publishing.
 *
 * @param type - Task event type
 * @param params - Event parameters
 * @returns Complete task event payload
 */
export function buildTaskEvent(type: TaskEventType, params: TaskEventParams): TaskEventPayload {
  // Validate required fields
  validateTaskEventParams(params);

  // Extract base fields
  const { jobId, userId, queueName, category, priority, metadata, ...rest } = params;

  // Build data object based on event type
  const data: TaskEventData = {
    jobId,
    queueName,
    status: getStatusForEventType(type) as any,
    metadata,
    ...rest, // Include type-specific fields (progress, error, result, etc.)
  };

  // Validate progress if present
  if ('progress' in rest && typeof rest.progress === 'number') {
    data.progress = validateProgress(rest.progress);
  }

  // Build complete payload
  const payload: TaskEventPayload = {
    type,
    id: generateEventId(),
    userId,
    timestamp: createTimestamp(),
    category,
    priority: priority || 'normal',
    data,
  };

  return payload;
}

/**
 * Calculate estimated completion time
 *
 * @param startTime - Job start time (ISO 8601)
 * @param progress - Current progress (0-100)
 * @returns Estimated completion time (ISO 8601) or null if not calculable
 */
export function calculateEstimatedCompletion(startTime: string, progress: number): string | null {
  if (progress === 0) return null;

  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = now - start;

  // Calculate estimated total duration based on progress
  const estimatedTotal = (elapsed / progress) * 100;
  const estimatedCompletion = start + estimatedTotal;

  return new Date(estimatedCompletion).toISOString();
}

/**
 * Sanitize error for event payload
 *
 * Removes sensitive information and limits size.
 *
 * @param error - Error object or message
 * @returns Sanitized error string
 */
export function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    return error.substring(0, 500); // Limit to 500 chars
  }

  if (error instanceof Error) {
    return error.message.substring(0, 500);
  }

  return String(error).substring(0, 500);
}
```

**Pattern**: Similar utility pattern seen throughout codebase (validation + construction helpers)

---

#### Step 4: Create Task Events Service
**File**: `backend/src/services/taskEvents.service.ts` (NEW)

**Action**: Implement task event publishing service

**Details**:
```typescript
import { redisService } from './redis.service.js';
import { EVENT_CHANNELS } from '../types/events.types.js';
import { buildTaskEvent, sanitizeError } from '../utils/taskEventHelpers.js';
import type {
  TaskStartedParams,
  TaskProgressParams,
  TaskCompletedParams,
  TaskFailedParams,
  TaskCancelledParams,
  TaskEventPayload,
} from '../types/job.types.js';

/**
 * Task Events Service
 *
 * Publishes task lifecycle events to Redis Pub/Sub for SSE delivery.
 *
 * Features:
 * - Type-safe event construction
 * - Automatic validation and sanitization
 * - Best-effort delivery (errors logged, not thrown)
 * - Integration with existing SSE event system
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task event requirements
 * - SPEC-EV-QUEUE-001:011: Queue event integration
 * - SPEC-EV-PS-009:012: Pub/Sub publishing
 * - SPEC-EV-PL-001:017: Event payload structure
 */
export class TaskEventsService {
  /**
   * Publish job started event
   *
   * Notifies user that an asynchronous job has begun execution.
   *
   * @param params - Job start parameters
   *
   * @example
   * await taskEventsService.publishTaskStarted({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   priority: 'normal',
   *   metadata: { filename: 'data.csv', size: 1048576 }
   * });
   */
  async publishTaskStarted(params: TaskStartedParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-started', params);
      await this.publish(event);
      console.log(`✅ Task started event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task started event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job progress event
   *
   * Updates user on job execution progress (0-100%).
   *
   * @param params - Job progress parameters
   *
   * @example
   * await taskEventsService.publishTaskProgress({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   progress: 45,
   *   message: 'Processing rows 450/1000',
   *   currentStep: 'Validating data'
   * });
   */
  async publishTaskProgress(params: TaskProgressParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-progress', params);
      await this.publish(event);
      console.log(`ℹ️  Task progress event published: ${params.jobId} (${params.progress}%)`);
    } catch (error) {
      console.error(`❌ Failed to publish task progress event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job completed event
   *
   * Notifies user that job finished successfully.
   *
   * @param params - Job completion parameters
   *
   * @example
   * await taskEventsService.publishTaskCompleted({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   result: { rowsProcessed: 1000, errors: 0 },
   *   duration: 45
   * });
   */
  async publishTaskCompleted(params: TaskCompletedParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-completed', params);
      await this.publish(event);
      console.log(`✅ Task completed event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task completed event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job failed event
   *
   * Notifies user that job failed with error details.
   *
   * @param params - Job failure parameters
   *
   * @example
   * await taskEventsService.publishTaskFailed({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   error: 'Invalid CSV format: missing header row',
   *   errorCode: 'INVALID_FORMAT',
   *   retryable: true
   * });
   */
  async publishTaskFailed(params: TaskFailedParams): Promise<void> {
    try {
      // Sanitize error message
      const sanitizedParams = {
        ...params,
        error: sanitizeError(params.error),
      };

      const event = buildTaskEvent('job-failed', sanitizedParams);
      await this.publish(event);
      console.log(`❌ Task failed event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task failed event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job cancelled event
   *
   * Notifies user that job was cancelled (by user or system).
   *
   * @param params - Job cancellation parameters
   *
   * @example
   * await taskEventsService.publishTaskCancelled({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   reason: 'User requested cancellation',
   *   cancelledBy: 'user'
   * });
   */
  async publishTaskCancelled(params: TaskCancelledParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-cancelled', params);
      await this.publish(event);
      console.log(`ℹ️  Task cancelled event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task cancelled event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish event to Redis Pub/Sub
   *
   * Internal method - publishes to platform:tasks channel.
   * SSE service listens to this channel and routes to connected users.
   *
   * SPEC-EV-PS-007: Type-specific channel platform:tasks
   * SPEC-EV-PS-010: Message must be JSON
   * SPEC-EV-PS-011: Publishing must be async (non-blocking)
   *
   * @param event - Complete task event payload
   */
  private async publish(event: TaskEventPayload): Promise<void> {
    try {
      // Publish to task-specific channel
      // SPEC-EV-PS-007: platform:tasks channel
      const subscriberCount = await redisService.publish(EVENT_CHANNELS.TASKS, event);

      console.log(`ℹ️  Published ${event.type} to ${EVENT_CHANNELS.TASKS}: ${subscriberCount} subscribers`);
    } catch (error: any) {
      console.error(`❌ Redis publish failed:`, {
        eventType: event.type,
        eventId: event.id,
        error: error.message,
      });

      // SPEC-EV-PS-012: Error in publication should not interrupt workflow
      // Log and continue - do not throw
    }
  }
}

// Export singleton instance
export const taskEventsService = new TaskEventsService();
```

**Pattern**: Service singleton pattern from `sse.service.ts` and `redis.service.ts`

---

#### Step 5: Update Service Index (Optional but Recommended)
**File**: `backend/src/services/index.ts`

**Action**: Export new task events service

**Details**:
```typescript
// Add to existing exports
export { taskEventsService } from './taskEvents.service.js';
```

**Pattern**: Centralized service exports (if `index.ts` exists)

---

#### Step 6: Create Usage Examples (Documentation)
**File**: `backend/src/services/taskEvents.service.ts` (add JSDoc examples)

**Action**: Document usage patterns for n8n/worker integration

**Details**: Add comprehensive JSDoc examples at top of service file:

```typescript
/**
 * USAGE EXAMPLES
 *
 * === In n8n Workflow ===
 *
 * Use Function node with this code:
 *
 * ```javascript
 * // Import (if available in n8n environment)
 * const { taskEventsService } = require('./services');
 *
 * // Or use direct Redis client in n8n
 * const Redis = require('ioredis');
 * const redis = new Redis(process.env.REDIS_URL);
 *
 * // Publish job started
 * const event = {
 *   type: 'job-started',
 *   id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
 *   userId: $json.userId,
 *   timestamp: new Date().toISOString(),
 *   category: 'email_processing',
 *   priority: 'normal',
 *   data: {
 *     jobId: $json.jobId,
 *     queueName: 'email-queue',
 *     status: 'running'
 *   }
 * };
 *
 * await redis.publish('platform:tasks', JSON.stringify(event));
 * return event;
 * ```
 *
 * === In Backend Worker ===
 *
 * ```typescript
 * import { taskEventsService } from './services';
 *
 * // Job started
 * await taskEventsService.publishTaskStarted({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   priority: 'high',
 *   metadata: { filename: job.data.filename }
 * });
 *
 * // Job progress (25%)
 * await taskEventsService.publishTaskProgress({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   progress: 25,
 *   message: 'Validating data format...',
 *   currentStep: '1/4'
 * });
 *
 * // Job progress (50%)
 * await taskEventsService.publishTaskProgress({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   progress: 50,
 *   message: 'Importing rows...',
 *   currentStep: '2/4'
 * });
 *
 * // Job completed
 * await taskEventsService.publishTaskCompleted({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   result: { rowsImported: 1500, errors: 0 },
 *   duration: 120
 * });
 *
 * // OR Job failed
 * await taskEventsService.publishTaskFailed({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   error: 'Invalid data format in row 42',
 *   errorCode: 'VALIDATION_ERROR',
 *   retryable: true,
 *   retryCount: job.attemptsMade
 * });
 * ```
 *
 * === Event Flow ===
 *
 * 1. Worker/n8n publishes event → Redis Pub/Sub (platform:tasks)
 * 2. SSEService receives → stores in Redis Stream (events:<userId>)
 * 3. SSEService sends to connected user via SSE
 * 4. Frontend receives → invalidates cache → fetches full data via JQEL
 * 5. UI updates with progress/status
 */
```

---

### Error Handling Strategy

#### Error Types and Handling

**Publishing Errors** (Redis connection issues):
```typescript
// Pattern: Log and continue (do not throw)
try {
  await redisService.publish(channel, event);
} catch (error) {
  console.error('❌ Failed to publish event:', error);
  // DO NOT throw - event delivery is best-effort
  // Job should continue regardless of event delivery status
}
```

**Validation Errors** (invalid parameters):
```typescript
// Pattern: Throw immediately (fail-fast)
export function validateTaskEventParams(params: any): void {
  if (!params.jobId) {
    throw new Error('jobId is required'); // Thrown synchronously
  }
}

// Caught in service method
async publishTaskStarted(params: TaskStartedParams): Promise<void> {
  try {
    const event = buildTaskEvent('job-started', params); // May throw validation error
    await this.publish(event);
  } catch (error) {
    console.error('❌ Failed to publish task started event:', { params, error });
    // Do not re-throw - calling code continues
  }
}
```

**Redis Connection Errors**:
```typescript
// Handled by redis.service.ts retry logic
// Service auto-reconnects with exponential backoff
// If Redis down, events are lost (expected behavior)
```

#### Error Display Pattern

**Backend Logging**:
```typescript
// Success
console.log('✅ Task completed event published: job_123');

// Info
console.log('ℹ️  Published job-progress to platform:tasks: 2 subscribers');

// Warning
console.warn('⚠️  Event missing userId, cannot route:', event);

// Error
console.error('❌ Failed to publish task event:', { jobId, error });
```

**Frontend Display** (future task 1.5.9-1.5.11):
- Job progress: Progress bar + status message
- Job completed: Success toast notification
- Job failed: Error toast with retry button (if retryable)
- Job cancelled: Info toast with cancellation reason

---

### Files to Create

1. **`backend/src/types/job.types.ts`**
   - Job-specific type definitions
   - Task event parameter interfaces
   - Task event payload structure

2. **`backend/src/utils/taskEventHelpers.ts`**
   - Event ID generation
   - Progress validation
   - Event payload construction
   - Error sanitization utilities

3. **`backend/src/services/taskEvents.service.ts`**
   - Task event publishing service
   - Five public methods (started, progress, completed, failed, cancelled)
   - Redis Pub/Sub integration

### Files to Modify

1. **`backend/src/types/events.types.ts`**
   - Extend `TaskEvent` interface with `data?: TaskEventData` field
   - Update `PlatformEvent.type` union to include job event types
   - No breaking changes to existing interfaces

2. **`backend/src/services/index.ts`** (Optional)
   - Add export for `taskEventsService`
   - Centralize service exports

---

## Validation Gates

### Type Checking
```bash
cd src/prototype-2/backend
npm run type-check
```
**Expected**: No TypeScript errors in new files

### Build Verification
```bash
cd src/prototype-2/backend
npm run build
```
**Expected**: Clean build with new service compiled to `dist/`

### Manual Testing Checklist

#### Test 1: Service Import
```typescript
// In any backend file
import { taskEventsService } from './services/taskEvents.service.js';
console.log(taskEventsService); // Should not be undefined
```

#### Test 2: Redis Pub/Sub Reception
```bash
# Terminal 1: Subscribe to task channel
redis-cli
> SUBSCRIBE platform:tasks

# Terminal 2: Run Node script
node -e "
const { taskEventsService } = require('./dist/services/taskEvents.service.js');
taskEventsService.publishTaskStarted({
  jobId: 'test_job_1',
  userId: 'test_user',
  queueName: 'test-queue'
});
"

# Terminal 1 should show:
# 1) "message"
# 2) "platform:tasks"
# 3) "{\"type\":\"job-started\", ...}"
```

#### Test 3: Event Validation
```typescript
// Should throw validation error
try {
  await taskEventsService.publishTaskStarted({
    jobId: '', // Invalid: empty string
    userId: 'user_123',
    queueName: 'test'
  });
} catch (error) {
  console.log('✅ Validation working:', error.message);
}
```

#### Test 4: Progress Normalization
```typescript
import { validateProgress } from './utils/taskEventHelpers.js';

// Test edge cases
console.assert(validateProgress(-10) === 0, 'Negative clamped to 0');
console.assert(validateProgress(150) === 100, 'Over 100 clamped to 100');
console.assert(validateProgress(45.7) === 46, 'Float rounded to int');
console.log('✅ Progress validation working');
```

#### Test 5: SSE Integration (End-to-End)
```bash
# Requires running services

# Terminal 1: Start backend
cd src/prototype-2/backend
npm run dev

# Terminal 2: Start Redis
redis-server

# Terminal 3: Connect SSE client
curl -N -H "Authorization: Bearer <valid-jwt>" \
  http://localhost:3000/api/events/stream

# Terminal 4: Publish event
node -e "
const { taskEventsService } = require('./dist/services/taskEvents.service.js');
await taskEventsService.publishTaskProgress({
  jobId: 'job_test',
  userId: '<user-id-from-jwt>',
  queueName: 'test',
  progress: 50,
  message: 'Half done!'
});
"

# Terminal 3 should show event data
```

### Integration Tests

#### Test Scenario 1: Full Job Lifecycle
```typescript
const jobId = 'job_lifecycle_test_' + Date.now();
const userId = 'user_123';
const queueName = 'test-queue';

// 1. Job started
await taskEventsService.publishTaskStarted({
  jobId, userId, queueName,
  category: 'test'
});

// 2. Progress updates
for (let i = 0; i <= 100; i += 25) {
  await taskEventsService.publishTaskProgress({
    jobId, userId, queueName,
    progress: i,
    message: `Processing ${i}%`
  });
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
}

// 3. Job completed
await taskEventsService.publishTaskCompleted({
  jobId, userId, queueName,
  result: { status: 'success' },
  duration: 5
});

// Verify: All 6 events received via SSE
```

#### Test Scenario 2: Job Failure with Retry
```typescript
await taskEventsService.publishTaskStarted({
  jobId: 'job_fail_test',
  userId: 'user_123',
  queueName: 'test-queue'
});

await taskEventsService.publishTaskFailed({
  jobId: 'job_fail_test',
  userId: 'user_123',
  queueName: 'test-queue',
  error: 'Network timeout after 30s',
  errorCode: 'NETWORK_TIMEOUT',
  retryable: true,
  retryCount: 1
});

// Verify: Frontend shows retry button
```

---

## References

### Specifications
- **SPEC-events.md (SPEC-EV-CO-009:013)** - Task event definition and requirements
- **SPEC-events.md (SPEC-EV-PL-001:017)** - Event payload structure
- **SPEC-events.md (SPEC-EV-PS-005:012)** - Redis Pub/Sub channels
- **SPEC-events.md (SPEC-EV-ST-001:016)** - Redis Streams for buffering
- **SPEC-events.md (SPEC-EV-QUEUE-001:011)** - Queue event integration

### Codebase Examples
- **`backend/src/types/events.types.ts`** - Base event type definitions
- **`backend/src/services/sse.service.ts`** - SSE routing and delivery patterns
- **`backend/src/services/redis.service.ts`** - Redis Pub/Sub operations
- **`backend/src/routes/events.routes.ts`** - SSE endpoint authentication

### External Documentation
- [Redis Pub/Sub Documentation](https://redis.io/docs/manual/pubsub/) - Pub/Sub patterns and best practices
- [Redis Streams Tutorial](https://redis.io/docs/data-types/streams-tutorial/) - Stream operations and recovery
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) - SSE protocol specification
- [ioredis API Reference](https://redis.github.io/ioredis/) - Redis client documentation

### Related Tasks
- **1.5.1** - SSE endpoint implementation (prerequisite)
- **1.5.4** - Redis Pub/Sub configuration (prerequisite)
- **1.5.5** - Redis Streams for buffering (prerequisite)
- **1.5.9** - Frontend SSE client (will consume task events)
- **1.5.10** - Frontend event handlers (will process task events)
- **3.7.x** - Tasks Module (will display task events in UI)
