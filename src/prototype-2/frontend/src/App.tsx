// Root application component
// Based on SPEC-routing.md routing architecture

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLoader from './core/routing/PortalLoader';
import NotFound from './pages/NotFound';
import { registerRoutes } from './core/routing';
import setupRoutes from './modules/setup/routes';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { PlatformProvider } from './providers/PlatformProvider';
import { SSEProvider } from './providers/SSEProvider';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { GlobalErrorFallback } from './components/error/GlobalErrorFallback';
import { Toaster } from './components/ui/toaster';
import { ErrorModal } from './components/error/ErrorModal';

export default function App() {
  useEffect(() => {
    // Register routes for main portal on mount
    registerRoutes('main', setupRoutes, { moduleId: 'setup' });
  }, []);

  return (
    <ErrorBoundary level="global" fallback={GlobalErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <PlatformProvider>
            <SSEProvider>
            <BrowserRouter>
              <Routes>
                {/* Main portal - root path */}
                <Route path="/" element={<PortalLoader portalId="main" />} />

                {/* All other portals - dynamic path */}
                <Route path="/:portalId/*" element={<PortalLoader />} />

                {/* Global 404 - no portal matches */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <ErrorModal />
          </SSEProvider>
          </PlatformProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
