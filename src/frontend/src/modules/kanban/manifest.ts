/**
 * Kanban Module Manifest
 *
 * SPEC Compliance: SPEC-KANBAN-R-*
 */

import type { ModuleManifest } from '@/types/module';

export const kanbanManifest: ModuleManifest = {
  id: 'kanban',
  moduleId: 'kanban',
  name: 'Kanban Board',
  version: '1.0.0',
  description: 'Visual task organization with drag-and-drop',
  type: 'functionality',
  category: 'productivity',
  dependencies: [],
  permissions: ['kanban:read', 'kanban:write'],
  config: {
    schema: {
      boardId: {
        type: 'string',
        required: true,
        description: 'Unique board identifier'
      },
      route: {
        type: 'string',
        required: true,
        description: 'Board route path'
      },
      title: {
        type: 'string',
        default: 'Kanban Board',
        description: 'Board title'
      },
      enableWIPLimit: {
        type: 'boolean',
        default: false,
        description: 'Enable Work In Progress limits'
      },
      enableFilters: {
        type: 'boolean',
        default: true,
        description: 'Enable card filtering'
      }
    },
    defaults: {
      boardId: '',
      route: '/kanban',
      title: 'Kanban Board',
      enableWIPLimit: false,
      enableFilters: true
    }
  }
};
