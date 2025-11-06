import { invalidateBackend } from '../jqel/invalidation';
import type { QueryClient } from '@tanstack/react-query';
import type { PlatformEvent } from '../../types/events';

/**
 * Configuration Change Event Handler
 *
 * Handles config-changed events from backend file watcher.
 * Invalidates TanStack Query cache when backend configuration files change.
 *
 * SPEC References:
 * - SPEC-CF-AS-012:013: Configuration hot reload
 * - SPEC-EV-FE-013:016: Event-driven cache invalidation
 *
 * Task 1.7.6 - Hot reload de configurações
 */

let queryClientInstance: QueryClient | null = null;

/**
 * Initialize config handler with QueryClient
 *
 * @param queryClient - TanStack QueryClient instance
 */
export function initConfigHandler(queryClient: QueryClient): void {
  queryClientInstance = queryClient;
}

/**
 * Handle config-changed events
 *
 * @param event - Platform event with config change data
 */
export async function handleConfigChange(event: PlatformEvent): Promise<void> {
  if (!queryClientInstance) {
    console.error('[ConfigHandler] QueryClient not initialized');
    return;
  }

  try {
    const { entity } = event.data || {};

    if (!entity) {
      console.warn('[ConfigHandler] Event missing entity field:', event);
      return;
    }

    // Invalidate specific entity type
    const entityMap: Record<string, { portal?: boolean; module?: boolean; instance?: boolean }> = {
      portal: { portal: true },
      module: { module: true },
      instance: { instance: true },
    };

    const options = entityMap[entity];
    if (options) {
      invalidateBackend(queryClientInstance, options);
    } else {
      // Unknown entity - invalidate all backend queries
      invalidateBackend(queryClientInstance);
    }

    if (import.meta.env.DEV) {
      console.log('[ConfigHandler] Invalidated cache for:', entity);
    }
  } catch (error) {
    console.error('[ConfigHandler] Error handling config change:', error);
    // Don't throw - event handling should continue
  }
}
