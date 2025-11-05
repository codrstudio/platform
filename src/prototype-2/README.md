# Prototype 2 - Modular Platform Implementation

This is **Prototype 2** of the platform project - an independent implementation experiment testing a specific architectural approach. This prototype is completely isolated from other prototypes.

## Overview

Prototype 2 implements a three-layer modular platform:

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Express + Node.js + TypeScript
- **Backbone**: Integration with n8n workflows (already implemented)

## Architecture

### Three-Layer System

```
Frontend (React 19 + Vite)
    ↓ HTTP/SSE
Backend (Express + Node.js)
    ↓ HTTP
Backbone (n8n workflows)
```

**Key Principles:**
- Frontend and Backend are completely independent applications
- Each layer has its own package.json and tsconfig.json
- Communication only via HTTP and Server-Sent Events (SSE)
- Shared types via `shared/` directory using TypeScript project references

### Core Concepts

1. **Portal** - Isolated sub-application
   - Main portal: `/`
   - Other portals: `/:portalId/*`
   - Each portal activates specific modules

2. **Module** - Reusable, lazy-loaded functionality
   - Two types: Components (libraries) and Functionality (complete features)
   - Declared dependencies on other modules
   - Self-contained with components, hooks, types, utils

3. **Instance** - Specific configuration of a module in a portal
   - One module can have multiple instances
   - Portal-scoped configuration

## Project Structure

```
src/prototype-2/
├── frontend/              # React 19 + Vite application
│   ├── public/           # Static assets (PWA manifest, service worker)
│   ├── src/
│   │   ├── core/         # Platform core (routing, modules, portals)
│   │   ├── modules/      # Lazy-loaded feature modules
│   │   ├── components/   # Shared UI components (shadcn/ui)
│   │   ├── providers/    # React Context providers
│   │   ├── hooks/        # Shared custom hooks
│   │   ├── services/     # API clients (JQEL, Auth, SSE)
│   │   ├── types/        # Frontend-specific types
│   │   └── styles/       # Global styles (Tailwind CSS)
│   └── index.html        # Vite entry point
│
├── backend/              # Express + Node.js application
│   └── src/
│       ├── routes/       # API routes (auth, jqel, events)
│       ├── middleware/   # Express middleware
│       ├── services/     # Business logic (JQEL processor, n8n proxy, Redis, SSE)
│       ├── config/       # JSON configuration storage (portals, modules, instances)
│       ├── types/        # Backend-specific types
│       └── utils/        # Helper functions
│
├── shared/               # Shared types and utilities
│   ├── types/           # Shared TypeScript definitions
│   ├── constants/       # Shared constants
│   └── utils/           # Pure utility functions
│
├── planning/            # Individual task implementation plans
├── PLAN.md             # Master task-driven implementation plan
└── README.md           # This file
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **TanStack Query** - Async state management (wraps JQEL)
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library (ONLY UI library allowed)
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icon system

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type safety
- **Redis** - Pub/Sub, Streams, cache
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin configuration

### Backbone (Already Built)
- **n8n** - Workflow automation (workflows in `../../workflows/`)
- 8 active workflows for authentication, chat, database access

## Data Access - JQEL

All data queries use **JQEL** (JSON Query Expression Language):

```typescript
// Example JQEL query
{
  "schema": "platform",
  "select": "users",
  "where": { "id": { "$eq": 123 } },
  "output": ["id", "name", "email"]
}
```

**Schema Routing:**
- `backend` - Processed by Express (portal/module/instance config)
- `platform` - Proxied to n8n Backbone
- `system` - Configurable processing
- Others - Application-specific, proxied to n8n

**Access Pattern:**
```typescript
// Frontend uses TanStack Query hooks
const { data } = useJQEL({
  schema: "backend",
  select: "portal",
  where: { portalId: { $eq: "main" } }
});
```

## Getting Started

> Note: Setup instructions will be completed in subsequent tasks (1.1.2, 1.1.3, 1.1.4)

### Prerequisites

- Node.js 18+
- Redis server running
- n8n instance accessible (for Backbone integration)

### Installation

```bash
# Frontend setup (will be detailed in task 1.1.3)
cd frontend
npm install

# Backend setup (will be detailed in task 1.1.4)
cd ../backend
npm install

# Shared types (optional, auto-referenced)
cd ../shared
npm install
```

### Development

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Environment Configuration

Copy `.env.example` to `.env` in both frontend and backend directories and configure:

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
N8N_WEBHOOK_BASE_URL=http://localhost:5678
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

## Development Approach

This prototype follows a **task-driven implementation plan** defined in `PLAN.md`:

1. **Foundation** (Systems 1.1-1.10) - Base infrastructure setup
2. **Authentication** (System 2.x) - JWT-based auth with n8n
3. **Core Systems** (3.x-6.x) - Portal routing, module system, JQEL, SSE, theming
4. **UI Framework** (7.x) - shadcn/ui integration
5. **Modules** (8.x) - Setup module and components

Each task has a detailed implementation plan in `planning/` directory.

## Key Features

### Progressive Web App (PWA)
- Installable on mobile and desktop
- Offline support with service worker
- App manifest with icons
- Performance: < 1s load on 3G

### Real-Time Events
- Server-Sent Events (SSE) for push updates
- Redis Pub/Sub backend
- Auto-invalidation of TanStack Query cache

### Modular Architecture
- Lazy-loaded modules (code splitting)
- Dependency management
- Portal-based isolation
- Dynamic module activation

### Theming
- Light/dark mode support
- Customizable brand colors per portal
- WCAG AA contrast validation
- CSS custom properties

## Current Status

**Task 1.1.1: Criar estrutura de pastas** - ✓ COMPLETED

This task established the complete project structure. All directories and placeholder files are in place. Next tasks will configure TypeScript, Vite, Express, and implement core systems.

## Important Notes

### Prototype Independence
- This prototype is 100% independent from other prototypes
- Do NOT reference code from prototype-1, prototype-3, or others
- Only reference shared specifications in `../../spec/` directory
- Each prototype tests different architectural approaches

### Specifications
All implementation follows formal specifications in `../../spec/`:
- `SPEC-architecture.md` - System architecture requirements
- `SPEC-concepts.md` - Portal, Module, Instance definitions
- `SPEC-routing.md` - Routing rules and priorities
- `SPEC-authentication.md` - JWT auth contracts
- `SPEC-data-access.md` - JQEL integration
- And 30+ other specification files

### Architecture Boundaries
- Frontend NEVER imports from Backend
- Backend NEVER imports from Frontend
- Shared code is the ONLY cross-boundary import
- Communication ONLY via HTTP/SSE

## References

- **Platform Specifications**: `../../spec/SPEC-*.md`
- **Technology Stack**: `../../STACK.md`
- **Platform Philosophy**: `../../MANIFESTO.md`
- **n8n Workflows**: `../../workflows/`
- **Development Methodology**: `../../metodologia/`

## Next Steps

Continue with task-driven implementation as defined in `PLAN.md`:

1. **1.1.2** - Configure TypeScript for all layers
2. **1.1.3** - Configure Vite for frontend (React, Tailwind, PWA)
3. **1.1.4** - Configure Express for backend (middleware, CORS, error handling)
4. And continue through the implementation plan...

---

**Note**: This is an active development prototype. Structure is complete, implementation is in progress following the task plan.
