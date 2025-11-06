import type { QueryClient } from '@tanstack/react-query';
import type { ConfigChangedEvent } from '../../types/events';

/**
 * SPEC-CF-AS-013: Backend broadcasts config changes via Redis Pub/Sub
 * SPEC-EV-FR-001 to SPEC-EV-FR-006: Frontend event processing
 *
 * Handler for configuration change events from SSE
 */

/**
 * SPEC-CF-AS-013: Handle configuration change events
 * Invalidate relevant caches when configuration changes
 */
export function handleConfigChanged(event: ConfigChangedEvent, queryClient: QueryClient): void {
  console.log('[ConfigHandler] Configuration changed:', event.data.configType);

  // SPEC-DA-EV-001 to SPEC-DA-EV-008: Invalidate TanStack Query cache
  switch (event.data.configType) {
    case 'portals':
      // Invalidate all portal-related queries
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform', 'portal'] });
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      console.log('[ConfigHandler] Invalidated portal caches');
      break;

    case 'modules':
      // Invalidate all module-related queries
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform', 'module'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      console.log('[ConfigHandler] Invalidated module caches');
      break;

    case 'instances':
      // Invalidate all instance-related queries
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform', 'instance'] });
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      console.log('[ConfigHandler] Invalidated instance caches');
      break;

    case 'all':
      // Invalidate everything
      queryClient.invalidateQueries({ queryKey: ['jqel', 'platform'] });
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      console.log('[ConfigHandler] Invalidated all configuration caches');
      break;

    default:
      console.warn('[ConfigHandler] Unknown config type:', (event as any).configType);
  }

  // Optional: Show toast notification to user
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // Check if notifications are allowed
    if (Notification.permission === 'granted') {
      new Notification('Configuration Updated', {
        body: `Platform ${event.data.configType} configuration has been updated`,
        icon: '/icon-192x192.png',
        tag: 'config-changed',
        requireInteraction: false,
      });
    }
  }
}
