# Platform - Modular Web Application Platform

A modular platform for building reusable, scalable web applications with isolated sub-applications (Portals), activatable features (Modules), and configurable instances.

## Architecture

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React 19 + Vite)                 │
│  - UI rendering, routing, state management  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKEND (Express + Node.js)                │
│  - Proxy, validation, authentication        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  BACKBONE (n8n - Already Implemented)       │
│  - Business logic, workflows, data          │
└─────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- React 19
- Vite 6
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui
- React Router 6
- TanStack Query 5
- React Hook Form 7
- Zod 3
- Lucide React

### Backend
- Node.js 18+
- Express 5
- TypeScript 5
- Redis (ioredis)
- Winston (logging)

### Backbone
- n8n (workflows in `workflows/`)

## Project Structure

```
platform/
├── src/
│   ├── frontend/           # React + Vite application
│   └── backend/            # Express API server
├── workflows/              # n8n workflows (Backbone)
├── spec/                   # Formal specifications (30+ files)
├── docs/                   # Additional documentation
├── PLAN.md                 # 14-phase implementation plan
└── CLAUDE.md               # Project instructions for Claude Code
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Redis server running (for production features)
- n8n instance running (for backend integration)

### Installation

1. **Frontend Setup**:
```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will be available at: http://localhost:5173

2. **Backend Setup**:
```bash
cd src/backend
npm install
cp .env.example .env
npm run dev
```

Backend will be available at: http://localhost:3000

### Development

**Frontend**:
```bash
cd src/frontend
npm run dev          # Start dev server
npm run build        # Build for production
```

**Backend**:
```bash
cd src/backend
npm run dev          # Start with hot-reload
npm run build        # Compile TypeScript
npm start            # Run compiled code
```

## Core Concepts

- **Portal**: Isolated sub-application within the platform
- **Module**: Reusable, encapsulated functionality
- **Instance**: Specific configuration of a module in a portal

## Environment Variables

See `.env.example` files in:
- `src/frontend/.env.example` - Frontend configuration
- `src/backend/.env.example` - Backend configuration

## Documentation

- `CLAUDE.md` - Complete project instructions
- `PLAN.md` - 14-phase implementation plan (450+ tasks)
- `spec/` - 30+ formal specification files
- `DESIGN.md` - Strict design rules
- `MANIFESTO.md` - Platform philosophy

## Current Status

**Wave 1: Project Base** - ✅ COMPLETED

- Frontend structure created (React 19 + Vite)
- Backend structure created (Express + Node.js)
- Tailwind CSS configured
- shadcn/ui configured
- Development servers working

**Next Steps**: Wave 2 - Authentication System

## License

ISC
