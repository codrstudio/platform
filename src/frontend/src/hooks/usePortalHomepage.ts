// hooks/usePortalHomepage.ts
import { usePortal, useUpdatePortal } from './usePortals';

export function usePortalHomepage(portalId: string) {
  const { data: portalResult } = usePortal(portalId);
  const updatePortal = useUpdatePortal();

  const portal = portalResult?.data?.[0];

  const isHomepage = (path: string): boolean => {
    return portal?.homepage?.type === 'subroute' && portal.homepage.value === path;
  };

  const setHomepage = async (path: string): Promise<void> => {
    await updatePortal.mutateAsync({
      portalId,
      homepage: {
        type: 'subroute',
        value: path
      }
    });
  };

  const clearHomepage = async (): Promise<void> => {
    await updatePortal.mutateAsync({
      portalId,
      homepage: {
        type: 'none'
      }
    });
  };

  return {
    homepage: portal?.homepage,
    isHomepage,
    setHomepage,
    clearHomepage
  };
}
