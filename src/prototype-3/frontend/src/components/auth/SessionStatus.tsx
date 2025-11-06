import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { tokenStorage } from '@/services/auth/tokenStorage';
import { useState, useEffect } from 'react';
import { RequirePermission } from './RequirePermission';
import { usePermission } from '@/hooks/usePermission';

/**
 * SPEC-AU-MA-011: Context PODE incluir: user, isAuthenticated, login(), logout()
 * SPEC-AU-LO-*: Logout current session
 * SPEC-AU-LA-*: Logout all sessions
 * SPEC-AU-AZ-*: Authorization/permission checking
 *
 * SessionStatus component for story 1.2.2 "Sessão persistente"
 * Displays current authentication state and provides logout actions
 * Includes permission checking examples (story 1.2.3)
 */

export function SessionStatus() {
  const { user, isAuthenticated, logout, logoutAll } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    expiresIn: number | null;
  }>({
    hasAccessToken: false,
    hasRefreshToken: false,
    expiresIn: null,
  });

  // Example of hook-based permission check (SPEC-AU-AZ)
  const { allowed: canManageUsers, isLoading: isCheckingPermission } = usePermission({
    action: 'manage',
    resource: 'users',
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const updateTokenInfo = () => {
      const expiry = tokenStorage.getTokenExpiry();
      setTokenInfo({
        hasAccessToken: !!tokenStorage.getAccessToken(),
        hasRefreshToken: !!tokenStorage.getRefreshToken(),
        expiresIn: expiry ? Math.floor((expiry - Date.now()) / 1000) : null,
      });
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null) return 'Unknown';
    if (seconds <= 0) return 'Expired';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4 max-w-md w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Session Status</h2>
        <p className="text-sm text-muted-foreground">
          You are currently logged in
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">User ID</span>
          <span className="font-medium">{user.userId}</span>
        </div>

        {user.username && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
        )}

        {user.email && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Access Token</span>
          <span className={`font-medium ${tokenInfo.hasAccessToken ? 'text-success' : 'text-error'}`}>
            {tokenInfo.hasAccessToken ? 'Valid' : 'Missing'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Refresh Token</span>
          <span className={`font-medium ${tokenInfo.hasRefreshToken ? 'text-success' : 'text-error'}`}>
            {tokenInfo.hasRefreshToken ? 'Valid' : 'Missing'}
          </span>
        </div>

        {tokenInfo.expiresIn !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expires In</span>
            <span className={`font-medium ${tokenInfo.expiresIn > 60 ? 'text-success' : 'text-warning'}`}>
              {formatTimeRemaining(tokenInfo.expiresIn)}
            </span>
          </div>
        )}

        {user.roles && user.roles.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Roles</span>
            <span className="font-medium">{user.roles.join(', ')}</span>
          </div>
        )}

        {user.permissions && user.permissions.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Permissions</span>
            <span className="font-medium text-xs">{user.permissions.slice(0, 3).join(', ')}{user.permissions.length > 3 ? '...' : ''}</span>
          </div>
        )}

        {/* Example: Hook-based permission check */}
        {!isCheckingPermission && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Can Manage Users</span>
            <span className={`font-medium ${canManageUsers ? 'text-success' : 'text-muted-foreground'}`}>
              {canManageUsers ? 'Yes' : 'No'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full"
        >
          Logout (Current Session)
        </Button>

        {/* Example: Component-based permission check - only show if user can manage sessions */}
        <RequirePermission
          action="manage"
          resource="sessions"
          fallback={
            <Button
              disabled
              variant="destructive"
              className="w-full"
              title="You don't have permission to manage all sessions"
            >
              Logout All Sessions (No Permission)
            </Button>
          }
        >
          <Button
            onClick={logoutAll}
            variant="destructive"
            className="w-full"
          >
            Logout All Sessions
          </Button>
        </RequirePermission>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Session will persist across page reloads.</p>
        <p>Access token auto-renews 1 minute before expiry.</p>
        <p className="text-info">Permission checks demonstrated above (SPEC-AU-AZ)</p>
      </div>
    </div>
  );
}
