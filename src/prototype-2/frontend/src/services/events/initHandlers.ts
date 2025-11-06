/**
 * Event Handlers Initialization
 *
 * Sets up event handlers with QueryClient dependency injection
 */

import type { QueryClient } from '@tanstack/react-query';
import { registerHandler } from './eventHandlers';
import { handleNotification, initNotificationHandler } from './notificationHandler';
import { handleTask, initTaskHandler } from './taskHandler';

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

  // Register handlers by event type
  registerHandler('notification', handleNotification as any);
  registerHandler('task', handleTask as any);

  console.log('[EventHandlers] Initialized and registered');
}
