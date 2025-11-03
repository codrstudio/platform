/**
 * Setup Module
 * Platform configuration and module management
 * SPEC-MS-* compliance
 */

import type { ModuleManifest } from '@/core/modules/types';
import { SetupHome } from './pages/SetupHome';
import { PortalManager } from './pages/PortalManager';
import { ModuleManager } from './pages/ModuleManager';

/**
 * Setup Module Manifest
 */
const setupModule: ModuleManifest = {
  moduleId: 'setup',
  name: 'Setup & Configuration',
  type: 'functionality',
  version: '1.0.0',
  dependencies: [],
  exports: {
    routes: [
      {
        path: '/',
        element: SetupHome,
        requiresAuth: false,
        metadata: {
          title: 'Setup Home',
          description: 'Overview of platform configuration',
        },
      },
      {
        path: '/portals',
        element: PortalManager,
        requiresAuth: false,
        metadata: {
          title: 'Portal Management',
          description: 'Manage platform portals',
        },
      },
      {
        path: '/modules',
        element: ModuleManager,
        requiresAuth: false,
        metadata: {
          title: 'Module Management',
          description: 'Manage platform modules',
        },
      },
    ],
  },
  metadata: {
    description: 'Platform configuration and module management interface',
    icon: 'settings',
    category: 'system',
  },
};

export default setupModule;
