name: "Modular Platform Implementation - Complete System"
description: |

## Purpose
Complete implementation of the modular platform following all 30+ specifications. This PRP provides comprehensive context for implementing Frontend (React 19), Backend (Express), and integration with existing Backbone (n8n workflows).

## Core Principles
1. **Context is King**: All 30+ SPEC files are authoritative
2. **Validation Loops**: Each phase has executable validation
3. **Information Dense**: Uses patterns from research and codebase
4. **Progressive Success**: Implement in waves, validate, then enhance
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
Build a fully functional modular platform where:
- Portals are isolated sub-applications with unique routes
- Modules are lazy-loaded, reusable features
- Instances are specific configurations of modules
- All data access uses JQEL via TanStack Query
- Real-time events via SSE + Redis Pub/Sub
- PWA with offline support
- JWT-based authentication via n8n workflows

## Why
- **Business value**: Reusable modules across multiple projects - build once, use infinitely
- **Integration**: Seamless integration with n8n Backbone for business logic
- **Problems solved**: Eliminates code duplication, provides modular architecture, enables rapid application development

## What
A production-ready platform with:
- Frontend: React 19 + Vite + TypeScript + shadcn/ui
- Backend: Express + TypeScript + Redis
- Backbone: n8n workflows (already implemented)
- Real-time: SSE + Redis Pub/Sub + Streams
- Auth: JWT with refresh token rotation
- Data: JQEL query language wrapped in TanStack Query

### Success Criteria
- [ ] Portal "main" and "setup" load correctly at `/` and `/setup`
- [ ] Module "setup" is active and lazy-loaded in setup portal
- [ ] Authentication flow works (login, refresh, logout)
- [ ] JQEL queries work via `/api/jqel` endpoint
- [ ] SSE connection established and receives events
- [ ] PWA installable with offline support
- [ ] All tests pass (unit + integration)
- [ ] Lighthouse score > 90 for performance
- [ ] Bundle size < 200KB for initial load

## All Needed Context

### Documentation & References (MUST READ)
```yaml
# Core Specifications (READ FIRST)
- file: spec/SPEC-concepts.md
  why: Defines Portal, Module, Instance concepts - fundamental to entire architecture

- file: spec/SPEC-architecture.md
  why: Tech stack requirements, PWA, responsive design, component modules

- file: spec/SPEC-routing.md
  why: Portal routing, module route injection, priority rules, dynamic loading

- file: spec/SPEC-data-access.md
  why: JQEL integration with TanStack Query, cache invalidation, validation

- file: spec/SPEC-jqel-syntax.md
  why: Complete JQEL query language syntax and operators

- file: spec/SPEC-authentication.md
  why: JWT flow, 5 auth routes, refresh token rotation, security

- file: spec/SPEC-events.md
  why: SSE, Redis Pub/Sub + Streams, notification vs tasks, n8n integration

- file: spec/SPEC-theming.md
  why: Light/dark theme, brand colors, WCAG AA compliance

- file: spec/SPEC-modules.md
  why: Module structure, dependencies, lazy loading, exports

- file: spec/SPEC-module-setup.md
  why: Setup module requirements (portal/module/instance management)

- file: MANIFESTO.md
  why: Platform philosophy - build once, reuse infinitely

# n8n Workflows (Backbone - Already Built)
- file: workflows/auth/auth-login.json
  why: Login workflow - shows n8n response format

- file: workflows/auth/auth-refresh.json
  why: Refresh token rotation implementation

- file: workflows/auth/authorize.json
  why: JWT validation and permission checking

# External Documentation URLs
- url: https://tanstack.com/query/v5/docs/framework/react/overview
  why: TanStack Query v5 guide - core data fetching library

- url: https://reactrouter.com/en/main/route/lazy
  why: React Router 6 lazy loading patterns for dynamic modules

- url: https://ui.shadcn.com/docs/components
  why: shadcn/ui component library - ONLY UI library allowed

- url: https://remix.run/blog/lazy-loading-routes
  why: Advanced lazy loading patterns for routes

- url: https://medium.com/trendyol-tech/how-we-used-server-sent-events-sse-to-deliver-real-time-notifications-on-our-backend-ebae41d3b5cb
  why: Production SSE + Redis implementation patterns

- url: https://github.com/mpangrazzi/redis-subscribe-sse
  why: Redis Pub/Sub → SSE streaming patterns

- url: https://fragmentedthought.com/blog/2025/react-query-caching-with-server-side-events
  why: Integrating SSE with TanStack Query for cache invalidation
```

### Current Codebase tree
```bash
platform/
├── src/
│   ├── frontend/                    # React 19 + Vite (basic structure exists)
│   │   ├── src/
│   │   │   ├── App.tsx             # Main app component
│   │   │   ├── main.tsx            # Entry point
│   │   │   ├── components/         # Shared components
│   │   │   ├── contexts/           # React contexts
│   │   │   ├── hooks/              # Custom hooks
│   │   │   ├── lib/                # Utilities
│   │   │   ├── modules/            # Module implementations (empty)
│   │   │   ├── pages/              # Page components
│   │   │   ├── providers/          # Context providers
│   │   │   ├── services/           # API services
│   │   │   ├── types/              # TypeScript types
│   │   │   └── utils/              # Helper functions
│   │   ├── package.json            # Dependencies installed
│   │   ├── vite.config.ts          # Vite configuration
│   │   └── tailwind.config.js      # Tailwind + shadcn configured
│   │
│   └── backend/                     # Express + TypeScript (basic structure exists)
│       ├── src/
│       │   ├── server.ts            # Main server file
│       │   ├── config/              # Configuration
│       │   ├── controllers/         # Route controllers
│       │   ├── middleware/          # Express middleware
│       │   ├── routes/              # Route definitions
│       │   ├── services/            # Business logic
│       │   ├── types/               # TypeScript types
│       │   ├── utils/               # Helper functions
│       │   └── validation/          # Input validation
│       └── package.json             # Dependencies installed
│
├── workflows/                       # n8n workflows (COMPLETE - DO NOT MODIFY)
│   ├── auth/                        # 8 authentication workflows
│   └── system/                      # 5 system workflows (health, request, chat, db)
│
├── spec/                            # 30+ formal specifications (AUTHORITATIVE)
├── PRPs/                            # Project Resource Plans
├── CLAUDE.md                        # Project instructions
└── README.md                        # Project overview
```

