// Setup Module Manifest
// Based on SPEC-module-setup.md
//
// SPEC Compliance:
// - SPEC-MS-MA-001: Manifesto do módulo Setup
// - SPEC-MS-IN-005: Instância DEVE ter instanceId="default" (módulo setup é single-instance)
// - SPEC-MS-FU-017 a FU-019: Validações para single-instance

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

  // SPEC-MS-MA-001: Setup é single-instance (apenas UMA instância por portal)
  singleInstance: true,
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
    },
    {
      path: '/components-demo',
    }
  ],
  widgets: [],
  components: [],
  permissions: []
};
