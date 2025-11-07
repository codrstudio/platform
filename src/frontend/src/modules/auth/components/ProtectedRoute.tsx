/**
 * ProtectedRoute Component - Auth Module
 *
 * SPEC Compliance:
 * - SPEC-AUTH-F-015: Mecanismo para proteger rotas
 * - SPEC-AUTH-F-016: Redireciona para login se não autenticado
 * - SPEC-AUTH-F-017: Redireciona para rota original após login
 * - spec/ui/auth-module-interfaces.md (Section 8)
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute wrapper component
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * // With custom redirect
 * <ProtectedRoute redirectTo="/auth/login">
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // SPEC-AUTH-F-017: Save original route for return after login
      sessionStorage.setItem('returnUrl', location.pathname + location.search);

      // SPEC-AUTH-F-016: Redirect to login
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, location, navigate, redirectTo]);

  // Loading state (SPEC: spec/ui/auth-module-interfaces.md Section 8.1)
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      )
    );
  }

  // Not authenticated (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated: render protected content
  return <>{children}</>;
}
