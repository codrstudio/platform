// Root application component
// Based on SPEC-routing.md routing architecture

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLoader from './core/routing/PortalLoader';
import { registerRoutes } from './core/routing';
import setupRoutes from './modules/setup/routes';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { SSEProvider } from './providers/SSEProvider';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

export default function App() {
  useEffect(() => {
    // Register routes for main portal on mount
    registerRoutes('main', setupRoutes, { moduleId: 'setup' });
  }, []);

  return (
    <ErrorBoundary level="global">
      <ThemeProvider>
        <AuthProvider>
          <SSEProvider>
            <BrowserRouter>
              <Routes>
                {/* Main portal - root path */}
                <Route path="/" element={<PortalLoader portalId="main" />} />

                {/* All other portals - dynamic path */}
                <Route path="/:portalId/*" element={<PortalLoader />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </SSEProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