### Desired Codebase tree with files to be added
```bash
platform/
├── src/
│   ├── frontend/src/
│   │   ├── core/                    # 🆕 Platform core (NEW)
│   │   │   ├── routing/
│   │   │   │   ├── PortalLoader.tsx         # Loads portal + modules
│   │   │   │   ├── PortalRouter.tsx         # Portal-specific router
│   │   │   │   ├── ModuleRoute.tsx          # Lazy route wrapper
│   │   │   │   └── usePortalRoutes.ts       # Dynamic routes hook
│   │   │   ├── modules/
│   │   │   │   ├── ModuleRegistry.ts        # Module registration
│   │   │   │   ├── ModuleLoader.ts          # Dynamic import handler
│   │   │   │   └── types.ts                 # Module interfaces
│   │   │   ├── portals/
│   │   │   │   ├── PortalRegistry.ts        # Portal configuration
│   │   │   │   └── types.ts                 # Portal interfaces
│   │   │   └── config/
│   │   │       ├── ConfigProvider.tsx       # JQEL-based config
│   │   │       └── useConfig.ts             # Config access hook
│   │   │
│   │   ├── services/                # 🆕 Enhanced services
│   │   │   ├── jqel/
│   │   │   │   ├── jqel.ts                  # JQEL query function
│   │   │   │   ├── jqelHooks.ts             # useJQEL, useJQELMutation
│   │   │   │   ├── jqelKeys.ts              # Query key factories
│   │   │   │   ├── jqelError.ts             # Error class
│   │   │   │   └── types.ts                 # JQEL interfaces
│   │   │   ├── auth/
│   │   │   │   ├── authService.ts           # Auth API calls
│   │   │   │   ├── tokenManager.ts          # Token storage/refresh
│   │   │   │   └── types.ts                 # Auth interfaces
│   │   │   └── events/
│   │   │       ├── EventSource.ts           # SSE connection manager
│   │   │       ├── useSSE.ts                # SSE React hook
│   │   │       └── types.ts                 # Event interfaces
│   │   │
│   │   ├── modules/                 # 🆕 Module implementations
│   │   │   └── setup/                       # Setup module
│   │   │       ├── index.ts                 # Module manifest
│   │   │       ├── routes.tsx               # Module routes
│   │   │       ├── components/              # Module components
│   │   │       │   ├── PortalList.tsx       # List portals
│   │   │       │   ├── ModuleList.tsx       # List modules
│   │   │       │   ├── InstanceList.tsx     # List instances
│   │   │       │   └── ConfigEditor.tsx     # JSON config editor
│   │   │       └── pages/                   # Module pages
│   │   │           ├── SetupHome.tsx        # Main setup page
│   │   │           ├── PortalManager.tsx    # Manage portals
│   │   │           └── ModuleManager.tsx    # Manage modules
│   │   │
│   │   ├── providers/               # 🆕 Enhanced providers
│   │   │   ├── QueryProvider.tsx            # TanStack Query setup
│   │   │   ├── ThemeProvider.tsx            # Light/dark theme
│   │   │   └── SSEProvider.tsx              # SSE connection
│   │   │
│   │   └── public/                  # 🆕 PWA files
│   │       ├── manifest.json                # Web app manifest
│   │       ├── sw.js                        # Service worker
│   │       └── icons/                       # App icons (multiple sizes)
│   │
│   └── backend/src/
│       ├── config/                  # 🆕 Enhanced config
│       │   ├── redis.ts                     # Redis connection
│       │   ├── cors.ts                      # CORS configuration
│       │   └── security.ts                  # Security headers
│       │
│       ├── routes/                  # 🆕 Route implementations
│       │   ├── auth.routes.ts               # Proxy to n8n auth
│       │   ├── jqel.routes.ts               # JQEL endpoint
│       │   ├── events.routes.ts             # SSE endpoint
│       │   └── health.routes.ts             # Health check
│       │
│       ├── services/                # 🆕 Core services
│       │   ├── n8nProxy.ts                  # n8n HTTP client
│       │   ├── redisService.ts              # Redis Pub/Sub + Streams
│       │   ├── sseService.ts                # SSE connection manager
│       │   ├── jqelProcessor.ts             # JQEL query processor
│       │   └── configService.ts             # Portal/Module config
│       │
│       ├── middleware/              # 🆕 Enhanced middleware
│       │   ├── auth.middleware.ts           # JWT validation
│       │   ├── validation.middleware.ts     # Zod validation
│       │   ├── rateLimiter.middleware.ts    # Rate limiting
│       │   └── errorHandler.middleware.ts   # Global error handler
│       │
│       └── types/                   # 🆕 Shared types
│           ├── jqel.types.ts                # JQEL interfaces
│           ├── jresult.types.ts             # JResult format
│           └── auth.types.ts                # Auth interfaces
```

### Known Gotchas of Codebase & Library Quirks
```typescript
// CRITICAL: React Router 6 requires createBrowserRouter for lazy loading
// ❌ WRONG: Using BrowserRouter with lazy routes doesn't work well
<BrowserRouter><Routes>...</Routes></BrowserRouter>

// ✅ CORRECT: Use createBrowserRouter with route objects
const router = createBrowserRouter([
  {
    path: "/",
    element: <PortalLoader portalId="main" />,
    lazy: () => import("./modules/setup")
  }
]);

// CRITICAL: TanStack Query v5 SSE integration pattern
// ❌ WRONG: Trying to use SSE directly in useQuery
// ✅ CORRECT: Use SSE to invalidate queries, then TanStack Query refetches
eventSource.addEventListener('data_changed', (event) => {
  queryClient.invalidateQueries(['schema', 'entity']);
});

// CRITICAL: Redis Pub/Sub does NOT persist messages
// If subscriber is offline, message is lost
// Solution: Use Redis Streams in parallel for buffering

// CRITICAL: SSE requires specific headers to prevent buffering
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('X-Accel-Buffering', 'no'); // For nginx

// CRITICAL: JQEL schema "backend" is processed by Express, not n8n
// "platform" and other schemas go to n8n
if (query.schema === 'backend') {
  // Process locally (portal/module/instance config)
} else {
  // Proxy to n8n
}

// CRITICAL: Modules must export specific keys for lazy loading
// routes.tsx must export: { routes: RouteObject[] }
export const routes: RouteObject[] = [
  { path: "/setup", element: <SetupHome /> }
];

// CRITICAL: Service Worker must be registered AFTER initial render
// Register in main.tsx after React renders
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// CRITICAL: JWT refresh must be transparent
// Wrap fetch to auto-refresh on 401, then retry original request
async function fetchWithAuth(url, options) {
  let response = await fetch(url, options);
  if (response.status === 401) {
    await refreshToken();
    response = await fetch(url, options); // Retry
  }
  return response;
}

// CRITICAL: shadcn/ui is the ONLY UI library allowed
// Do NOT install Material-UI, Ant Design, or others

// CRITICAL: Portal "main" has absolute priority over other portals
// If main creates route "/sandbox", portal "sandbox" becomes inaccessible

// CRITICAL: Vite requires proper chunk splitting configuration
// Configure manualChunks in vite.config.ts for optimal loading
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['@radix-ui/*'],
        'query-vendor': ['@tanstack/react-query']
      }
    }
  }
}
```

