// Root application component
// Based on SPEC-routing.md routing architecture

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLoader from './core/routing/PortalLoader';
import { registerRoutes } from './core/routing';
import setupRoutes from './modules/setup/routes';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
  useEffect(() => {
    // Register routes for main portal on mount
    registerRoutes('main', setupRoutes, { moduleId: 'setup' });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main portal - root path */}
          <Route path="/" element={<PortalLoader portalId="main" />} />

          {/* All other portals - dynamic path */}
          <Route path="/:portalId/*" element={<PortalLoader />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
