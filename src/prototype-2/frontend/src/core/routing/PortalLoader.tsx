// Portal Loader - Loads portal configuration and renders appropriate portal router
// Based on SPEC-routing.md Portal loading flow

import { useParams } from 'react-router-dom';
import { usePortalConfig } from '../../hooks/usePortalConfig';
import { useModuleLoader } from '../../hooks/useModuleLoader';
import { MainPortalRouter } from './MainPortalRouter';
import PortalRouter from './PortalRouter';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

interface PortalLoaderProps {
  portalId?: string; // If provided, use this; otherwise extract from URL
}

export default function PortalLoader({ portalId: providedPortalId }: PortalLoaderProps) {
  const params = useParams<{ portalId?: string }>();
  const portalId = providedPortalId || params.portalId || 'main';

  const { portal, loading: portalLoading, error: portalError } = usePortalConfig(portalId);

  // Load modules for the portal (only if portal is loaded)
  const {
    modules,
    loading: modulesLoading,
    error: modulesError
  } = useModuleLoader(portal?.activeModules || []);

  // Loading state - portal or modules
  if (portalLoading || modulesLoading) {
    return <LoadingState message="Loading portal..." />;
  }

  // Error state - portal loading failed
  if (portalError) {
    return (
      <ErrorState
        title="Portal Not Found"
        message={portalError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Portal not found
  if (!portal) {
    return (
      <ErrorState
        title="Portal Not Found"
        message={`Portal "${portalId}" could not be loaded.`}
      />
    );
  }

  // Error state - modules loading failed
  if (modulesError) {
    return (
      <ErrorState
        title="Failed to Load Modules"
        message={modulesError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Main portal uses specialized router
  if (portalId === 'main') {
    return <MainPortalRouter portal={portal} />;
  }

  // All other portals use generic PortalRouter with loaded modules
  return <PortalRouter portal={portal} modules={modules} />;
}