## Implementation Blueprint

### Phase Overview (14 Waves - from PLAN.md)
This PRP covers Waves 1-6, which establish the core platform:
1. ✅ **Wave 1: Project Base** - COMPLETED (structure exists)
2. **Wave 2: Authentication System** - JWT, login, refresh, logout
3. **Wave 3: JQEL Foundation** - Query language, TanStack Query integration
4. **Wave 4: Portal & Module Core** - Dynamic loading, routing
5. **Wave 5: Setup Module** - Portal/module/instance management UI
6. **Wave 6: Real-Time Events** - SSE, Redis, notifications

Waves 7-14 (additional modules) covered in separate PRPs.

### Data models and structure

```typescript
// Core Interfaces (create in src/frontend/src/types/platform.types.ts)

// Portal Definition
interface Portal {
  portalId: string;              // Unique ID (e.g., "main", "setup")
  name: string;                  // Display name
  path: string;                  // Route path ("/" for main, "/:portalId" for others)
  settingsKey: string;           // Theme configuration key
  removable: boolean;            // Can be deleted?
  activeModules: string[];       // Array of active module IDs
  metadata?: Record<string, any>; // Additional config
}

// Module Definition
interface ModuleManifest {
  moduleId: string;              // Unique ID (e.g., "setup", "chat")
  name: string;                  // Display name
  type: 'component' | 'functionality'; // Module type
  version: string;               // Semantic version
  dependencies: string[];        // Other module IDs required
  exports: {
    routes?: RouteExport[];      // Exported routes
    components?: Record<string, React.ComponentType>;
    widgets?: Record<string, React.ComponentType>;
  };
}

// Instance Configuration
interface ModuleInstance {
  instanceId: string;            // Unique within portal
  moduleId: string;              // Reference to module
  portalId: string;              // Parent portal
  config: Record<string, any>;   // Module-specific configuration
  active: boolean;               // Is instance active?
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

// JQEL Query (create in src/frontend/src/services/jqel/types.ts)
interface JQELQuery {
  schema: string;                // "backend", "platform", "system", or app schema
  select?: string;               // Entity to select
  mutate?: string;               // Entity to mutate
  action?: 'insert' | 'update' | 'delete' | string; // Mutation action
  where?: JQELWhere;             // Filter conditions
  values?: Record<string, any>;  // Values for mutations
  options?: {
    limit?: number;              // Max records (default 1000)
    offset?: number;             // Skip records
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
  };
  output?: string[];             // Fields to return (projection)
  except?: string[];             // Fields to exclude
}

// JResult Response (create in src/frontend/src/services/jqel/types.ts)
interface JResult<T = any> {
  code: number;                  // HTTP status code
  message: string;               // Human-readable message
  data?: T;                      // Response data
  field?: string;                // Field with error (for validation)
  errors?: Array<{               // Multiple errors
    field: string;
    message: string;
  }>;
}

// SSE Event (create in src/frontend/src/services/events/types.ts)
interface PlatformEvent {
  type: 'notification' | 'task' | 'data_changed';
  id: string;                    // Unique event ID
  userId?: string;               // Target user
  userIds?: string[];            // Target users (for broadcast)
  timestamp: string;             // ISO 8601
  category?: string;             // Event category
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  // For data_changed events:
  schema?: string;
  entity?: string;
  ids?: string[];                // Changed record IDs
}

// Auth Tokens (create in src/frontend/src/services/auth/types.ts)
interface AuthTokens {
  access_token: string;          // JWT
  refresh_token: string;         // Opaque token
  token_type: 'Bearer';
  expires_in: number;            // Seconds until expiration
}

interface JWTPayload {
  sub: string;                   // User ID
  iss: string;                   // Issuer
  iat: number;                   // Issued at (unix timestamp)
  exp: number;                   // Expiration (unix timestamp)
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;            // Additional claims
}
```

### List of tasks to be completed (in order)

