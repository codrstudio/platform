# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **modular platform** project for building reusable, scalable web applications. The platform allows creating isolated sub-applications (Portals) with activatable features (Modules) that can have multiple configurations (Instances).

**Core Philosophy**: Build once, reuse infinitely. Modules evolve together - fix a bug once and it's fixed everywhere.

### Key Characteristics

- **Specification-Driven**: Implementation follows formal specifications in `spec/*.md` (33 SPEC files)
- **Three-Layer Architecture**: Frontend (React) ↔ Backend (Express) ↔ Backbone (n8n)
- **Current Phase**: Specification complete, implementation pending

## ⚠️ CURRENT PROJECT STATUS

**CRITICAL**: This project is currently in the **SPECIFICATION PHASE**.

**What EXISTS**:
- ✅ **33 comprehensive SPEC files** defining all systems and features
- ✅ **10 UI/UX interface specifications** with wireframes and component designs
- ✅ **13 n8n Backbone workflows** (authentication and system operations)
- ✅ **Implementation plan** (`src/PLAN.md` - 7 Initiatives with Epic/Story structure)
- ✅ **Project philosophy** (`MANIFESTO.md`)
- ✅ **Technology stack definition** (`spec/STACK.md`)

**What DOES NOT EXIST YET**:
- ❌ No frontend code
- ❌ No backend code
- ❌ No package.json or dependencies
- ❌ No configuration files
- ❌ No build system
- ❌ No tests

**History**: This project experimented with 3 different prototype implementations, which were all removed on Nov 6, 2025 to start fresh with a unified approach based on lessons learned.

## Quick Start

### First Task Checklist

Before implementing ANY feature:

1. ✅ Read this CLAUDE.md completely (10 min)
2. ✅ Read `src/PLAN.md` - the value-driven implementation roadmap
3. ✅ Read the **fundamental specifications**:
   - `spec/SPEC-concepts.md` - Portal, Module, Instance definitions
   - `spec/SPEC-architecture.md` - Three-layer architecture
   - `spec/SPEC-modules.md` - Module system design
4. ✅ Read relevant SPEC files for your specific feature (15-30 min)
5. ✅ Check `spec/ui/` for UI/UX interface specifications if implementing frontend

**IMPORTANT**: Implementation must follow the specifications exactly. These specs are the result of extensive design work and represent the authoritative source of truth.

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

Read `spec/SPEC-concepts.md` for full details. Summary:

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

See `spec/STACK.md` for the complete stack. Must use these exact technologies:

### Frontend
- **React 19** + Vite + TypeScript
- **React Router** for routing
- **Tailwind CSS** + **shadcn/ui** (ONLY UI library allowed)
- **React Hook Form** + **Zod** for forms
- **TanStack Query** for async state (wrapping JQEL)
- **Lucide React** for icons
- Specialized components: TanStack Table, Recharts, FullCalendar
- **Service Worker** for PWA functionality

### Backend
- **Node.js** + **Express** + TypeScript
- **Redis** for Pub/Sub, Streams, and cache
- **JWT** authentication
- **Helmet** for security headers
- **Winston** (logging) + **Morgan** (HTTP logging)
- **Server-Sent Events (SSE)** for real-time updates

### Backbone (Already Built)
- **n8n** workflows (see `workflows/` directory)
- 13 active workflows for auth, chat, database access
- Integration point: `https://n8n.codrstudio.dev`

### Custom Systems
- **JQEL** (JSON Query Expression Language) - Platform's unified data access layer

## Data Access - JQEL

**Critical**: ALL data access MUST use JQEL (JSON Query Expression Language).

