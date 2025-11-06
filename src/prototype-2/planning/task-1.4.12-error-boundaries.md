# Task Plan: 1.4.12 - Implementar error boundaries

## Context and Objective

This task implements React Error Boundaries to gracefully handle JQEL query errors and rendering failures in the UI. Error boundaries are critical safety mechanisms that prevent a single component error from crashing the entire application.

**What will be implemented:**
- Generic `ErrorBoundary` component using React 19 error handling
- JQEL-specific `JQELErrorBoundary` wrapper optimized for data access errors
- Fallback UI components with retry capability (full-page, inline, minimal)
- Error logging integration with structured logging
- Integration examples with existing JQEL hooks

**Why it's needed:**
- Prevents application crashes from unhandled errors in React components
- Provides user-friendly fallback UI with recovery options
- Enables error logging for diagnostics and monitoring
- Implements SPEC-DA-ERR-006:008 requirements

**How it integrates:**
- Wraps App.tsx for global error handling
- Wraps PortalLoader for portal-level isolation
- Optionally wraps individual JQEL query components
- Integrates with existing `JQELError` class and error handling utilities

**Business value:**
- Improved user experience with graceful error handling
- Faster debugging through structured error logging
- Reduced support burden with self-recovery options
- Higher application reliability and resilience

**User impact:**
- Instead of blank screens, users see helpful error messages
- Users can retry failed operations without page reload
- Clear visual feedback when data loading fails
- Development team gets actionable error reports

## Dependencies

### Prerequisite Tasks
- 1.4.1 - Criar /api/jqel no backend (completed)
- 1.4.6 - Criar hooks useJQELQuery (completed)
- 1.4.7 - Criar hooks useJQELMutation (completed)
- 1.4.9 - Implementar retry logic (partially complete - needs enhancement)

### Files/Modules Affected

**Files to Create:**
- `frontend/src/components/error/ErrorBoundary.tsx` - Generic error boundary
- `frontend/src/components/error/JQELErrorBoundary.tsx` - JQEL-specific boundary
- `frontend/src/components/error/ErrorFallback.tsx` - Full-page fallback UI
- `frontend/src/components/error/InlineErrorFallback.tsx` - Inline fallback UI
- `frontend/src/components/error/MinimalErrorFallback.tsx` - Minimal fallback UI
- `frontend/src/services/logging/errorLogger.ts` - Error logging service
- `frontend/src/types/errorBoundary.ts` - TypeScript types

**Files to Modify:**
- `frontend/src/App.tsx` - Wrap with GlobalErrorBoundary
- `frontend/src/core/routing/PortalLoader.tsx` - Wrap with PortalErrorBoundary
- `frontend/src/services/jqel/errors.ts` - Add logging methods

### Enables Tasks
- 1.8.1 - Criar GlobalErrorBoundary (uses generic ErrorBoundary)
- 1.8.2 - Criar PortalErrorBoundary (uses generic ErrorBoundary)
- 1.8.3 - Criar ModuleErrorBoundary (uses generic ErrorBoundary)
- 1.8.4 - Configurar Winston para logging (integrates with errorLogger)

### External Dependencies
- React 19 (already installed) - Error boundary support
- None (uses existing dependencies)

## Patterns Identified in Codebase

### Similar Components/Modules

**Error Display Components:**
- `frontend/src/components/common/ErrorState.tsx` - Full-page error state with retry
  - Uses accessibility attributes (`role="alert"`, `aria-live="assertive"`)
  - Tailwind CSS styling consistent with theme
  - Simple SVG icon implementation
  - Retry button with primary button styling

- `frontend/src/components/error/RouteError.tsx` - Route-level error fallback
  - Inline styles (should migrate to Tailwind)
  - Shows error details in development mode
  - Supports retry and back actions
  - Uses emoji for visual indicator (platform allows this pattern)

**Query Error Handling:**
- `frontend/src/services/jqel/hooks/useJQELQuery.ts` - Query hook with retry logic
  - `shouldRetry()` function distinguishes client (4xx) from server (5xx) errors
  - Returns `JQELError` typed errors
  - Default retry: up to 3 times for server errors only

