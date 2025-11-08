// Setup Module Routes
// Based on SPEC-module-setup.md

import { lazy } from 'react';
import { Route } from 'react-router-dom';
import type { ModuleRoute } from '@/types/module';

// Lazy load pages
const SetupDashboard = lazy(() => import('./pages/SetupDashboard').then(m => ({ default: m.SetupDashboard })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const PlatformSettings = lazy(() => import('./pages/PlatformSettings').then(m => ({ default: m.PlatformSettings })));
const RealmList = lazy(() => import('./pages/RealmList').then(m => ({ default: m.RealmList })));
const RealmForm = lazy(() => import('./pages/RealmForm').then(m => ({ default: m.RealmForm })));
const PortalList = lazy(() => import('./pages/PortalList').then(m => ({ default: m.PortalList })));
const PortalForm = lazy(() => import('./pages/PortalForm').then(m => ({ default: m.PortalForm })));
const PortalModules = lazy(() => import('./pages/PortalModules').then(m => ({ default: m.PortalModules })));
const ThemeConfig = lazy(() => import('./pages/ThemeConfig').then(m => ({ default: m.ThemeConfig })));
const InstanceList = lazy(() => import('./pages/InstanceList').then(m => ({ default: m.InstanceList })));
const InstanceForm = lazy(() => import('./pages/InstanceForm').then(m => ({ default: m.InstanceForm })));
const ComponentsDemo = lazy(() => import('./pages/ComponentsDemo').then(m => ({ default: m.ComponentsDemo })));

export const setupRoutes: ModuleRoute[] = [
  {
    path: '/',
    component: SetupDashboard,
    index: true
  },
  {
    path: '/about',
    component: AboutPage
  },
  {
    path: '/platform-settings',
    component: PlatformSettings
  },
  {
    path: '/realms',
    component: RealmList
  },
  {
    path: '/realms/new',
    component: RealmForm
  },
  {
    path: '/realms/:realmId',
    component: RealmForm
  },
  {
    path: '/portals',
    component: PortalList
  },
  {
    path: '/portals/new',
    component: PortalForm
  },
  {
    path: '/portals/:portalId',
    component: PortalForm
  },
  {
    path: '/portals/:portalId/theme',
    component: ThemeConfig
  },
  {
    path: '/portals/:portalId/modules',
    component: PortalModules
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances',
    component: InstanceList
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances/new',
    component: InstanceForm
  },
  {
    path: '/portals/:portalId/modules/:moduleId/instances/:instanceId',
    component: InstanceForm
  },
  {
    path: '/components-demo',
    component: ComponentsDemo
  }
];

// Export as React Router elements for rendering
export function renderSetupRoutes() {
  return setupRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={<route.component />}
      index={route.index}
    />
  ));
}