Read `spec/SPEC-data-access.md` and `spec/SPEC-jqel-syntax.md` for complete documentation.

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
├── spec/                  # 33 formal specification files (SPEC-*.md)
│   ├── SPEC-concepts.md           # Portal, Module, Instance definitions
│   ├── SPEC-architecture.md       # Stack requirements, PWA, responsive
│   ├── SPEC-modules.md            # Module system design
│   ├── SPEC-routing.md            # Routing rules and priorities
│   ├── SPEC-authentication.md     # Auth contracts and JWT
│   ├── SPEC-events.md             # SSE real-time events system
│   ├── SPEC-channels.md           # Redis Pub/Sub channels
│   ├── SPEC-queues.md             # Redis Streams for task queues
│   ├── SPEC-theming.md            # Light/dark theme, brand colors
│   ├── SPEC-data-access.md        # JQEL integration with TanStack Query
│   ├── SPEC-jqel-syntax.md        # JQEL query language syntax
│   ├── SPEC-jqel-schema.md        # JQEL schema routing rules
│   ├── SPEC-frontend-state.md     # Client-side state management
│   ├── SPEC-error-handling.md     # Error boundaries and recovery
│   ├── SPEC-module-*.md           # 15+ module specifications
│   ├── ui/                        # 10 UI/UX interface specifications
│   ├── pending-decisions/         # Architectural decisions pending resolution
│   ├── whats-new/                 # Documentation of changes and updates
│   └── STACK.md                   # Technology stack definition
├── workflows/             # n8n workflows (Backbone - already built)
│   ├── auth/             # 8 authentication workflows
│   │   ├── auth-login.json
│   │   ├── auth-refresh.json
│   │   ├── auth-logout.json
│   │   ├── auth-logout-all.json
│   │   ├── authorize.json
│   │   ├── fn-find-user.json
│   │   ├── fn-jwt-emission.json
│   │   └── fn-jwt-validation.json
│   ├── system/           # 5 system workflows
│   │   ├── chat.json
│   │   ├── health.json
│   │   ├── request.json
│   │   ├── request_database.json
│   │   └── request_datatable.json
│   └── flows/            # Placeholder for future workflows
├── src/                  # Implementation code (EMPTY - to be implemented)
│   └── PLAN.md           # Value-driven implementation plan
├── .claude/              # Claude Code configuration
│   └── commands/         # Slash commands
├── .vscode/              # VS Code configuration
├── .tmp/                 # Temporary files (gitignored)
├── assets/               # Project assets
├── MANIFESTO.md          # Platform philosophy and vision
├── CLAUDE.md             # This file
└── README.md             # Project overview
```

## Implementation Plan

The implementation follows a **value-driven** approach defined in `src/PLAN.md`.

### 7 Initiatives (High-Level Goals)

1. **PLATFORM FOUNDATION** - Base environment, auth, routing, data access
2. **SETUP MODULE** - Initial configuration interface
3. **CORE MODULES** - Essential user-facing features (auth, chat, organizations, profiles)
4. **ADVANCED INFRASTRUCTURE** - Real-time events, notifications, task queues
5. **PRODUCTIVITY MODULES** - Documents, tasks, calendar, forms
6. **COMMUNICATION & CONTENT** - Forum, feed, videos, wiki
7. **SPECIALIZED FEATURES** - Marketplace, workflow automation, API platform

### Structure: Initiative → Epic → Story → Task

Each story follows the format:
```
> Como [persona],
> Quero [ação],
> Para [benefício]
```

### Task Status Legend
- `[ ]` — Pendente
- `[-]` — Em Implementação
- `[x]` — Feito
- `[!]` — Bloqueado

## Key Rules & Constraints

### Data Access
- NEVER access data directly from frontend - always use JQEL
- NEVER use fetch/axios directly for data - wrap in TanStack Query
- ALL queries MUST go through `/api/jqel` endpoint

### Architecture Boundaries
- **Frontend**: NEVER put business logic in React components
- **Backend**: NEVER access application databases directly (only via n8n)
- **Backbone**: Already built, integration only

### UI & Styling
- Use ONLY shadcn/ui for components (no other UI libraries)
- Minimize or eliminate custom CSS
- Use Tailwind utilities for styling
- Use semantic colors (success, warning, error, info) with Lucide icons
- NO emojis unless explicitly requested
- Follow UI/UX specifications in `spec/ui/` exactly

### Module Development
- Modules MUST be lazy-loaded (React.lazy + dynamic import)
- Modules MUST declare dependencies in manifest
- Modules export routes, components, widgets
- Routes are relative (portal prefixes injected automatically)

### Specifications are Law
- Read relevant `spec/SPEC-*.md` files before implementing features
- Specifications use RFC 2119 keywords (MUST, SHOULD, MAY)
- All implementation decisions already documented in specs
- If specs conflict with code, specs win

## Working with Specifications

### Reading Specs

Before implementing any feature, consult the relevant specification:

```bash
# Core concepts (ALWAYS read first)
spec/SPEC-concepts.md
spec/SPEC-architecture.md
spec/SPEC-modules.md

# Feature-specific
spec/SPEC-routing.md         # Before implementing routing
spec/SPEC-authentication.md  # Before implementing auth
spec/SPEC-data-access.md     # Before implementing data queries
spec/SPEC-theming.md         # Before implementing themes
spec/SPEC-events.md          # Before implementing SSE/notifications
spec/SPEC-channels.md        # Before implementing Redis Pub/Sub
spec/SPEC-queues.md          # Before implementing task queues

# Frontend state management
spec/SPEC-frontend-state.md  # Before implementing React state/context

# Module development
spec/SPEC-module-setup.md          # Setup module requirements
spec/SPEC-module-auth.md           # Auth module
spec/SPEC-module-chat.md           # Chat module
spec/SPEC-module-organizations.md  # Organizations module
# ... (15+ module specs total)

