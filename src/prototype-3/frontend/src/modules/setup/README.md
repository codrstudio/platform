# Setup Module

Visual configurator for managing portals, modules, and instances on the platform.

## Overview

The Setup module provides a complete UI for configuring the platform without editing JSON files directly. It allows administrators to:

- **Create and manage portals** - Isolated sub-applications with their own routes
- **Activate and configure modules** - Enable functionality within portals
- **Create module instances** - Multiple configurations of the same module
- **Configure themes** - Customize visual appearance per portal
- **View platform settings** - Monitor service health and configuration

## Module Information

- **ID**: `setup`
- **Type**: `functionality`
- **Version**: `1.0.0`
- **Dependencies**: None
- **Category**: `system`

## Installation

The Setup module comes pre-activated in the `setup` portal during platform installation.

### Initial State

```json
{
  "portalId": "setup",
  "route": "/setup",
  "removable": true,
  "modules": ["setup"]
}
```

### Access

Navigate to `/setup` to access the configurator interface.

## Routes

All routes are relative to the portal (e.g., `/setup` portal uses these as `/setup/*`):

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | SetupDashboard | Main dashboard with overview |
| `/portals` | PortalList | List all portals |
| `/portals/new` | PortalForm | Create new portal |
| `/portals/:portalId` | PortalForm | Edit portal |
| `/portals/:portalId/modules` | PortalModules | Manage portal modules |
| `/portals/:portalId/modules/:moduleId/instances` | InstanceList | List module instances |
| `/portals/:portalId/modules/:moduleId/instances/new` | InstanceForm | Create instance |
| `/portals/:portalId/modules/:moduleId/instances/:instanceId` | InstanceForm | Edit instance |
| `/portals/:portalId/theme` | ThemeConfig | Configure portal theme |
| `/platform-settings` | PlatformSettings | View platform settings |

## Features

### Portal Management

- List all portals with their configuration
- Create new portals with custom routes
- Edit existing portals (except `main`)
- Delete portals (if `removable: true`)
- Visual indication of the `main` portal (non-removable)

### Module Management

- View available modules with dependencies
- Activate modules in specific portals
- Automatic dependency activation
- Prevent deactivation if other modules depend on it
- Cascade deactivation with confirmation

### Instance Management

- Create multiple instances of the same module
- Instance-specific configuration
- Edit and delete instances
- Validation based on module schema

### Theme Configuration

- Select theme mode: light, dark, or system
- Choose brand color with color picker
- Real-time preview in both modes
- WCAG AA contrast validation
- Share theme across portals via `settings-key`

### Platform Settings

- Read-only view of `.env` configuration
- Service health indicators (n8n, Redis, Backend)
- Auto-updating health checks
- Secure display (passwords masked, secrets hidden)

## Usage Example

### Creating a Complete Application

```typescript
// 1. Create a new portal
POST /api/jqel
{
  "schema": "platform",
  "mutate": "portal",
  "action": "insert",
  "values": {
    "portalId": "app",
    "route": "/app",
    "removable": true,
    "settingsKey": "default"
  }
}

// 2. Activate auth module
POST /api/jqel
{
  "schema": "platform",
  "mutate": "module",
  "action": "activate",
  "values": {
    "portalId": "app",
    "moduleId": "auth"
  }
}

// 3. Create auth instance
POST /api/jqel
{
  "schema": "platform",
  "mutate": "instance",
  "action": "insert",
  "values": {
    "portalId": "app",
    "moduleId": "auth",
    "instanceId": "login-app",
    "config": {}
  }
}
```

## Architecture

### Data Flow

```
User Interface (React)
       ↓
JQEL Queries (TanStack Query)
       ↓
Backend (Express) - schema: "platform"
       ↓
n8n Workflows (Backbone)
       ↓
Database / File Storage
```

### State Management

- **TanStack Query** for server state (portals, modules, instances)
- **React Hook Form** + **Zod** for form validation
- **Optimistic updates** for instant UI feedback
- **Cache invalidation** after mutations

### Validation

- **Client-side**: Zod schemas with inline error messages
- **Server-side**: Backend validation before persistence
- **SPEC compliance**: All validations follow SPEC-module-setup.md

## Security

### Authentication

The Setup module routes require authentication (`requiresAuth: true`). Access is protected by the platform's authentication system.

### Authorization

Operations can be further restricted by permissions:

```typescript
// Example: Require 'admin' permission
{
  path: '/portals/new',
  component: PortalForm,
  requiresAuth: true,
  permissions: ['admin']
}
```

### Best Practices

- **Production**: Remove or restrict access to the setup portal
- **Development**: Keep setup portal active for configuration
- **Reactivation**: Edit configuration files manually if needed

## Removal in Production

The Setup module can be safely removed after configuration is complete:

1. Configuration remains in JSON files
2. Platform continues to work normally
3. Can be reactivated by editing `portals.json`:

```json
{
  "portalId": "setup",
  "route": "/setup",
  "removable": true,
  "modules": ["setup"]
}
```

4. Restart the application to apply changes

## Development

### Adding New Features

1. Define route in `routes.ts`
2. Create page component in `pages/`
3. Export from `index.ts` if needed
4. Update this README

### Testing

- Unit tests for components
- Integration tests for forms
- End-to-end tests for complete flows

### Contributing

Follow platform conventions:

- Use TypeScript for type safety
- Follow SPEC requirements
- Use shadcn/ui components
- Use Tailwind for styling
- Document SPEC references in code comments

## Specifications

This module implements:

- **SPEC-module-setup.md** - Complete Setup module specification
- **SPEC-modules.md** - General module system requirements
- **SPEC-concepts.md** - Portal, Module, Instance concepts
- **SPEC-data-access.md** - JQEL integration
- **SPEC-theming.md** - Theme configuration

## Changelog

### 1.0.0 (Initial)

- Portal management (list, create, edit, delete)
- Module activation/deactivation
- Instance management
- Theme configuration
- Platform settings viewer
- Complete SPEC compliance

## License

Part of the modular platform project.
