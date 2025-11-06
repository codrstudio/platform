import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * SPEC-A-PWA-021: Auto-update when new version available
 *
 * Component that prompts the user when a new version of the app is available
 */

export function PWAUpdatePrompt() {
  const { needsRefresh, updateApp, dismissUpdate } = useServiceWorker();

  if (!needsRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-card border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-info"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">
            Update Available
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A new version of the app is available. Reload to update.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={updateApp}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reload
            </button>
            <button
              onClick={dismissUpdate}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={dismissUpdate}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