- `frontend/src/hooks/jqel/useOptimisticMutation.ts` - Mutation with error handling
  - `onError` callback for error handling
  - Rollback mechanism on failure
  - Error passed to user-provided error handler

### Conventions to Follow

**Naming Conventions:**
- Component files: PascalCase (e.g., `ErrorBoundary.tsx`)
- Utility files: camelCase (e.g., `errorLogger.ts`)
- Type files: camelCase (e.g., `errorBoundary.ts`)
- Props interfaces: `ComponentNameProps` pattern

**File Structure:**
- Error components: `frontend/src/components/error/`
- Logging services: `frontend/src/services/logging/`
- Types: `frontend/src/types/`
- Follow existing directory structure

**Import/Export Patterns:**
- Default export for React components
- Named exports for utilities and types
- Type imports using `import type { ... }`
- Relative imports for local files

**State Management:**
- React component state for error boundaries (class components in React 19)
- No external state management needed
- Error state is local to boundary

**Error Handling:**
- Use `JQELError` class from `frontend/src/services/jqel/errors.ts`
- Check error types with helper methods: `isValidationError()`, `isAuthError()`, etc.
- Log all caught errors with structured data
- Display user-friendly messages, hide technical details in production

### Reusable Code Examples

```typescript
// Pattern from: frontend/src/services/jqel/errors.ts
export class JQELError extends Error {
  code: number;
  field?: string;
  jresult: JResult;

  constructor(jresult: JResult) {
    super(jresult.message || 'JQEL query failed');
    this.name = 'JQELError';
    this.code = jresult.code;
    this.field = jresult.field;
    this.jresult = jresult;
  }

  isValidationError(): boolean {
    return this.code === 400;
  }

  isServerError(): boolean {
    return this.code >= 500 && this.code < 600;
  }
}
```

```typescript
// Pattern from: frontend/src/components/common/ErrorState.tsx
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md px-4">
        <div className="mx-auto mb-4 text-destructive">
          {/* SVG icon */}
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
```

```typescript
// Pattern from: frontend/src/services/jqel/hooks/useJQELQuery.ts
function shouldRetry(failureCount: number, error: JQELError): boolean {
  // Don't retry client errors (4xx)
  if (error.code >= 400 && error.code < 500) {
    return false;
  }

  // Retry server errors (5xx) up to 3 times
  if (error.code >= 500) {
    return failureCount < 3;
  }

  return failureCount < 3;
}
```

## Critical Context

### Documentation

