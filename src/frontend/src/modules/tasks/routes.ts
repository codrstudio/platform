/**
 * Tasks Module Routes
 *
 * SPEC Compliance:
 * - SPEC-TASKS-L-001: Página de listagem completa
 */

import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy-loaded pages for code splitting
const TaskList = lazy(() =>
  import('./pages/TaskList').then(m => ({ default: m.TaskList }))
);

/**
 * Tasks module routes
 *
 * Note: Routes are relative to the portal.
 * Portal prefix is injected automatically by PortalRouter.
 *
 * Configuration via instance config:
 * - taskRoute: Path for tasks page (default: '/tasks')
 */
export const routes: ModuleRoute[] = [
  {
    path: '/tasks',
    component: TaskList,
    isPublic: false, // Requires authentication
    meta: {
      title: 'Tarefas',
      description: 'Tarefas interativas pendentes'
    }
  }
];

export default routes;
