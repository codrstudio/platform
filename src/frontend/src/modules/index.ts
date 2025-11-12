/**
 * Modules Index - Central module registry
 *
 * This file imports all available modules to trigger their
 * auto-registration in the ModuleRegistry.
 *
 * Each module's index.ts calls moduleRegistry.register() when imported,
 * making the module available for dynamic routing.
 *
 * SPEC Compliance:
 * - SPEC-R-LM-007: All modules registered in ModuleRegistry
 * - SPEC-R-LM-008: Auto-registration via module index.ts
 * - SPEC-R-LM-010: Only loads lightweight metadata
 * - SPEC-R-LM-014: New modules must be added here
 *
 * When adding a new module:
 * 1. Create the module in src/modules/nome-modulo/
 * 2. Ensure the module exports a ModuleExports object
 * 3. Add the import below (in alphabetical order)
 * 4. The module will be automatically discovered and available
*/

// Core Modules
import './setup';
import './auth';

// Component Modules
// import './app-components';
// import './export-components';
// import './media-components';

// Functionality Modules (alphabetical order)
// import './chat';
import './chatify';
// import './command-palette';
// import './dashboard';
// import './forms';
// import './homepage';
// import './journey';
// import './kanban';
// import './loading';
// import './markbrowser';
// import './notifications';
// import './sidebar';
// import './tasks';

/**
 * Note: This file only imports module metadata (manifests, route definitions).
 * Actual components are lazy-loaded via React.lazy() when routes are accessed.
 *
 * Impact: ~5-10KB total for all module metadata
 * Heavy code (components, pages) is loaded on demand when routes are accessed.
 */