```yaml
# ============================================================================
# WAVE 2: AUTHENTICATION SYSTEM
# ============================================================================

Task 2.1: Create Auth Types and Interfaces
LOCATION: src/frontend/src/services/auth/types.ts
CREATE new file with:
  - AuthTokens interface (access_token, refresh_token, expires_in)
  - JWTPayload interface (sub, iss, iat, exp, username, email, roles)
  - LoginRequest, LoginResponse interfaces
  - RefreshRequest, RefreshResponse interfaces
  - LogoutRequest, AuthorizeRequest interfaces
  Export all interfaces

Task 2.2: Create Token Manager
LOCATION: src/frontend/src/services/auth/tokenManager.ts
CREATE TokenManager class:
  - Store access_token in memory (class property)
  - Store refresh_token in localStorage (key: "refresh_token")
  - getAccessToken(): string | null
  - setTokens(tokens: AuthTokens): void
  - clearTokens(): void
  - isTokenExpired(token: string): boolean (parse JWT, check exp claim)
  - scheduleRefresh(expiresIn: number): void (auto-refresh 1 min before expiry)
  PATTERN: Use jwt-decode library to parse JWT without validation
  GOTCHA: Never store access_token in localStorage (XSS risk)

Task 2.3: Create Auth Service
LOCATION: src/frontend/src/services/auth/authService.ts
CREATE authService object:
  - login(username, password, realm?, schema?): Promise<AuthTokens>
    POST to /api/1/auth/login
  - refresh(refreshToken: string): Promise<AuthTokens>
    POST to /api/1/auth/refresh
  - logout(refreshToken: string): Promise<void>
    POST to /api/1/auth/logout
  - logoutAll(accessToken: string): Promise<void>
    POST to /api/1/auth/logout-all
  - authorize(accessToken: string, permission?: string): Promise<{authorized: boolean, payload: any}>
    POST to /api/1/auth/authorize
  PATTERN: Use fetch with async/await
  ERROR HANDLING: Throw custom AuthError with code, message from JResult

Task 2.4: Create Backend Auth Routes (Proxy)
LOCATION: src/backend/src/routes/auth.routes.ts
CREATE Express router:
  - POST /api/1/auth/login → proxy to n8n
  - POST /api/1/auth/refresh → proxy to n8n
  - POST /api/1/auth/logout → proxy to n8n
  - POST /api/1/auth/logout-all → proxy to n8n
  - POST /api/1/auth/authorize → proxy to n8n
  VALIDATION: Use Zod to validate request bodies before proxying
  PROXY: Forward to n8n webhook URLs from process.env.N8N_WEBHOOK_BASE_URL

Task 2.5: Create n8n Proxy Service
LOCATION: src/backend/src/services/n8nProxy.ts
CREATE n8nProxyService:
  - proxyRequest(path: string, body: any): Promise<any>
    - Build full URL: `${N8N_WEBHOOK_BASE_URL}${path}`
    - POST with JSON body
    - Include timeout (5s default)
    - Return response as-is
  ERROR HANDLING: Map n8n errors to JResult format

Task 2.6: Create Auth Middleware
LOCATION: src/backend/src/middleware/auth.middleware.ts
CREATE validateJWT middleware:
  - Extract token from header: Authorization: Bearer <token>
  - Call authService.authorize(token) (which calls n8n)
  - If authorized, attach req.user = payload
  - If not authorized, return 401
  CACHING: Cache authorize results in Redis for 5 minutes
  PATTERN: Use next() on success, next(error) on failure

Task 2.7: Create Frontend Auth Context
LOCATION: src/frontend/src/contexts/AuthContext.tsx
CREATE AuthContext with:
  - State: user (JWTPayload | null), isAuthenticated (boolean), isLoading (boolean)
  - Actions: login(username, password), logout(), refreshToken()
  - Auto-refresh: Use tokenManager.scheduleRefresh()
  - Persistence: Load refresh_token on mount, attempt refresh
  PATTERN: Use React Context + useReducer
  EXPORT: useAuth() hook for consuming context

Task 2.8: Create Protected Route Component
LOCATION: src/frontend/src/components/ProtectedRoute.tsx
CREATE ProtectedRoute component:
  - Check isAuthenticated from useAuth()
  - If not authenticated, redirect to /login
  - If authenticated, render children or <Outlet />
  - Optional: Check permissions via authorize()
  PATTERN: Use React Router's Navigate for redirect

# ============================================================================
# WAVE 3: JQEL FOUNDATION
# ============================================================================

Task 3.1: Create JQEL Types
LOCATION: src/frontend/src/services/jqel/types.ts
CREATE interfaces:
  - JQELQuery (schema, select?, mutate?, action?, where?, values?, options?, output?, except?)
  - JQELWhere (recursive structure with operators: eq, ne, gt, lt, like, in, and, or, not)
  - JQELOptions (limit, offset, orderBy)
  - JResult<T> (code, message, data?, field?, errors?)
  MIRROR: Structure from spec/SPEC-jqel-syntax.md
  EXPORT: All interfaces

Task 3.2: Create JQEL Error Class
LOCATION: src/frontend/src/services/jqel/jqelError.ts
CREATE JQELError extends Error:
  - Properties: code, message, field?, jresult
  - Constructor accepts JResult
  - Override toString() for better logging
  PATTERN: Standard Error extension pattern

Task 3.3: Create JQEL Query Function
LOCATION: src/frontend/src/services/jqel/jqel.ts
CREATE jqel object:
  - query<T>(queryObject: JQELQuery): Promise<JResult<T>>
    - POST to /api/jqel
    - Include JWT from tokenManager.getAccessToken()
    - Handle 401: attempt token refresh, retry once
    - Handle errors: throw JQELError
    - Return JResult
  GOTCHA: Must handle token refresh transparently
  PATTERN: Use fetch with Authorization header

Task 3.4: Create JQEL Query Keys Factory
LOCATION: src/frontend/src/services/jqel/jqelKeys.ts
CREATE query key factories:
  - jqelKeys.all(): ['jqel']
  - jqelKeys.schema(schema: string): ['jqel', schema]
  - jqelKeys.entity(schema: string, entity: string): ['jqel', schema, entity]
  - jqelKeys.detail(schema: string, entity: string, id: any): ['jqel', schema, entity, 'detail', id]
  - jqelKeys.list(schema: string, entity: string, filters?: any): ['jqel', schema, entity, 'list', filters]
  PURPOSE: Consistent query keys for TanStack Query
  PATTERN: Factory pattern from TanStack Query docs

Task 3.5: Create useJQEL Hook
LOCATION: src/frontend/src/services/jqel/jqelHooks.ts
CREATE useJQEL hook:
  - Wrapper around useQuery from TanStack Query
  - Parameters: (queryObject: JQELQuery, options?: UseQueryOptions)
  - Auto-generate query key from queryObject
  - Call jqel.query() as queryFn
  - Return { data, isLoading, error, refetch, ... }
  EXAMPLE:
    const { data } = useJQEL({
      schema: 'backend',
      select: 'portal',
      where: { portalId: { eq: 'main' } }
    });

Task 3.6: Create useJQELMutation Hook
LOCATION: src/frontend/src/services/jqel/jqelHooks.ts
CREATE useJQELMutation hook:
  - Wrapper around useMutation from TanStack Query
  - Parameters: (options?: UseMutationOptions)
  - mutationFn calls jqel.query()
  - Return { mutate, mutateAsync, isLoading, error, ... }
  EXAMPLE:
    const mutation = useJQELMutation();
    mutation.mutate({
      schema: 'backend',
      mutate: 'portal',
      action: 'insert',
      values: { portalId: 'new', name: 'New Portal' }
    });

Task 3.7: Create Backend JQEL Routes
LOCATION: src/backend/src/routes/jqel.routes.ts
CREATE Express router:
  - POST /api/jqel
  - Validate JWT with auth middleware
  - Validate JQEL query with Zod
  - Route based on schema:
    - If schema === "backend": process locally (configService)
    - Else: proxy to n8n
  - Return JResult

Task 3.8: Create JQEL Processor for Backend Schema
LOCATION: src/backend/src/services/jqelProcessor.ts
CREATE jqelProcessor:
  - process(query: JQELQuery): Promise<JResult>
  - Handle CRUD for portals, modules, instances
  - Read/write to JSON files in /config (or database)
  - Apply WHERE filters manually (in-memory)
  - Apply OPTIONS (limit, offset, orderBy) manually
  - Return results in JResult format
  GOTCHA: This is simple file-based CRUD, not a full DB
  PATTERN: Read JSON, filter, modify, write back

Task 3.9: Setup TanStack Query Provider
LOCATION: src/frontend/src/providers/QueryProvider.tsx
CREATE QueryProvider:
  - Create QueryClient with default options:
    - staleTime: 5 minutes
    - cacheTime: 10 minutes
    - refetchOnWindowFocus: false
    - retry: (count, error) => error.code >= 500 && count < 3
  - Wrap app with QueryClientProvider
  - Add ReactQueryDevtools in dev mode
  MOUNT: Add to src/frontend/src/main.tsx

# ============================================================================
# WAVE 4: PORTAL & MODULE CORE
# ============================================================================

Task 4.1: Create Portal Types
LOCATION: src/frontend/src/core/portals/types.ts
CREATE interfaces:
  - Portal (portalId, name, path, settingsKey, removable, activeModules, metadata)
  - PortalConfig (configuration structure)
  EXPORT: All portal-related types

Task 4.2: Create Module Types
LOCATION: src/frontend/src/core/modules/types.ts
CREATE interfaces:
  - ModuleManifest (moduleId, name, type, version, dependencies, exports)
  - RouteExport (path, component, requiresAuth?, metadata?)
  - ModuleContext (moduleId, portalId, instanceId?, config?)
  EXPORT: All module-related types

Task 4.3: Create Module Registry
LOCATION: src/frontend/src/core/modules/ModuleRegistry.ts
CREATE ModuleRegistry class:
  - Static registry: Map<string, () => Promise<ModuleManifest>>
  - register(moduleId: string, loader: () => Promise<ModuleManifest>): void
  - get(moduleId: string): Promise<ModuleManifest>
  - has(moduleId: string): boolean
  - list(): string[]
  PURPOSE: Central registry of all available modules
  PATTERN: Singleton pattern
  EXAMPLE:
    ModuleRegistry.register('setup', () => import('../modules/setup'));

Task 4.4: Create Module Loader
LOCATION: src/frontend/src/core/modules/ModuleLoader.ts
CREATE ModuleLoader class:
  - loadModule(moduleId: string): Promise<ModuleManifest>
    - Get from ModuleRegistry
    - Dynamic import
    - Validate dependencies
    - Return manifest
  - loadModules(moduleIds: string[]): Promise<ModuleManifest[]>
    - Load multiple modules in parallel
    - Resolve dependency order
  ERROR: Throw if module not found or dependencies missing

Task 4.5: Create usePortalRoutes Hook
LOCATION: src/frontend/src/core/routing/usePortalRoutes.ts
CREATE usePortalRoutes hook:
  - Parameters: (portalId: string)
  - Fetch portal config via JQEL (schema: backend, select: portal)
  - Load active modules via ModuleLoader
  - Extract routes from modules
  - Prefix routes with portal path
  - Return array of RouteObject (React Router format)
  REACTIVE: Use TanStack Query, so routes update when config changes

Task 4.6: Create PortalLoader Component
LOCATION: src/frontend/src/core/routing/PortalLoader.tsx
CREATE PortalLoader:
  - Props: portalId (optional, from URL param if not provided)
  - Use usePortalRoutes(portalId) to get routes
  - Show loading skeleton while fetching
  - Show error if portal not found
  - Render PortalRouter with routes
  PATTERN: Suspense boundary for lazy loading

Task 4.7: Create PortalRouter Component
LOCATION: src/frontend/src/core/routing/PortalRouter.tsx
CREATE PortalRouter:
  - Props: routes (RouteObject[])
  - Create Routes component with dynamic routes
  - Each route uses React.lazy for component
  - Wrap in Suspense with loading fallback
  - Add ErrorBoundary for route errors
  PATTERN: <Routes>{routes.map(...)}</Routes>

Task 4.8: Create ModuleRoute Component
LOCATION: src/frontend/src/core/routing/ModuleRoute.tsx
CREATE ModuleRoute:
  - Wrapper for lazy-loaded route components
  - Provides ModuleContext via React Context
  - Handles loading states
  - Handles errors
  PATTERN: Higher-order component pattern

Task 4.9: Setup Root Router
LOCATION: src/frontend/src/App.tsx
MODIFY App.tsx:
  - Use createBrowserRouter instead of BrowserRouter
  - Define routes:
    - { path: "/", element: <PortalLoader portalId="main" /> }
    - { path: "/:portalId/*", element: <PortalLoader /> }
    - { path: "/health", element: <HealthCheck /> }
  - Use RouterProvider with router
  GOTCHA: React Router 6.4+ requires createBrowserRouter for lazy loading

Task 4.10: Create Initial Portal Configs
LOCATION: src/backend/config/portals.json
CREATE JSON file:
  - Array of Portal objects
  - Portal "main": { portalId: "main", path: "/", activeModules: [], removable: false }
  - Portal "setup": { portalId: "setup", path: "/setup", activeModules: ["setup"], removable: true }
  LOAD: Read by jqelProcessor when schema === "backend"

# ============================================================================
# WAVE 5: SETUP MODULE
# ============================================================================

Task 5.1: Create Setup Module Manifest
LOCATION: src/frontend/src/modules/setup/index.ts
CREATE and export:
  - moduleId: "setup"
  - name: "Setup & Configuration"
  - type: "functionality"
  - version: "1.0.0"
  - dependencies: []
  - exports.routes: Array of route objects
    - { path: "/", element: <SetupHome /> }
    - { path: "/portals", element: <PortalManager /> }
    - { path: "/modules", element: <ModuleManager /> }
  REGISTER: Call ModuleRegistry.register('setup', () => import('./modules/setup'))

Task 5.2: Create SetupHome Page
LOCATION: src/frontend/src/modules/setup/pages/SetupHome.tsx
CREATE SetupHome component:
  - Display overview cards: # portals, # modules, # instances
  - Links to /setup/portals, /setup/modules
  - Use useJQEL to fetch counts
  - Use shadcn/ui Card components
  STYLE: Use Tailwind, zero custom CSS

Task 5.3: Create PortalList Component
LOCATION: src/frontend/src/modules/setup/components/PortalList.tsx
CREATE PortalList:
  - Fetch portals via useJQEL({ schema: 'backend', select: 'portal' })
  - Display in shadcn/ui Table
  - Show: portalId, name, path, # active modules, removable
  - Actions: Edit, Delete (if removable)
  - Use Lucide icons for actions

Task 5.4: Create PortalManager Page
LOCATION: src/frontend/src/modules/setup/pages/PortalManager.tsx
CREATE PortalManager:
  - Render PortalList
  - Add "Create Portal" button
  - Dialog for create/edit with React Hook Form + Zod
  - On submit: useJQELMutation to insert/update
  - Invalidate portal queries on success
  FORM FIELDS: portalId, name, settingsKey, removable

Task 5.5: Create ModuleList Component
LOCATION: src/frontend/src/modules/setup/components/ModuleList.tsx
CREATE ModuleList:
  - Get available modules from ModuleRegistry.list()
  - Fetch module manifests
  - Display in Cards or Table
  - Show: moduleId, name, type, version, dependencies
  - Action: Activate in portal (select portal, activate)

Task 5.6: Create ModuleManager Page
LOCATION: src/frontend/src/modules/setup/pages/ModuleManager.tsx
CREATE ModuleManager:
  - Render ModuleList
  - Show which modules are active in which portals
  - Action: Activate/Deactivate module in portal
  - On action: Update portal.activeModules via JQEL mutation

Task 5.7: Create InstanceList Component
LOCATION: src/frontend/src/modules/setup/components/InstanceList.tsx
CREATE InstanceList:
  - Props: portalId, moduleId
  - Fetch instances via JQEL
  - Display in Table: instanceId, config, active, actions
  - Actions: Edit config, Delete

Task 5.8: Create ConfigEditor Component
LOCATION: src/frontend/src/modules/setup/components/ConfigEditor.tsx
CREATE ConfigEditor:
  - Props: config (Record<string, any>), onChange
  - JSON editor with syntax highlighting
  - Validate JSON on change
  - Use @monaco-editor/react or simple textarea
  - Show errors if invalid JSON

# ============================================================================
# WAVE 6: REAL-TIME EVENTS (SSE + Redis)
# ============================================================================

Task 6.1: Create Event Types
LOCATION: src/frontend/src/services/events/types.ts
CREATE interfaces:
  - PlatformEvent (type, id, userId, timestamp, category, priority, schema?, entity?, ids?)
  - EventType ('notification' | 'task' | 'data_changed')
  - EventHandler ((event: PlatformEvent) => void)
  EXPORT: All event types

Task 6.2: Create EventSource Manager
LOCATION: src/frontend/src/services/events/EventSource.ts
CREATE EventSourceManager class:
  - connect(accessToken: string): void
    - Create EventSource to /api/events/stream?token=...
    - Setup event listeners
  - disconnect(): void
  - on(eventType: string, handler: EventHandler): void
  - off(eventType: string, handler: EventHandler): void
  - Connection state: connected, disconnected, reconnecting
  - Auto-reconnect on close
  - Store last event timestamp for recovery
  PATTERN: Event emitter pattern

Task 6.3: Create useSSE Hook
LOCATION: src/frontend/src/services/events/useSSE.ts
CREATE useSSE hook:
  - Manage EventSource connection
  - Parameters: (enabled?: boolean)
  - Connect on mount, disconnect on unmount
  - Return: { connected, lastEvent, subscribe, unsubscribe }
  INTEGRATION: Auto-invalidate TanStack Query on data_changed events
  EXAMPLE:
    const { subscribe } = useSSE();
    useEffect(() => {
      return subscribe('data_changed', (event) => {
        queryClient.invalidateQueries([event.schema, event.entity]);
      });
    }, []);

Task 6.4: Create SSEProvider
LOCATION: src/frontend/src/providers/SSEProvider.tsx
CREATE SSEProvider:
  - Wrap app with EventSource connection
  - Provide connection via React Context
  - Auto-connect when authenticated
  - Auto-disconnect when logged out
  - Handle reconnection logic
  MOUNT: Add to src/frontend/src/main.tsx

Task 6.5: Create Backend Redis Service
LOCATION: src/backend/src/services/redisService.ts
CREATE redisService:
  - connect(): Promise<void> - Connect to Redis
  - disconnect(): Promise<void>
  - publish(channel: string, message: any): Promise<void> - Pub/Sub
  - subscribe(channel: string, handler: (message: any) => void): void
  - xadd(stream: string, data: any): Promise<string> - Add to Stream
  - xread(stream: string, lastId: string): Promise<any[]> - Read from Stream
  - Use ioredis library
  CONFIGURATION: Load from process.env (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)

Task 6.6: Create Backend SSE Service
LOCATION: src/backend/src/services/sseService.ts
CREATE sseService:
  - connections: Map<userId, Response[]> - Active SSE connections
  - addConnection(userId: string, res: Response): void
  - removeConnection(userId: string, res: Response): void
  - sendEvent(userId: string, event: PlatformEvent): void
  - sendEventToAll(event: PlatformEvent): void
  - startListening(): void - Subscribe to Redis Pub/Sub
    - On message: parse, determine target userId(s), sendEvent()
  - sendHeartbeat(): void - Send :heartbeat every 30s
  PATTERN: Map-based connection tracking

Task 6.7: Create Backend SSE Route
LOCATION: src/backend/src/routes/events.routes.ts
CREATE Express route:
  - GET /api/events/stream
  - Extract JWT from query param, header, or cookie
  - Validate JWT with auth middleware
  - Set SSE headers (Content-Type, Cache-Control, Connection, X-Accel-Buffering)
  - Add connection to sseService
  - On client disconnect: remove connection
  - Keep connection open
  GOTCHA: res.write() to send events, never res.send()

Task 6.8: Setup Redis Connection on Backend Start
LOCATION: src/backend/src/server.ts
MODIFY server.ts:
  - Import redisService
  - Call await redisService.connect() before starting Express
  - Call sseService.startListening() after Redis connected
  - Graceful shutdown: disconnect Redis and SSE on SIGTERM
  ERROR HANDLING: Retry Redis connection with exponential backoff

Task 6.9: Test Event Flow End-to-End
MANUAL TEST:
  1. Start backend (Redis connected)
  2. Login via frontend
  3. SSE connection established in Network tab
  4. Use n8n or backend script to publish test event to Redis
  5. Verify event received in frontend console
  6. Verify TanStack Query invalidated appropriate cache
  VALIDATION: Event flows from Redis → Backend → SSE → Frontend → Query Invalidation

# ============================================================================
# WAVE 6.5: PWA SETUP
# ============================================================================

Task 6.10: Create Web App Manifest
LOCATION: src/frontend/public/manifest.json
CREATE manifest:
  - name: "Modular Platform"
  - short_name: "Platform"
  - start_url: "/"
  - display: "standalone"
  - background_color: "#ffffff"
  - theme_color: "#000000"
  - icons: Array of icon objects (192x192, 512x512)
  REFERENCE: Link in src/frontend/index.html

Task 6.11: Create Service Worker
LOCATION: src/frontend/public/sw.js
CREATE service worker:
  - Cache strategy: Cache-first for assets (JS, CSS, images)
  - Cache strategy: Network-first for API calls
  - Offline fallback page
  - Update notification when new version available
  PATTERN: Workbox-like strategies (manual implementation or use Vite PWA plugin)

Task 6.12: Register Service Worker
LOCATION: src/frontend/src/main.tsx
MODIFY main.tsx:
  - After React render, check if ('serviceWorker' in navigator)
  - Register /sw.js
  - Handle update events (prompt user to reload)
  GOTCHA: Register AFTER initial render to avoid blocking

Task 6.13: Create App Icons
LOCATION: src/frontend/public/icons/
CREATE icons:
  - icon-192x192.png
  - icon-512x512.png
  - favicon.ico
  - apple-touch-icon.png
  USE: Simple logo or placeholder

# ============================================================================
# FINAL INTEGRATION & VALIDATION
# ============================================================================

Task 7.1: Create Health Check Endpoint
LOCATION: src/backend/src/routes/health.routes.ts
CREATE health check:
  - GET /health
  - Check Redis connection
  - Check n8n reachability (optional ping)
  - Return { status: "ok", redis: "connected", n8n: "reachable" }

Task 7.2: Add Global Error Handler
LOCATION: src/backend/src/middleware/errorHandler.middleware.ts
CREATE error handler:
  - Catch all errors
  - Map to JResult format
  - Log errors with Winston
  - Return appropriate HTTP status
  MOUNT: app.use(errorHandler) LAST in middleware chain

Task 7.3: Add Request Logging
LOCATION: src/backend/src/middleware/logger.middleware.ts
CREATE request logger:
  - Log: method, path, status, duration
  - Use Winston
  - Exclude /health and /api/events/stream from logs (too noisy)

Task 7.4: Add Rate Limiting
LOCATION: src/backend/src/middleware/rateLimiter.middleware.ts
CREATE rate limiter:
  - Use express-rate-limit
  - Apply to /api/1/auth/* routes (5 req/min per IP)
  - Apply to /api/jqel (100 req/min per user)
  - Store in Redis

Task 7.5: Configure CORS
LOCATION: src/backend/src/config/cors.ts
CREATE CORS config:
  - Allow frontend origin from process.env.FRONTEND_URL
  - Allow credentials (cookies)
  - Allow headers: Content-Type, Authorization
  - Allow methods: GET, POST, PUT, DELETE
  MOUNT: app.use(cors(corsConfig))

Task 7.6: Add Security Headers
LOCATION: src/backend/src/config/security.ts
CREATE security headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security: max-age=31536000
  - Use helmet.js
  MOUNT: app.use(helmet())

Task 7.7: Configure Vite for Production Build
LOCATION: src/frontend/vite.config.ts
MODIFY vite.config.ts:
  - Add manual chunks for better code splitting
  - Configure rollupOptions.output.manualChunks:
    - 'react-vendor': ['react', 'react-dom', 'react-router-dom']
    - 'query-vendor': ['@tanstack/react-query']
    - 'ui-vendor': All @radix-ui packages
  - Set build.target: 'es2020'
  - Set build.cssCodeSplit: true

Task 7.8: Add Environment Variables
LOCATION: .env.example files
UPDATE both frontend and backend .env.example:
  FRONTEND:
    - VITE_API_BASE_URL=http://localhost:3000
    - VITE_SSE_URL=http://localhost:3000/api/events/stream
  BACKEND:
    - PORT=3000
    - FRONTEND_URL=http://localhost:5173
    - N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
    - REDIS_HOST=localhost
    - REDIS_PORT=6379
    - REDIS_PASSWORD=
    - JWT_SECRET=your-secret-key-here
    - NODE_ENV=development

Task 7.9: Create Initial Module Registrations
LOCATION: src/frontend/src/core/modules/registry.ts
CREATE registry initialization:
  - Import ModuleRegistry
  - Register 'setup' module
  - Register future modules here
  - Export initialized registry

Task 7.10: Update Main Entry Point
LOCATION: src/frontend/src/main.tsx
ENSURE main.tsx includes:
  - QueryProvider wrapper
  - AuthContext wrapper
  - SSEProvider wrapper
  - ThemeProvider wrapper
  - RouterProvider with router
  - Service worker registration
  ORDER: Theme → Query → Auth → SSE → Router
```

