/**
 * Module Loader - Imports all modules via central index
 *
 * This file imports the central modules index, which triggers
 * auto-registration of all modules in the ModuleRegistry.
 *
 * SPEC Compliance:
 * - SPEC-R-LM-011: Central module loader
 * - SPEC-R-LM-012: Imported once in App.tsx
 * - SPEC-R-LM-013: Ensures all modules are registered
 * - SPEC-R-LM-001: Static import of module metadata
 * - SPEC-R-LM-002: Lazy-loading of heavy code (components/pages)
 *
 * Note: This only imports module metadata (manifests, route definitions).
 * Actual components are lazy-loaded via React.lazy() when routes are accessed.
 *
 * To add a new module:
 * - Create the module in src/modules/nome-modulo/
 * - Add the import in src/modules/index.ts
 * - The module will be automatically discovered
 */

// Import all modules from central index
import '@/modules';

/**
 * This triggers the auto-registration of all modules
 * defined in src/modules/index.ts
 *
 * Each module's index.ts file calls moduleRegistry.register()
 * when imported, making the module available for dynamic routing.
 */
