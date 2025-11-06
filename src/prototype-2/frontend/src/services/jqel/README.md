# JQEL Service

This directory contains the JQEL (JSON Query Expression Language) client and integration with TanStack Query.

## Cache Invalidation

Cache invalidation happens automatically after mutations via mutation hooks (`useInsert`, `useUpdate`, `useDelete`).

### Automatic Invalidation

```typescript
import { useInsert } from '@/services/jqel';

function MyComponent() {
  const createUser = useInsert('sac', 'usuario');

  const handleCreate = () => {
    createUser.mutate({
      values: { nome: 'John Doe', email: 'john@example.com' }
    });
    // Cache automatically invalidated after success
    // All queries for ['sac', 'usuario'] will refetch
  };
}
```

### Invalidation Scopes

- **specific**: Invalidate specific records only (UPDATE with ID)
- **entity**: Invalidate all queries for entity (INSERT, DELETE)
- **schema**: Invalidate entire schema (bulk operations)

### Custom Invalidation Strategy

```typescript
import { useJQELMutation } from '@/services/jqel';

const mutation = useJQELMutation({
  buildQuery: (vars) => ({
    schema: 'sac',
    mutate: 'usuario',
    action: 'custom-bulk-update',
    where: { status: { $eq: 'pending' } },
    values: { status: 'active' }
  }),
  invalidateKeys: () => [
    ['sac', 'usuario'],           // Invalidate all users
    ['dashboard', 'user-stats']   // Also invalidate dashboard
  ]
});
```

### Manual Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { invalidateEntity, invalidateBackend } from '@/services/jqel';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate specific entity
    invalidateEntity(queryClient, 'sac', 'usuario');

    // Invalidate specific record
    invalidateEntity(queryClient, 'sac', 'usuario', { recordId: 123 });

    // Invalidate backend config
    invalidateBackend(queryClient, { portal: true });
  };
}
```

## Query Keys

All query keys use hierarchical structure for efficient invalidation.

### Backend Schema Keys

```typescript
import { queryKeys } from '@/services/jqel';

// All backend queries
queryKeys.backend.all  // ['backend']

// Portals
queryKeys.backend.portals()  // ['backend', 'portal']
queryKeys.backend.portal('main')  // ['backend', 'portal', { id: 'main' }]

// Modules
queryKeys.backend.modules()  // ['backend', 'module']
queryKeys.backend.modules('main')  // ['backend', 'module', { portalId: 'main' }]
queryKeys.backend.module('setup')  // ['backend', 'module', { moduleId: 'setup' }]

// Instances
queryKeys.backend.instances()  // ['backend', 'instance']
queryKeys.backend.instances('main', 'chat')  // ['backend', 'instance', { portalId: 'main', moduleId: 'chat' }]
queryKeys.backend.instance('inst-1')  // ['backend', 'instance', { id: 'inst-1' }]
```

### Application Schema Keys

```typescript
// All queries for schema
queryKeys.schema.all('sac')  // ['sac']

// All queries for entity
queryKeys.schema.entity('sac', 'usuario')  // ['sac', 'usuario']

// List with filters
queryKeys.schema.list('sac', 'usuario', { status: 'active' })
// ['sac', 'usuario', 'list', { status: 'active' }]

// Specific record
queryKeys.schema.detail('sac', 'usuario', 123)
// ['sac', 'usuario', 'detail', { id: 123 }]

// Custom query
queryKeys.schema.custom('sac', 'usuario', 'recent', { limit: 10 })
// ['sac', 'usuario', 'recent', { limit: 10 }]
```

## Mutation Hooks

### useInsert

```typescript
import { useInsert } from '@/services/jqel';

const createPortal = useInsert<Portal>('backend', 'portal', {
  output: ['portalId', 'name', 'path']
});

createPortal.mutate(
  { values: { name: 'New Portal', path: '/new' } },
  {
    onSuccess: (portal) => console.log('Created:', portal),
    onError: (error) => console.error(error)
  }
);
```

### useUpdate

```typescript
import { useUpdate } from '@/services/jqel';

const updatePortal = useUpdate<Portal>('backend', 'portal');

updatePortal.mutate(
  {
    where: { portalId: { $eq: 'main' } },
    values: { name: 'Updated Name' }
  },
  {
    onSuccess: (portal) => console.log('Updated:', portal)
  }
);
```

### useDelete

```typescript
import { useDelete } from '@/services/jqel';

const deletePortal = useDelete<Portal>('backend', 'portal');

deletePortal.mutate(
  { where: { portalId: { $eq: 'temp-portal' } } },
  {
    onSuccess: () => console.log('Deleted')
  }
);
```

## SSE Event Integration (Future)

When SSE (Server-Sent Events) system is implemented (Task 1.5), invalidation will also be triggered by real-time events:

```typescript
// Event listener will call
invalidateEntity(queryClient, event.schema, event.entity, {
  recordId: event.recordId
});
```

## Best Practices

1. **Use automatic invalidation**: Let mutation hooks handle invalidation
2. **Start conservative**: Over-invalidate initially, optimize later
3. **Log in development**: Invalidation is logged automatically in dev mode
4. **Test thoroughly**: Check that UI updates after mutations
5. **Consider cross-entity effects**: Use `additionalKeys` for related entities
6. **Use hierarchical keys**: Design query keys for efficient partial matching
7. **Avoid over-invalidation**: Be specific when possible to reduce unnecessary refetches

## Debugging

### React DevTools

1. Open browser DevTools
2. Go to "TanStack Query" tab
3. Watch queries get invalidated after mutations
4. Check query status changes: fresh → stale → fetching

### Console Logs

In development mode, invalidation is logged:

```
[Invalidation] Invalidated queries: {
  schema: 'sac',
  entity: 'usuario',
  action: 'update',
  scope: 'specific',
  keys: [['sac', 'usuario', 'detail', { id: 123 }], ['sac', 'usuario']]
}
```

## SPEC References

- **SPEC-DA-MU-005:008**: Invalidation after successful mutation
- **SPEC-DA-IN-001:008**: Cache invalidation implementation
- **SPEC-DA-BP-006:008**: Intelligent invalidation strategies
- **SPEC-DA-TQ-005:009**: Hierarchical query key structure
- **SPEC-DA-BP-001:003**: Query key factory pattern
