# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Em src/vsc-task-view

## Project Overview

This is a **modular platform** project for building reusable, scalable web applications. The platform allows creating isolated sub-applications (Portals) with activatable features (Modules) that can have multiple configurations (Instances).

**Core Philosophy**: Build once, reuse infinitely. Modules evolve together - fix a bug once and it's fixed everywhere.

### Key Characteristics

- **Independent Project**: This platform project is independent from the parent project (CiaPrime API). Do NOT navigate to parent directories.
- **Specification-Driven**: Implementation follows formal specifications in `spec/*.md` (30+ SPEC files)
- **Three-Layer Architecture**: Frontend (React) ↔ Backend (Express) ↔ Backbone (n8n)

## CRITICAL: Prototype Independence

**⚠️ EACH PROTOTYPE IS 100% INDEPENDENT ⚠️**

This project contains multiple prototypes in `src/` directory (prototype-1, prototype-2, prototype-3, etc.). **These are SEPARATE, ISOLATED experiments - NOT evolutionary versions of each other.**

### Absolute Rules:
- ❌ NEVER reference code from other prototypes
- ❌ NEVER assume patterns from one apply to another
- ❌ NEVER copy or look at other prototype implementations
- ❌ NEVER use other prototypes as "examples" or "reference"
- ✅ Each prototype has its own PLAN.md defining its approach
- ✅ Each prototype may use different architectural decisions
- ✅ Only reference specifications in `spec/` directory (shared by all)
- ✅ When working on prototype-X, treat other prototypes as if they don't exist

**Why?** Each prototype tests different implementation approaches. Cross-contamination defeats the purpose of having isolated experiments.

## Quick Start

### First Task Checklist

1. ✅ Identify which prototype you're working on (check user's request or current directory)
2. ✅ Read this CLAUDE.md completely (10 min)
3. ✅ Read the prototype's PLAN.md file (located in `src/prototype-X/PLAN.md`)
4. ✅ Read relevant SPEC files from `spec/` for your feature (15 min)
5. ✅ Follow the prototype's specific setup instructions from its PLAN.md

**IMPORTANT**: Each prototype has its own setup, structure, and approach defined in its PLAN.md. Do NOT assume any prototype follows the same patterns.

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
│   ├── prototype-1/      # Independent prototype experiment
│   ├── prototype-2/      # Independent prototype experiment
│   ├── prototype-3/      # Independent prototype experiment
│   └── ...               # Each has its own PLAN.md and structure
├── metodologia/          # Development methodology documentation
├── PRPs/                 # Project proposals and plans
├── MANIFESTO.md          # Platform philosophy and vision
├── STACK.md              # Technology stack decisions
└── README.md             # Project overview
```

**Note**: Each prototype in `src/` is a completely independent implementation experiment. Refer to each prototype's PLAN.md for its specific structure and approach.

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

## File Location Quick Reference

**When working on a specific feature, find files here:**

| Feature | Specification | Frontend Files | Backend Files |
|---------|--------------|----------------|---------------|
| **Authentication** | `spec/SPEC-authentication.md` | `services/auth/*`<br>`contexts/AuthContext.tsx`<br>`components/ProtectedRoute.tsx` | `routes/auth.routes.ts`<br>`middleware/auth.middleware.ts`<br>`services/n8nProxy.ts` |
| **JQEL Queries** | `spec/SPEC-data-access.md`<br>`spec/SPEC-jqel-syntax.md` | `services/jqel/*`<br>`providers/QueryProvider.tsx` | `routes/jqel.routes.ts`<br>`services/jqelProcessor.ts` |
| **Real-time Events** | `spec/SPEC-events.md` | `services/events/*`<br>`providers/SSEProvider.tsx` | `routes/events.routes.ts`<br>`services/sseService.ts`<br>`services/redisService.ts` |
| **Portal/Module System** | `spec/SPEC-concepts.md`<br>`spec/SPEC-routing.md`<br>`spec/SPEC-modules.md` | `core/routing/*`<br>`core/modules/*`<br>`core/portals/*` | `services/jqelProcessor.ts`<br>(backend schema handling) |
| **UI Components** | `spec/SPEC-architecture.md` | `components/ui/*`<br>(shadcn/ui only) | N/A |
| **Theming** | `spec/SPEC-theming.md` | `providers/ThemeProvider.tsx`<br>CSS custom properties | N/A |
| **Error Handling** | `spec/SPEC-error-handling.md` | `services/*/jqelError.ts`<br>Error boundaries | `middleware/errorHandler.middleware.ts` |

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

**IMPORTANT**: Each prototype has its own setup and commands. Refer to the specific prototype's PLAN.md or README for:
- How to install dependencies
- How to run development servers
- Environment configuration
- Build commands
- Testing commands

**Do NOT assume** all prototypes use the same commands or structure.

## Testing & Validation

**IMPORTANT**: Each prototype has its own testing approach and validation procedures. Refer to the specific prototype's PLAN.md for:
- Testing strategy and commands
- Manual testing procedures
- Build validation steps
- Performance targets

### General Validation Targets (apply to all prototypes)

**Performance** (PWA requirements):
- Landing page: < 1s load on 3G
- Initial bundle: < 200KB gzipped
- Module chunks: < 500KB gzipped each

**Lighthouse Audit** (target scores):
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: Must be installable

## Common Issues & Solutions

### Backend Won't Start

**Symptom**: Backend crashes or fails to start

**Solutions**:
- **Check Redis**: Run `redis-cli ping` → should return "PONG"
  - If not: Start Redis with `redis-server` or `docker run -p 6379:6379 redis`
- **Check n8n**: Verify `N8N_WEBHOOK_BASE_URL` in `.env` is accessible
  - Test: `curl http://your-n8n-instance/webhook/health`
