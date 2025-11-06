import { useEffect, useState } from 'react';
import { PWAUpdatePrompt } from './components/common/PWAUpdatePrompt';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { NotificationCenter } from './components/notifications';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { SSEProvider } from './providers/SSEProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { PortalRouter } from './core/routing/PortalRouter';
import { GlobalErrorBoundary } from './components/error/GlobalErrorBoundary';
import { registerModules } from './core/modules';

/**
 * SPEC-A-L-004: Frontend as SPA
 * SPEC-A-PWA-001 to SPEC-A-PWA-029: PWA requirements
 * SPEC-R-STR-001 to SPEC-R-PRI-006: Portal routing system
 * SPEC-EV-SSE-001 to SPEC-EV-SSE-028: Real-time events via SSE
 * SPEC-ERR-BOUND-001 to SPEC-ERR-BOUND-004: Global error boundary
 * SPEC-MO-ST-* to SPEC-MO-MA-*: Module system initialization
 * SPEC-EV-CO-005 to SPEC-EV-CO-008: Notification system UI
 *
 * Story 1.3.1: Portal routing structure
 * Story 1.4.3: Real-time data updates
 * Story 1.4.4: Error handling system
 * Story 1.5.1: Real-time notifications UI
 * Story 1.5.2: Module registration system
 */

function AppContent() {
  return (
    <>
      {/* PWA Components (SPEC-A-PWA-006, SPEC-A-PWA-021) */}
      <OfflineIndicator />
      <PWAUpdatePrompt />

      {/* Notification Center in header (SPEC-EV-FR-003) */}
      <div className="fixed top-0 right-0 z-50 p-4">
        <NotificationCenter />
      </div>

      {/* Portal Router handles all routing */}
      <PortalRouter />
    </>
  );
}

/**
 * Main App component wrapped with providers and error boundary
 * SPEC-AU-MA-012: AuthProvider for authentication
 * SPEC-EV-FR-001: SSEProvider for real-time events
 * SPEC-ERR-BOUND-001: GlobalErrorBoundary catches all unhandled errors
 * SPEC-MO-LC-001: Modules are loaded when portal activates them
 *
 * Story 1.5.2: Initialize module registry on app startup
 */
function App() {
  const [modulesReady, setModulesReady] = useState(false);

  // Initialize module registry on app startup
  // SPEC-MO-ST-006: Entry point exports module metadata
  // SPEC-MO-LC-001: Modules loaded when portal opens
  useEffect(() => {
    registerModules().then(() => {
      setModulesReady(true);
    });
  }, []);

  // Wait for modules to register before rendering
  if (!modulesReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <SSEProvider>
              <AppContent />
            </SSEProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
