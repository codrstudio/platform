/**
 * Tasks Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-TASKS-B-001 to B-006: Badge de tarefas pendentes
 * - SPEC-TASKS-P-001 to P-007: Preview dropdown
 * - SPEC-TASKS-L-001 to L-004: Página de listagem
 * - SPEC-TASKS-E-001 to E-005: Integração SSE
 */

import { tasksManifest } from './manifest';
import routes from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { TaskList } from './pages/TaskList';

// Hooks
export { useTasks } from './hooks/useTasks';

// Types
export type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  TaskAction,
  TaskFilters,
  TaskResponse,
  TaskModuleConfig,
  TaskCategoryRendererProps
} from './types';

// Module Exports
export const tasksModule: ModuleExports = {
  manifest: tasksManifest,
  routes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(tasksModule);