## Validation Loop

### Level 1: TypeScript Compilation & Linting
```bash
# Frontend
cd src/frontend
npm run build        # Must succeed with zero errors
npm run lint         # ESLint check - fix all errors

# Backend
cd src/backend
npm run build        # TypeScript compilation must succeed
npm run lint         # ESLint check - fix all errors

# Expected: No compilation or linting errors
```

### Level 2: Unit Tests (Create tests for each service)
```typescript
// Example: src/frontend/src/services/jqel/__tests__/jqel.test.ts
import { describe, it, expect, vi } from 'vitest';
import { jqel } from '../jqel';

describe('JQEL Service', () => {
  it('should construct valid POST request', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ code: 200, data: [] })
      })
    );

    await jqel.query({ schema: 'backend', select: 'portal' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/jqel',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should throw JQELError on failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ code: 400, message: 'Bad request' })
      })
    );

    await expect(jqel.query({ schema: 'backend', select: 'portal' }))
      .rejects.toThrow('Bad request');
  });
});
```

```bash
# Run tests
cd src/frontend
npm test             # Run all tests
npm run test:coverage # Coverage report (aim for >80%)

# Expected: All tests pass
```

### Level 3: Integration Tests
```bash
# Start all services
cd src/backend && npm run dev &         # Start backend
cd src/frontend && npm run dev &        # Start frontend
# Start Redis: docker run -p 6379:6379 redis
# Start n8n (if not already running)

# Manual integration test checklist:
1. Open http://localhost:5173 - Should load without errors
2. Open DevTools Network tab - Check for /api/events/stream connection
3. Navigate to /setup - Should load setup module
4. Create a new portal via setup UI - Should persist
5. Check Redis for events: redis-cli XREAD STREAMS events:test 0
6. Lighthouse audit: Performance > 90, Accessibility > 90
```

