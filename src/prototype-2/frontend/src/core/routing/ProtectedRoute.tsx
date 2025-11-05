import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import type { ProtectedRouteProps } from './types';

/**
 * ProtectedRoute component
 *
 * Wraps route content and controls access based on authentication
 * and optionally authorization status.
 *
 * Usage:
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 *
 * // With permission check
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredPermission="admin.access">
 *     <AdminPage />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * Specification: SPEC-R-RP-001:008, SPEC-AU-MA-014:018
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  fallback,
  forbiddenFallback,
  redirectTo = '/login',
}: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Step 1: Handle loading state
  // While checking authentication, show loading indicator
  // SPEC-R-RP-001: Wait for auth check before deciding
  if (isLoading) {
    return (
      <div>
        {fallback || (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Check authentication requirement
  // SPEC-R-RP-004: Redirect to login if not authenticated
  // SPEC-AU-MA-017: Use Navigate with state to preserve return location
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Step 3: Check permission requirement (if specified)
  // SPEC-AU-MA-016: CAN verify specific permissions
  // Note: Full permission checking will be implemented in Sistema 1.3
  // For now, this is a placeholder for future integration with /api/1/auth/authorize
  if (requiredPermission && user) {
    // TODO (Sistema 1.3): Implement permission check via /api/1/auth/authorize
    // For now, just check if user object exists (authenticated users pass)
    // const hasPermission = await checkPermission(user, requiredPermission);

    // Placeholder: Assume authenticated users have permission
    // This will be replaced with actual API call in authentication tasks
    const hasPermission = true;

    if (!hasPermission) {
      // SPEC-AU-MA-018: Show 403 without permission
      return (
        <div>
          {forbiddenFallback || (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>403 - Forbidden</h1>
              <p>You do not have permission to access this resource.</p>
              <p>Required permission: <code>{requiredPermission}</code></p>
            </div>
          )}
        </div>
      );
    }
  }

  // Step 4: Render protected content
  // User is authenticated and authorized
  return <>{children}</>;
}
