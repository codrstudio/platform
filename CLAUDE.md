# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **modular platform** project for building reusable, scalable web applications. The platform allows creating isolated sub-applications (Portals) with activatable features (Modules) that can have multiple configurations (Instances).

**Current Status**: **Prototype-1 implementation is 85%+ complete** with functional authentication, JQEL foundation, SSE events, and basic infrastructure. Located in `src/prototype-1/` directory.

**Core Philosophy**: Build once, reuse infinitely. Modules evolve together - fix a bug once and it's fixed everywhere.

### Key Characteristics

- **Independent Project**: This platform project is independent from the parent project (CiaPrime API). Do NOT navigate to parent directories.
- **Specification-Driven**: Implementation follows formal specifications in `spec/*.md` (30+ SPEC files)
- **Three-Layer Architecture**: Frontend (React) ↔ Backend (Express) ↔ Backbone (n8n)
- **Active Development**: Prototype-1 implementation is functional and actively being developed in `src/prototype-1/`

## Architecture

### Three-Layer Foundation

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React 19 + Vite)                 │
│  - UI rendering, routing, state management  │
│  - NO business logic or database access     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKEND (Express + Node.js)                │
│  - Proxy between frontend and backbone      │
│  - Validation, authentication, routing      │
│  - Minimal control logic only               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKBONE (n8n - Already Implemented)       │
│  - Business logic, workflows, automations   │
│  - Data access and external integrations    │
│  - Authentication/authorization processing  │
└─────────────────────────────────────────────┘
```

**IMPORTANT**: The Backbone (n8n) is already developed with workflows in `workflows/`. This project focuses on implementing Frontend and Backend.

### Core Concepts

1. **Portal** - Isolated sub-application within the platform
   - Has unique ID (e.g., "main", "setup")
   - Main portal uses `/`, others use `/:portalId/*`
   - Completely isolated from other portals (no shared state)
   - Configures which modules are active

2. **Module** - Reusable, encapsulated functionality
   - Can be activated in multiple portals
   - Lazy-loaded on demand (code splitting)
   - Can declare dependencies on other modules
   - Two types: "Components" (libraries) and "Functionality" (complete experiences)

3. **Instance** - Specific configuration of an activated module
   - One module can have multiple instances with different configs
   - Portal-scoped (same instanceId can exist in different portals)

## Technology Stack (Mandatory)

### Frontend
- **React 19** + Vite + TypeScript
- **React Router** for routing
- **Tailwind CSS** + **shadcn/ui** (ONLY UI library allowed)
- **React Hook Form** + **Zod** for forms
- **TanStack Query** for async state (wrapping JQEL)
- **Lucide React** for icons
- Specialized components: TanStack Table, Recharts, FullCalendar

### Backend
- **Node.js** + **Express** + TypeScript
- **Redis** for Pub/Sub, Streams, and cache
- JWT authentication

### Backbone (Already Built)
- **n8n** workflows (see `workflows/` directory)
- 8 active workflows for auth, chat, database access

## Data Access - JQEL

**Critical**: ALL data access MUST use JQEL (JSON Query Expression Language).

### What is JQEL
- Platform's unified query language
- JSON-based, database-agnostic
- Sends POST to `/api/jqel`
- Encapsulated via TanStack Query hooks

### Query Structure
```typescript
{
  "schema": "platform" | "backend" | "system" | "<app-schema>",
  "select": "entity" | "mutate": "entity",
  "action": "insert" | "update" | "delete" | "custom",
  "where": { /* conditions */ },
  "options": { "limit": 10, "offset": 0, "orderBy": [...] },
  "output": ["field1", "field2"],  // projection
  "except": ["sensitive"]           // exclude fields
}
```

### Reserved Schemas
- `platform` - Routed to Backbone (n8n) for general platform operations
- `backend` - Processed by Backend (Express) - used for portal/module/instance config
- `system` - Configurable processing
- Others - Application-specific, routed to Backbone

### Usage Example
```typescript
// Via TanStack Query hooks (preferred)
const { data, isLoading } = useJQEL({
  schema: "backend",
  select: "portal",
  where: { portalId: { $eq: "main" } }
});

