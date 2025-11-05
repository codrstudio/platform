// Setup module routes
// Example routes for portal routing validation

import type { RouteDefinition } from '../../types/routing';
import { lazyRoute } from '../../core/routing/lazyRoute';

// Lazy-loaded route components
// These will be code-split into separate chunks
const SetupHome = lazyRoute(() => import('./pages/SetupHome'));
const PortalManagement = lazyRoute(() => import('./pages/PortalManagement'));

const routes: RouteDefinition[] = [
  {
    path: '/',
    component: SetupHome,
  },
  {
    path: '/portals',
    component: PortalManagement,
  },
];

export default routes;
