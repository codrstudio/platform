/**
 * Dashboard Module Manifest
 *
 * SPEC Compliance: SPEC-DASH-R-*
 */

import type { ModuleManifest } from '@/types/module';

export const dashboardManifest: ModuleManifest = {
  id: 'dashboard',
  moduleId: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',
  description: 'Customizable dashboards with data visualization widgets',
  type: 'functionality',
  category: 'productivity',
  dependencies: [],
  permissions: ['dashboard:read', 'dashboard:write'],
  config: {
    schema: {
      instanceId: {
        type: 'string',
        required: true,
        description: 'Unique dashboard instance identifier'
      },
      title: {
        type: 'string',
        required: true,
        description: 'Dashboard title'
      },
      route: {
        type: 'string',
        required: true,
        description: 'Dashboard route path'
      },
      description: {
        type: 'string',
        required: false,
        description: 'Dashboard description'
      },
      refreshInterval: {
        type: 'number',
        default: 0,
        description: 'Auto-refresh interval in milliseconds (0 = disabled)'
      },
      gridColumns: {
        type: 'number',
        default: 12,
        description: 'Number of grid columns'
      },
      editable: {
        type: 'boolean',
        default: false,
        description: 'Allow editing via UI'
      },
      requiresAuth: {
        type: 'boolean',
        default: true,
        description: 'Require authentication'
      },
      requiredPermission: {
        type: 'string',
        required: false,
        description: 'Required permission to view'
      },
      theme: {
        type: 'string',
        default: 'default',
        description: 'Dashboard theme (default or compact)'
      },
      fullscreen: {
        type: 'boolean',
        default: false,
        description: 'Enable fullscreen mode'
      }
    },
    defaults: {
      instanceId: '',
      title: 'Dashboard',
      route: '/dashboard',
      refreshInterval: 0,
      gridColumns: 12,
      editable: false,
      requiresAuth: true,
      theme: 'default',
      fullscreen: false,
      widgets: []
    }
  }
};
