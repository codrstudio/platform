import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { CompositionProvider } from './core/composition/CompositionContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PortalRouter } from './components/routing/PortalRouter';
import { LoginPage, NotFoundPage, UnauthorizedPage } from './pages';
import { EventNotification, ConnectionStatus } from './components/events';
import { UpdateNotification } from './components/cache/UpdateNotification';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { cacheValidator } from './services/cacheValidator';

// Import module loader to auto-register all modules
// SPEC-R-LM-001: Static import of module metadata
import './core/modules/loader';

// Import composition system initialization
import { initializePlatformCompositions } from './core/composition/platform';

// Initialize platform compositions (components and layouts)
initializePlatformCompositions();

/**
 * TanStack Query Client Configuration
 * SPEC-DA-TQ-006 to SPEC-DA-TQ-007: Query client configuration
 *
 * Strategy: Network-First with offline fallback
 * - Always tries network first when online
 * - Falls back to cache when offline
 * - Ensures fresh data in collaborative/multi-user environments
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 2,            // 2 seconds cache (balance freshness vs performance)
      gcTime: 1000 * 60 * 30,         // 30 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: true,     // Revalidate when window gains focus
      refetchOnReconnect: true,       // Revalidate on reconnect
      networkMode: 'online',          // Use cache only when offline
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Loading Fallback Component
 * SPEC-R-LD-003: Loading state during lazy loading
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

/**
 * Cache Epoch Sync Component
 * Fetches cache epoch from server on mount and syncs with local cache validator
 */
function CacheEpochSync() {
  useEffect(() => {
    const syncEpoch = async () => {
      try {
        const response = await fetch(`/api/cache/epoch`);
        const result = await response.json();

        if (result.success && result.data?.epoch) {
          cacheValidator.updateEpoch(result.data.epoch);
        }
      } catch (error) {
        console.error('[CacheEpochSync] Failed to sync epoch:', error);
      }
    };

    syncEpoch();
  }, []);

  return null;
}

/**
 * Main App Component
 *
 * Architecture:
 * - BrowserRouter: Client-side routing
 * - QueryClientProvider: TanStack Query data management
 * - AuthProvider: Global authentication state
 * - EventProvider: Real-time events via SSE
 * - Suspense: Lazy loading fallback
 * - Routes: Application routing structure
 *
 * SPEC-R-PM-001: Main portal uses "/"
 * SPEC-R-PO-001: Other portals use "/:portalId/*"
 * SPEC-DA-P-005: TanStack Query encapsulates JQEL
 * SPEC-TH-HC-014: ThemeProvider moved to PortalRouter for per-portal realm theming
 */
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EventProvider>
            <CompositionProvider>
              <CacheEpochSync />
              <Suspense fallback={<LoadingFallback />}>
              {/* Global toast notifications - SPEC-ERR-UI-001 */}
              <Toaster
                position="bottom-right"
                expand={false}
                richColors
                closeButton
                duration={5000}
              />

              {/* Event system UI components */}
              <EventNotification />
              <ConnectionStatus />

              {/* Cache update notification - PLAN_4 FASE 3 */}
              <UpdateNotification />

              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected routes: Portal navigation */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <PortalRouter>
                        {/* 404 fallback */}
                        <Route path="*" element={<NotFoundPage />} />
                      </PortalRouter>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            </CompositionProvider>
          </EventProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
