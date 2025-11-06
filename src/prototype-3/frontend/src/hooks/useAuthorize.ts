/**
 * SPEC-authentication.md - Authorization Hook
 *
 * Provides permission checking via the /api/1/auth/authorize endpoint.
 * Implements SPEC-AU-AZ (Authorization API).
 */

import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AuthorizeRequest, AuthorizeResponse } from '../types/auth';

/**
 * Hook for checking permissions via the authorize endpoint.
 *
 * Usage:
 * ```tsx
 * const { authorize, isLoading } = useAuthorize();
 *
 * const checkPermission = async () => {
 *   const result = await authorize('read', 'portal:main');
 *   if (result.allowed) {
 *     // User has permission
 *   }
 * };
 * ```
 *
 * SPEC References:
 * - SPEC-AU-AZ-001 to SPEC-AU-AZ-004: Request structure
 * - SPEC-AU-AZ-010 to SPEC-AU-AZ-014: Response structure
 */
export function useAuthorize() {
  const mutation = useMutation<
    AuthorizeResponse,
    Error,
    AuthorizeRequest
  >({
    mutationFn: async (request: AuthorizeRequest) => {
      const response = await fetch('/api/1/auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include httpOnly cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'Authorization request failed',
        }));
        throw new Error(error.message || 'Authorization failed');
      }

      return response.json();
    },
  });

  /**
   * Check if user has permission to perform an action on a resource.
   *
   * @param action - Action to perform (e.g., 'read', 'write', 'delete')
   * @param resource - Resource identifier (e.g., 'portal:main', 'module:setup')
   * @param context - Optional context for fine-grained authorization
   * @returns Authorization response with allowed flag
   */
  const authorize = useCallback(
    async (
      action: string,
      resource: string,
      context?: Record<string, any>
    ): Promise<AuthorizeResponse> => {
      return mutation.mutateAsync({
        action,
        resource,
        context,
      });
    },
    [mutation]
  );

  return {
    authorize,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
