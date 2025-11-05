/**
 * Auth Home Page
 * Redirects to login if not authenticated
 * Shows user dashboard if authenticated
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutButton } from '../components/LogoutButton';
import { UserAvatar } from '../components/UserAvatar';

export function AuthHome() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show authenticated home
  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
            <p className="text-muted-foreground">You are successfully authenticated</p>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
            <UserAvatar showName size="lg" />

            {user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">User ID: {user.sub}</p>
                {user.roles && user.roles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Roles: {user.roles.join(', ')}
                  </p>
                )}
              </div>
            )}

            <LogoutButton variant="outline" />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>This is a temporary home page.</p>
            <p>Add more modules to this portal to see additional content.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