// Mutations
const mutation = useJQELMutation();
mutation.mutate({
  schema: "backend",
  mutate: "module",
  action: "update",
  values: { active: true },
  where: { moduleId: { $eq: "setup" } }
});
```

## Project Structure

```
platform/
├── spec/                  # 30+ formal specification files (SPEC-*.md)
│   ├── SPEC-concepts.md           # Portal, Module, Instance definitions
│   ├── SPEC-architecture.md       # Stack requirements, PWA, responsive
│   ├── SPEC-routing.md            # Routing rules and priorities
│   ├── SPEC-authentication.md     # Auth contracts and JWT
│   ├── SPEC-events.md             # SSE real-time events system
│   ├── SPEC-theming.md            # Light/dark theme, brand colors
│   ├── SPEC-data-access.md        # JQEL integration with TanStack Query
│   ├── SPEC-jqel-syntax.md        # JQEL query language syntax
│   └── SPEC-module-*.md           # Module specifications
├── workflows/             # n8n workflows (Backbone - already built)
│   ├── auth/             # Authentication workflows (login, refresh, logout)
│   └── system/           # System workflows (health, request, chat)
├── src/
│   └── prototype-1/      # Current working implementation (85%+ complete)
│       ├── frontend/     # React 19 + Vite + TypeScript
│       │   ├── src/
│       │   │   ├── components/      # Reusable UI components
│       │   │   ├── contexts/        # AuthContext, etc.
│       │   │   ├── pages/           # Page components
│       │   │   ├── providers/       # QueryProvider, etc.
│       │   │   ├── services/        # auth, jqel, events
│       │   │   └── lib/             # Utilities, shadcn/ui
│       │   └── public/              # PWA manifest, icons, SW
│       └── backend/      # Express + Node.js + TypeScript
│           ├── src/
│           │   ├── routes/          # API routes (auth, jqel, events, health)
│           │   ├── services/        # n8nProxy, jqelProcessor, sseService, redisService
│           │   ├── middleware/      # auth, errorHandler, logger, rateLimiter
│           │   ├── config/          # Environment configuration
│           │   └── server.ts        # Express app entry point
│           └── config/              # Portal/module/instance JSON files
├── PRPs/                  # Implementation plans and progress tracking
│   ├── platform-implementation.md         # Original implementation plan
│   └── platform-implementation.TASKS.md   # Detailed task checklist (85%+ complete)
├── MANIFESTO.md          # Platform philosophy and vision
└── README.md             # Project overview and getting started
```

## Key Rules & Constraints

### Data Access
- NEVER access data directly from frontend - always use JQEL
- NEVER use fetch/axios directly for data - wrap in TanStack Query
- ALL queries MUST go through `/api/jqel` endpoint

### Architecture Boundaries
- Frontend: NEVER put business logic in React components
- Backend: NEVER access application databases directly (only via n8n)
- Backbone: Already built, integration only

### UI & Styling
- Use ONLY shadcn/ui for components (no other UI libraries)
- Minimize or eliminate custom CSS
- Use Tailwind utilities for styling
- Use semantic colors (success, warning, error, info) with Lucide icons
- NO emojis unless explicitly requested

### Module Development
- Modules MUST be lazy-loaded (React.lazy + dynamic import)
- Modules MUST declare dependencies in manifest
- Modules export routes, components, widgets
- Routes are relative (portal prefixes injected automatically)

### Specifications are Law
- Read relevant `spec/SPEC-*.md` files before implementing features
- Specifications use RFC 2119 keywords (MUST, SHOULD, MAY)
- All implementation decisions already documented in specs

## Working with Specifications

### Reading Specs
Before implementing any feature, consult the relevant specification:

```bash
# Core concepts (always read first)
spec/SPEC-concepts.md
spec/SPEC-architecture.md

# Feature-specific
spec/SPEC-routing.md         # Before implementing routing
spec/SPEC-authentication.md  # Before implementing auth
spec/SPEC-data-access.md     # Before implementing data queries
spec/SPEC-theming.md         # Before implementing themes
spec/SPEC-events.md          # Before implementing SSE/notifications

# Module development
spec/SPEC-modules.md               # General module rules
spec/SPEC-module-setup.md          # Setup module requirements
spec/SPEC-module-components.md     # Component modules
```

### Specification Format
Specs use formal requirement IDs:
```
SPEC-<AREA>-<SECTION>-<NUMBER>

