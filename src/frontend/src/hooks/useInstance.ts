/**
 * useInstance Hook - Get module instance configuration
 *
 * SPEC Compliance:
 * - SPEC-C-I-*: Instance configuration management
 * - SPEC-MO-IN-*: Module instance configuration
 */

import { useMemo } from 'react';
import type { ModuleInstance } from '@/types/module';

/**
 * Get instance configuration
 *
 * Usage:
 * ```tsx
 * const instance = useInstance('main', 'auth', 'login-main');
 * const config = instance?.config;
 * ```
 */
export function useInstance(
  portalId: string,
  moduleId: string,
  instanceId: string
): ModuleInstance | null {
  // TODO: Implement instance fetching from JQEL
  // For now, return null (will be implemented in EPIC 2.2)
  return useMemo(() => {
    // Placeholder implementation
    return null;
  }, [portalId, moduleId, instanceId]);
}

/**
 * Get instance configuration with typed config
 *
 * Usage:
 * ```tsx
 * interface AuthConfig {
 *   loginRoute: string;
 *   realm: string;
 * }
 *
 * const instance = useInstanceConfig<AuthConfig>('main', 'auth', 'login-main');
 * const config = instance?.config; // Typed as AuthConfig
 * ```
 */
export function useInstanceConfig<T = Record<string, any>>(
  portalId: string,
  moduleId: string,
  instanceId: string
): { config: T } | null {
  const instance = useInstance(portalId, moduleId, instanceId);

  return useMemo(() => {
    if (!instance) return null;
    return {
      config: instance.config as T
    };
  }, [instance]);
}
