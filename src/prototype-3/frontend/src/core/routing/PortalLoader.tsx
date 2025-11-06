/**
 * Portal Loader
 *
 * Loads portal configuration from backend and provides loading/error states.
 * Used by PortalRouter to determine available portals and their routes.
 */

import { useEffect, useState } from 'react';
import type { Portal } from '@/types/portal';
import { fetchAllPortals } from '@/services/portals/portalClient';

export interface PortalLoaderState {
  portals: Portal[] | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load portal configurations
 *
 * Fetches portal data from backend and manages loading state.
 */
export function usePortalLoader(): PortalLoaderState {
  const [state, setState] = useState<PortalLoaderState>({
    portals: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPortals() {
      try {
        setState({ portals: null, loading: true, error: null });
        const portals = await fetchAllPortals();

        if (!cancelled) {
          setState({ portals, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            portals: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load portals'),
          });
        }
      }
    }

    loadPortals();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * Portal Loader Component
 *
 * Renders loading state, error state, or children with loaded portals.
 */
interface PortalLoaderProps {
  children: (portals: Portal[]) => React.ReactNode;
  loading?: React.ReactNode;
  error?: (error: Error) => React.ReactNode;
}

export function PortalLoader({ children, loading, error }: PortalLoaderProps) {
  const { portals, loading: isLoading, error: loadError } = usePortalLoader();

  if (isLoading) {
    return loading || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-600">Loading portals...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return error ? (
      error(loadError)
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Failed to Load Portals</h1>
          <p className="mt-2 text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!portals || portals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">No Portals Available</h1>
          <p className="mt-2 text-sm text-gray-600">
            No portal configurations found. Please configure portals in the backend.
          </p>
        </div>
      </div>
    );
  }

  return <>{children(portals)}</>;
}
