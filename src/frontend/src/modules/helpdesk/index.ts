/**
 * Helpdesk Module - Main Export
 *
 * SPEC Compliance:
 * - spec/modules/sac-module/SPEC-sac-helpdesk.md
 */

import { helpdeskManifest } from './manifest';
import { helpdeskRoutes } from './routes';
import type { ModuleExports } from '@/types/module';

// Module Exports
export const helpdeskModule: ModuleExports = {
  manifest: helpdeskManifest,
  routes: helpdeskRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(helpdeskModule);
