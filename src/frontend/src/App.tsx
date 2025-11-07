import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PortalRouter } from './components/routing/PortalRouter';
import { LoginPage, NotFoundPage } from './pages';
import { Loader2 } from 'lucide-react';

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
 * - AuthProvider: Global authentication state
 * - Suspense: Lazy loading fallback
 * - Routes: Application routing structure
 *
 * SPEC-R-PM-001: Main portal uses "/"
 * SPEC-R-PO-001: Other portals use "/:portalId/*"
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