### Level 4: Authentication Flow Test
```bash
# Test auth endpoints
curl -X POST http://localhost:3000/api/1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'

# Expected: { code: 200, data: { access_token: "...", refresh_token: "..." } }

# Test protected route
TOKEN="<access_token_from_above>"
curl -X POST http://localhost:3000/api/jqel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"schema": "backend", "select": "portal"}'

# Expected: { code: 200, data: [...portals...] }
```

### Level 5: JQEL Flow Test
```bash
# Test JQEL query (requires auth)
curl -X POST http://localhost:3000/api/jqel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "schema": "backend",
    "select": "portal",
    "where": { "portalId": { "eq": "main" } }
  }'

# Expected: { code: 200, data: [{ portalId: "main", ... }] }

# Test JQEL mutation
curl -X POST http://localhost:3000/api/jqel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "schema": "backend",
    "mutate": "portal",
    "action": "insert",
    "values": {
      "portalId": "test",
      "name": "Test Portal",
      "path": "/test",
      "activeModules": [],
      "removable": true
    }
  }'

# Expected: { code: 200, data: { portalId: "test", ... } }

# Verify creation
curl -X POST http://localhost:3000/api/jqel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "schema": "backend", "select": "portal" }'

# Expected: Should include new "test" portal
```

### Level 6: SSE Event Test
```bash
# In one terminal, listen to SSE
curl -N -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/stream

# In another terminal, publish test event to Redis
redis-cli PUBLISH platform:events '{"type":"notification","id":"test1","userId":"user_123","timestamp":"2025-11-02T10:00:00Z"}'

# Expected: First terminal should receive the event
```

