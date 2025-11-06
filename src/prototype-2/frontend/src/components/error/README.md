# Error Boundary System

This directory implements the three-tier error boundary hierarchy for the platform:
- **Global**: Catches application-wide errors (wraps entire app)
- **Portal**: Catches portal-level errors (wraps each portal)
- **Module**: Catches module-level errors (wraps individual modules)

Based on SPEC-error-handling.md requirements.

## Components

### ErrorBoundary (Generic)
Generic error boundary component that can be used at any level.

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { CustomFallback } from '@/components/error/CustomFallback';

<ErrorBoundary level="module" fallback={CustomFallback}>
  <YourComponent />
</ErrorBoundary>
```

### ModuleErrorBoundary (Recommended)
Convenience wrapper pre-configured for module-level error handling.

```typescript
import { ModuleErrorBoundary } from '@/components/error/ModuleErrorBoundary';

// Recommended: Wrap entire module
export function MyModule() {
  return (
    <ModuleErrorBoundary moduleId="my-module">
      <ModuleContent />
    </ModuleErrorBoundary>
  );
}
```

### ModuleErrorFallback
Inline error fallback UI specifically designed for module errors.
Fits within module container without breaking portal layout.

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ModuleErrorFallback } from '@/components/error/ModuleErrorFallback';

<ErrorBoundary level="module" fallback={ModuleErrorFallback}>
  <ComplexModuleFeature />
</ErrorBoundary>
```

## Usage Examples

### Example 1: Module Entry Point (Recommended)

Wrap the entire module at its entry point:

```typescript
// src/modules/dashboard/index.tsx
import { ModuleErrorBoundary } from '@/components/error/ModuleErrorBoundary';
import { DashboardContent } from './DashboardContent';

export function DashboardModule() {
  return (
    <ModuleErrorBoundary moduleId="dashboard">
      <DashboardContent />
    </ModuleErrorBoundary>
  );
}
```

### Example 2: Route-Level Boundaries

Wrap individual routes within a module:

```typescript
// src/modules/kanban/routes.tsx
import { ModuleErrorBoundary } from '@/components/error/ModuleErrorBoundary';
import { KanbanBoard } from './pages/KanbanBoard';
import { KanbanSettings } from './pages/KanbanSettings';

export const routes = [
  {
    path: 'board',
    element: (
      <ModuleErrorBoundary moduleId="kanban-board">
        <KanbanBoard />
      </ModuleErrorBoundary>
    )
  },
  {
    path: 'settings',
    element: (
      <ModuleErrorBoundary moduleId="kanban-settings">
        <KanbanSettings />
      </ModuleErrorBoundary>
    )
  }
];
```

### Example 3: Complex Widget

For complex widgets that might fail independently:

```typescript
// src/modules/dashboard/widgets/AnalyticsWidget.tsx
import { ModuleErrorBoundary } from '@/components/error/ModuleErrorBoundary';
import { AnalyticsChart } from './AnalyticsChart';

export function AnalyticsWidget() {
  return (
    <ModuleErrorBoundary moduleId="analytics-widget">
      <AnalyticsChart />
    </ModuleErrorBoundary>
  );
}
```

### Example 4: Custom Error Handling

Add custom error handling logic:

```typescript
import { ModuleErrorBoundary } from '@/components/error/ModuleErrorBoundary';
import { sendErrorToAnalytics } from '@/services/analytics';

export function MyModule() {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Custom error tracking
    sendErrorToAnalytics({
      module: 'my-module',
      error: error.message,
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <ModuleErrorBoundary
      moduleId="my-module"
      onError={handleError}
    >
      <ModuleContent />
    </ModuleErrorBoundary>
  );
}
```

## Best Practices

### ✅ DO:
- Place boundaries at module entry points for maximum coverage
- Use `moduleId` prop for better error tracking and debugging
- Keep fallback UI inline (don't break portal layout)
- Use boundaries for complex features (dashboards, editors, visualizations)
- Test error recovery by clicking "Try Again"

### ❌ DON'T:
- Wrap every component (defeats the purpose)
- Use boundaries for simple components (buttons, icons, labels)
- Create nested boundaries at the same level
- Take full screen with module error UI
- Over-complicate recovery logic

### When to Use Module Boundaries:
- **Complex features**: Dashboard, kanban board, calendar, rich editor
- **Third-party integrations**: Chart libraries, external widgets
- **Data-heavy components**: Large tables, complex forms
- **Independent features**: Each feature can fail without affecting others

### When NOT to Use:
- **Simple components**: Buttons, icons, text labels
- **Layout components**: Headers, footers, navigation
- **Every list item**: Wrap the list, not each item
- **Over-isolation**: Balance between isolation and complexity

## Error Flow

```
Module Component Error
         ↓
ErrorBoundary (level="module")
         ↓
getDerivedStateFromError()
(Set hasError=true)
         ↓
componentDidCatch()
(Log error with moduleId)
         ↓
ModuleErrorFallback
├── Display inline error
├── Show "Try Again" button
└── Dev: Show error details
         ↓
Portal Layout Remains Intact
├── Navigation works
├── Other modules function
└── User can navigate away
```

## Testing

### Manual Testing:
1. Create test component that throws error on button click
2. Wrap with ModuleErrorBoundary
3. Verify error displays inline (not full-screen)
4. Verify portal navigation still works
5. Verify other modules still function
6. Click "Try Again" - should re-render
7. Check browser console - error should be logged with moduleId

### Example Test Component:
```typescript
function ErrorTester() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test module error');
  }

  return (
    <ModuleErrorBoundary moduleId="error-tester">
      <button onClick={() => setShouldError(true)}>
        Trigger Error
      </button>
    </ModuleErrorBoundary>
  );
}
```

## Architecture

The three-tier hierarchy ensures progressive error isolation:

```
┌─────────────────────────────────────┐
│  GlobalErrorBoundary               │ ← App crashes (full screen)
│  ┌───────────────────────────────┐ │
│  │ PortalErrorBoundary           │ │ ← Portal crashes (portal area)
│  │ ┌───────────────────────────┐ │ │
│  │ │ ModuleErrorBoundary       │ │ │ ← Module crashes (inline)
│  │ │                           │ │ │
│  │ │  Module Content           │ │ │
│  │ │                           │ │ │
│  │ └───────────────────────────┘ │ │
│  │                               │ │
│  │ Other modules still work      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

Each tier catches errors that escape the tier below it, providing maximum resilience.

## References

- [SPEC-error-handling.md](../../../../../../spec/SPEC-error-handling.md)
  - SPEC-ERR-BOUND-008: Module boundary support
  - SPEC-ERR-BOUND-009: Module errors MUST NOT break portal
  - SPEC-ERR-BOUND-010: Module-specific fallback UI

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Boundary Best Practices](https://react.dev/learn/error-boundaries)
