/**
 * Kanban Module Routes
 *
 * SPEC Compliance: SPEC-KANBAN-R-*
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

const KanbanBoard = lazy(() => import('./pages/KanbanBoard').then(m => ({ default: m.KanbanBoard })));

export const kanbanRoutes: RouteDefinition[] = [
  {
    path: '/kanban',
    component: KanbanBoard
  },
  {
    path: '/kanban/:boardId',
    component: KanbanBoard
  }
];
