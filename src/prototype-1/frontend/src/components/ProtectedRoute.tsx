/**
 * Protected Route Component
 * Ensures user is authenticated before rendering children
 * SPEC-AU-* compliance
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission if required
  if (permission && user) {
    const userPermissions = user.permissions || [];

    if (!userPermissions.includes(permission)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access this resource.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Required permission: <code className="bg-muted px-2 py-1 rounded">{permission}</code>
            </p>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}
