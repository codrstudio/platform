// Setup module routes
// Example routes for portal routing validation

import type { RouteDefinition } from '../../types/routing';
import { lazyRoute } from '../../core/routing/lazyRoute';

// Lazy-loaded route components
// These will be code-split into separate chunks
const SetupHome = lazyRoute(() => import('./pages/SetupHome'));
const PortalManagement = lazyRoute(() => import('./pages/PortalManagement'));
const PortalCreate = lazyRoute(() => import('./pages/PortalCreate'));
const PortalEdit = lazyRoute(() => import('./pages/PortalEdit'));
const ModuleList = lazyRoute(() => import('./pages/ModuleList'));
const InstanceManager = lazyRoute(() => import('./pages/InstanceManager'));
const CreateInstance = lazyRoute(() => import('./pages/CreateInstance'));
const EditInstance = lazyRoute(() => import('./pages/EditInstance'));
const PlatformSettings = lazyRoute(() => import('./pages/PlatformSettings'));

const routes: RouteDefinition[] = [
  {
    path: '/',
    component: SetupHome,
  },
  {
    path: '/portals',
    component: PortalManagement,
  },
  {
    path: '/portals/new',
    component: PortalCreate,
  },
  {
    path: '/portals/:portalId/edit',
    component: PortalEdit,
  },
  {
    path: '/modules',
    component: ModuleList,
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances',
    component: InstanceManager,
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances/new',
    component: CreateInstance,
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances/:instanceId/edit',
    component: EditInstance,
  },
  {
    path: '/platform-settings',
    component: PlatformSettings,
  },
];

export default routes;