# UI/UX implementations
spec/ui/SPEC-ui-*.md         # Interface wireframes and components
```

### Specification Format

Specs use formal requirement IDs:
```
SPEC-<AREA>-<SECTION>-<NUMBER>

Examples:
SPEC-A-L-001    - Architecture, Layers, #1
SPEC-C-P-005    - Concepts, Portal, #5
SPEC-JQEL-STR-003  - JQEL, Structure, #3
SPEC-M-SETUP-001   - Module, Setup, #1
```

### Specification Index

| Area | Files | Purpose |
|------|-------|---------|
| **Core Concepts** | `SPEC-concepts.md` | Portal, Module, Instance definitions |
| **Architecture** | `SPEC-architecture.md`, `STACK.md` | System structure, tech stack |
| **Modules** | `SPEC-modules.md` | Module system design |
| **Routing** | `SPEC-routing.md` | URL structure, navigation |
| **Authentication** | `SPEC-authentication.md` | JWT, session management |
| **Data Access** | `SPEC-data-access.md`, `SPEC-jqel-syntax.md`, `SPEC-jqel-schema.md` | JQEL query system |
| **Real-Time** | `SPEC-events.md`, `SPEC-channels.md`, `SPEC-queues.md` | SSE, Redis Pub/Sub, Streams |
| **Frontend** | `SPEC-frontend-state.md`, `SPEC-error-handling.md` | React state, error boundaries |
| **Theming** | `SPEC-theming.md` | Light/dark mode, brand colors |
| **UI/UX** | `spec/ui/SPEC-ui-*.md` | Interface wireframes (10 files) |
| **Modules** | `SPEC-module-*.md` | Individual module specs (15+ files) |

## Authentication System

The platform implements JWT-based authentication with 5 routes (all processed by n8n).

Read `spec/SPEC-authentication.md` for complete documentation.

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

The platform uses Server-Sent Events (SSE) for real-time updates.

Read `spec/SPEC-events.md` and `spec/SPEC-channels.md` for complete documentation.

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

The platform MUST be a fully functional PWA.

Read `spec/SPEC-architecture.md` (SPEC-A-PWA-*) for complete requirements.

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

## Theming System

The platform implements a comprehensive theming system.

Read `spec/SPEC-theming.md` for complete documentation.

### Theme Modes
- **light** - Light theme
- **dark** - Dark theme
- **system** - Auto-detect from OS preferences (default)

### Implementation Requirements
- `ThemeProvider` wraps the entire application
- Theme state managed in React Context
- Preferences persisted to localStorage with `settings-key` scoping
- Automatic system preference detection using `matchMedia`
- CSS custom properties for dynamic theming

### Brand Colors
- Portal-specific brand color customization
- Automatic palette generation from brand color
- WCAG AA contrast validation
- Semantic color generation (success, warning, error, info)

## Development Approach

### Starting Implementation

When beginning implementation for the first time:

1. **Read the fundamentals** (2-3 hours):
   - `CLAUDE.md` (this file)
   - `src/PLAN.md` (implementation roadmap)
   - `spec/SPEC-concepts.md`
   - `spec/SPEC-architecture.md`
   - `spec/SPEC-modules.md`

2. **Choose starting point** from `src/PLAN.md`:
   - Recommended: **INITIATIVE 1: PLATFORM FOUNDATION**
   - Start with **EPIC 1.1: Ambiente de Desenvolvimento**

3. **Read relevant specs**:
   - Frontend: `spec/SPEC-architecture.md` (SPEC-A-FE-*)
   - Backend: `spec/SPEC-architecture.md` (SPEC-A-BE-*)
   - PWA: `spec/SPEC-architecture.md` (SPEC-A-PWA-*)

4. **Initialize project structure**:
   - Create `src/frontend/` with Vite + React 19 + TypeScript
   - Create `src/backend/` with Express + TypeScript
   - Configure dependencies per `spec/STACK.md`

5. **Follow PLAN.md tasks** in order

### Before Writing Code

**ALWAYS follow this workflow**:

1. **Identify task**: Which Epic/Story are you implementing?
   - Check `src/PLAN.md` for current task
   - Understand the user value (Como/Quero/Para)

2. **Read specifications**: Find relevant `spec/SPEC-*.md` files
   - Check "Refs:" in the story for specification references
   - Read entire SPEC file, not just summaries
   - Note RFC 2119 keywords (MUST, SHOULD, MAY)

3. **Check UI/UX specs**: If implementing UI
   - Look in `spec/ui/` for wireframes and component designs
   - Follow the exact design specifications

4. **Validate approach**: Cross-reference with SPEC requirements
   - Does your approach match the specification?
   - Are you following architecture boundaries?
   - Are you using approved technologies from `spec/STACK.md`?

5. **Implement**: Follow the specifications exactly
   - Use TypeScript for type safety
   - Follow naming conventions from specs
   - Implement all MUST requirements
   - Consider all SHOULD requirements

6. **Test**: Validate implementation
   - Does it meet all SPEC requirements?
   - Does it provide the user value from the story?
   - Does it follow performance targets?

7. **Update tracking**: Mark task in `src/PLAN.md`
   - Change `[ ]` to `[x]` when complete
   - Add notes about implementation details
   - Flag any deviations from original plan with `[!]`

**Never start coding without completing steps 1-3.**

### When Implementing Features

1. **Read specifications first** - Everything is already designed in `spec/`
2. **Respect boundaries** - Frontend, Backend, Backbone have clear responsibilities
3. **Use JQEL exclusively** - No direct data access from frontend
4. **Follow UI/UX specs** - `spec/ui/` defines exact interfaces
5. **Validate with specs** - Cross-reference implementation against SPEC-* files

The specifications are comprehensive and authoritative. When in doubt, consult the relevant SPEC file rather than making assumptions.

### Temporary Files

**CRITICAL**: Do NOT create scripts, test files, or temporary files in the main project structure.

- ✓ Create temporary files in `.tmp/` directory only
- ✗ Never create temporary files in `src/`, `spec/`, or root directory
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

## Important Notes

### Project Isolation
- This is an INDEPENDENT project within a monorepo
- Do NOT navigate to parent directories (`../`)
- Do NOT reference parent project code
- Environment variables are specific to this platform

### n8n Backbone
- n8n workflows are ALREADY IMPLEMENTED
- Located in `workflows/` directory
- 13 active workflows for authentication and system operations
- Backend will proxy to n8n via HTTP with mutual authentication
- Integration endpoint: `https://n8n.codrstudio.dev`

