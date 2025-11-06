/**
 * SPEC-authentication.md - Permission Check Hook
 *
 * Provides a declarative way to check permissions with automatic loading states.
 * Built on top of useAuthorize for reactive permission checking.
 */

import { useEffect, useState } from 'react';
import { useAuthorize } from './useAuthorize';
import type { PermissionCheck } from '../types/auth';

export interface UsePermissionOptions {
  /**
   * Action to check (e.g., 'read', 'write', 'delete')
   */
  action: string;

  /**
   * Resource to check (e.g., 'portal:main', 'module:setup')
   */
  resource: string;

  /**
   * Optional context for fine-grained authorization
   */
  context?: Record<string, any>;

  /**
   * Whether to automatically check on mount (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook for declarative permission checking with loading states.
 *
 * Usage:
 * ```tsx
 * const { allowed, isLoading, error } = usePermission({
 *   action: 'read',
 *   resource: 'portal:main'
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (!allowed) return <AccessDenied />;
 * return <ProtectedContent />;
 * ```
 *
 * SPEC References:
 * - SPEC-AU-AZ: Authorization API
 */
export function usePermission(options: UsePermissionOptions) {
  const { action, resource, context, enabled = true } = options;
  const { authorize, isLoading: isAuthorizing, error: authorizeError } = useAuthorize();

  const [permissionCheck, setPermissionCheck] = useState<PermissionCheck>({
    allowed: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const checkPermission = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authorize(action, resource, context);

        if (!cancelled) {
          setPermissionCheck({
            allowed: response.allowed,
            reason: response.reason,
            requiredPermissions: response.requiredPermissions,
            grantedPermissions: response.grantedPermissions,
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Permission check failed'));
          setPermissionCheck({ allowed: false });
          setIsLoading(false);
        }
      }
    };

    checkPermission();

    return () => {
      cancelled = true;
    };
  }, [action, resource, context, enabled, authorize]);

  return {
    allowed: permissionCheck.allowed,
    reason: permissionCheck.reason,
    requiredPermissions: permissionCheck.requiredPermissions,
    grantedPermissions: permissionCheck.grantedPermissions,
    isLoading: isLoading || isAuthorizing,
    error: error || authorizeError,
  };
}