- **Check port 3000**: Ensure port is not in use
  - Windows: `netstat -ano | findstr :3000`
  - Linux/Mac: `lsof -i :3000`
- **Check environment**: Verify `.env` file exists and has all required variables

### Frontend Won't Connect to Backend

**Symptom**: CORS errors, 401 errors, or network failures

**Solutions**:
- **CORS errors**: Verify `FRONTEND_URL` in backend `.env` matches frontend dev server
  - Default: `http://localhost:5173`
  - Check browser console for exact origin mismatch
- **401 errors**: Check JWT token in localStorage
  - Open DevTools → Application → Local Storage
  - Look for `refresh_token` key
  - Try logout/login to get fresh token
- **Connection refused**: Ensure backend is running on correct port
  - Check `VITE_API_URL` in frontend `.env` matches backend port

### SSE Connection Fails

**Symptom**: No real-time updates, EventSource errors in console

**Solutions**:
- **Missing headers**: Backend must set these headers:
  ```typescript
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For nginx
  ```
- **Redis not working**: Verify Redis Pub/Sub is working
  - Terminal 1: `redis-cli SUBSCRIBE platform:events`
  - Terminal 2: `redis-cli PUBLISH platform:events "test"`
  - Terminal 1 should show the message
- **Authentication**: SSE requires valid JWT token
  - Check Authorization header is being sent
  - Verify token hasn't expired

### JQEL Queries Failing

**Symptom**: Queries return errors or unexpected results

**Solutions**:
- **Schema routing**: Remember schema routing rules:
  - `backend` schema → Processed by Express (portal/module/instance config)
  - `platform` schema → Proxied to n8n
  - Other schemas → Proxied to n8n
- **Authentication**: All JQEL queries require valid JWT
  - Check `Authorization: Bearer <token>` header
  - Token must not be expired
- **Query syntax**: Validate JQEL query structure
  - Use `$eq`, `$ne`, `$gt`, `$lt`, `$in` operators (with $ prefix)
  - Check `spec/SPEC-jqel-syntax.md` for correct syntax
