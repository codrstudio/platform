# SPEC-jqel-schemas-organization.md

**Specification ID:** SPEC-JQEL-SCHEMAS
**Created:** 2025-01-12
**Status:** Active
**Related:** SPEC-data-access.md, SPEC-jqel-syntax.md, SPEC-jqel-schema.md

---

## Overview

This specification defines the **schema organization** for JQEL queries in the platform. It establishes strict rules for schema naming and usage to ensure consistency and prevent unauthorized schema creation.

**Key Principle:** The platform is designed to create applications. Therefore, schemas are divided into two categories:
1. **Platform Schemas** - Map platform resources (independent of user applications)
2. **Application Schemas** - Map application-specific resources (configured by platform users)

---

## Platform Schemas

Platform schemas map general platform resources, independent of the specific application being built.

### SPEC-JQEL-SCHEMAS-001
**Platform schemas are RESERVED and MUST NOT be created arbitrarily.**

There are exactly **FOUR (4)** platform schemas:

#### 1. `frontend` Schema
- **Purpose:** Maps client-side resources without triggering network requests
- **Processing:** Handled entirely in the frontend (localStorage, IndexedDB, etc.)
- **Examples:**
  - Command palette history
  - UI preferences
  - Client-side caches
  - Draft data (forms, editors)

#### 2. `backend` Schema
- **Purpose:** Maps resources managed by the Backend itself
- **Processing:** Handled by Express backend (file-based storage)
- **Examples:**
  - Portal configuration (`portal`, `portals`)
  - Module configuration (`module`, `modules`)
  - Instance configuration (`instance`, `instances`)
  - Realm configuration (`realm`, `realms`)
  - Login branding (`login-branding`)

#### 3. `platform` Schema
- **Purpose:** Maps resources belonging to the Platform base system
- **Processing:** Routed to Backbone (n8n)
- **Examples:**
  - Notifications
  - User profiles
  - System-wide settings
  - Cross-portal resources

#### 4. `backbone` Schema
- **Purpose:** Maps resources managed directly by the n8n Backbone
- **Processing:** Routed to Backbone (n8n)
- **Examples:**
  - Workflow executions
  - External integrations
  - Complex business logic

### SPEC-JQEL-SCHEMAS-002
**It is FORBIDDEN to create additional platform schemas.**

Developers MUST identify which platform schema is appropriate for their resource and use it accordingly.

---

## Application Schemas

Application schemas map resources specific to the applications being built by platform users.

### SPEC-JQEL-SCHEMAS-003
**Application schemas are USER-DEFINED and map to application features.**

There are **TWO (2)** types of application schemas:

#### 1. `system` Schema
- **Purpose:** Maps general application data (cross-feature)
- **Processing:** Routed to Backbone (n8n)
- **Examples:**
  - Application-wide settings
  - User data (app-specific)
  - Shared resources between features

#### 2. Custom Schemas (`{custom}`)
- **Purpose:** Maps feature-specific resources
- **Processing:** Routed to Backbone (n8n)
- **Naming:** Similar to database schema naming conventions
- **Examples:**
  - `chat` - Chat module resources
  - `forms` - Forms module resources
  - `kanban` - Kanban module resources
  - `crm` - CRM application resources
  - `inventory` - Inventory management resources

### SPEC-JQEL-SCHEMAS-004
**Custom schemas MUST follow naming conventions:**
- Lowercase only
- Alphanumeric characters and hyphens
- Start with a letter
- Descriptive of the feature/module
- Pattern: `^[a-z][a-z0-9-]*$`

### SPEC-JQEL-SCHEMAS-005
**Custom schemas MUST NOT conflict with platform schema names.**

Reserved names (cannot be used for custom schemas):
- `frontend`
- `backend`
- `platform`
- `backbone`

---

## Schema Routing Rules

### SPEC-JQEL-SCHEMAS-006
**Schema routing follows these rules:**

| Schema Type | Schema Name | Processed By | Storage |
|-------------|-------------|--------------|---------|
| Platform | `frontend` | Frontend | localStorage, IndexedDB |
| Platform | `backend` | Backend (Express) | File system (JSON) |
| Platform | `platform` | Backbone (n8n) | Application database |
| Platform | `backbone` | Backbone (n8n) | Application database |
| Application | `system` | Backbone (n8n) | Application database |
| Application | `{custom}` | Backbone (n8n) | Application database |

