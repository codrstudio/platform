/**
 * Setup Module Routes
 *
 * This file defines all routes for the Setup module.
 * Routes are relative to the portal (no portal prefix).
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-RO-*)
 * - SPEC-modules.md (SPEC-MO-RO-*)
 */

import { lazy } from 'react';
import type { ModuleRoute } from '../../types/module';

/**
 * Lazy-loaded page components
 * SPEC-MO-PE-006: Routes should use lazy loading
 */
const SetupDashboard = lazy(() => import('./pages/SetupDashboard'));
const PortalList = lazy(() => import('./pages/PortalList'));
const PortalForm = lazy(() => import('./pages/PortalForm'));
const PortalModules = lazy(() => import('./pages/PortalModules'));
const InstanceList = lazy(() => import('./pages/InstanceList'));
const InstanceForm = lazy(() => import('./pages/InstanceForm'));
const ThemeConfig = lazy(() => import('./pages/ThemeConfig'));
const PlatformSettings = lazy(() => import('./pages/PlatformSettings'));

/**
 * Setup module routes
 * SPEC-MS-RO-001: Module Setup must export routes
 * SPEC-MS-RO-003: Route structure definition
 * SPEC-MO-RO-010: Paths are relative (no portal prefix)
 */
export const routes: ModuleRoute[] = [
  {
    /** SPEC-MS-RO-002: Main route (relative to portal) */
    path: '/',
    component: SetupDashboard,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Portals list */
    path: '/portals',
    component: PortalList,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Create new portal */
    path: '/portals/new',
    component: PortalForm,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Edit existing portal */
    path: '/portals/:portalId',
    component: PortalForm,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Manage modules for a portal */
    path: '/portals/:portalId/modules',
    component: PortalModules,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: List instances for a module */
    path: '/portals/:portalId/modules/:moduleId/instances',
    component: InstanceList,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Create new instance */
    path: '/portals/:portalId/modules/:moduleId/instances/new',
    component: InstanceForm,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Edit existing instance */
    path: '/portals/:portalId/modules/:moduleId/instances/:instanceId',
    component: InstanceForm,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: Configure portal theme */
    path: '/portals/:portalId/theme',
    component: ThemeConfig,
    requiresAuth: true,
  },
  {
    /** SPEC-MS-RO-003: View platform settings (read-only) */
    path: '/platform-settings',
    component: PlatformSettings,
    requiresAuth: true,
  },
];
