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
const RealmEdit = lazy(() => import('./pages/RealmEdit').then(m => ({ default: m.RealmEdit })));
const PortalList = lazy(() => import('./pages/PortalList').then(m => ({ default: m.PortalList })));
const PortalCreate = lazy(() => import('./pages/PortalCreate').then(m => ({ default: m.PortalCreate })));
const PortalEdit = lazy(() => import('./pages/PortalEdit').then(m => ({ default: m.PortalEdit })));
const PortalModules = lazy(() => import('./pages/PortalModules').then(m => ({ default: m.PortalModules })));
const ThemeConfig = lazy(() => import('./pages/ThemeConfig').then(m => ({ default: m.ThemeConfig })));
const InstanceList = lazy(() => import('./pages/InstanceList').then(m => ({ default: m.InstanceList })));
const InstanceForm = lazy(() => import('./pages/InstanceForm').then(m => ({ default: m.InstanceForm })));
const ComponentsDemo = lazy(() => import('./pages/ComponentsDemo').then(m => ({ default: m.ComponentsDemo })));
const CompositionList = lazy(() => import('./pages/CompositionList').then(m => ({ default: m.CompositionList })));
const CompositionEditor = lazy(() => import('./pages/CompositionEditor').then(m => ({ default: m.CompositionEditor })));

// Module-specific editors (imported from other modules)
const HomepageEditor = lazy(() => import('../homepage/pages/EditorPage').then(m => ({ default: m.EditorPage })));

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
    component: RealmEdit
  },
  {
    path: '/realms/:realmId/form',
    component: RealmForm
  },
  {
    path: '/portals',
    component: PortalList
  },
  {
    path: '/portals/new',
    component: PortalCreate
  },
  {
    path: '/portals/:portalId',
    component: PortalEdit
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
    path: '/portals/:portalId/modules/:moduleId/instances/:instanceId/editor',
    component: HomepageEditor
  },
  {
    path: '/portals/:portalId/compositions',
    component: CompositionList
  },
  {
    path: '/portals/:portalId/compositions/:compositionId/configure',
    component: CompositionEditor
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