## Final Validation Checklist
- [ ] All TypeScript compiles without errors
- [ ] All ESLint checks pass
- [ ] All unit tests pass (>80% coverage)
- [ ] Manual test: Portal "main" loads at `/`
- [ ] Manual test: Portal "setup" loads at `/setup`
- [ ] Manual test: Login flow works end-to-end
- [ ] Manual test: JQEL query works (select)
- [ ] Manual test: JQEL mutation works (insert)
- [ ] Manual test: SSE connection established
- [ ] Manual test: SSE receives events from Redis
- [ ] Manual test: PWA installable (lighthouse check)
- [ ] Bundle size < 200KB gzipped for initial load
- [ ] Lighthouse: Performance > 90, Accessibility > 90
- [ ] Redis Pub/Sub working
- [ ] Redis Streams working
- [ ] n8n workflows responding correctly
- [ ] Documentation updated (README.md)

---

## Anti-Patterns to Avoid
- ❌ Don't create new patterns when existing ones work - Follow SPEC files exactly
- ❌ Don't skip validation - Every task has validation criteria
- ❌ Don't ignore failing tests - Fix them immediately
- ❌ Don't use sync functions in async context - Use async/await properly
- ❌ Don't hardcode values - Use environment variables
- ❌ Don't catch all exceptions - Be specific with error types
- ❌ Don't install UI libraries other than shadcn/ui - Specification forbids it
- ❌ Don't store access_token in localStorage - XSS risk, use memory only
- ❌ Don't modify n8n workflows - They are complete, only integrate
- ❌ Don't create custom CSS - Use Tailwind utilities exclusively
- ❌ Don't use BrowserRouter - Use createBrowserRouter for lazy loading
- ❌ Don't send data in SSE events - Send only metadata, fetch data via JQEL
- ❌ Don't skip token refresh logic - Must be transparent to user
- ❌ Don't forget Redis Streams alongside Pub/Sub - Both are required

