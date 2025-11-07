/**
 * Notifications Module - Routes
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-C-001: Rota de listagem configurada
 */

import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy-loaded pages for code splitting
const NotificationList = lazy(() =>
  import('./pages/NotificationList').then(m => ({ default: m.NotificationList }))
);

/**
 * Notifications module routes
 *
 * Note: Routes are relative to the portal.
 * Portal prefix is injected automatically by PortalRouter.
 *
 * Configuration via instance config:
 * - listRoute: Path for notifications list page (default: '/notifications')
 */
export const routes: ModuleRoute[] = [
  {
    path: '/notifications',
    component: NotificationList,
    isPublic: false, // Requires authentication
    meta: {
      title: 'Notificações',
      description: 'Centro de notificações'
    }
  }
];

export default routes;
