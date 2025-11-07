/**
 * Sidebar Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-R-*: Module responsibilities
 * - SPEC-SIDEBAR-E-*: Component exports
 */

import { sidebarManifest } from './manifest';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Types
export type {
  SidebarLayout,
  SidebarVariant,
  BadgeVariant,
  MenuBadge,
  MenuItem,
  UserAction,
  UserMenuConfig,
  SidebarConfig
} from './types';

// Module Exports
export const sidebarModule: ModuleExports = {
  manifest: sidebarManifest
  // Note: Sidebar does not provide routes - it's a layout component
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(sidebarModule);
