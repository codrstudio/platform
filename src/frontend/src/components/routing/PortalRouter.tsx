// Portal Router Component
// Based on SPEC-routing.md and SPEC-concepts.md

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense } from 'react';
import { usePortal } from '@/hooks/useJQEL';
import { Loader2 } from 'lucide-react';
import { PortalDefaultView } from '@/components/portal/PortalDefaultView';
import { useTheme } from '@/contexts/ThemeContext';
import { renderSetupRoutes } from '@/modules/setup';

interface PortalRouterProps {
  children?: React.ReactNode;
}

/**
 * Portal Content Component
 * Displays content for a specific portal
 */
function PortalContent({ portalId }: { portalId: string }) {
  const { mode } = useTheme();
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

  // If portal has no active modules, show PortalDefaultView
  if (portal.activeModules.length === 0) {
    return (
      <PortalDefaultView
        portalId={portal.portalId}
        portalName={portal.name}
        settingsKey={portal.settingsKey}
        removable={portal.removable}
        theme={mode}
      />
    );
  }

  // If portal has active modules, render module routes
  if (portal.activeModules.includes('setup')) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <Routes>
          {renderSetupRoutes()}
        </Routes>
      </Suspense>
    );
  }

  // TODO: When other modules are implemented, add their routing logic here
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{portal.name}</h1>
            {portal.description && (
              <p className="text-muted-foreground">{portal.description}</p>
            )}
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Portal</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">ID do Portal</dt>
                <dd className="text-sm">{portal.portalId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Módulos Ativos</dt>
                <dd className="text-sm">
                  {portal.activeModules.length > 0
                    ? portal.activeModules.join(', ')
                    : 'Nenhum módulo ativo'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Settings Key</dt>
                <dd className="text-sm">{portal.settingsKey || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
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
