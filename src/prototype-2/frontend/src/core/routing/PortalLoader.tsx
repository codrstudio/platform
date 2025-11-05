// Portal Loader - Loads portal configuration and renders appropriate portal router
// Based on SPEC-routing.md Portal loading flow

import { useParams } from 'react-router-dom';
import { usePortalConfig } from '../../hooks/usePortalConfig';
import { MainPortalRouter } from './MainPortalRouter';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

interface PortalLoaderProps {
  portalId?: string; // If provided, use this; otherwise extract from URL
}

export default function PortalLoader({ portalId: providedPortalId }: PortalLoaderProps) {
  const params = useParams<{ portalId?: string }>();
  const portalId = providedPortalId || params.portalId || 'main';

  const { portal, loading, error } = usePortalConfig(portalId);

  // Loading state
  if (loading) {
    return <LoadingState message="Loading platform..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Portal Not Found"
        message={error.message}
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

  // For now, only main portal is implemented
  if (portalId === 'main') {
    return <MainPortalRouter portal={portal} />;
  }

  // Other portals will be implemented in task 1.2.3
  return (
    <ErrorState
      title="Portal Not Implemented"
      message={`Portal "${portalId}" routing is not yet implemented.`}
    />
  );
}