---

## PRP Confidence Score

**Score: 8.5/10**

### Strengths:
- ✅ All 30+ specifications referenced and followed
- ✅ Complete task breakdown with clear dependencies
- ✅ Executable validation commands provided
- ✅ Research-backed patterns (TanStack Query + SSE, React Router lazy loading, Redis Pub/Sub + Streams)
- ✅ Existing n8n workflows understood and integrated
- ✅ Clear error handling and security patterns
- ✅ Progressive implementation (waves) with validation gates
- ✅ Comprehensive context for AI implementation

### Weaknesses/Risks:
- ⚠️ SSE + TanStack Query integration is custom (no official library support) - may require iteration
- ⚠️ JQEL processor for backend schema is simplified file-based CRUD - may need optimization
- ⚠️ Dynamic route injection with React Router 6 state-driven approach needs careful testing
- ⚠️ Service Worker implementation is manual - could use Vite PWA plugin for robustness

### Why not 10/10:
This PRP provides a very strong foundation, but implementing a completely custom platform with dynamic module loading, custom query language (JQEL), and SSE integration has inherent complexity. The SSE + TanStack Query integration pattern, while researched, doesn't have an official solution and will require careful implementation. The JQEL backend processor is intentionally simplified, which may require additional work for performance at scale. That said, the PRP provides sufficient context and patterns to achieve success in 1-2 passes with minor iterations.

### Recommendation:
Implement in waves as specified. Complete Wave 2 (Auth) first, validate thoroughly, then move to Wave 3 (JQEL), and so on. Each wave has clear validation gates. If issues arise, they'll be caught early and can be addressed before building dependent features.
