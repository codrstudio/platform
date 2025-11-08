/**
 * Kanban Module - Main Export
 *
 * Visual task organization with drag-and-drop capabilities.
 *
 * SPEC: SPEC-module-kanban.md
 */

import { kanbanManifest } from './manifest';
import { kanbanRoutes } from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { KanbanBoard } from './pages/KanbanBoard';

// Hooks
export { useKanban } from './hooks/useKanban';

// Types
export type {
  KanbanColumn,
  KanbanCard,
  KanbanInstanceConfig,
  KanbanFilter,
  CustomFieldDefinition
} from './types';

// Module Exports
export const kanbanModule: ModuleExports = {
  manifest: kanbanManifest,
  routes: kanbanRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(kanbanModule);