- **Backend logs**: Check backend console for detailed error messages

### Module Not Loading

**Symptom**: Module fails to load, blank screen, or loading forever

**Solutions**:
- **Check registration**: Verify module is registered in `ModuleRegistry`
  - Location: `src/frontend/src/core/modules/registry.ts`
- **Check portal config**: Ensure module is in portal's `activeModules` array
  - Query: `{ schema: "backend", select: "portal", where: { portalId: { $eq: "yourPortal" } } }`
- **Check dependencies**: Module dependencies must be satisfied
  - Check module manifest's `dependencies` array
  - Ensure all dependency modules are registered
- **Check lazy loading**: Verify dynamic import path is correct
  - Path should be relative to module file
  - Example: `() => import('./modules/setup')`

### Build Failures

**Symptom**: `npm run build` fails with TypeScript or Vite errors

**Solutions**:
- **Type errors**: Run `npm run lint` to see all TypeScript errors
  - Fix errors one by one
  - Common issue: Missing imports or incorrect types
- **Dependency issues**: Clear node_modules and reinstall
  - `rm -rf node_modules package-lock.json`
  - `npm install`
- **Environment variables**: Vite requires `VITE_` prefix for env vars
  - Check all env vars in frontend code start with `VITE_`
- **Import paths**: Use relative imports, not absolute
  - Wrong: `import { foo } from 'src/utils'`
  - Right: `import { foo } from '../utils'`

## Important Notes

### Project Isolation
- This is an INDEPENDENT project within a monorepo
- Do NOT navigate to parent directories (`../`)
- Do NOT reference parent project code
- Environment variables are specific to this platform

### Prototype Isolation
- Each prototype in `src/` is completely independent
- Do NOT reference other prototypes' code
- Each has its own PLAN.md, structure, and implementation approach
- When working on one prototype, ignore all others

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
- **Prototype Plans**: Each prototype has its own PLAN.md with task tracking

## Development Approach

### Before Writing Code

**ALWAYS follow this workflow**:

1. **Identify prototype and task**: Which prototype are you working on?
   - Confirm prototype directory (e.g., `src/prototype-2/`)
   - Read the prototype's PLAN.md to understand its structure and approach
   - Identify which task/system you're implementing

2. **Read specifications**: Find relevant `spec/SPEC-*.md` files
   - Use "File Location Quick Reference" table above
   - Read entire SPEC file, not just summaries
   - Note RFC 2119 keywords (MUST, SHOULD, MAY)

3. **Check prototype's plan**: Understand the prototype's approach
   - Each prototype has its own PLAN.md with task breakdown
   - Follow the prototype's specific architectural decisions
   - DO NOT look at other prototypes for "examples"

4. **Validate approach**: Cross-reference with SPEC requirements
   - Does your approach match the specification?
   - Are you following architecture boundaries?
   - Are you using approved technologies from the stack?

5. **Implement**: Follow the prototype's PLAN.md
   - Use TypeScript for type safety
   - Maintain consistent naming conventions within the prototype
   - Follow the prototype's chosen patterns

6. **Test**: Run relevant validation commands
   - Follow prototype-specific testing procedures
   - Validate against performance targets
   - Check build succeeds

7. **Update tracking**: Mark tasks complete in prototype's PLAN.md
   - Update task status
   - Add notes about implementation details
   - Flag any deviations from original plan

**Never start coding without completing steps 1-3.**

### When Implementing Features

1. **Read specifications first** - Everything is already designed in `spec/`
2. **Respect boundaries** - Frontend, Backend, Backbone have clear responsibilities
3. **Use JQEL exclusively** - No direct data access from frontend
4. **Follow prototype's plan** - Each prototype defines its own patterns and approach
5. **Validate with specs** - Cross-reference implementation against SPEC-* files

The specifications are comprehensive and authoritative. When in doubt, consult the relevant SPEC file rather than making assumptions. Each prototype's PLAN.md defines how to apply specs in that specific implementation.

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
