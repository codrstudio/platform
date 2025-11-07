// usePermission hook
// Based on SPEC-authentication.md (SPEC-AU-AZ-*)

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PermissionCheck } from '@/types/auth';

/**
 * Hook to check if user has a specific permission
 *
 * Usage:
 * ```tsx
 * const { hasPermission, isLoading } = usePermission('read.users');
 *
 * if (isLoading) return <Skeleton />;
 * if (!hasPermission) return null;
 *
 * return <UserManagementPanel />;
 * ```
 *
 * SPEC-AU-AZ-005 to SPEC-AU-AZ-036
 */
export function usePermission(permission: string): PermissionCheck {
  const { hasPermission: checkPermission, isAuthenticated } = useAuth();
  const [state, setState] = useState<PermissionCheck>({
    hasPermission: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({
        hasPermission: false,
        isLoading: false,
      });
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        const result = await checkPermission(permission);

        if (!cancelled) {
          setState({
            hasPermission: result,
            isLoading: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            hasPermission: false,
            isLoading: false,
            error: error instanceof Error ? error : new Error('Permission check failed'),
          });
        }
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [permission, isAuthenticated, checkPermission]);

  return state;
}

/**
 * Hook to check multiple permissions at once
 *
 * Usage:
 * ```tsx
 * const { hasPermission, isLoading } = usePermissions(['read.users', 'write.users']);
 *
 * if (hasPermission('read.users')) {
 *   // Show user list
 * }
 *
 * if (hasPermission('write.users')) {
 *   // Show create button
 * }
 * ```
 */
export function usePermissions(permissions: string[]): {
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  error?: Error;
} {
  const { hasPermission: checkPermission, isAuthenticated } = useAuth();
  const [state, setState] = useState<{
    permissions: Record<string, boolean>;
    isLoading: boolean;
    error?: Error;
  }>({
    permissions: {},
    isLoading: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setState({
        permissions: {},
        isLoading: false,
      });
      return;
    }

    let cancelled = false;

    const checkAll = async () => {
      try {
        const results = await Promise.all(
          permissions.map(async (perm) => {
            const has = await checkPermission(perm);
            return [perm, has] as const;
          })
        );

        if (!cancelled) {
          setState({
            permissions: Object.fromEntries(results),
            isLoading: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            permissions: {},
            isLoading: false,
            error: error instanceof Error ? error : new Error('Permission check failed'),
          });
        }
      }
    };

    checkAll();

    return () => {
      cancelled = true;
    };
  }, [permissions.join(','), isAuthenticated, checkPermission]);

  return {
    hasPermission: (permission: string) => state.permissions[permission] || false,
    isLoading: state.isLoading,
    error: state.error,
  };
}