### Configuration Persistence
- Portal/Module/Instance configs will be stored as JSON files on backend
- Accessed via JQEL with schema="backend"
- Initial state: 2 portals ("main", "setup") with "setup" module active
- See `spec/SPEC-jqel-schema.md` for routing details

### Visual Guidelines
- Support light/dark themes (CSS custom properties)
- Brand color customizable per portal via `settings-key`
- Automatic palette generation with WCAG AA contrast validation
- Semantic colors with Lucide icons for visual meaning
- Zero or minimal CSS customization

### File Encoding
- **ALWAYS save files in UTF-8 encoding**

### Process Management
- ❌ FORBIDDEN: Never use `kill` command to terminate Node.js processes
  - Node normally runs in hot-reload mode and doesn't need to be killed
  - There may be production processes that should not be interrupted
- ❌ FORBIDDEN: Never change port configuration to force the app to work
  - If port is occupied, do NOT modify it
  - Stop execution and report the problem instead

## Getting Help

- **Philosophy**: See `MANIFESTO.md` for platform vision and benefits
- **Specifications**: Browse `spec/` directory - 33 formal requirement docs
- **Implementation Plan**: See `src/PLAN.md` for value-driven roadmap
- **UI/UX Designs**: See `spec/ui/` for interface specifications

## Development Commands (Future)

**Note**: These commands will be available once the implementation begins.

### Frontend (Future: `src/frontend/`)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types only (no build)
npm run lint         # Run ESLint
```

### Backend (Future: `src/backend/`)
```bash
npm install          # Install dependencies
npm run dev          # Start with hot-reload (nodemon + ts-node)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled code from dist/
npm run type-check   # Check TypeScript types only (no build)
npm run lint         # Run ESLint
```

### Required Services
- Redis server must be running (default: localhost:6379)
- n8n instance must be accessible at `https://n8n.codrstudio.dev`

## Common Issues & Solutions (Future Reference)

This section will be populated as implementation progresses and common issues are identified.

### Redis Connectivity
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Starting Redis (platform-specific)
# Linux/macOS
redis-server

# Windows (using WSL)
wsl redis-server

# Windows (using Docker)
docker run -d -p 6379:6379 redis:latest

# Windows (native Redis from MSOpenTech)
redis-server.exe
```

### n8n Connectivity
```bash
# Verify n8n is accessible
curl https://n8n.codrstudio.dev/webhook/health
```

## Summary

**Current State**: Specification complete, ready for implementation.

**Next Steps**:
1. Read this CLAUDE.md completely
2. Read `src/PLAN.md` to understand the value-driven approach
3. Read fundamental specs (SPEC-concepts.md, SPEC-architecture.md, SPEC-modules.md)
4. Start with INITIATIVE 1, EPIC 1.1: Ambiente de Desenvolvimento
5. Follow specifications exactly during implementation
6. Update `src/PLAN.md` task status as you progress

**Remember**: The specifications are the source of truth. All implementation decisions have already been made and documented. Your job is to bring them to life with quality code that follows the architectural boundaries and technology stack requirements.
- **NÃO USE EMOJI** — A menos que solicitado explicitamente, não use emojis.