Examples:
SPEC-A-L-001    - Architecture, Layers, #1
SPEC-C-P-005    - Concepts, Portal, #5
SPEC-JQEL-STR-003  - JQEL, Structure, #3
```

## Authentication System

The platform implements JWT-based authentication with 5 routes (all processed by n8n):

### Routes
- `POST /api/1/auth/login` - Authenticate user, issue JWT + refresh token
- `POST /api/1/auth/refresh` - Renew session with refresh token
- `POST /api/1/auth/logout` - Revoke current refresh token
- `POST /api/1/auth/logout-all` - Revoke all user sessions
- `POST /api/1/auth/authorize` - Validate JWT and check permissions

### Workflow Files
Authentication workflows are in `workflows/auth/`:
- `auth-login.json`
- `auth-refresh.json`
- `auth-logout.json`
- `auth-logout-all.json`
- `authorize.json`
- Helper functions: `fn-find-user.json`, `fn-jwt-emission.json`, `fn-jwt-validation.json`

### Backend Role
Backend acts as proxy:
1. Receives auth request from frontend
2. Validates request structure
3. Forwards to n8n workflow via HTTP
4. Returns standardized JResult response

## Real-Time Events

The platform uses Server-Sent Events (SSE) for real-time updates:

### Flow
```
Backbone (n8n) → Redis Pub/Sub → Backend Listener → SSE Stream → Frontend
```

### Implementation
- Backend: `GET /api/events/stream` (SSE endpoint)
- Redis: Subscribe to `platform:events` channel
- Frontend: EventSource connection with auto-reconnect
- TanStack Query: Auto-invalidate queries on relevant events

### Event Payload
```typescript
{
  type: "notification" | "task" | "data-change",
  target: "user:123" | "portal:main" | "module:chat",
  data: { /* event-specific payload */ }
}
```

## Progressive Web App (PWA)

The platform MUST be a fully functional PWA:

### Requirements
- Web App Manifest with name, icons, start_url, display: "standalone"
- Service Worker with cache strategies:
  - Cache-first for assets (JS, CSS, images)
  - Network-first for data
- Offline fallback pages
- Installable on devices (mobile, desktop)

### Performance Targets
- Landing page: < 1s load on 3G
- Initial bundle: < 200KB gzipped
- Module chunks: < 500KB gzipped each

## Development Commands

### Prototype-1 (Current Implementation)

**Frontend** (`src/prototype-1/frontend/`):
```bash
cd src/prototype-1/frontend
npm install                   # Install dependencies
npm run dev                   # Start Vite dev server (http://localhost:5173)
npm run build                 # Build for production
npm run lint                  # ESLint check
npm run preview               # Preview production build
```

**Backend** (`src/prototype-1/backend/`):
```bash
cd src/prototype-1/backend
npm install                   # Install dependencies
npm run dev                   # Start Express with hot-reload (http://localhost:3000)
npm run build                 # Compile TypeScript
npm start                     # Run compiled code
npm run lint                  # ESLint check
npm run lint:fix              # Auto-fix linting issues
```

**Important**: Frontend and Backend must be run separately in different terminals.

### Environment Configuration

Both frontend and backend have `.env.example` files. Copy them to `.env` and configure:

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:3000
VITE_N8N_WEBHOOK_URL=http://your-n8n-instance
```

**Backend** (`.env`):
```bash
PORT=3000
N8N_WEBHOOK_BASE_URL=http://your-n8n-instance
REDIS_HOST=localhost
REDIS_PORT=6379
# ... see .env.example for complete list
```

## Important Notes

### Project Isolation
- This is an INDEPENDENT project within a monorepo
- Do NOT navigate to parent directories (`../`)
- Do NOT reference parent project code
- Environment variables are specific to this platform

### Current State
- **Prototype-1 is 85%+ complete** and functional
- Implemented features:
  - ✅ Frontend structure (React 19 + Vite + Tailwind + shadcn/ui)
  - ✅ Backend structure (Express + TypeScript)
  - ✅ Full authentication system (JWT with auto-refresh)
  - ✅ JQEL foundation (types, hooks, TanStack Query integration)
  - ✅ SSE real-time events (Redis Pub/Sub → Backend → Frontend)
  - ✅ PWA support (manifest, service worker, offline capability)
  - ✅ Basic infrastructure (logging, error handling, rate limiting)
- Working location: `src/prototype-1/`
- See `PRPs/platform-implementation.TASKS.md` for detailed progress

### n8n Backbone
- n8n workflows are ALREADY IMPLEMENTED
- Located in `workflows/` directory
- 8 active workflows for authentication and system operations
- Backend will proxy to n8n via HTTP with mutual authentication

