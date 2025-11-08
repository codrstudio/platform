/**
 * Dashboard Module Routes
 *
 * SPEC Compliance: SPEC-DASH-R-*
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

const DashboardView = lazy(() => import('./pages/DashboardView').then(m => ({ default: m.DashboardView })));

export const dashboardRoutes: RouteDefinition[] = [
  {
    path: '/dashboard',
    component: DashboardView
  },
  {
    path: '/dashboard/:dashboardId',
    component: DashboardView
  }
];
