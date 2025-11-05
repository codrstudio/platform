/**
 * Service Worker Registration Module
 *
 * Handles registration and lifecycle management of the service worker
 * using workbox-window for enhanced developer experience.
 *
 * @see SPEC-A-PWA-018 - Service worker registration requirements
 */

/**
 * Registers the service worker and handles lifecycle events.
 *
 * This function:
 * - Checks if service workers are supported
 * - Registers the service worker using workbox-window
 * - Listens to lifecycle events (controlling, activated, waiting)
 * - Logs registration status to console
 * - Handles update notifications
 *
 * @returns Promise that resolves when registration is complete
 * @throws Never throws - all errors are caught and logged
 */
export async function registerServiceWorker(): Promise<void> {
  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service workers are not supported in this browser');
      return;
    }

    // Dynamically import workbox-window (code splitting)
    const { Workbox } = await import('workbox-window');

    // Create Workbox instance with service worker path
    const wb = new Workbox('/sw.js');

    // Listen to 'controlling' event - SW is now controlling the page
    wb.addEventListener('controlling', () => {
      console.log('[SW] Service worker is now controlling the page');
    });

    // Listen to 'activated' event - SW has activated
    wb.addEventListener('activated', (event) => {
      // First activation or update activation
      if (!event.isUpdate) {
        console.log('[SW] Service worker activated for the first time');
        console.log('[SW] Offline support is now enabled');
      } else {
        console.log('[SW] Service worker updated to new version');
      }
    });

    // Listen to 'waiting' event - New SW is waiting to activate
    wb.addEventListener('waiting', () => {
      console.log('[SW] New version available. Refresh to update.');

      // Optional: Show user notification about update
      // This could be implemented with a toast notification in the future
      // For now, we just log to console
    });

    // Listen to 'installed' event - SW has been installed
    wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('[SW] Service worker installed successfully');
      } else {
        console.log('[SW] New service worker version installed');
      }
    });

    // Register the service worker
    await wb.register();

    console.log('[SW] Service worker registration initiated');

  } catch (error) {
    // Never throw - service worker failures should not break the app
    // Offline support is progressive enhancement, not a requirement
    console.error('[SW] Service worker registration failed:', error);
  }
}
