import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PortalRouter } from './components/routing/PortalRouter';
import { LoginPage, NotFoundPage } from './pages';
import { EventNotification, ConnectionStatus } from './components/events';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

/**
 * TanStack Query Client Configuration
 * SPEC-DA-TQ-006 to SPEC-DA-TQ-007: Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 30,         // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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
 * Main App Component
 *
 * Architecture:
 * - BrowserRouter: Client-side routing
 * - QueryClientProvider: TanStack Query data management
 * - AuthProvider: Global authentication state
 * - Suspense: Lazy loading fallback
 * - Routes: Application routing structure
 *
 * SPEC-R-PM-001: Main portal uses "/"
 * SPEC-R-PO-001: Other portals use "/:portalId/*"
 * SPEC-DA-P-005: TanStack Query encapsulates JQEL
 */
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <EventProvider>
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

            <Routes>
              {/* Public route: Login */}
              <Route path="/login" element={<LoginPage />} />

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
            </EventProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
