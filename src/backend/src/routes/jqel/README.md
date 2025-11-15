# JQEL Modular Architecture

## Overview

This directory contains the modular implementation of JQEL (JSON Query Expression Language) routing system. The architecture was designed to solve the problem of a single monolithic route file growing indefinitely by separating concerns into specialized handlers and entities.

## Problem Solved

**Before**: Single `jqel.routes.ts` file with 660+ lines containing:
- Schema routing logic
- Entity CRUD operations
- Business validation rules
- n8n proxy logic
- All mixed together in one file

**After**: Modular architecture with clear separation of concerns:
- ~50 lines in main router (just routing)
- Schema handlers (backend, system, n8n)
- Entity handlers (portal, module, instance, realm, login-branding, sdl)
- Easy to extend, test, and maintain

## Architecture

```
routes/jqel/
├── index.ts                              # Main router (~50 lines) - THIN
├── README.md                             # This file
├── handlers/
│   ├── SchemaHandler.ts                  # Interface for schema handlers
│   ├── SchemaHandlerFactory.ts           # Factory pattern - creates handlers
│   ├── BackendSchemaHandler.ts           # Handles backend schema
│   ├── SystemSchemaHandler.ts            # Handles system schema (SDL local, rest n8n)
│   └── N8nSchemaHandler.ts               # Handles platform + app schemas (proxy to n8n)
└── entities/
    ├── EntityHandler.ts                  # Base class for entity CRUD
    └── backend/
        ├── PortalEntity.ts               # Portal CRUD + business rules
        ├── ModuleEntity.ts               # Module CRUD
        ├── InstanceEntity.ts             # Instance CRUD + single-instance validation
        ├── RealmEntity.ts                # Realm CRUD + events
        ├── LoginBrandingEntity.ts        # LoginBranding CRUD
        └── SdlEntity.ts                  # SDL read-only
```

## Flow

```
POST /api/jqel
  ↓
index.ts (validates basic structure)
  ↓
SchemaHandlerFactory.getHandler(schema)
  ↓
┌─────────────┬──────────────┬──────────────┐
│ Backend     │ System       │ N8n          │
│ Handler     │ Handler      │ Handler      │
└─────────────┴──────────────┴──────────────┘
       ↓              ↓              ↓
  Entity Handler   SDL Entity   n8n Proxy
  (CRUD logic)    (read-only)   (forward)
```

## Components

### 1. Main Router (`index.ts`)

**Responsibility**: Basic validation and routing delegation

- Validates query structure (schema, select/mutate)
- Delegates to appropriate schema handler via Factory
- Handles top-level error catching
- **~50 lines** - stays small forever

### 2. Schema Handlers (`handlers/`)

**Responsibility**: Schema-level routing and processing

#### SchemaHandlerFactory
- Factory pattern
- Creates and caches schema handlers
- Routes based on schema type

#### BackendSchemaHandler
- Handles `schema: "backend"`
- Routes to entity handlers (portal, module, instance, realm, login-branding, sdl)
- Validates entity exists
- File-based storage

#### SystemSchemaHandler
- Handles `schema: "system"`
- SDL queries → local processing (SdlEntity)
- Other queries → n8n proxy (N8nSchemaHandler)

#### N8nSchemaHandler
- Handles `schema: "platform"` and custom application schemas
- Proxies all queries to n8n Backbone
- Simple HTTP forwarding

### 3. Entity Handlers (`entities/`)

**Responsibility**: Entity-specific CRUD logic and business rules

#### EntityHandler (Base Class)
- Abstract base class for all entities
- Provides template for SELECT/INSERT/UPDATE/DELETE
- Routes mutate actions to specific handlers

#### Backend Entities

**PortalEntity**
- CRUD for Portal configuration
- Realm validation (SPEC-RM-VAL-001, SPEC-RM-VAL-002)
- Auto-create instances for single-instance modules (SPEC-MO-IN-015)
- Auto-remove instances when deactivating modules (SPEC-C-I-022)
- Config-changed events

