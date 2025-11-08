/**
 * Forms Module Routes
 *
 * SPEC Compliance: SPEC-FORMS-R-*
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

const FormView = lazy(() => import('./pages/FormView').then(m => ({ default: m.FormView })));

export const formsRoutes: RouteDefinition[] = [
  {
    path: '/form',
    component: FormView
  },
  {
    path: '/form/:formId',
    component: FormView
  }
];