**React 19 Error Boundaries:**
- [React Docs - Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- Error boundaries are class components that implement `componentDidCatch()` and `getDerivedStateFromError()`
- Only catch errors in rendering, lifecycle methods, and constructors
- Do NOT catch errors in event handlers (use try-catch instead)

**JQEL Error Handling:**
- See `spec/SPEC-data-access.md` sections 11 (Tratamento de Erros)
- SPEC-DA-ERR-006: Error boundaries for render errors
- SPEC-DA-ERR-007: Fallback UI with retry option
- SPEC-DA-ERR-008: Error logging for diagnostics

**Platform Error Handling:**
- See `spec/SPEC-error-handling.md` sections 3 (Error Boundaries)
- SPEC-ERR-BOUND-001:004 - Global error boundary requirements
- SPEC-ERR-BOUND-005:007 - Portal error boundary requirements
- SPEC-ERR-BOUND-008:010 - Module error boundary requirements

### Gotchas and Pitfalls

**React 19 Error Boundaries:**
- ⚠️ Error boundaries MUST be class components (not function components)
- ⚠️ Error boundaries do NOT catch errors in:
  - Event handlers (use try-catch)
  - Asynchronous code (setTimeout, promises)
  - Server-side rendering
  - Errors thrown in the error boundary itself
- ⚠️ `getDerivedStateFromError()` is static - cannot access `this`
- ⚠️ `componentDidCatch()` is for side effects (logging), not state updates

**JQEL Integration:**
- ⚠️ TanStack Query errors appear in component render, not in error boundary
- ⚠️ Must use Error Boundary only for uncaught rendering errors
- ⚠️ For query errors, use `error` state from `useJQELQuery()` instead
- ⚠️ Error boundaries complement, not replace, query error handling

**Logging:**
- ⚠️ Don't log sensitive data (passwords, tokens, PII)
- ⚠️ Stack traces only in development mode
- ⚠️ Use structured logging format for easy parsing
- ⚠️ Consider rate limiting logs to prevent spam

**Performance:**
- ⚠️ Error boundaries have minimal overhead
- ⚠️ Avoid creating too many nested boundaries (one per portal/module is enough)
- ⚠️ Don't trigger re-renders on every logged error

### Existing Patterns to Follow

**Error Display:**
- See `frontend/src/components/common/ErrorState.tsx` for full-page error pattern
- Use `role="alert"` and `aria-live="assertive"` for accessibility
- Use Tailwind CSS classes, avoid inline styles
- Use semantic color tokens: `text-destructive`, `bg-destructive/10`

**Development vs Production:**
- See `frontend/src/components/error/RouteError.tsx` for environment detection
- Use `import.meta.env.DEV` to check environment
- Show stack traces and technical details only in development
- Use generic messages in production

**Button Styling:**
- Follow pattern from ErrorState: `bg-primary px-4 py-2 text-sm font-medium`
- Use `hover:bg-primary/90` for hover state
- Include focus ring: `focus:outline-none focus:ring-2 focus:ring-primary`

## Technical Specification

### Architecture

```
frontend/src/
├── components/
│   └── error/
│       ├── ErrorBoundary.tsx          # Generic error boundary (class component)
│       ├── JQELErrorBoundary.tsx      # JQEL-specific wrapper (function component)
│       ├── ErrorFallback.tsx          # Full-page fallback UI
│       ├── InlineErrorFallback.tsx    # Inline fallback UI
│       ├── MinimalErrorFallback.tsx   # Minimal fallback UI
│       └── RouteError.tsx             # (existing - may enhance)
│
├── services/
│   ├── jqel/
│   │   └── errors.ts                  # (modify - add logging methods)
│   └── logging/
│       └── errorLogger.ts             # Structured error logging
│
└── types/
    └── errorBoundary.ts               # TypeScript definitions
```

### Data Flow

```
Component Error Thrown
        ↓
ErrorBoundary.getDerivedStateFromError()
        ↓
    (Update state to hasError: true)
        ↓
ErrorBoundary.componentDidCatch()
        ↓
    errorLogger.logError()
        ↓
    (Log to console / monitoring service)
        ↓
ErrorBoundary.render()
        ↓
    Render fallback UI with error details
        ↓
    User clicks "Retry"
        ↓
    Reset error state → Re-render children
```

### Modules and Responsibilities

**ErrorBoundary (Class Component):**
- Responsibility: Catch React rendering errors, manage error state, render fallback
- Interface:
  ```typescript
  interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ComponentType<FallbackProps>;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    level?: 'global' | 'portal' | 'module';
  }
  ```

**JQELErrorBoundary (Function Component):**
- Responsibility: Wrap ErrorBoundary with JQEL-specific configuration
- Interface:
  ```typescript
  interface JQELErrorBoundaryProps {
    children: ReactNode;
    fallbackType?: 'full' | 'inline' | 'minimal';
    queryKey?: readonly unknown[];
  }
  ```

**ErrorFallback Components:**
- Responsibility: Display user-friendly error messages with retry
- Three variants: Full-page, Inline, Minimal
- Interface:
  ```typescript
  interface FallbackProps {
    error: Error;
    resetError: () => void;
    level?: 'global' | 'portal' | 'module';
  }
  ```

**errorLogger Service:**
- Responsibility: Structured logging of errors with context
- Interface:
  ```typescript
  interface LogErrorOptions {
    category: string;
    level: 'ERROR' | 'WARN' | 'INFO';
    context?: Record<string, any>;
  }

  function logError(error: Error, options: LogErrorOptions): void;
  ```

### State Management

**ErrorBoundary State:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

State managed locally in class component:
- `getDerivedStateFromError()` - Set `hasError: true`, store `error`
- `componentDidCatch()` - Store `errorInfo`, trigger logging
- `resetError()` - Reset to initial state, trigger re-render

**No global state needed** - Each boundary manages its own error state independently.

### Libraries and Tools

**React 19 (v19.2.0):**
- Built-in error boundary support via class components
- `Component.getDerivedStateFromError()` - Static method for state updates
- `Component.componentDidCatch()` - Instance method for side effects

**TypeScript (v5.5.0):**
- Type safety for error boundary props and state
- `ErrorInfo` type from React for error details
- Discriminated unions for fallback types

**Tailwind CSS (v4.1.16):**
- Styling for fallback UI components
- Semantic color tokens (`text-destructive`, `bg-destructive`)
- Responsive utilities for mobile/desktop

**No additional dependencies required** - Uses existing platform stack.

## UI/UX Specification

### Visual Components

**Reusable Components:**
- `<ErrorState>` - from `components/common/ErrorState.tsx` (existing)
  - Full-page error display with centered layout
  - Props: `title`, `message`, `onRetry`

**New Components:**

**`<ErrorBoundary>`** - Generic boundary (not visually rendered)
- Props: `children`, `fallback`, `onError`, `level`
- Renders children when no error, fallback when error caught

**`<ErrorFallback>`** - Full-page fallback
- Layout: Centered vertically and horizontally
- Content: Large error icon, title, message, retry button
- Props: `error`, `resetError`, `level`

**`<InlineErrorFallback>`** - Inline fallback
- Layout: Alert box with border
- Content: Small icon, message, retry link
- Props: `error`, `resetError`

**`<MinimalErrorFallback>`** - Minimal fallback
- Layout: Single line with icon
- Content: Icon + brief message + retry link
- Props: `error`, `resetError`

**`<JQELErrorBoundary>`** - JQEL wrapper
- Wrapper around `<ErrorBoundary>` with JQEL-specific logic
- Automatically selects appropriate fallback based on error type
- Props: `children`, `fallbackType`, `queryKey`

### User Journey

**1. Normal Operation**
- User navigates to page with JQEL queries
- Data loads successfully
- No error boundary triggered

**2. Rendering Error Occurs**
- Component throws error during render (e.g., null.property)
- Error boundary catches error
- Fallback UI displays immediately

**3. User Sees Error Feedback**
- **Global Error**: Full-page fallback with "Reload Page" button
- **Portal Error**: Full-page fallback with "Back to Home" + "Reload Portal"
- **Module Error**: Inline fallback with "Try Again"

**4. User Attempts Recovery**
- User clicks "Try Again" button
- Error boundary resets state
- Component re-renders (may succeed if transient error)

**5. Success or Escalation**
- **If successful**: Component renders normally, user continues
- **If fails again**: Error boundary catches again, shows fallback
- **If persistent**: User can reload page or navigate away

### Interface States

**Initial State (No Error):**
```tsx
<ErrorBoundary>
  <YourComponent />  {/* Rendered normally */}
</ErrorBoundary>
```

**Error State (Full-page):**
```
┌─────────────────────────────────────┐
│                                     │
│         [Error Icon]                │
│                                     │
│     Something went wrong            │
│                                     │
│  An unexpected error occurred.     │
│  Try reloading the page.           │
│                                     │
│     [Reload Page]                   │
│                                     │
│  (Error details - dev only)         │
│                                     │
└─────────────────────────────────────┘
```

**Error State (Inline):**
```
┌─────────────────────────────────────┐
│ ⚠ Failed to load this section       │
│ [Try Again]                          │
└─────────────────────────────────────┘
```

**Error State (Minimal):**
```
⚠ Error loading data. Try again?
```

**Loading State (After Retry):**
- Not applicable - Error boundary reset triggers immediate re-render
- If component has loading state, it will show its own spinner

**Success State (After Successful Retry):**
- Component renders normally
- No indication that error occurred (clean slate)

### Design Tokens

**Colors:**
- `text-destructive` - Error text color (red)
- `bg-destructive/10` - Error background (light red)
- `border-destructive` - Error border (red)
- `text-muted-foreground` - Secondary text (gray)
- `bg-primary` - Button background (brand color)
- `text-primary-foreground` - Button text (white)

**Spacing:**
- `p-4` - Padding for inline errors
- `px-4 py-2` - Button padding
- `mb-2` - Margin between title and message
- `mb-4` - Margin below message
- `max-w-md` - Max width for full-page errors

**Typography:**
- `text-xl font-semibold` - Error title
- `text-sm font-medium` - Button text
- `text-muted-foreground` - Error message
- `text-xs` - Error details (dev mode)

### Responsive Behavior

**Mobile (< 768px):**
- Full-page errors: Stack vertically, max-width 90%
- Inline errors: Full width, icon above text
- Buttons: Full width on very small screens

**Tablet (768px - 1024px):**
- Full-page errors: Centered, max-width 600px
- Inline errors: Horizontal layout
- Buttons: Auto width, centered

**Desktop (> 1024px):**
- Full-page errors: Centered, max-width 600px
- Inline errors: Horizontal layout
- Buttons: Auto width, centered

### Accessibility (WCAG 2.1 AA)

**ARIA Attributes:**
- `role="alert"` - Mark error regions as alerts
- `aria-live="assertive"` - Announce errors immediately to screen readers
- `aria-describedby` - Link error messages to related elements

**Keyboard Navigation:**
- Retry button focusable with Tab
- Enter/Space to activate retry
- Escape to dismiss (if dismissible)

**Screen Reader Announcements:**
- "Error: [error message]" announced when boundary catches error
- "Retrying..." announced when retry button clicked
- "Success" announced if retry succeeds (via component)

**Focus Management:**
- Focus moves to retry button when error appears
- Focus returns to triggering element after successful retry
- Focus ring visible on all interactive elements

**Color Contrast:**
- Error text: 4.5:1 contrast ratio minimum
- Button: 4.5:1 contrast ratio
- Icons: Redundant with text (not color-only)

## Implementation Blueprint

### Ordered Steps

**1. Create TypeScript Types**
- Create: `frontend/src/types/errorBoundary.ts`
- Details: Define interfaces for error boundary props, state, and fallback props
- Exports: `ErrorBoundaryProps`, `ErrorBoundaryState`, `FallbackProps`, `LogErrorOptions`

```typescript
// Pattern: Similar to frontend/src/types/jqel.ts
import type { ReactNode, ComponentType, ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'portal' | 'module';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface FallbackProps {
  error: Error;
  resetError: () => void;
  level?: 'global' | 'portal' | 'module';
}

export interface LogErrorOptions {
  category: string;
  level?: 'ERROR' | 'WARN' | 'INFO';
  context?: Record<string, any>;
}
```

**2. Create Error Logger Service**
- Create: `frontend/src/services/logging/errorLogger.ts`
- Details: Implement structured logging with environment-aware output
- Pattern: See error handling pattern from existing hooks

```typescript
// Pattern: Similar to logging in useJQELQuery.ts shouldRetry()
import type { LogErrorOptions } from '../../types/errorBoundary';

interface ErrorLogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  category: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
}

export function logError(error: Error, options: LogErrorOptions): void {
  const { category, level = 'ERROR', context = {} } = options;

  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message: error.message,
    error: {
      name: error.name,
      message: error.message,
      ...(import.meta.env.DEV && { stack: error.stack })
    },
    context
  };

  // Console output (always in dev, only ERROR/WARN in prod)
  if (import.meta.env.DEV || level === 'ERROR' || level === 'WARN') {
    console.error(`[${level}] ${category}:`, logEntry);
  }

  // TODO: Send to monitoring service in production
  // if (!import.meta.env.DEV && level === 'ERROR') {
  //   sendToMonitoring(logEntry);
  // }
}

export function logWarning(message: string, category: string, context?: Record<string, any>): void {
  console.warn(`[WARN] ${category}:`, { message, context });
}

export function logInfo(message: string, category: string, context?: Record<string, any>): void {
  if (import.meta.env.DEV) {
    console.info(`[INFO] ${category}:`, { message, context });
  }
}
```

**3. Create Generic ErrorBoundary Component**
- Create: `frontend/src/components/error/ErrorBoundary.tsx`
- Details: Class component implementing React error boundary lifecycle
- Pattern: React 19 class component pattern

```typescript
// React 19 Error Boundary Pattern
import { Component, type ReactNode, type ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, FallbackProps } from '../../types/errorBoundary';
import { logError } from '../../services/logging/errorLogger';
import { ErrorFallback } from './ErrorFallback';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to render fallback UI on next render
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context
    logError(error, {
      category: 'error-boundary',
      level: 'ERROR',
      context: {
        level: this.props.level || 'unknown',
        componentStack: errorInfo.componentStack
      }
    });

    // Store errorInfo for display
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          level={this.props.level}
        />
      );
    }

    return this.props.children;
  }
}
```

**4. Create Full-Page Error Fallback**
- Create: `frontend/src/components/error/ErrorFallback.tsx`
- Details: Full-page error display with retry button
- Pattern: Based on `frontend/src/components/common/ErrorState.tsx`

```typescript
// Pattern from: frontend/src/components/common/ErrorState.tsx
import type { FallbackProps } from '../../types/errorBoundary';

export function ErrorFallback({ error, resetError, level = 'global' }: FallbackProps) {
  const handleRetry = () => {
    resetError();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const title = level === 'global'
    ? 'Something went wrong'
    : level === 'portal'
    ? 'Portal error'
    : 'Component error';

  const message = level === 'global'
    ? 'An unexpected error occurred. Please reload the page.'
    : level === 'portal'
    ? 'This portal encountered an error. Try reloading or go back to home.'
    : 'This component failed to load. Try again or refresh the page.';

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md px-4">
        {/* Error Icon */}
        <div className="mx-auto mb-4 text-destructive">
          <svg
            className="mx-auto"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2">{title}</h2>

        {/* Message */}
        <p className="text-muted-foreground mb-4">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          {level !== 'global' && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          )}

          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

**5. Create Inline Error Fallback**
- Create: `frontend/src/components/error/InlineErrorFallback.tsx`
- Details: Compact inline error display for module-level errors
- Pattern: Alert-style component

```typescript
import type { FallbackProps } from '../../types/errorBoundary';

export function InlineErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div
      className="rounded-lg border border-destructive bg-destructive/10 p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <svg
          className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load this section
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An error occurred while loading.'}
          </p>
          <button
            onClick={resetError}
            className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>

      {/* Error Details (Development Only) */}
      {import.meta.env.DEV && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto max-h-32">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
```

**6. Create Minimal Error Fallback**
- Create: `frontend/src/components/error/MinimalErrorFallback.tsx`
- Details: Single-line error display for non-critical components
- Pattern: Inline text with retry link

```typescript
import type { FallbackProps } from '../../types/errorBoundary';

export function MinimalErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="alert">
      <svg
        className="h-4 w-4 text-destructive flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>Error loading data.</span>
      <button
        onClick={resetError}
        className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        Try again?
      </button>
    </div>
  );
}
```

**7. Create JQEL Error Boundary Wrapper**
- Create: `frontend/src/components/error/JQELErrorBoundary.tsx`
- Details: Function component wrapping ErrorBoundary with JQEL-specific logic
- Pattern: Wrapper component with smart fallback selection

```typescript
import { type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { InlineErrorFallback } from './InlineErrorFallback';
import { MinimalErrorFallback } from './MinimalErrorFallback';
import { isJQELError } from '../../services/jqel/errors';
import { logError } from '../../services/logging/errorLogger';

interface JQELErrorBoundaryProps {
  children: ReactNode;
  fallbackType?: 'full' | 'inline' | 'minimal';
  queryKey?: readonly unknown[];
}

export function JQELErrorBoundary({
  children,
  fallbackType = 'inline',
  queryKey
}: JQELErrorBoundaryProps) {

  const handleError = (error: Error) => {
    // Log with JQEL context
    logError(error, {
      category: 'jqel-query',
      level: 'ERROR',
      context: {
        isJQELError: isJQELError(error),
        queryKey: queryKey ? JSON.stringify(queryKey) : undefined,
        ...(isJQELError(error) && {
          code: error.code,
          field: error.field
        })
      }
    });
  };

  // Select fallback component based on type
  const fallbackComponent =
    fallbackType === 'full' ? ErrorFallback :
    fallbackType === 'inline' ? InlineErrorFallback :
    MinimalErrorFallback;

  return (
    <ErrorBoundary
      fallback={fallbackComponent}
      onError={handleError}
      level="module"
    >
      {children}
    </ErrorBoundary>
  );
}
```

**8. Update App.tsx with Global Error Boundary**
- Modify: `frontend/src/App.tsx`
- Details: Wrap entire app with global error boundary
- Pattern: Top-level wrapper pattern

```typescript
// Add import
import { ErrorBoundary } from './components/error/ErrorBoundary';

export default function App() {
  // ... existing code ...

  return (
    <ErrorBoundary level="global">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PortalLoader portalId="main" />} />
            <Route path="/:portalId/*" element={<PortalLoader />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**9. Add Portal Error Boundary to PortalLoader**
- Modify: `frontend/src/core/routing/PortalLoader.tsx`
- Details: Wrap portal content with portal-level error boundary
- Pattern: Portal isolation pattern

```typescript
// Add import
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

export default function PortalLoader({ portalId }: PortalLoaderProps) {
  // ... existing code ...

  return (
    <ErrorBoundary level="portal">
      {/* existing portal content */}
    </ErrorBoundary>
  );
}
```

**10. Add Logging Methods to JQELError**
- Modify: `frontend/src/services/jqel/errors.ts`
- Details: Add convenience methods for logging JQEL errors
- Pattern: Extend existing class with logging helpers

```typescript
// Add import
import { logError } from '../logging/errorLogger';

export class JQELError extends Error {
  // ... existing code ...

  /**
   * Log this error with JQEL context
   */
  log(context?: Record<string, any>): void {
    logError(this, {
      category: 'jqel',
      level: 'ERROR',
      context: {
        code: this.code,
        field: this.field,
        ...context
      }
    });
  }

  /**
   * Get user-friendly error message based on error code
   */
  getUserMessage(): string {
    if (this.isValidationError()) {
      return 'Invalid data. Please check your input.';
    }
    if (this.code === 401) {
      return 'Please log in to continue.';
    }
    if (this.code === 403) {
      return 'You do not have permission for this action.';
    }
    if (this.code === 404) {
      return 'Resource not found.';
    }
    if (this.isServerError()) {
      return 'Server error. Please try again later.';
    }
    return this.message || 'An error occurred.';
  }
}
```

### Error Handling Strategy

**Error Types:**

**Network Errors:**
- Timeout: Retry up to 3 times with exponential backoff
- Connection lost: Show offline indicator, auto-retry when online
- 5xx errors: Retry with backoff, show "Server error" message

**Validation Errors (4xx):**
- 400 Bad Request: Display validation errors inline
- 401 Unauthorized: Trigger auth refresh, then redirect to login
- 403 Forbidden: Show "Permission denied" message
- 404 Not Found: Show "Resource not found" message
- 429 Rate Limited: Show "Too many requests" with countdown

**Rendering Errors:**
- Caught by error boundary
- Log with component stack
- Display fallback UI with retry option

**JQEL Query Errors:**
- Handled by TanStack Query error state (NOT error boundary)
- Display inline error message
- Provide retry button

**Error Display Pattern:**

```typescript
// Pattern from: Combination of ErrorState.tsx and RouteError.tsx
function handleJQELError(error: unknown) {
  if (isJQELError(error)) {
    // Log error
    error.log({ component: 'MyComponent' });

    // Display user-friendly message
    const message = error.getUserMessage();
    showToast(message, 'error');

    // Different handling based on code
    if (error.code === 401) {
      // Trigger auth refresh
      refreshAuth();
    } else if (error.isServerError()) {
      // Enable retry
      enableRetry();
    }
  } else {
    // Unknown error
    logError(error as Error, { category: 'unknown' });
    showToast('An unexpected error occurred', 'error');
  }
}
```

### Files to Create

**Components:**
1. `frontend/src/components/error/ErrorBoundary.tsx` - Generic error boundary class component
2. `frontend/src/components/error/ErrorFallback.tsx` - Full-page fallback UI
3. `frontend/src/components/error/InlineErrorFallback.tsx` - Inline fallback UI
4. `frontend/src/components/error/MinimalErrorFallback.tsx` - Minimal fallback UI
5. `frontend/src/components/error/JQELErrorBoundary.tsx` - JQEL-specific wrapper

**Services:**
6. `frontend/src/services/logging/errorLogger.ts` - Structured error logging

**Types:**
7. `frontend/src/types/errorBoundary.ts` - TypeScript definitions

### Files to Modify

**App Integration:**
1. `frontend/src/App.tsx` - Wrap with global ErrorBoundary
2. `frontend/src/core/routing/PortalLoader.tsx` - Wrap with portal ErrorBoundary

**Error Enhancement:**
3. `frontend/src/services/jqel/errors.ts` - Add `log()` and `getUserMessage()` methods

## Validation Gates

**Type Checking:**
```bash
# Ensure all TypeScript types are valid
npm run type-check
```

**Build Verification:**
```bash
# Verify production build succeeds
npm run build
```

**Manual Testing:**

**Test Error Boundary Catching:**
1. Create component that throws error in render
2. Verify error boundary catches and shows fallback
3. Verify retry button resets and re-renders
4. Verify error is logged to console (dev mode)

**Test JQEL Error Boundary:**
1. Create component with JQEL query that fails
2. Verify appropriate fallback displays (inline/full/minimal)
3. Verify retry triggers re-query
4. Verify error logged with query context

**Test Portal Isolation:**
1. Trigger error in one portal
2. Verify error boundary scoped to portal
3. Verify other portals unaffected
4. Navigate away and back - error should be cleared

**Test Development vs Production:**
1. In dev mode: Verify stack traces visible
2. In prod build: Verify stack traces hidden
3. Verify generic messages in production

**Accessibility Testing:**
```bash
# Manual checks
- Tab to retry button (keyboard navigation)
- Screen reader announces error (role="alert")
- Focus visible on interactive elements
- Color contrast meets WCAG AA (4.5:1)
```

**Expected Outcomes:**
- All components render without TypeScript errors
- Build completes successfully
- Error boundaries catch rendering errors
- Fallback UI displays correctly
- Retry functionality works
- Errors logged with context
- Accessibility requirements met

## References

**Specifications:**
- SPEC-data-access.md - Section 11 (Tratamento de Erros)
  - SPEC-DA-ERR-006: Error boundaries for render errors
  - SPEC-DA-ERR-007: Fallback UI with retry option
  - SPEC-DA-ERR-008: Error logging for diagnostics

- SPEC-error-handling.md - Section 3 (Error Boundaries)
  - SPEC-ERR-BOUND-001:004 - Global boundary requirements
  - SPEC-ERR-BOUND-005:007 - Portal boundary requirements
  - SPEC-ERR-BOUND-008:010 - Module boundary requirements

**Documentation:**
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React 19 Error Handling](https://react.dev/learn/error-boundaries)

**Codebase Examples:**
- `frontend/src/components/common/ErrorState.tsx` - Full-page error pattern
- `frontend/src/components/error/RouteError.tsx` - Route error fallback
- `frontend/src/services/jqel/errors.ts` - JQELError class
- `frontend/src/services/jqel/hooks/useJQELQuery.ts` - Retry logic pattern