**ModuleEntity**
- CRUD for Module configuration
- Simple file-based storage

**InstanceEntity**
- CRUD for Instance configuration
- Single-instance validation (SPEC-MO-IN-017, SPEC-MO-IN-018)
- Prevents duplicate instances in single-instance modules
- Prevents deletion of default instances

**RealmEntity**
- CRUD for Realm configuration
- Config-changed events

**LoginBrandingEntity**
- CRUD for LoginBranding (realm-scoped)
- Validates realmId presence

**SdlEntity**
- READ-ONLY schema discovery
- Mutations return 400 error

## How to Extend

### Adding a New Entity to Backend Schema

1. **Create entity handler** in `entities/backend/`:

```typescript
// entities/backend/NewEntity.ts
import { EntityHandler } from '../EntityHandler.js'
import type { JQELSelectQuery, JQELMutateQuery, JResult } from '../../../../types/jqel.types.js'

export class NewEntity extends EntityHandler {
  protected entityName = 'new-entity'

  async handleSelect(query: JQELSelectQuery): Promise<JResult> {
    // Implement SELECT logic
  }

  async handleInsert(query: JQELMutateQuery): Promise<JResult> {
    // Implement INSERT logic
  }

  async handleUpdate(query: JQELMutateQuery): Promise<JResult> {
    // Implement UPDATE logic
  }

  async handleDelete(query: JQELMutateQuery): Promise<JResult> {
    // Implement DELETE logic
  }
}
```

2. **Register in BackendSchemaHandler**:

```typescript
// handlers/BackendSchemaHandler.ts
import { NewEntity } from '../entities/backend/NewEntity.js'

constructor() {
  this.entities = new Map([
    // ... existing entities
    ['new-entity', new NewEntity()],
  ])
}
```

**Done!** No changes to index.ts required.

### Adding a New Schema Type

1. **Create schema handler** in `handlers/`:

```typescript
// handlers/CustomSchemaHandler.ts
import type { SchemaHandler } from './SchemaHandler.js'
import type { JQELQuery } from '../../../types/jqel.types.js'

export class CustomSchemaHandler implements SchemaHandler {
  async execute(query: JQELQuery, res: Response): Promise<void> {
    // Implement schema-specific logic
  }
}
```

2. **Register in SchemaHandlerFactory**:

```typescript
// handlers/SchemaHandlerFactory.ts
import { CustomSchemaHandler } from './CustomSchemaHandler.js'

static getHandler(schema: string): SchemaHandler {
  switch (schema) {
    // ... existing cases
    case 'custom':
      handler = new CustomSchemaHandler()
      break
  }
}
```

**Done!** No changes to index.ts required.

## Benefits

### 1. Separation of Concerns
- Router only routes
- Schema handlers handle schema-level logic
- Entity handlers handle entity-specific logic
- Each component has a single, clear responsibility

### 2. Scalability
- Add new entities without touching router
- Add new schemas without touching existing code
- Each entity is isolated and independent

### 3. Testability
- Test each entity handler in isolation
- Mock dependencies easily
- Clear interfaces for testing

### 4. Maintainability
- Find code easily (entity logic in entity file)
- Changes are localized (modify only affected entity)
- No 1000+ line files

### 5. Consistency
- All entities follow same pattern (EntityHandler base)
- All schemas follow same pattern (SchemaHandler interface)
- Predictable structure for new developers

## Rules & Constraints

### CRITICAL RULES

1. **NEVER add routes to `index.ts`**
   - JQEL is a query language, not a REST API
   - All queries go through POST `/api/jqel`
   - See comment at top of `index.ts`

2. **NEVER put business logic in `index.ts`**
   - Index only validates and delegates
   - Business logic belongs in entity handlers

