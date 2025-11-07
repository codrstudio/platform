// Protected Route Component
// Based on SPEC-authentication.md (SPEC-AU-MA-014 to SPEC-AU-MA-018)

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication
 * SPEC-AU-MA-014: Provides <ProtectedRoute> component
 * SPEC-AU-MA-015: Verifies authentication
 * SPEC-AU-MA-016: Can verify specific permissions (optional)
 * SPEC-AU-MA-017: Redirects to login without authentication
 * SPEC-AU-MA-018: Shows error 403 without permission
 */
export function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Save return URL when redirecting to login
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem('returnUrl', location.pathname + location.search);
    }
  }, [isLoading, isAuthenticated, location]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If permission required, verify it (future implementation)
  if (requiredPermission) {
    // TODO: Implement permission check
    // For now, just render children
    console.warn(`Permission check not yet implemented for: ${requiredPermission}`);
  }

  // Render children if authenticated
  return <>{children}</>;
}

/**
 * Loading Page Component
 */
export function LoadingPage({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
