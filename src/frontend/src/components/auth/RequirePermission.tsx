// RequirePermission Component
// Based on SPEC-authentication.md (SPEC-AU-MA-014 to SPEC-AU-MA-018)

import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Component to conditionally render based on user permissions
 *
 * Usage:
 * ```tsx
 * <RequirePermission permission="read.users">
 *   <UserManagementPanel />
 * </RequirePermission>
 *
 * // With custom fallback
 * <RequirePermission
 *   permission="admin"
 *   fallback={<AccessDenied />}
 * >
 *   <AdminPanel />
 * </RequirePermission>
 * ```
 *
 * SPEC-AU-MA-016: Can verify specific permissions
 * SPEC-AU-MA-018: Without permission, shows error 403 or nothing
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
  loadingFallback = null,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = usePermission(permission);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Access Denied fallback component
 */
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold">Acesso negado</h2>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para acessar este recurso.
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
