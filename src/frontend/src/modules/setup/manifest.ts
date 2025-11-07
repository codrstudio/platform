// Setup Module Manifest
// Based on SPEC-module-setup.md

import type { ModuleManifest } from '@/types/module';

export const setupManifest: ModuleManifest = {
  id: 'setup',
  moduleId: 'setup',
  version: '1.0.0',
  name: 'Setup',
  description: 'Módulo de configuração visual da plataforma',
  type: 'functionality',
  category: 'system',
  dependencies: [],
  routes: [
    {
      path: '/',
      index: true
    },
    {
      path: '/portals',
    },
    {
      path: '/portals/new',
    },
    {
      path: '/portals/:portalId',
    },
    {
      path: '/portals/:portalId/theme',
    },
    {
      path: '/portals/:portalId/modules',
    },
    {
      path: '/portals/:portalId/modules/:moduleId/instances',
    },
    {
      path: '/platform-settings',
    }
  ],
  widgets: [],
  components: [],
  permissions: []
};
