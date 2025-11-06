# Task Plan: 1.5.10 - Implementar event handlers

## Context and Objective

This task implements **frontend event handlers** for the platform's real-time event system. Event handlers process incoming SSE events (notifications and tasks) and trigger appropriate UI responses such as toast notifications, progress bars, badge updates, and TanStack Query cache invalidation.

**What will be implemented:**
- Event handler registration system with type-based routing
- Built-in handlers for notification events (toast display)
- Built-in handlers for task events (progress tracking)
- Handler lifecycle management (register, unregister, invoke)
- Integration with shadcn/ui Toast component for visual notifications
- Integration with TanStack Query for cache invalidation
- Custom handler support for application-specific event processing
- Error boundaries for handler failures (prevent SSE connection crash)

**Why it's needed:**
Event handlers bridge the gap between raw SSE events and UI updates. They enable:
- **Visual Feedback**: Display toasts for notifications, progress bars for tasks
- **Data Synchronization**: Invalidate TanStack Query cache when data changes
- **User Awareness**: Badge counters, notification center updates
- **Task Management**: Progress tracking, completion callbacks
- **Custom Logic**: Application-specific event processing

**How it integrates:**
- **Task 1.5.9 (EventSource Manager)**: Provides connection and event reception
- **Backend SSE System (1.5.1-1.5.8)**: Delivers events via Redis Pub/Sub
- **shadcn/ui Toast**: Already installed (@radix-ui/react-toast), used for notifications
- **TanStack Query**: Already configured in main.tsx, used for cache invalidation
- **AuthProvider**: Provides userId for event filtering

**Business value:**
- Immediate user feedback without page refreshes
- Real-time data synchronization across components
- Foundation for notification center (task 3.6) and task module (task 3.7)
- Enhanced user experience with visual feedback for async operations
- Reduced server load (no polling)

**User impact:**
Users see instant visual feedback for notifications, track task progress in real-time, and experience seamless data updates without manual refreshes.

## Dependencies

### Prerequisite Tasks
- **1.5.9 - EventSource Connection Manager**: ✅ MUST be complete (this task extends it)
  - Note: Task 1.5.9 does NOT appear in planning folder yet
  - Implementation will assume EventSource manager exists with:
    - `addEventListener(handler)` method
    - `removeEventListener(handler)` method
    - Event payload parsing (PlatformEvent type)
    - Auto-reconnection support

### Files/Modules Affected

**Files to Create:**
- `src/prototype-2/frontend/src/services/events/eventHandlers.ts` - Handler registry and management
- `src/prototype-2/frontend/src/services/events/notificationHandler.ts` - Notification event handler
- `src/prototype-2/frontend/src/services/events/taskHandler.ts` - Task event handler
- `src/prototype-2/frontend/src/components/ui/toaster.tsx` - Toaster component (shadcn/ui pattern)
- `src/prototype-2/frontend/src/hooks/use-toast.ts` - Toast hook (shadcn/ui pattern)
- `src/prototype-2/frontend/src/types/events.ts` - Frontend event types (mirror backend types)

**Files to Modify:**
- `src/prototype-2/frontend/src/services/events/sseClient.ts` - Connect handlers to SSE events (task 1.5.9)
- `src/prototype-2/frontend/src/App.tsx` - Mount Toaster component
- `src/prototype-2/frontend/src/main.tsx` - Potentially add event handler initialization

**Files to Reference (No Changes):**
- `src/prototype-2/frontend/src/providers/AuthProvider.tsx` - Access userId for filtering
- `src/prototype-2/frontend/src/main.tsx` - QueryClient already configured
- `src/prototype-2/backend/src/types/events.types.ts` - Event type reference

### Enables Tasks
- **1.5.11 - Integrar com TanStack Query**: Cache invalidation based on events
- **3.6 - Notifications Module**: Notification center UI
- **3.7 - Tasks Module**: Task list and progress tracking UI
- **3.2 - Chat Module**: Real-time message notifications

### External Dependencies
- `@radix-ui/react-toast` - Already installed, provides toast primitives
- `@tanstack/react-query` - Already installed, provides QueryClient for invalidation
- `lucide-react` - Already installed (assumed), provides notification icons

## Patterns Identified in Codebase

### Similar Components/Modules

**AuthProvider Pattern (AuthProvider.tsx):**
- Context-based state management with React.createContext
- Custom hook for accessing context (useAuth)
- Error throwing if used outside provider
- useMemo for optimized context value
- Singleton-like state management

**Error Boundary Pattern (ErrorBoundary.tsx):**
- Multi-level error boundaries (global, portal, module)
- Graceful error handling with fallback UI
- Error logging without crashing app
- Pattern: Wrap handlers in try/catch to prevent SSE disconnect

**Provider Pattern (main.tsx, App.tsx):**
- Providers wrap entire app or sections
- QueryClientProvider → AuthProvider → BrowserRouter → Routes
- New providers added to hierarchy in App.tsx or main.tsx

### Conventions to Follow

**Naming Conventions:**
- Service files: `{feature}Client.ts` or `{feature}Service.ts` (e.g., `eventHandlers.ts`)
- Handler files: `{eventType}Handler.ts` (e.g., `notificationHandler.ts`)
- Type files: `{feature}.ts` in types/ (e.g., `events.ts`)
- Hooks: `use-{feature}.ts` (e.g., `use-toast.ts`)
- Components: PascalCase with `.tsx` (e.g., `Toaster.tsx`)

**File Structure:**
```
src/prototype-2/frontend/src/
├── services/
│   └── events/
│       ├── sseClient.ts            [MODIFY - Task 1.5.9]
│       ├── eventHandlers.ts        [NEW]
│       ├── notificationHandler.ts  [NEW]
│       └── taskHandler.ts          [NEW]
├── components/
│   └── ui/
│       └── toaster.tsx             [NEW]
├── hooks/
│   └── use-toast.ts                [NEW]
├── types/
│   └── events.ts                   [NEW]
└── App.tsx                         [MODIFY]
```

**Import/Export Patterns:**
```typescript
// Services export singleton or factory
export const eventHandlers = new EventHandlerRegistry();

// Handlers export handler function
export const handleNotification = (event: NotificationEvent) => { /* ... */ };

// Components export default
export default function Toaster() { /* ... */ }

// Hooks export named function
export function useToast() { /* ... */ }

// Types export interfaces/types only
export type { PlatformEvent, NotificationEvent, TaskEvent };
```

**State Management:**
- Global state: React Context (for toast state)
- Handler registry: Singleton with Map for O(1) lookup
- Event processing: Stateless functions
- TanStack Query: Already handles data state