### Configuration Persistence
- Portal/Module/Instance configs stored as JSON files on backend
- Accessed via JQEL with schema="backend"
- NOT stored in `/config/*.json` (that's for platform UI preferences)
- Initial state: 2 portals ("main", "setup") with "setup" module active

### Visual Guidelines
- Support light/dark themes (CSS custom properties)
- Brand color customizable per portal via `settings-key`
- Automatic palette generation with WCAG AA contrast validation
- Semantic colors with Lucide icons for visual meaning
- Zero or minimal CSS customization

## Getting Help

- **Philosophy**: See `MANIFESTO.md` for platform vision and benefits
- **Specifications**: Browse `spec/` directory - 30+ formal requirement docs

## Implementation Architecture (Prototype-1)

### Frontend Structure (`src/prototype-1/frontend/src/`)

**Services Layer** - Core business logic:
- `services/auth/` - Authentication (tokenManager, authService, types)
- `services/jqel/` - JQEL queries (jqel.ts, jqelHooks.ts, jqelKeys.ts, types)
- `services/events/` - SSE event streaming (eventService.ts, types)

**Contexts & Providers** - State management:
- `contexts/AuthContext.tsx` - Global auth state, user info, isAuthenticated
- `providers/QueryProvider.tsx` - TanStack Query setup with defaults

**Components** - UI building blocks:
- `components/ui/` - shadcn/ui components (button, card, input, toast, etc.)
- `components/ProtectedRoute.tsx` - Route guard for authenticated pages

**Pages** - Route components:
- `pages/LoginPage.tsx`, `DashboardPage.tsx`, etc.

**Entry Point**:
- `main.tsx` - Mounts providers (QueryProvider → AuthProvider → Router → App)

### Backend Structure (`src/prototype-1/backend/src/`)

**Routes** - API endpoints:
- `routes/auth.routes.ts` - `/api/1/auth/*` (proxy to n8n)
- `routes/jqel.routes.ts` - `/api/jqel` (JQEL processor)
- `routes/events.routes.ts` - `/api/events/stream` (SSE)
- `routes/health.routes.ts` - `/api/health` (health check)

**Services** - Business logic:
- `services/n8nProxy.ts` - Forward requests to n8n Backbone
- `services/jqelProcessor.ts` - Process JQEL queries (schema routing)
- `services/sseService.ts` - Manage SSE connections
- `services/redisService.ts` - Redis Pub/Sub for events

**Middleware**:
- `middleware/auth.middleware.ts` - JWT validation (via n8n)
- `middleware/errorHandler.middleware.ts` - Global error handling
- `middleware/logger.middleware.ts` - Winston logging
- `middleware/rateLimiter.middleware.ts` - Rate limiting

**Entry Point**:
- `server.ts` - Express app with CORS, Helmet, middleware, routes

### Key Implementation Patterns

**Authentication Flow**:
1. User logs in → Frontend calls `/api/1/auth/login`
2. Backend proxies to n8n → n8n validates and issues JWT + refresh token
3. Frontend stores access_token in memory, refresh_token in localStorage
4. Auto-refresh before token expires (background scheduler in AuthContext)
5. Protected routes check `isAuthenticated` before rendering

**JQEL Query Flow**:
1. Component uses `useJQEL()` hook → wraps TanStack Query's `useQuery()`
2. Hook calls `jqel.query()` → POST to `/api/jqel` with JWT
3. Backend validates request → routes by schema (platform/backend/system/app)
4. Response cached by TanStack Query with auto-invalidation
5. SSE events can trigger cache invalidation for real-time updates

**SSE Events Flow**:
1. Backend subscribes to Redis channel `platform:events`
2. n8n publishes events to Redis when data changes
3. Backend broadcasts to all connected SSE clients (filtered by target)
4. Frontend EventSource receives events → triggers TanStack Query invalidation
5. Components auto-refetch updated data

## Development Approach

When implementing features:

1. **Read specifications first** - Everything is already designed in `spec/`
2. **Respect boundaries** - Frontend, Backend, Backbone have clear responsibilities
3. **Use JQEL exclusively** - No direct data access from frontend
4. **Follow existing patterns** - Check `src/prototype-1/` for established patterns
5. **Validate with specs** - Cross-reference implementation against SPEC-* files

The specifications are comprehensive and authoritative. When in doubt, consult the relevant SPEC file rather than making assumptions.

### Temporary Files

**CRITICAL**: Do NOT create scripts, test files, or temporary files in the main project structure.

- ✓ Create temporary files in `.tmp/` directory only
- ✗ Never create temporary files in `src/`, `docs/`, or root directory
- `.tmp/` is gitignored and safe for experiments

### Playwright Testing

When asked to use Playwright:

**IMPORTANT**: The request is for **user experimentation**, NOT automated testing.

- ✓ Use Playwright to simulate user behavior and explore the system
- ✓ Interact with the UI from a user's perspective
- ✗ Do NOT generate test files or test cases
- ✗ Do NOT save test configurations
- ✗ Do NOT create test reports
- ✗ Do NOT save any Playwright artifacts

**CRITICAL**
- ✗ Do NOT read files in .tmp folder unless it was created by you or was explicit told so by the user.
