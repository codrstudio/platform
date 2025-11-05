// Portal Loader - Loads portal configuration and modules
// Based on SPEC-module-loading.md Portal loading flow

import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalConfig } from '../../hooks/usePortalConfig';
import { useModuleLoader } from '../../hooks/useModuleLoader';
import PortalRouter from './PortalRouter';

interface PortalLoaderProps {
  portalId?: string; // If provided, use this; otherwise extract from URL
}

export default function PortalLoader({ portalId: providedPortalId }: PortalLoaderProps) {
  const params = useParams<{ portalId?: string }>();
  const portalId = providedPortalId || params.portalId || 'main';

  const { portal, loading: portalLoading, error: portalError } = usePortalConfig(portalId);
  const { modules, loading: modulesLoading, error: modulesError } = useModuleLoader(
    portal?.activeModules || []
  );

  // Loading state
  if (portalLoading || modulesLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading portal {portalId}...</div>
        {modulesLoading && portal && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Loading modules: {portal.activeModules.join(', ')}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (portalError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <div>Error loading portal: {portalError.message}</div>
      </div>
    );
  }

  if (modulesError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <div>Error loading modules: {modulesError.message}</div>
      </div>
    );
  }

  if (!portal) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Portal not found: {portalId}</div>
      </div>
    );
  }

  // Success - render portal with loaded modules
  return (
    <Suspense fallback={<div>Loading routes...</div>}>
      <PortalRouter portal={portal} modules={modules} />
    </Suspense>
  );
}
