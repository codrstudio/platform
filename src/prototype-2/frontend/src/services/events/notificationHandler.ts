/**
 * Notification Event Handler
 *
 * Processes notification events and displays toast notifications.
 *
 * SPEC References:
 * - SPEC-EV-CO-005:008: Notification concepts (passive, informational)
 * - SPEC-EV-FR-001:003: Event handling (invalidation + display)
 */

import { toast, type ToastVariant } from '../../hooks/use-toast';
import type { NotificationEvent } from '../../types/events';
import type { QueryClient } from '@tanstack/react-query';

// QueryClient access (set during initialization)
let queryClient: QueryClient | null = null;

/**
 * Initialize notification handler with QueryClient
 *
 * Must be called before handling events.
 *
 * @param client - TanStack QueryClient instance
 */
export function initNotificationHandler(client: QueryClient): void {
  queryClient = client;
  console.log('[NotificationHandler] Initialized');
}

/**
 * Map notification category to toast variant
 *
 * Controls visual styling (color, icon).
 *
 * @param category - Notification category
 * @returns Toast variant
 */
function mapCategoryToVariant(category?: string): ToastVariant {
  switch (category) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    case 'system':
    default:
      return 'default';
  }
}

/**
 * Determine if cache should be invalidated
 *
 * SPEC-EV-FR-001: Use events to invalidate TanStack Query cache
 *
 * @param event - Notification event
 * @returns True if cache invalidation needed
 */
function shouldInvalidateCache(event: NotificationEvent): boolean {
  // Invalidate if event contains data field with schema/entity info
  if (event.data && (event.data.schema || event.data.entity)) {
    return true;
  }

  // Invalidate for certain categories
  if (event.category === 'success' && event.data) {
    return true; // Success usually means data changed
  }

  return false;
}

/**
 * Invalidate cache based on event data
 *
 * Uses hierarchical query keys for efficient invalidation.
 *
 * @param event - Notification event
 */
async function invalidateCache(event: NotificationEvent): Promise<void> {
  if (!queryClient) {
    console.warn('[NotificationHandler] QueryClient not initialized, skipping invalidation');
    return;
  }

  if (!event.data) {
    return;
  }

  const { schema, entity, id } = event.data;

  // Hierarchical invalidation
  if (schema && entity && id) {
    // Specific record: ['backend', 'portal', 'main']
    await queryClient.invalidateQueries({
      queryKey: [schema, entity, id]
    });
  } else if (schema && entity) {
    // All records of entity: ['backend', 'portal']
    await queryClient.invalidateQueries({
      queryKey: [schema, entity]
    });
  } else if (schema) {
    // All queries for schema: ['backend']
    await queryClient.invalidateQueries({
      queryKey: [schema]
    });
  }

  console.log('[NotificationHandler] Cache invalidated:', { schema, entity, id });
}

/**
 * Handle notification event
 *
 * Main handler function registered with EventHandlerRegistry.
 *
 * SPEC-EV-FR-001:003: Invalidate cache → display toast
 * SPEC-EV-CO-006: Notifications are passive (no required action)
 *
 * @param event - Notification event
 */
export async function handleNotification(event: NotificationEvent): Promise<void> {
  console.log('[NotificationHandler] Processing notification:', event.id);

  // Step 1: Invalidate cache if needed (data first)
  // SPEC-EV-FR-001: Use events to invalidate TanStack Query cache
  if (shouldInvalidateCache(event)) {
    await invalidateCache(event);
  }

  // Step 2: Display toast (UI feedback)
  // SPEC-EV-FR-003: Display visual notification when event received
  const variant = mapCategoryToVariant(event.category);

  // Determine auto-dismiss duration based on severity
  let duration: number | null = 5000; // Default: 5 seconds
  if (event.severity === 'critical') {
    duration = null; // No auto-dismiss for critical
  } else if (event.severity === 'high') {
    duration = 10000; // 10 seconds
  } else if (event.severity === 'low') {
    duration = 3000; // 3 seconds
  }

  // Build toast options
  const toastOptions: Parameters<typeof toast>[0] = {
    title: event.title || getCategoryTitle(event.category),
    description: event.message,
    variant,
    duration,
  };

  // Add action button if actionUrl provided
  if (event.actionUrl) {
    toastOptions.action = {
      label: 'View Details',
      onClick: () => {
        window.location.href = event.actionUrl!;
      },
    };
  }

  // Show toast
  toast(toastOptions);

  console.log('[NotificationHandler] Toast displayed:', event.id);
}

/**
 * Get default title for category
 *
 * @param category - Notification category
 * @returns Default title
 */
function getCategoryTitle(category?: string): string {
  switch (category) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Information';
    case 'system':
      return 'System Notification';
    default:
      return 'Notification';
  }
}