### SPEC-JQEL-SCHEMAS-007
**Frontend MUST validate schema names before sending queries.**

Invalid schema names MUST result in immediate error without network request.

### SPEC-JQEL-SCHEMAS-008
**Backend MUST validate schema routing and reject unknown platform schemas.**

---

## Schema Discovery

### SPEC-JQEL-SCHEMAS-009
**Schema discovery MUST use the `system` schema.**

To retrieve available schemas, entities, and actions:

```typescript
{
  "schema": "system",
  "select": "schemas"
}
```

### SPEC-JQEL-SCHEMAS-010
**Schema discovery MUST NOT use nested routes.**

The following is FORBIDDEN:
```typescript
GET /api/jqel/schemas  // ❌ FORBIDDEN
```

Must use:
```typescript
POST /api/jqel
{
  "schema": "system",
  "select": "schemas"
}
```

---

## Examples

### Platform Schema Examples

#### Frontend Schema (Client-Side Only)
```typescript
// Save command palette history
{
  "schema": "frontend",
  "mutate": "command-history",
  "action": "insert",
  "values": {
    "command": "create-portal",
    "timestamp": "2025-01-12T10:30:00Z"
  }
}
```

#### Backend Schema (Configuration)
```typescript
// Query portals
{
  "schema": "backend",
  "select": "portal",
  "where": { "portalId": { "$eq": "main" } }
}
```

#### Platform Schema (System Resources)
```typescript
// Query notifications
{
  "schema": "platform",
  "select": "notification",
  "where": { "userId": { "$eq": "user123" } }
}
```

#### Backbone Schema (n8n Direct)
```typescript
// Query workflow executions
{
  "schema": "backbone",
  "select": "execution",
  "where": { "workflowId": { "$eq": "wf-001" } }
}
```

### Application Schema Examples

#### System Schema (Application-Wide)
```typescript
// Query application settings
{
  "schema": "system",
  "select": "app-settings",
  "where": { "key": { "$eq": "theme" } }
}
```

#### Custom Schema (Feature-Specific)
```typescript
// Chat module
{
  "schema": "chat",
  "select": "message",
  "where": { "conversationId": { "$eq": "conv-123" } }
}

// Forms module
{
  "schema": "forms",
  "select": "submission",
  "where": { "formId": { "$eq": "form-001" } }
}

// Kanban module
{
  "schema": "kanban",
  "select": "card",
  "where": { "columnId": { "$eq": "col-todo" } }
}
```

---

## Migration Guide

### Existing Code Using Invalid Schemas

If you find code using schemas not defined in this specification:

1. **Identify the resource type** - Is it platform or application?
2. **Choose the correct schema** - Platform (frontend/backend/platform/backbone) or Application (system/{custom})
3. **Update all queries** - Change schema name in JQEL queries
4. **Update backend routing** - Ensure backend handles the schema correctly
5. **Test thoroughly** - Verify queries work after migration

### Common Mistakes

❌ **Creating arbitrary platform schemas:**
```typescript
{ "schema": "config", ... }  // Use "backend"
{ "schema": "settings", ... }  // Use "platform" or "system"
{ "schema": "cache", ... }  // Use "frontend"
```

✅ **Using correct platform schemas:**
```typescript
{ "schema": "backend", ... }
{ "schema": "platform", ... }
{ "schema": "frontend", ... }
```

---

## Enforcement

### SPEC-JQEL-SCHEMAS-011
**Code reviews MUST verify schema usage.**

All JQEL queries MUST be reviewed to ensure:
- Platform schemas are used correctly
- Custom schemas follow naming conventions
- No arbitrary schema creation

### SPEC-JQEL-SCHEMAS-012
**Backend MUST log warnings for unknown schemas.**

When receiving a query with an unknown schema, the backend SHOULD:
1. Log a warning with schema name and query details
2. Route to Backbone (n8n) as application schema
3. Monitor logs for accidental schema creation

---

## Summary

**Platform Schemas (4 total):**
- `frontend` - Client-side resources
- `backend` - Backend-managed configuration
- `platform` - Platform system resources
- `backbone` - Direct n8n resources

**Application Schemas:**
- `system` - Application-wide data
- `{custom}` - Feature-specific data (user-defined)

**Golden Rule:** If you need a new schema, it's probably a custom application schema, NOT a platform schema.
