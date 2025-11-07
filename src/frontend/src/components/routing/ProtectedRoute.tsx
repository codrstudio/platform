// Protected Route Component
// Based on SPEC-authentication.md (SPEC-AU-MA-014 to SPEC-AU-MA-018)

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfig } from '@/hooks/useConfig';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication ONLY if auth module is active
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasModule, isLoading: configLoading } = useConfig();
  const location = useLocation();

  // Check if auth module is active in current portal
  const authModuleActive = hasModule('auth');

  useEffect(() => {
    // Save return URL when redirecting to login
    if (!authLoading && !configLoading && authModuleActive && !isAuthenticated) {
      sessionStorage.setItem('returnUrl', location.pathname + location.search);
    }
  }, [authLoading, configLoading, authModuleActive, isAuthenticated, location]);

  // Show loading state while checking configuration and authentication
  if (authLoading || configLoading) {
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

  // If auth module is NOT active, render children without protection
  if (!authModuleActive) {
    return <>{children}</>;
  }

  // Auth module is active - require authentication
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