3. **ALWAYS extend EntityHandler for new entities**
   - Provides consistent CRUD pattern
   - Enforces interface contract
   - Makes testing easier

4. **ALWAYS implement SchemaHandler for new schemas**
   - Enforces interface contract
   - Ensures compatibility with Factory

5. **NEVER bypass the Factory pattern**
   - Always use `SchemaHandlerFactory.getHandler()`
   - Don't instantiate handlers directly in router
   - Factory handles caching and lifecycle

### Best Practices

1. **Entity Validation**
   - Validate in entity handler, not schema handler
   - Return proper JResult with error codes
   - Use descriptive error messages

2. **Error Handling**
   - Try/catch in schema handlers
   - Return 400 for validation errors
   - Return 500 for unexpected errors
   - Log errors before returning

3. **Events**
   - Emit config-changed events after mutations
   - Use `emitConfigChanged()` utility
   - Include entity type, ID, action, and data

4. **Business Rules**
   - Implement in entity handlers, not schema handlers
   - Document SPEC references in comments
   - Examples: realm validation, single-instance rules

5. **Performance**
   - Schema handlers are cached by Factory
   - Entity handlers are reused within schema handler
   - No need to recreate instances per request

## Migration from Old Code

The original `jqel.routes.ts` (660 lines) has been replaced with this modular structure:

**Old Structure**:
```
jqel.routes.ts (660 lines)
  ├── handleBackendSchema()
  ├── handleN8nSchema()
  ├── handleSelect()
  ├── handleMutate()
  ├── handleInsert()
  ├── handleUpdate()
  └── handleDelete()
      └── switch (entity) { ... } // 6 entities × 4 operations
```

**New Structure**:
```
jqel/
  ├── index.ts (50 lines)
  ├── handlers/ (4 files, ~150 lines total)
  └── entities/ (6 files, ~400 lines total)
```

**Total**: ~600 lines, but organized into 11 focused files instead of 1 monolithic file.

## Specifications

This implementation follows these specifications:

- **SPEC-DA-W-005**: All JQEL queries through single endpoint
- **SPEC-JQEL-SCH-004**: Schema-based routing
- **SPEC-JQEL-SCH-005**: Backend schema processed by Backend
- **SPEC-JQEL-SCH-006**: Platform/app schemas forwarded to n8n
- **SPEC-RM-VAL-001**: Realm validation on portal creation
- **SPEC-RM-VAL-002**: Realm validation on portal update
- **SPEC-MO-IN-015**: Auto-create instances for single-instance modules
- **SPEC-MO-IN-017**: Prevent deletion of default instances
- **SPEC-MO-IN-018**: Prevent duplicate instances in single-instance modules
- **SPEC-C-I-016**: Auto-create default instances
- **SPEC-C-I-022**: Auto-remove instances when deactivating modules

## Future Improvements

1. **Authorization**
   - Add permission checks in schema handlers
   - Validate user can access schema/entity
   - Check CRUD permissions per entity

2. **Caching**
   - Add Redis caching in entity handlers
   - Cache GET queries with TTL
   - Invalidate on mutations

3. **Query Optimization**
   - Add indexes for common queries
   - Implement query planning
   - Add query performance metrics

4. **Validation Layer**
   - Extract validation to separate middleware
   - Use JSON Schema for query validation
   - Centralized validation rules

5. **Audit Log**
   - Log all mutations with user context
   - Track changes history
   - Implement undo/redo

## Summary

This modular architecture solves the scalability problem of JQEL routing by:

1. **Separating concerns**: Router, Schema Handlers, Entity Handlers
2. **Using design patterns**: Factory, Strategy, Template Method
3. **Maintaining consistency**: Interfaces enforce contracts
4. **Enabling growth**: Add entities/schemas without touching core code
5. **Improving maintainability**: Small, focused files with clear responsibilities

The main router (`index.ts`) will **never grow** beyond ~50 lines, while the system can support unlimited entities and schemas through the modular handler system.
