// Setup Module Entry Point
// Based on SPEC-module-setup.md

import type { ModuleExports } from '@/types/module';
import { setupManifest } from './manifest';
import { setupRoutes } from './routes';

// Exports for backward compatibility
export { setupManifest } from './manifest';
export { setupRoutes, renderSetupRoutes } from './routes';

// Module Exports
export const setupModule: ModuleExports = {
  manifest: setupManifest,
  routes: setupRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';
moduleRegistry.register(setupModule);
