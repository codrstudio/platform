/**
 * Event Handlers Initialization
 *
 * Sets up event handlers with QueryClient dependency injection
 */

import type { QueryClient } from '@tanstack/react-query';
import { registerHandler } from './eventHandlers';
import { handleNotification, initNotificationHandler } from './notificationHandler';
import { handleTask, initTaskHandler } from './taskHandler';
import { handleConfigChange, initConfigHandler } from './configHandler';

/**
 * Initialize event handlers with QueryClient
 *
 * Must be called before SSE connection established
 *
 * @param queryClient - TanStack QueryClient instance
 */
export function initializeEventHandlers(queryClient: QueryClient): void {
  // Initialize handlers with dependencies
  initNotificationHandler(queryClient);
  initTaskHandler(queryClient);
  initConfigHandler(queryClient); // Task 1.7.6

  // Register handlers by event type
  registerHandler('notification', handleNotification as any);
  registerHandler('task', handleTask as any);

  // Register config-changed handler (Task 1.7.6)
  // Config changes come as notification events with category 'config-changed'
  registerHandler('notification', async (event) => {
    if (event.category === 'config-changed') {
      await handleConfigChange(event);
    }
  });

  console.log('[EventHandlers] Initialized and registered');
}
