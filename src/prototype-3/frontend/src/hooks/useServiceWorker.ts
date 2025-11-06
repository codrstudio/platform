import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * SPEC-A-PWA-018: Service Worker registration on startup
 * SPEC-A-PWA-021: Auto-update when new version available
 * SPEC-A-PWA-010: Sync data when back online
 */

interface ServiceWorkerStatus {
  isOnline: boolean;
  needsRefresh: boolean;
  updateAvailable: boolean;
  isInstalling: boolean;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isOnline: navigator.onLine,
    needsRefresh: false,
    updateAvailable: false,
    isInstalling: false,
  });

  // Register Service Worker with vite-plugin-pwa
  const {
    needRefresh: [needsRefresh, setNeedsRefresh],
    offlineReady: [offlineReady, _setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: any) {
      console.log('[PWA] Service Worker registered:', registration);

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error: Error) {
      console.error('[PWA] Service Worker registration error:', error);
    },
    onNeedRefresh() {
      console.log('[PWA] New version available');
      setStatus(prev => ({...prev, needsRefresh: true, updateAvailable: true }));
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline');
      setStatus(prev => ({ ...prev, isInstalling: false }));
    },
  });

  // Listen for online/offline events (SPEC-A-PWA-010)
  useEffect(() => {
    const handleOnline = () => {
      console.log('[PWA] Back online');
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('[PWA] Gone offline');
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update status when needsRefresh changes
  useEffect(() => {
    setStatus(prev => ({ ...prev, needsRefresh }));
  }, [needsRefresh]);

  /**
   * Update the Service Worker to the new version
   */
  const updateApp = async () => {
    await updateServiceWorker(true);
  };

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = () => {
    setNeedsRefresh(false);
    setStatus(prev => ({ ...prev, needsRefresh: false, updateAvailable: false }));
  };

  return {
    ...status,
    updateApp,
    dismissUpdate,
    offlineReady,
  };
}
