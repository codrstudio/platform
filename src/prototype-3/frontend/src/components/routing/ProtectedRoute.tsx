/**
 * SPEC-authentication.md - Protected Route Component
 *
 * Route wrapper that requires authentication and optionally checks permissions.
 * Redirects to login if not authenticated, shows access denied if permission check fails.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { usePermission } from '../../hooks/usePermission';

export interface ProtectedRouteProps {
  /**
   * Content to render if authorized
   */
  children: React.ReactNode;

  /**
   * Whether authentication is required (default: true)
   * SPEC-R-RP-001: Routes MAY require authentication (not MUST)
   * Set to false to allow public access without authentication
   */
  requireAuth?: boolean;

  /**
   * Optional action to check (e.g., 'read', 'write', 'delete')
   * If not provided, only authentication is checked.
   */
  action?: string;

  /**
   * Optional resource to check (e.g., 'portal:main', 'module:setup')
   * Required if action is provided.
   */
  resource?: string;

  /**
   * Optional context for fine-grained authorization
   */
  context?: Record<string, any>;

  /**
   * Path to redirect to if not authenticated (default: '/login')
   */
  redirectTo?: string;

  /**
   * Fallback to show while loading (default: null)
   */
  loadingFallback?: React.ReactNode;

  /**
   * Fallback to show when access is denied (default: access denied message)
   */
  accessDeniedFallback?: React.ReactNode;
}

/**
 * Component that protects routes with authentication and optional permission checks.
 *
 * Basic usage (authentication only):
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * With permission check:
 * ```tsx
 * <Route path="/admin" element={
 *   <ProtectedRoute action="manage" resource="portal:main">
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * SPEC References:
 * - SPEC-AU-LI: Authentication (login required)
 * - SPEC-AU-AZ: Authorization (permission check)
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  action,
  resource,
  context,
  redirectTo = '/login',
  loadingFallback = null,
  accessDeniedFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this resource.</p>
      </div>
    </div>
  ),
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // If auth not required, render children directly (public route)
  // SPEC-R-RP-001: Routes MAY require authentication
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check permission if action/resource provided
  const {
    allowed,
    isLoading: isPermissionLoading,
  } = usePermission({
    action: action || '',
    resource: resource || '',
    context,
    enabled: !!(action && resource && isAuthenticated),
  });

  // Show loading state
  if (isAuthLoading || (action && resource && isPermissionLoading)) {
    return <>{loadingFallback}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check permission if required
  if (action && resource) {
    if (!allowed) {
      return <>{accessDeniedFallback}</>;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
