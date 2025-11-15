// Portal Router Component
// Based on SPEC-routing.md and SPEC-concepts.md

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense } from 'react';
import { usePortal } from '@/hooks/jqel/usePortal';
import { Loader2 } from 'lucide-react';
import { PortalDefaultView } from '@/components/portal/PortalDefaultView';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { moduleRegistry } from '@/core/modules';

interface PortalRouterProps {
  children?: React.ReactNode;
}

/**
 * Helper function to render routes from active modules
 * SPEC-R-RM-011: Portal prefixes routes with its own path
 * SPEC-R-LM-004: Dynamic rendering based on activeModules
 */
function renderActiveModuleRoutes(activeModules: string[]) {
  const routes: JSX.Element[] = [];

  activeModules.forEach((moduleId) => {
    const module = moduleRegistry.getModule(moduleId);

    if (!module) {
      if (import.meta.env.DEV) {
        console.warn(`[PortalRouter] Module "${moduleId}" not found in registry`);
      }
      return;
    }

    if (!module.routes || module.routes.length === 0) {
      if (import.meta.env.DEV) {
        console.log(`[PortalRouter] Module "${moduleId}" has no routes`);
      }
      return;
    }

    // SPEC-R-LM-006: Components are lazy-loaded when route is accessed
    module.routes.forEach((route) => {
      routes.push(
        <Route
          key={`${moduleId}-${route.path}`}
          path={route.path}
          element={<route.component />}
          index={route.index}
        />
      );
    });
  });

  return routes;
}

/**
 * Portal Content Inner Component
 * Renders portal content with theme context available
 * SPEC-R-LM-005: Only render routes from modules in activeModules
 */
function PortalContentInner({ portal }: { portal: any }) {
  const { mode } = useTheme();

  // Check if portal has any modules with routes
  const hasActiveModules = portal.activeModules && portal.activeModules.length > 0;

  if (hasActiveModules) {
    const routes = renderActiveModuleRoutes(portal.activeModules);

    // If we have routes to render, show them
    if (routes.length > 0) {
      // Homepage redirect: if homepage is configured, add redirect route at the beginning
      if (portal.homepage?.type === 'subroute' && portal.homepage.value) {
        // Remove leading slash to make path relative to portal context
        // This ensures /ola/mundo becomes ola/mundo, which navigates to /:portalId/ola/mundo
        const relativePath = portal.homepage.value.startsWith('/')
          ? portal.homepage.value.slice(1)
          : portal.homepage.value;

        routes.unshift(
          <Route
            key="homepage-redirect"
            path="/"
            element={<Navigate to={relativePath} replace />}
          />
        );
      }

      return (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <Routes>
            {routes}
          </Routes>
        </Suspense>
      );
    }
  }

  // Default: show PortalDefaultView if no routes available
  // (no modules, only modules without routes, or unimplemented modules)
  return (
    <PortalDefaultView
      portalId={portal.portalId}
      portalName={portal.name}
      realmId={portal.realmId}
      removable={portal.removable}
      theme={mode}
    />
  );
}

/**
 * Portal Content Component
 * Displays content for a specific portal
 * SPEC-TH-HC-014: ThemeProvider wraps portal content with portal's realmId
 */
function PortalContent({ portalId }: { portalId: string }) {
  const { data: portalResult, isLoading, error } = usePortal(portalId);

  const portal = portalResult?.data?.[0] || null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Carregando portal...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Portal não encontrado</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'O portal solicitado não existe.'}
          </p>
        </div>
      </div>
    );
  }

  // SPEC-TH-HC-014: Each portal gets its own ThemeProvider with its realmId
  return (
    <ThemeProvider realmId={portal.realmId || 'default'} portalId={portalId}>
      <PortalContentInner portal={portal} />
    </ThemeProvider>
  );
}

/**
 * Portal Route Component
 * Handles dynamic portal routing
 */
function PortalRoute() {
  const { portalId } = useParams<{ portalId: string }>();

  if (!portalId) {
    return <Navigate to="/" replace />;
  }

  return <PortalContent portalId={portalId} />;
}

/**
 * PortalRouter Component
 *
 * Main routing component for portal navigation
 * SPEC-R-PM-001: Main portal uses "/"
 * SPEC-R-PO-001: Other portals use "/:portalId/*"
 */
export function PortalRouter({ children }: PortalRouterProps) {
  return (
    <Routes>
      {/* Main portal route (SPEC-R-PM-001) */}
      <Route
        path="/"
        element={<PortalContent portalId="main" />}
      />

      {/* Other portals route (SPEC-R-PO-001) */}
      <Route
        path="/:portalId/*"
        element={<PortalRoute />}
      />

      {/* Custom children routes (for login, etc) */}
      {children}
    </Routes>
  );
}
