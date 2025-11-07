// Portal Router Component
// Based on SPEC-routing.md and SPEC-concepts.md

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { portalService } from '@/services/portalService';
import type { Portal } from '@/types/portal';
import { Loader2 } from 'lucide-react';

interface PortalRouterProps {
  children?: React.ReactNode;
}

/**
 * Portal Content Component
 * Displays content for a specific portal
 */
function PortalContent({ portalId }: { portalId: string }) {
  const [portal, setPortal] = useState<Portal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortal = async () => {
      try {
        setIsLoading(true);
        const data = await portalService.getPortalById(portalId);

        if (!data) {
          setError('Portal não encontrado');
        } else {
          setPortal(data);
        }
      } catch (err) {
        setError('Erro ao carregar portal');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortal();
  }, [portalId]);

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
          <p className="text-muted-foreground">{error || 'O portal solicitado não existe.'}</p>
        </div>
      </div>
    );
  }

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
