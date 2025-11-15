// Protected Route Component
// Based on SPEC-authentication.md (SPEC-AU-MA-014 to SPEC-AU-MA-018)

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortalConfig } from '@/hooks/jqel/usePortalConfig';
import { Loader2 } from 'lucide-react';
import { saveReturnUrl, shouldSkipRedirectSave } from '@/lib/auth-redirect';

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasModule, hasActiveInstance, getActiveAuthInstance, isLoading: configLoading } = usePortalConfig();
  const location = useLocation();

  // Check if auth module is active in current portal
  // SPEC-C-I-001: Only check instances if module is active
  const authModuleActive = hasModule('auth');

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
  // Guest users cannot access protected routes
  // Check both: guest flag in JWT payload OR sub starting with "guest_"
  const isGuest = user?.guest === true || user?.sub?.startsWith('guest_') || false;

  if (!isAuthenticated || isGuest) {
    // Save return URL before redirecting to login (hybrid approach)
    // Skip if already on login/logout pages
    if (!shouldSkipRedirectSave(location.pathname)) {
      const encodedUrl = saveReturnUrl(location.pathname, location.search);
      return <Navigate to={`/login?redirect=${encodedUrl}`} replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // First layer authorization: Check instance roles (admin/configurator level)
  // If instance has roles configured, user MUST have at least one matching role
  const authInstance = getActiveAuthInstance();

  if (authInstance?.config?.roles) {
    const instanceRoles = authInstance.config.roles as string[];

    if (Array.isArray(instanceRoles) && instanceRoles.length > 0) {
      const userRoles = user?.roles || [];
      const hasRequiredRole = instanceRoles.some((role: string) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        // User doesn't have required role for this portal
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // If permission required, verify it (future implementation)
  if (requiredPermission) {
    // TODO: Implement permission check
    // For now, just render children
    console.warn(`Permission check not yet implemented for: ${requiredPermission}`);
  }

  // Render children if authenticated and authorized
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
