// Setup module routes
// Example routes for portal routing validation

import type { RouteDefinition } from '../../types/routing';
import { SetupHome, PortalManagement } from './components/SetupComponents';

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
