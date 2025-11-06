# Auth Module

**Status**: ✅ Complete (Wave 8)
**Specification**: `spec/SPEC-module-auth.md`
**Type**: Functionality Module
**Version**: 1.0.0

## Overview

The Auth Module provides UI/UX components for authentication in the platform. It wraps the core authentication infrastructure (AuthContext, authService) with reusable, configurable components.

## Features Implemented

✅ **Login Interface** (SPEC-AUTH-F-001 to SPEC-AUTH-F-006)
- LoginForm component with username/password
- Optional realm and schema selection
- Client-side validation
- Error handling and display
- Show/hide password toggle

✅ **Login Page** (SPEC-AUTH-F-017)
- Full-page login interface
- Automatic redirect after successful login
- Redirect to original protected route

✅ **Logout Functionality** (SPEC-AUTH-F-007 to SPEC-AUTH-F-010)
- LogoutButton component
- Configurable redirect after logout
- Proper token cleanup

✅ **User Display** (SPEC-AUTH-E-002)
- UserAvatar component
- Initials fallback
- Configurable size (sm/md/lg)
- Optional name display

✅ **Route Protection** (SPEC-AUTH-F-015 to SPEC-AUTH-F-017)
- ProtectedRoute wrapper (re-exported from core)
- Automatic redirect to login
- Permission checking support

✅ **Token Management** (Uses core AuthContext)
- Automatic token refresh (SPEC-AUTH-F-011 to SPEC-AUTH-F-014)
- Session persistence across page reloads
- Secure token storage

## File Structure

```
src/modules/auth/
├── components/
│   ├── LoginForm.tsx          # Login form with realm/schema support
│   ├── LogoutButton.tsx       # Logout button component
│   ├── UserAvatar.tsx         # User avatar with initials
│   └── index.ts               # Component barrel exports
├── pages/
│   └── LoginPage.tsx          # Full login page with routing
├── hooks/
│   └── index.ts               # Re-exports useAuth from core
├── index.ts                   # Module manifest and main exports
└── README.md                  # This file
```

## Components

### LoginForm

```tsx
import { LoginForm } from '@/modules/auth';

<LoginForm
  realm="default"
  schema="app"
  allowRealmSelection={false}
  allowSchemaSelection={false}
  onSuccess={() => console.log('Login success')}
  onError={(err) => console.error(err)}
/>
```

**Props**:
- `realm?: string` - Default realm
- `schema?: string` - Default schema
- `allowRealmSelection?: boolean` - Allow user to change realm
- `allowSchemaSelection?: boolean` - Allow user to change schema
- `onSuccess?: () => void` - Callback on successful login
- `onError?: (error: Error) => void` - Callback on error

### LoginPage

```tsx
import { LoginPage } from '@/modules/auth';

<LoginPage
  realm="default"
  schema="app"
  redirectTo="/dashboard"
/>
```

**Props**:
- All LoginForm props except `onSuccess`
- `redirectTo?: string` - Default redirect after login (default: '/')

### LogoutButton

```tsx
import { LogoutButton } from '@/modules/auth';

<LogoutButton redirectTo="/login">
  Sign Out
</LogoutButton>
```

**Props**:
- `redirectTo?: string` - Where to redirect after logout (default: '/login')
- `className?: string` - Custom CSS classes
- `children?: React.ReactNode` - Custom button content

### UserAvatar

```tsx
import { UserAvatar } from '@/modules/auth';

<UserAvatar size="md" showName={true} />
```

**Props**:
- `size?: 'sm' | 'md' | 'lg'` - Avatar size (default: 'md')
- `showName?: boolean` - Show user name next to avatar (default: false)
- `className?: string` - Custom CSS classes

### ProtectedRoute

```tsx
import { ProtectedRoute } from '@/modules/auth';

<ProtectedRoute permission="read.usuarios">
  <ProtectedContent />
</ProtectedRoute>
```

**Props**:
- `children: React.ReactNode` - Content to protect
- `permission?: string` - Required permission (optional)

## Hooks

### useAuth

```tsx
import { useAuth } from '@/modules/auth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken
  } = useAuth();

  // Use auth state and actions
}
```

## Module Exports

The module exports routes for the `/login` path:

```typescript
{
  path: '/login',
  element: LoginPage,
  requiresAuth: false,
  metadata: {
    title: 'Sign In',
    description: 'User authentication page',
  },
}
```

## Integration

The module is registered in the module registry:

```typescript
// src/core/modules/registry.ts
moduleRegistry.register('auth', () => import('@/modules/auth'));
```

## Dependencies

- **Core Auth Infrastructure**: Uses AuthContext and authService from platform core
- **React Router**: For navigation and routing
- **No UI Library**: Components use plain Tailwind CSS (shadcn/ui can be added later)

## SPEC Compliance

### Implemented Requirements

✅ **SPEC-AUTH-R-001**: Provides authentication UI components
✅ **SPEC-AUTH-R-003**: Wraps Auth Channel (`/api/1/auth/*`)
✅ **SPEC-AUTH-F-001 to F-006**: Login functionality
✅ **SPEC-AUTH-F-007 to F-010**: Logout functionality
✅ **SPEC-AUTH-F-015 to F-017**: Route protection
✅ **SPEC-AUTH-S-001 to S-006**: Context and persistence
✅ **SPEC-AUTH-E-001**: Exports LoginForm, ProtectedRoute, useAuth
✅ **SPEC-AUTH-E-002**: Exports LogoutButton, UserAvatar
✅ **SPEC-AUTH-I-001 to I-003**: Integration flows

### Pending Requirements

⏳ **SPEC-AUTH-P-001 to P-005**: Permission validation hooks
⏳ **SPEC-AUTH-O-001 to O-002**: Signup functionality
⏳ **SPEC-AUTH-O-003 to O-004**: Password recovery
⏳ **SPEC-AUTH-O-005 to O-006**: Logout all sessions UI

### Not Implementing (Core Responsibility)

❌ **SPEC-AUTH-R-002**: Auth logic (handled by AuthContext/authService)
❌ **SPEC-AUTH-F-011 to F-014**: Token refresh (handled by AuthContext)
❌ **SPEC-AUTH-SEC-001 to SEC-005**: Security (handled by core services)

## Testing

Build verification:
```bash
cd src/prototype-1/frontend
npm run build
```

Result: ✅ Build successful (205.46 kB main bundle)

## Next Steps

1. **Install shadcn/ui**: Upgrade components to use shadcn/ui for consistency
2. **Add Permission Hooks**: Implement `usePermission` and `RequirePermission`
3. **Add Signup**: Implement optional signup functionality
4. **Add Password Recovery**: Implement password recovery flow
5. **Add LogoutAll UI**: Add "logout all devices" functionality

## Notes

- Components use basic Tailwind CSS styling (no shadcn/ui yet)
- Module reuses existing core auth infrastructure
- All authentication logic remains in core services
- Module focuses on UI/UX only per SPEC-AUTH-R-002