**Error Handling:**
```typescript
// Wrap handlers in try/catch to prevent SSE crash
try {
  handler(event);
} catch (error) {
  console.error('[EventHandler] Error processing event:', error, event);
  // Don't re-throw - log and continue
}

// Handler validation
if (!event.type) {
  console.warn('[EventHandler] Event missing type field:', event);
  return; // Skip invalid events
}
```

### Reusable Code Examples

**Provider Pattern from AuthProvider.tsx:**
```typescript
// File: src/prototype-2/frontend/src/providers/AuthProvider.tsx (lines 23-35)
interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  // ... other values
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // ... state and logic

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, /* ... */ }),
    [user, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**QueryClient Access from main.tsx:**
```typescript
// File: src/prototype-2/frontend/src/main.tsx (lines 11-20)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// In hooks/components, access via:
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['key'] });
```

**Error Boundary Pattern from ErrorBoundary.tsx:**
```typescript
// File: src/prototype-2/frontend/src/components/error/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', { error, errorInfo });
    // Log to service, don't crash app
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Critical Context

### Documentation

**SPEC-events.md - Event Handling:**
- [SPEC-EV-FE-008:012](D:\sources\codr.studio\platform\spec\SPEC-events.md#L250-254) - Frontend MUST implement event handlers
  - SPEC-EV-FE-008: Frontend must register handler functions for event types
  - SPEC-EV-FE-009: Handlers must discriminate on event.type field
  - SPEC-EV-FE-010: Handlers must be non-blocking (don't delay event loop)
  - SPEC-EV-FE-011: Handler errors must not break SSE connection
  - SPEC-EV-FE-012: Handlers may invoke multiple actions (toast + invalidation)

**SPEC-events.md - Frontend Processing:**
- [SPEC-EV-FR-001:003](D:\sources\codr.studio\platform\spec\SPEC-events.md#L316-320) - Event handling pattern
  - SPEC-EV-FR-001: Use events to invalidate TanStack Query cache
  - SPEC-EV-FR-002: Fetch complete data via JQEL after invalidation
  - SPEC-EV-FR-003: Display visual notification when event received

**SPEC-events.md - Notification Events:**
- [SPEC-EV-CO-005:008](D:\sources\codr.studio\platform\spec\SPEC-events.md#L24-30) - Notification characteristics
  - SPEC-EV-CO-005: Notification is informational, unidirectional
  - SPEC-EV-CO-006: Does NOT require user action (passive)
  - SPEC-EV-CO-007: May be marked as viewed
  - SPEC-EV-CO-008: Examples: "Processing started", "Email sent", "Error in log"

**SPEC-events.md - Task Events:**
- [SPEC-EV-CO-009:013](D:\sources\codr.studio\platform\spec\SPEC-events.md#L34-43) - Task characteristics
  - SPEC-EV-CO-009: Task requires user action
  - SPEC-EV-CO-010: Must have status (pending, completed, cancelled)
  - SPEC-EV-CO-011: Must allow interaction (approve, reject, respond)
  - SPEC-EV-CO-012: May contain embedded forms

**Backend Event Types (events.types.ts):**
- [NotificationEvent](D:\sources\codr.studio\platform\src\prototype-2\backend\src\types\events.types.ts#L30-38) - Extended notification fields
  - category: 'system' | 'info' | 'success' | 'warning' | 'error'
  - severity: 'low' | 'normal' | 'high' | 'critical'
  - title?: string (short title)
  - message?: string (message body)
  - actionUrl?: string (click-through link)
  - iconName?: string (Lucide icon name)

- [TaskEvent](D:\sources\codr.studio\platform\src\prototype-2\backend\src\types\events.types.ts#L45-50) - Task event structure
  - status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  - data: TaskEventData (progress, jobId, etc.)

### Gotchas and Pitfalls

**Event Handler Specific:**
- ⚠️ Handlers MUST NOT throw errors - wrap in try/catch or SSE connection will break
- ⚠️ Handlers MUST be non-blocking - use setTimeout/Promise for expensive operations
- ⚠️ Handler order matters - register cache invalidation before toast (data first, UI second)
- ⚠️ Event discrimination on `type` field is critical - wrong handler crashes app
- ⚠️ Handler registry must support unregister for cleanup (prevent memory leaks)
- ⚠️ Duplicate handlers must be prevented (same handler registered twice)

**Toast Notifications:**
- ⚠️ Toast limit - only show N toasts at once (default: 5), queue others
- ⚠️ Toast auto-dismiss - configure per severity (critical = no auto-dismiss)
- ⚠️ Toast positioning - avoid covering critical UI elements
- ⚠️ Toast z-index - must be above modals (check CSS)
- ⚠️ Multiple toasts for same event - deduplicate by event.id

**TanStack Query Integration:**
- ⚠️ Invalidation timing - invalidate BEFORE showing toast (data loads first)
- ⚠️ Query key patterns - use hierarchical keys for efficient invalidation
- ⚠️ Over-invalidation - don't invalidate unrelated queries (performance)
- ⚠️ QueryClient access - use useQueryClient hook or pass instance

**Task Events:**
- ⚠️ Progress bars - must handle 0%, partial, and 100% states
- ⚠️ Task completion - remove progress UI after X seconds
- ⚠️ Failed tasks - show error with retry action
- ⚠️ Cancelled tasks - distinguish user vs system cancellation

**SSE Connection:**
- ⚠️ Handler registration must happen BEFORE SSE connection established
- ⚠️ Unregister handlers on component unmount (cleanup)
- ⚠️ Don't block SSE message parsing with expensive handlers
- ⚠️ Connection state - handlers may be called while reconnecting

### Existing Patterns to Follow

**Singleton Registry Pattern:**
- See how QueryClient is created once and passed via provider
- EventHandlerRegistry should be singleton, not recreated

**Hook Pattern for UI:**
- See `useAuth()` pattern - create `useToast()` with similar structure
- Throw error if used outside provider context

**Component Mounting:**
- See how `<ReactQueryDevtools>` is mounted in main.tsx
- Mount `<Toaster>` component in App.tsx (inside providers)

**Error Logging:**
- See AuthProvider console.error patterns (lines 100-117)
- Use structured logging: `console.error('[Component] Message:', { context })`

## Technical Specification

### Architecture

```
src/prototype-2/frontend/src/
├── services/
│   └── events/
│       ├── sseClient.ts            [MODIFY] - Register handlers on init
│       ├── eventHandlers.ts        [NEW] - Registry and routing
│       ├── notificationHandler.ts  [NEW] - Toast display logic
│       └── taskHandler.ts          [NEW] - Progress tracking logic
├── components/
│   └── ui/
│       ├── toaster.tsx             [NEW] - Toaster container
│       └── toast.tsx               [NEW] - Toast component (if not exists)
├── hooks/
│   └── use-toast.ts                [NEW] - Toast state and actions
├── types/
│   └── events.ts                   [NEW] - Frontend event types
└── App.tsx                         [MODIFY] - Mount Toaster
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  SSE Client (Task 1.5.9 - EventSource Manager)                  │
│  - Receives event from backend via SSE                          │
│  - Parses JSON: const event: PlatformEvent = JSON.parse(data)  │
│  - Invokes: eventHandlers.handleEvent(event)                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ handleEvent(event)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  EventHandlerRegistry                                           │
│  - Discriminate on event.type field                            │
│  - Route to appropriate handlers:                              │
│    - type='notification' → notificationHandlers[]             │
│    - type='task' → taskHandlers[]                             │
│  - Invoke handlers sequentially (order matters)                │
│  - Catch and log handler errors (don't propagate)              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ (for notification events)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Notification Handler                                           │
│  1. Invalidate Cache (if data field present)                   │
│     - queryClient.invalidateQueries({ queryKey: [schema, ...] })│
│  2. Map category to toast variant:                             │
│     - 'success' → green toast                                  │
│     - 'error' → red toast                                      │
│     - 'warning' → yellow toast                                 │
│     - 'info' → blue toast                                      │
│  3. Call toast() with mapped data                              │
│     - title: event.title || default                            │
│     - description: event.message                               │
│     - action: event.actionUrl (View Details button)            │
│     - icon: event.iconName (Lucide icon)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ toast({ title, description, variant })
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Toast Hook (useToast)                                         │
│  - Add toast to state queue                                    │
│  - Assign unique ID                                            │
│  - Start auto-dismiss timer (if configured)                    │
│  - Emit update event to Toaster component                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ State update
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Toaster Component                                              │
│  - Render active toasts (max 5)                                │
│  - Position: bottom-right (configurable)                       │
│  - Animate: slide-in, fade-out                                 │
│  - Handle: dismiss, action click                               │
└─────────────────────────────────────────────────────────────────┘
```

**Task Event Flow (Parallel):**
```
EventHandlerRegistry
    │
    │ (for task events)
    ▼
Task Handler
    │
    ├─> 1. Update Task State (global or per-portal)
    │      - Store: Map<taskId, TaskState>
    │      - Progress: 0-100
    │      - Status: pending → running → completed/failed
    │
    ├─> 2. Invalidate Task Queries
    │      - queryClient.invalidateQueries({ queryKey: ['tasks'] })
    │
    └─> 3. Display Progress (if status='running')
           - Show progress bar (toast or dedicated UI)
           - Update percentage
           - Auto-dismiss on complete/failed
```

### Modules and Responsibilities

**eventHandlers.ts**
- Responsibility: Central event routing and handler management
- Interface:
  - `registerHandler(type, handler)` - Add handler for event type
  - `unregisterHandler(type, handler)` - Remove handler
  - `handleEvent(event)` - Route event to handlers
  - `clearHandlers()` - Remove all handlers (cleanup)
- State: Map<EventType, Set<Handler>>
- Singleton: Single registry instance

**notificationHandler.ts**
- Responsibility: Process notification events
- Interface:
  - `handleNotification(event: NotificationEvent)` - Main handler function
  - `mapCategoryToVariant(category)` - Category → toast variant
  - `shouldInvalidateCache(event)` - Determine if cache invalidation needed
- Dependencies: useToast hook, QueryClient
- Pure functions (no instance state)

**taskHandler.ts**
- Responsibility: Process task events, track progress
- Interface:
  - `handleTask(event: TaskEvent)` - Main handler function
  - `updateTaskState(taskId, status, progress)` - Update task tracking
  - `showTaskProgress(event)` - Display progress bar
  - `cleanupCompletedTask(taskId)` - Remove from tracking after completion
- State: Map<taskId, TaskState> (global or per-component)
- Singleton or provider pattern

**use-toast.ts**
- Responsibility: Toast state management and actions
- Interface:
  - `toast(options)` - Show new toast
  - `dismiss(toastId?)` - Dismiss specific or all toasts
  - `toasts` - Array of active toasts
- State: Toast queue with IDs, timers, variants
- Based on shadcn/ui toast pattern

**toaster.tsx**
- Responsibility: Render toast UI
- Interface: React component (no props)
- Uses: useToast hook to subscribe to toast state
- Renders: Toast components with animations

### State Management

**Event Handler State:**
```typescript
// EventHandlerRegistry (singleton)
class EventHandlerRegistry {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  // O(1) registration and lookup
  // Supports multiple handlers per event type
  // Handlers invoked in registration order
}
```

**Toast State:**
```typescript
// useToast hook (context-based)
interface ToastState {
  toasts: Toast[];  // Active toasts
  maxToasts: number; // Limit (default: 5)
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

// Toast structure
interface Toast {
  id: string; // Unique ID
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  action?: { label: string; onClick: () => void };
  duration?: number; // Auto-dismiss milliseconds
}
```

**Task State (Optional for Task Handler):**
```typescript
// Task tracking state
interface TaskState {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  startTime: number; // timestamp
}

// Global task state (or use Context/Zustand)
const taskStates = new Map<string, TaskState>();
```

**Why these patterns:**
- Map-based handler registry: O(1) lookup, supports multiple handlers
- Context-based toast state: Accessible from anywhere, single source of truth
- Global task state: Simple, no provider needed (tasks are global concept)

### Libraries and Tools

**@radix-ui/react-toast (Already Installed)**
- Provides Toast primitive components
- Accessible (ARIA attributes)
- Customizable with Tailwind CSS
- Auto-dismiss, swipe-to-dismiss
- Usage: Wrap Toaster in ToastProvider, use imperative API

**@tanstack/react-query (Already Installed)**
- QueryClient for cache invalidation
- Access via useQueryClient() hook
- Invalidation patterns:
  ```typescript
  // Invalidate specific query
  queryClient.invalidateQueries({ queryKey: ['users', userId] });

  // Invalidate all queries starting with key
  queryClient.invalidateQueries({ queryKey: ['users'] });

  // Invalidate multiple related queries
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'users'
  });
  ```

**lucide-react (Already Installed - Assumed)**
- Icons for toast notifications
- Usage: `import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'`
- Icons match backend iconName field

**TypeScript**
- Strict typing for event discrimination
- Type guards for event type narrowing
- Autocomplete for handler signatures

## Implementation Blueprint

### Ordered Steps

#### 1. Create Frontend Event Types

**Create:** `src/prototype-2/frontend/src/types/events.ts`

**Details:**
- Mirror backend event types (NotificationEvent, TaskEvent)
- Export type guards for runtime type checking
- Ensure compatibility with backend types

```typescript
/**
 * Frontend Event Types
 *
 * Mirrors backend types from src/prototype-2/backend/src/types/events.types.ts
 * Used for type-safe event handling in frontend.
 */

/**
 * Base platform event structure
 */
export interface PlatformEvent {
  type: 'notification' | 'task' | 'job-started' | 'job-progress' | 'job-completed' | 'job-failed' | 'job-cancelled';
  id: string;
  userId?: string;
  userIds?: string[];
  timestamp: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
}

/**
 * Notification event
 *
 * Passive, informational events displayed as toasts.
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
 *
 * Interactive events requiring user action or showing progress.
 */
export interface TaskEvent extends PlatformEvent {
  type: 'task';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  category?: string;
  data?: TaskEventData;
}

/**
 * Task event data structure
 */
export interface TaskEventData {
  jobId: string;
  queueName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  currentStep?: string;
  estimatedDuration?: number;
  result?: any;
  duration?: number;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
  retryCount?: number;
  reason?: string;
  cancelledBy?: 'user' | 'system' | 'timeout';
  metadata?: Record<string, any>;
}

/**
 * Event handler function signature
 */
export type EventHandler<T extends PlatformEvent = PlatformEvent> = (event: T) => void | Promise<void>;

/**
 * Type guard: Check if event is NotificationEvent
 */
export function isNotificationEvent(event: PlatformEvent): event is NotificationEvent {
  return event.type === 'notification';
}

/**
 * Type guard: Check if event is TaskEvent
 */
export function isTaskEvent(event: PlatformEvent): event is TaskEvent {
  return event.type === 'task';
}
```

**Pattern reference:** Similar to backend types but optimized for frontend usage

---

#### 2. Create shadcn/ui Toast Hook

**Create:** `src/prototype-2/frontend/src/hooks/use-toast.ts`

**Details:**
- Imperative toast API: `toast({ title, description })`
- Context-based state management
- Auto-dismiss timer support
- Max toast limit (queue remaining)

```typescript
/**
 * Toast Hook - shadcn/ui pattern
 *
 * Provides imperative toast API for showing notifications.
 * Based on shadcn/ui toast implementation.
 */

import * as React from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'destructive';

export interface ToastActionElement {
  altText?: string;
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number; // milliseconds, null = no auto-dismiss
  open?: boolean;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 100; // ms delay before removing from DOM

type ToasterToast = Toast & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

// Toast state
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
}

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

/**
 * Show a toast notification
 */
export function toast(props: Omit<Toast, 'id'>) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Hook to access toast state and actions
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}
```

**Pattern reference:** Standard shadcn/ui toast hook pattern with memory-based state

---

#### 3. Create Toaster Component (shadcn/ui)

**Create:** `src/prototype-2/frontend/src/components/ui/toaster.tsx`

**Details:**
- Renders active toasts from useToast hook
- Positioned bottom-right (configurable)
- Uses @radix-ui/react-toast primitives
- Styled with Tailwind CSS

```typescript
/**
 * Toaster Component - shadcn/ui pattern
 *
 * Renders toast notifications from useToast hook.
 * Mount in App.tsx to enable toasts globally.
 */

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'; // Assumes toast.tsx exists or will be created
import { useToast } from '../../hooks/use-toast';

/**
 * Toaster container component
 *
 * Renders all active toasts. Mount once in App.tsx.
 */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action && (
              <button
                onClick={action.onClick}
                className="text-sm font-medium underline"
              >
                {action.label}
              </button>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
```

**Note:** This component assumes `toast.tsx` exists with @radix-ui/react-toast primitives. If not, it should be created following shadcn/ui patterns (Toast, ToastClose, ToastTitle, ToastDescription, ToastProvider, ToastViewport components wrapping @radix-ui primitives with Tailwind styling).

**Pattern reference:** Standard shadcn/ui component structure

---

#### 4. Create Event Handler Registry

**Create:** `src/prototype-2/frontend/src/services/events/eventHandlers.ts`

**Details:**
- Central registry for event type → handler mapping
- Supports multiple handlers per event type
- Invokes handlers with error isolation
- O(1) handler lookup

```typescript
/**
 * Event Handler Registry
 *
 * Central system for registering and invoking event handlers.
 * Routes incoming events to appropriate handlers based on event.type.
 *
 * SPEC References:
 * - SPEC-EV-FE-008:012: Event handler registration and invocation
 */

import type { PlatformEvent, EventHandler } from '../../types/events';

/**
 * Event Handler Registry
 *
 * Manages handler registration and event routing.
 * Singleton pattern - single registry per application.
 */
class EventHandlerRegistry {
  // Map: event type → Set of handlers
  // Set prevents duplicate handlers, preserves insertion order
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Register handler for event type
   *
   * SPEC-EV-FE-008: Frontend must register handler functions for event types
   *
   * @param eventType - Event type to handle (e.g., 'notification', 'task')
   * @param handler - Handler function to invoke
   */
  registerHandler<T extends PlatformEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType)!;

    // Prevent duplicate registration
    if (handlers.has(handler as EventHandler)) {
      console.warn('[EventHandlers] Handler already registered for type:', eventType);
      return;
    }

    handlers.add(handler as EventHandler);
    console.log(`[EventHandlers] Registered handler for type: ${eventType}`);
  }

  /**
   * Unregister handler for event type
   *
   * @param eventType - Event type
   * @param handler - Handler function to remove
   */
  unregisterHandler<T extends PlatformEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType);
    if (!handlers) {
      return;
    }

    handlers.delete(handler as EventHandler);

    // Cleanup empty handler sets
    if (handlers.size === 0) {
      this.handlers.delete(eventType);
    }

    console.log(`[EventHandlers] Unregistered handler for type: ${eventType}`);
  }

  /**
   * Handle incoming event
   *
   * Routes event to all registered handlers for event.type.
   * Handlers invoked sequentially in registration order.
   * Handler errors caught and logged (don't propagate).
   *
   * SPEC-EV-FE-009: Handlers must discriminate on event.type field
   * SPEC-EV-FE-010: Handlers must be non-blocking
   * SPEC-EV-FE-011: Handler errors must not break SSE connection
   *
   * @param event - Platform event to handle
   */
  async handleEvent(event: PlatformEvent): Promise<void> {
    // SPEC-EV-FE-009: Discriminate on event.type
    if (!event.type) {
      console.warn('[EventHandlers] Event missing type field:', event);
      return;
    }

    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      console.log(`[EventHandlers] No handlers registered for type: ${event.type}`);
      return;
    }

    console.log(`[EventHandlers] Processing event: ${event.type}`, { id: event.id });

    // Invoke handlers sequentially
    for (const handler of handlers) {
      try {
        // SPEC-EV-FE-010: Non-blocking (handlers should be fast)
        await handler(event);
      } catch (error) {
        // SPEC-EV-FE-011: Handler errors must not break SSE connection
        console.error('[EventHandlers] Handler error:', {
          eventType: event.type,
          eventId: event.id,
          error,
        });
        // Continue with next handler
      }
    }
  }

  /**
   * Clear all handlers (cleanup)
   *
   * Useful for testing or application shutdown.
   */
  clearHandlers(): void {
    this.handlers.clear();
    console.log('[EventHandlers] All handlers cleared');
  }

  /**
   * Get handler count for event type
   *
   * @param eventType - Event type
   * @returns Number of registered handlers
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Export singleton instance
export const eventHandlers = new EventHandlerRegistry();
```

**Pattern reference:** Singleton service pattern similar to other services

---

#### 5. Create Notification Handler

**Create:** `src/prototype-2/frontend/src/services/events/notificationHandler.ts`

**Details:**
- Process notification events
- Map category to toast variant (visual styling)
- Display toast with title, message, icon, action
- Invalidate cache if data field present

```typescript
/**
 * Notification Event Handler
 *
 * Processes notification events and displays toast notifications.
 *
 * SPEC References:
 * - SPEC-EV-CO-005:008: Notification concepts (passive, informational)
 * - SPEC-EV-FR-001:003: Event handling (invalidation + display)
 */

import { toast, type ToastVariant } from '../../hooks/use-toast';
import type { NotificationEvent } from '../../types/events';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Settings
} from 'lucide-react';

// QueryClient access (set during initialization)
let queryClient: ReturnType<typeof useQueryClient> | null = null;

/**
 * Initialize notification handler with QueryClient
 *
 * Must be called before handling events.
 *
 * @param client - TanStack QueryClient instance
 */
export function initNotificationHandler(client: ReturnType<typeof useQueryClient>): void {
  queryClient = client;
  console.log('[NotificationHandler] Initialized');
}

/**
 * Map notification category to toast variant
 *
 * Controls visual styling (color, icon).
 *
 * @param category - Notification category
 * @returns Toast variant
 */
function mapCategoryToVariant(category?: string): ToastVariant {
  switch (category) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    case 'system':
    default:
      return 'default';
  }
}

/**
 * Get icon component for notification category
 *
 * @param category - Notification category
 * @param iconName - Custom icon name from event
 * @returns Lucide icon component
 */
function getIconComponent(category?: string, iconName?: string) {
  // Use custom icon if provided
  if (iconName) {
    // Could implement dynamic icon lookup here
    // For now, return default based on category
  }

  // Map category to default icon
  switch (category) {
    case 'success':
      return CheckCircle;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'system':
      return Settings;
    default:
      return Info;
  }
}

/**
 * Determine if cache should be invalidated
 *
 * SPEC-EV-FR-001: Use events to invalidate TanStack Query cache
 *
 * @param event - Notification event
 * @returns True if cache invalidation needed
 */
function shouldInvalidateCache(event: NotificationEvent): boolean {
  // Invalidate if event contains data field with schema/entity info
  if (event.data && (event.data.schema || event.data.entity)) {
    return true;
  }

  // Invalidate for certain categories
  if (event.category === 'success' && event.data) {
    return true; // Success usually means data changed
  }

  return false;
}

/**
 * Invalidate cache based on event data
 *
 * Uses hierarchical query keys for efficient invalidation.
 *
 * @param event - Notification event
 */
async function invalidateCache(event: NotificationEvent): Promise<void> {
  if (!queryClient) {
    console.warn('[NotificationHandler] QueryClient not initialized, skipping invalidation');
    return;
  }

  if (!event.data) {
    return;
  }

  const { schema, entity, id } = event.data;

  // Hierarchical invalidation
  if (schema && entity && id) {
    // Specific record: ['backend', 'portal', 'main']
    await queryClient.invalidateQueries({
      queryKey: [schema, entity, id]
    });
  } else if (schema && entity) {
    // All records of entity: ['backend', 'portal']
    await queryClient.invalidateQueries({
      queryKey: [schema, entity]
    });
  } else if (schema) {
    // All queries for schema: ['backend']
    await queryClient.invalidateQueries({
      queryKey: [schema]
    });
  }

  console.log('[NotificationHandler] Cache invalidated:', { schema, entity, id });
}

/**
 * Handle notification event
 *
 * Main handler function registered with EventHandlerRegistry.
 *
 * SPEC-EV-FR-001:003: Invalidate cache → display toast
 * SPEC-EV-CO-006: Notifications are passive (no required action)
 *
 * @param event - Notification event
 */
export async function handleNotification(event: NotificationEvent): Promise<void> {
  console.log('[NotificationHandler] Processing notification:', event.id);

  // Step 1: Invalidate cache if needed (data first)
  // SPEC-EV-FR-001: Use events to invalidate TanStack Query cache
  if (shouldInvalidateCache(event)) {
    await invalidateCache(event);
  }

  // Step 2: Display toast (UI feedback)
  // SPEC-EV-FR-003: Display visual notification when event received
  const variant = mapCategoryToVariant(event.category);
  const Icon = getIconComponent(event.category, event.iconName);

  // Determine auto-dismiss duration based on severity
  let duration = 5000; // Default: 5 seconds
  if (event.severity === 'critical') {
    duration = null; // No auto-dismiss for critical
  } else if (event.severity === 'high') {
    duration = 10000; // 10 seconds
  } else if (event.severity === 'low') {
    duration = 3000; // 3 seconds
  }

  // Build toast options
  const toastOptions: Parameters<typeof toast>[0] = {
    title: event.title || getCategoryTitle(event.category),
    description: event.message,
    variant,
    duration,
  };

  // Add action button if actionUrl provided
  if (event.actionUrl) {
    toastOptions.action = {
      label: 'View Details',
      onClick: () => {
        window.location.href = event.actionUrl!;
      },
    };
  }

  // Show toast
  toast(toastOptions);

  console.log('[NotificationHandler] Toast displayed:', event.id);
}

/**
 * Get default title for category
 *
 * @param category - Notification category
 * @returns Default title
 */
function getCategoryTitle(category?: string): string {
  switch (category) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Information';
    case 'system':
      return 'System Notification';
    default:
      return 'Notification';
  }
}
```

**Pattern reference:** Handler function with dependency injection (QueryClient)

---

#### 6. Create Task Handler

**Create:** `src/prototype-2/frontend/src/services/events/taskHandler.ts`

**Details:**
- Process task events
- Track task progress (Map<taskId, TaskState>)
- Display progress toasts for running tasks
- Auto-dismiss on completion
- Show error with retry for failed tasks

```typescript
/**
 * Task Event Handler
 *
 * Processes task events and tracks task progress.
 * Displays progress bars and status updates.
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task concepts (interactive, requires action)
 * - SPEC-EV-TA-001:010: Task event structure and status
 */

import { toast } from '../../hooks/use-toast';
import type { TaskEvent, TaskEventData } from '../../types/events';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// QueryClient access (set during initialization)
let queryClient: ReturnType<typeof useQueryClient> | null = null;

// Task state tracking
interface TaskState {
  taskId: string;
  jobId: string;
  status: string;
  progress: number;
  message?: string;
  toastId?: string; // Track toast for updates
  startTime: number;
}

const activeTasks = new Map<string, TaskState>();

/**
 * Initialize task handler with QueryClient
 *
 * @param client - TanStack QueryClient instance
 */
export function initTaskHandler(client: ReturnType<typeof useQueryClient>): void {
  queryClient = client;
  console.log('[TaskHandler] Initialized');
}

/**
 * Update task state
 *
 * @param taskId - Task identifier
 * @param updates - Partial task state updates
 */
function updateTaskState(taskId: string, updates: Partial<TaskState>): void {
  const existing = activeTasks.get(taskId);
  if (existing) {
    activeTasks.set(taskId, { ...existing, ...updates });
  } else {
    activeTasks.set(taskId, {
      taskId,
      jobId: updates.jobId || taskId,
      status: updates.status || 'pending',
      progress: updates.progress || 0,
      message: updates.message,
      toastId: updates.toastId,
      startTime: updates.startTime || Date.now(),
    });
  }
}

/**
 * Remove task from tracking
 *
 * @param taskId - Task identifier
 */
function removeTask(taskId: string): void {
  activeTasks.delete(taskId);
  console.log('[TaskHandler] Task removed from tracking:', taskId);
}

/**
 * Get icon for task status
 *
 * @param status - Task status
 * @returns Lucide icon component
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'running':
      return Loader2;
    case 'completed':
      return CheckCircle;
    case 'failed':
      return XCircle;
    case 'pending':
    default:
      return Clock;
  }
}

/**
 * Handle task event
 *
 * Main handler function registered with EventHandlerRegistry.
 *
 * SPEC-EV-CO-010: Task must have status
 * SPEC-EV-CO-011: Task must allow interaction
 *
 * @param event - Task event
 */
export async function handleTask(event: TaskEvent): Promise<void> {
  console.log('[TaskHandler] Processing task:', event.id);

  const taskId = event.id;
  const data = event.data;
  const status = event.status || data?.status || 'pending';
  const progress = data?.progress || 0;
  const message = data?.message || event.category;

  // Update task state
  updateTaskState(taskId, {
    jobId: data?.jobId || taskId,
    status,
    progress,
    message,
  });

  const Icon = getStatusIcon(status);

  // Handle different statuses
  switch (status) {
    case 'pending':
      // Show pending toast
      const pendingToast = toast({
        title: 'Task Pending',
        description: message || 'Task queued for processing',
        variant: 'default',
        duration: 3000,
      });
      updateTaskState(taskId, { toastId: pendingToast.id });
      break;

    case 'running':
      // Show/update progress toast
      const runningToast = toast({
        title: 'Task Running',
        description: `${message || 'Processing'} (${progress}%)`,
        variant: 'default',
        duration: null, // No auto-dismiss
      });
      updateTaskState(taskId, { toastId: runningToast.id });
      break;

    case 'completed':
      // Show success toast
      toast({
        title: 'Task Completed',
        description: message || 'Task completed successfully',
        variant: 'success',
        duration: 5000,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      }

      // Remove from tracking after delay
      setTimeout(() => removeTask(taskId), 5000);
      break;

    case 'failed':
      // Show error toast with retry option
      toast({
        title: 'Task Failed',
        description: data?.error || message || 'Task failed to complete',
        variant: 'error',
        duration: null, // Don't auto-dismiss errors
        action: data?.retryable
          ? {
              label: 'Retry',
              onClick: () => {
                console.log('[TaskHandler] Retry task:', taskId);
                // Emit retry event or call API
                // TODO: Implement retry logic
              },
            }
          : undefined,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      // Remove from tracking after delay
      setTimeout(() => removeTask(taskId), 10000);
      break;

    case 'cancelled':
      // Show cancelled toast
      toast({
        title: 'Task Cancelled',
        description: data?.reason || message || 'Task was cancelled',
        variant: 'warning',
        duration: 5000,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      // Remove from tracking
      removeTask(taskId);
      break;

    default:
      console.warn('[TaskHandler] Unknown task status:', status);
  }

  console.log('[TaskHandler] Task processed:', taskId);
}

/**
 * Get all active tasks
 *
 * Useful for displaying task list UI.
 *
 * @returns Array of active task states
 */
export function getActiveTasks(): TaskState[] {
  return Array.from(activeTasks.values());
}

/**
 * Get specific task state
 *
 * @param taskId - Task identifier
 * @returns Task state or undefined
 */
export function getTaskState(taskId: string): TaskState | undefined {
  return activeTasks.get(taskId);
}
```

**Pattern reference:** Stateful handler with Map-based tracking

---

#### 7. Integrate Handlers with SSE Client (Task 1.5.9)

**Modify:** `src/prototype-2/frontend/src/services/events/sseClient.ts`

**Details:**
- Register handlers on SSE client initialization
- Invoke eventHandlers.handleEvent() on message receipt
- Initialize handler dependencies (QueryClient)

**Modification:**
```typescript
// Assuming sseClient.ts has a structure similar to:
// - connect() method
// - onMessage() callback
// - EventSource setup

// Add imports at top
import { eventHandlers } from './eventHandlers';
import {
  handleNotification,
  initNotificationHandler
} from './notificationHandler';
import {
  handleTask,
  initTaskHandler
} from './taskHandler';
import { isNotificationEvent, isTaskEvent } from '../../types/events';
import type { PlatformEvent } from '../../types/events';

// In initialization function (or export separate init function):
export function initializeEventHandlers(queryClient: QueryClient): void {
  // Initialize handlers with dependencies
  initNotificationHandler(queryClient);
  initTaskHandler(queryClient);

  // Register handlers by event type
  eventHandlers.registerHandler('notification', handleNotification);
  eventHandlers.registerHandler('task', handleTask);

  console.log('[SSEClient] Event handlers registered');
}

// In onMessage callback (when SSE event received):
eventSource.onmessage = async (event) => {
  try {
    // Parse event data
    const data = JSON.parse(event.data) as PlatformEvent;

    // Route to handlers
    await eventHandlers.handleEvent(data);
  } catch (error) {
    console.error('[SSEClient] Error processing event:', error);
    // Don't crash SSE connection
  }
};
```

**Pattern reference:** Dependency injection and initialization pattern

---

#### 8. Mount Toaster in App

**Modify:** `src/prototype-2/frontend/src/App.tsx`

**Details:**
- Import and mount Toaster component
- Place inside providers, outside router
- Toaster is globally accessible

```typescript
// File: src/prototype-2/frontend/src/App.tsx

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLoader from './core/routing/PortalLoader';
import { registerRoutes } from './core/routing';
import setupRoutes from './modules/setup/routes';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { Toaster } from './components/ui/toaster'; // NEW

export default function App() {
  useEffect(() => {
    registerRoutes('main', setupRoutes, { moduleId: 'setup' });
  }, []);

  return (
    <ErrorBoundary level="global">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PortalLoader portalId="main" />} />
            <Route path="/:portalId/*" element={<PortalLoader />} />
          </Routes>
        </BrowserRouter>
        <Toaster /> {/* NEW - Mount toaster globally */}
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**Pattern reference:** Global component mounting pattern

---

#### 9. Initialize Handlers on App Start

**Modify:** `src/prototype-2/frontend/src/main.tsx` or create initialization hook

**Details:**
- Initialize event handlers after QueryClient creation
- Connect handlers to SSE client
- Ensure handlers ready before SSE connection

**Option A: In main.tsx (before render)**
```typescript
// File: src/prototype-2/frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';
import { initializeEventHandlers } from './services/events/sseClient'; // NEW

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Initialize event handlers with QueryClient
initializeEventHandlers(queryClient); // NEW

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);

// Service worker registration...
```

**Option B: In App.tsx with useEffect**
```typescript
// Inside App component
import { initializeEventHandlers } from './services/events/sseClient';
import { useQueryClient } from '@tanstack/react-query';

export default function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize event handlers
    initializeEventHandlers(queryClient);
  }, [queryClient]);

  // ... rest of component
}
```

**Recommendation:** Option A (main.tsx) for earlier initialization

---

### Error Handling Strategy

**Error Types:**

1. **Handler Execution Errors**
   - Handler throws exception during processing
   - **Handling:** Catch in eventHandlers.handleEvent(), log, continue to next handler
   - **Impact:** Single handler failure doesn't break others or SSE connection

2. **Toast API Errors**
   - Invalid toast options
   - Toast limit exceeded
   - **Handling:** Toast hook validates options, queues excess toasts
   - **Impact:** Graceful degradation (toast not shown but app continues)

3. **Cache Invalidation Errors**
   - QueryClient not initialized
   - Invalid query key
   - **Handling:** Log warning, skip invalidation
   - **Impact:** Data may be stale but app continues functioning

4. **Type Discrimination Errors**
   - Event missing `type` field
   - Unknown event type
   - **Handling:** Log warning, skip event
   - **Impact:** Event not processed but SSE connection continues

**Error Display Pattern:**

```typescript
// Handler wrapper (in eventHandlers.handleEvent)
for (const handler of handlers) {
  try {
    await handler(event);
  } catch (error) {
    // Log with context but don't crash
    console.error('[EventHandlers] Handler error:', {
      eventType: event.type,
      eventId: event.id,
      handler: handler.name,
      error,
    });
    // Continue with next handler - don't break loop
  }
}

// Toast error handling (in use-toast.ts)
export function toast(props: Omit<Toast, 'id'>) {
  try {
    // Validate props
    if (!props.title && !props.description) {
      console.warn('[Toast] Toast requires title or description');
      return { id: '', dismiss: () => {}, update: () => {} };
    }

    // Normal flow...
  } catch (error) {
    console.error('[Toast] Error showing toast:', error);
    return { id: '', dismiss: () => {}, update: () => {} };
  }
}

// Cache invalidation error handling
async function invalidateCache(event: NotificationEvent): Promise<void> {
  if (!queryClient) {
    console.warn('[NotificationHandler] QueryClient not initialized, skipping invalidation');
    return; // Graceful degradation
  }

  try {
    await queryClient.invalidateQueries({ queryKey: [schema, entity, id] });
  } catch (error) {
    console.error('[NotificationHandler] Cache invalidation failed:', error);
    // Don't throw - log and continue
  }
}
```

**Pattern reference:** Error isolation similar to ErrorBoundary pattern

---

### Files to Create

1. **`src/prototype-2/frontend/src/types/events.ts`**
   - PlatformEvent, NotificationEvent, TaskEvent interfaces
   - EventHandler type
   - Type guards (isNotificationEvent, isTaskEvent)

2. **`src/prototype-2/frontend/src/hooks/use-toast.ts`**
   - Toast hook implementation
   - Toast state management (memory-based)
   - toast() imperative API
   - useToast() hook for components

3. **`src/prototype-2/frontend/src/components/ui/toaster.tsx`**
   - Toaster container component
   - Renders active toasts from useToast
   - Maps toasts to Toast component instances

4. **`src/prototype-2/frontend/src/services/events/eventHandlers.ts`**
   - EventHandlerRegistry class
   - Handler registration/unregistration
   - Event routing to handlers
   - Error isolation

5. **`src/prototype-2/frontend/src/services/events/notificationHandler.ts`**
   - handleNotification() handler function
   - Category to variant mapping
   - Cache invalidation logic
   - Toast display with icons and actions

6. **`src/prototype-2/frontend/src/services/events/taskHandler.ts`**
   - handleTask() handler function
   - Task state tracking (Map)
   - Progress toast updates
   - Completion/failure handling

---

### Files to Modify

1. **`src/prototype-2/frontend/src/services/events/sseClient.ts`** (Task 1.5.9)
   - Add: `initializeEventHandlers(queryClient)` function
   - Modify: `onmessage` callback to invoke `eventHandlers.handleEvent()`
   - Import handler modules

2. **`src/prototype-2/frontend/src/App.tsx`**
   - Import: `Toaster` component
   - Add: `<Toaster />` mount (inside AuthProvider, outside Router)

3. **`src/prototype-2/frontend/src/main.tsx`**
   - Import: `initializeEventHandlers`
   - Add: `initializeEventHandlers(queryClient)` after QueryClient creation

---

## Validation Gates

### Development Testing

```bash
# Terminal 1 - Start Backend with SSE (Task 1.5.1-1.5.8 complete)
cd src/prototype-2/backend
npm run dev

# Terminal 2 - Start Frontend
cd src/prototype-2/frontend
npm run dev

# Terminal 3 - Test notification publishing
# Use Redis CLI to simulate backend event
redis-cli PUBLISH platform:notifications '{
  "type": "notification",
  "id": "test_notif_1",
  "userId": "user_123",
  "timestamp": "2025-11-06T10:00:00Z",
  "category": "success",
  "severity": "normal",
  "title": "Test Notification",
  "message": "This is a test notification from Redis"
}'

# Expected in browser:
# - Green success toast appears bottom-right
# - Title: "Test Notification"
# - Description: "This is a test notification from Redis"
# - Auto-dismisses after 5 seconds

# Terminal 3 - Test task event
redis-cli PUBLISH platform:tasks '{
  "type": "task",
  "id": "test_task_1",
  "userId": "user_123",
  "timestamp": "2025-11-06T10:01:00Z",
  "status": "running",
  "data": {
    "jobId": "job_123",
    "queueName": "processing",
    "status": "running",
    "progress": 50,
    "message": "Processing your request"
  }
}'

# Expected in browser:
# - Progress toast appears: "Task Running"
# - Description: "Processing your request (50%)"
# - Does NOT auto-dismiss (until completed)
```

### Type Checking

```bash
cd src/prototype-2/frontend
npm run type-check

# Expected: No TypeScript errors
```

### Build Verification

```bash
cd src/prototype-2/frontend
npm run build

# Expected: Successful build
# - No TypeScript errors
# - All new modules compiled
# - Bundle size increase reasonable (<50KB for toast + handlers)
```

### Manual Testing Checklist

**Event Routing:**
- [ ] Notification events route to notification handler
- [ ] Task events route to task handler
- [ ] Unknown event types are logged and skipped
- [ ] Events without `type` field are skipped
- [ ] Multiple handlers for same type all execute

**Notification Display:**
- [ ] Success notifications show green toast
- [ ] Error notifications show red toast
- [ ] Warning notifications show yellow toast
- [ ] Info notifications show blue toast
- [ ] System notifications show blue toast
- [ ] Toast auto-dismisses after duration
- [ ] Critical severity toasts don't auto-dismiss
- [ ] Toast with actionUrl shows "View Details" button
- [ ] Clicking action button navigates to URL

**Task Tracking:**
- [ ] Pending tasks show "Task Pending" toast
- [ ] Running tasks show progress percentage
- [ ] Running tasks don't auto-dismiss
- [ ] Completed tasks show green success toast
- [ ] Failed tasks show red error toast
- [ ] Failed tasks with retryable=true show "Retry" button
- [ ] Cancelled tasks show warning toast
- [ ] Task state tracked in Map
- [ ] Completed tasks removed from tracking after delay

**Cache Invalidation:**
- [ ] Notification with data.schema invalidates cache
- [ ] Notification with data.entity invalidates entity queries
- [ ] Notification with data.id invalidates specific record
- [ ] Task completion invalidates task queries
- [ ] Invalidation happens before toast display
- [ ] QueryClient not initialized logs warning (doesn't crash)

**Error Handling:**
- [ ] Handler throwing error logged but doesn't crash SSE
- [ ] Invalid toast options logged and skipped
- [ ] Missing QueryClient logs warning
- [ ] Event without userId processed normally
- [ ] Multiple rapid events don't crash app
- [ ] Toast limit enforced (max 5 visible)
- [ ] Excess toasts queued (appear when slots free)

**Integration:**
- [ ] Toaster component renders in App
- [ ] Toaster positioned bottom-right
- [ ] Toast z-index above other elements
- [ ] SSE connection receives events
- [ ] Events parsed correctly from SSE data
- [ ] Handler initialization happens before SSE connect
- [ ] Handlers unregister on cleanup (no memory leak)

### Browser Console Checks

```javascript
// Check event handlers registered
// Should see logs:
// "[EventHandlers] Registered handler for type: notification"
// "[EventHandlers] Registered handler for type: task"

// Check handler invocation
// After publishing event, should see:
// "[EventHandlers] Processing event: notification"
// "[NotificationHandler] Processing notification: test_notif_1"
// "[NotificationHandler] Toast displayed: test_notif_1"

// Check error isolation
// If handler throws, should see:
// "[EventHandlers] Handler error: { eventType, eventId, error }"
// SSE connection should remain active (no disconnect)
```

---

## References

**Specifications:**
- [SPEC-events.md](D:\sources\codr.studio\platform\spec\SPEC-events.md) - Complete event system specification
  - Lines 250-254: Frontend event handler requirements (SPEC-EV-FE-008:012)
  - Lines 316-320: Frontend processing pattern (SPEC-EV-FR-001:003)
  - Lines 22-30: Notification concepts (SPEC-EV-CO-005:008)
  - Lines 34-43: Task concepts (SPEC-EV-CO-009:013)

**Codebase Examples:**
- `src/prototype-2/frontend/src/providers/AuthProvider.tsx` - Provider pattern, context management
- `src/prototype-2/frontend/src/components/error/ErrorBoundary.tsx` - Error isolation pattern
- `src/prototype-2/frontend/src/main.tsx` - QueryClient setup, provider hierarchy
- `src/prototype-2/frontend/src/App.tsx` - Component mounting pattern
- `src/prototype-2/backend/src/types/events.types.ts` - Event type definitions

**External Documentation:**
- [shadcn/ui Toast](https://ui.shadcn.com/docs/components/toast) - Toast component documentation
- [@radix-ui/react-toast](https://www.radix-ui.com/primitives/docs/components/toast) - Toast primitives
- [TanStack Query - Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation) - Cache invalidation patterns
- [Lucide React Icons](https://lucide.dev/icons/) - Icon library documentation
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) - SSE client API

**n8n Integration:**
- Handlers receive events published by backend (tasks 1.5.7-1.5.8)
- Backend publishes to Redis Pub/Sub (task 1.5.4)
- SSE service delivers to frontend (task 1.5.1)
- Frontend handlers process and display (this task 1.5.10)
