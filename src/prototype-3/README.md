# Prototype 3 - Codr Platform

Prototype 3 implements the full platform specification following a value-driven, user-centric approach.

## Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router** - Routing (to be implemented)
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack Query** - Data fetching and caching
- **React Hook Form + Zod** - Form handling
- **Lucide React** - Icons
- **PWA** - Progressive Web App support

### Backend
- **Node.js + Express** - HTTP server
- **TypeScript** - Type safety
- **Redis** - Pub/Sub, Streams, Cache
- **BullMQ** - Queue system
- **JWT** - Authentication

### Infrastructure
- **n8n** - Backbone (workflows and business logic)
- **Redis** - Message broker and cache
- **BullMQ** - Async job processing

## Project Structure

```
prototype-3/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── core/         # Core platform systems
│   │   ├── modules/      # Feature modules
│   │   ├── components/   # Shared components
│   │   ├── services/     # API clients
│   │   ├── hooks/        # Reusable hooks
│   │   ├── providers/    # Context providers
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── backend/              # Express backend
│   └── src/
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       ├── middleware/   # Express middleware
│       ├── workers/      # BullMQ workers
│       ├── queues/       # Queue definitions
│       ├── types/        # TypeScript types
│       └── config/       # Configuration files
└── PLAN.md              # Implementation plan

```

## Quick Start

### Prerequisites
- Node.js 20+
- Redis server running
- n8n instance (for full functionality)

### Installation

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
# IMPORTANT: Set JWT_SECRET to a secure value (min 32 chars)
npm run dev
```

### Development

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Type check without building
```

**Backend** (http://localhost:3000):
```bash
cd backend
npm run dev          # Start with hot-reload
npm run build        # Compile TypeScript
npm start            # Run compiled code
npm run type-check   # Type check without building
npm run worker       # Start BullMQ workers
```

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# n8n Backbone
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
N8N_API_KEY=optional-api-key

# BullMQ
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3

# Logging
LOG_LEVEL=debug
```

## Implementation Progress

See [PLAN.md](./PLAN.md) for detailed implementation progress.

### Current Status
- ✅ Story 1.1: Setup do projeto base
- ⏳ Story 1.2: PWA funcional
- ⏳ Epic 1.2: Sistema de Autenticação
- ⏳ Epic 1.3: Navegação e Roteamento
- ... (see PLAN.md for complete list)

## Key Concepts

### Portal
A portal is an isolated sub-application within the platform with its own routes, modules, and configuration.

- **portalId**: Unique identifier
- **main** portal uses `/` route
- Other portals use `/:portalId/*` routes
- Completely isolated from each other

### Module
A module is an encapsulated, reusable functionality that can be activated in one or more portals.

- Lazy-loaded on demand
- Can declare dependencies on other modules
- Types: "Componentes" (libraries) or "Funcionalidade" (complete experiences)

### Instance
An instance is a specific configuration of an activated module in a portal.

- Multiple instances of same module allowed
- Portal-scoped (different portals can have instances with same ID)
- Independent configuration per instance

## Architecture

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

## Specifications

All implementation follows formal specifications in `/spec/*.md`:

- **SPEC-concepts.md** - Portal, Module, Instance definitions
- **SPEC-architecture.md** - Stack requirements, PWA, responsive design
- **SPEC-routing.md** - Routing rules and priorities
- **SPEC-authentication.md** - JWT auth, sessions, permissions
- **SPEC-data-access.md** - JQEL query language integration
- **SPEC-events.md** - Real-time events with SSE
- **SPEC-theming.md** - Light/dark themes, brand colors
- **SPEC-modules.md** - Module system specification
- ... and 20+ more specifications

## License

Private project - All rights reserved
