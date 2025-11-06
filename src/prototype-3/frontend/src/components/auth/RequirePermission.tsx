/**
 * SPEC-authentication.md - Permission Wrapper Component
 *
 * Declarative component for protecting UI elements based on permissions.
 * Shows children only if user has required permission.
 */

import { usePermission, type UsePermissionOptions } from '../../hooks/usePermission';

export interface RequirePermissionProps extends UsePermissionOptions {
  /**
   * Content to show when permission is granted
   */
  children: React.ReactNode;

  /**
   * Optional fallback to show when permission is denied (default: null)
   */
  fallback?: React.ReactNode;

  /**
   * Optional loading fallback while checking permission (default: null)
   */
  loadingFallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on permission check.
 *
 * Usage:
 * ```tsx
 * <RequirePermission action="delete" resource="portal:main">
 *   <DeleteButton />
 * </RequirePermission>
 * ```
 *
 * With fallback:
 * ```tsx
 * <RequirePermission
 *   action="write"
 *   resource="module:settings"
 *   fallback={<span>Read-only mode</span>}
 * >
 *   <EditButton />
 * </RequirePermission>
 * ```
 *
 * SPEC References:
 * - SPEC-AU-AZ: Authorization API
 */
export function RequirePermission({
  action,
  resource,
  context,
  enabled = true,
  children,
  fallback = null,
  loadingFallback = null,
}: RequirePermissionProps) {
  const { allowed, isLoading } = usePermission({
    action,
    resource,
    context,
    enabled,
  });

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
