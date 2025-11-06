/**
 * Event Handler Registry
 *
 * Manages registration and dispatch of event handlers.
 * Handlers are organized by event type for efficient dispatch.
 *
 * SPEC References:
 * - SPEC-EV-FE-007: Event handler registration
 * - SPEC-EV-FR-001:006: Event processing
 */

import type { PlatformEvent, EventHandler, UnsubscribeFunction } from '../../types/events';
import { logError, logWarning } from '../logging/errorLogger';

/**
 * Global event handler registry
 * Map: event type -> Set of handlers
 */
const handlerRegistry = new Map<string, Set<EventHandler>>();

/**
 * Wildcard handlers (called for all events)
 */
const wildcardHandlers = new Set<EventHandler>();

/**
 * Register event handler for specific event type
 *
 * SPEC-EV-FE-007: Provide event handler registration
 *
 * @param type - Event type to listen for (e.g., 'notification', 'task')
 * @param handler - Handler function to call when event received
 * @returns Unsubscribe function to remove handler
 *
 * @example
 * const unsubscribe = registerHandler('notification', (event) => {
 *   console.log('Received notification:', event);
 * });
 *
 * // Later, to unsubscribe:
 * unsubscribe();
 */
export function registerHandler(type: string, handler: EventHandler): UnsubscribeFunction {
  // Get or create handler set for this type
  if (!handlerRegistry.has(type)) {
    handlerRegistry.set(type, new Set());
  }

  const handlers = handlerRegistry.get(type)!;
  handlers.add(handler);

  // Return unsubscribe function
  return () => {
    handlers.delete(handler);

    // Clean up empty sets
    if (handlers.size === 0) {
      handlerRegistry.delete(type);
    }
  };
}

/**
 * Register wildcard handler (called for all events)
 *
 * @param handler - Handler function
 * @returns Unsubscribe function
 */
export function registerWildcardHandler(handler: EventHandler): UnsubscribeFunction {
  wildcardHandlers.add(handler);

  return () => {
    wildcardHandlers.delete(handler);
  };
}

/**
 * Dispatch event to registered handlers
 *
 * SPEC-EV-FR-001:003: Process events and trigger actions
 *
 * @param event - Platform event to dispatch
 */
export async function dispatchEvent(event: PlatformEvent): Promise<void> {
  // SPEC-EV-PL-015: Ignore unknown event types (forward compatibility)
  if (!event.type) {
    logWarning('Event missing type field, skipping', 'event-handlers', { event });
    return;
  }

  // Get handlers for this event type
  const typeHandlers = handlerRegistry.get(event.type) || new Set();
  const allHandlers = [...typeHandlers, ...wildcardHandlers];

  if (allHandlers.length === 0) {
    // No handlers registered - this is normal, not an error
    return;
  }

  // Call all handlers asynchronously (non-blocking)
  const promises = allHandlers.map(async (handler) => {
    try {
      await handler(event);
    } catch (error) {
      // Handler error should not break other handlers
      logError(error as Error, {
        category: 'event-handler',
        level: 'ERROR',
        context: {
          eventType: event.type,
          eventId: event.id
        }
      });
    }
  });

  // Wait for all handlers to complete
  await Promise.allSettled(promises);
}

/**
 * Clear all event handlers
 * Call on logout or cleanup
 */
export function clearHandlers(): void {
  handlerRegistry.clear();
  wildcardHandlers.clear();
}

/**
 * Get count of registered handlers (for debugging)
 */
export function getHandlerCount(): { byType: Map<string, number>; wildcard: number } {
  const byType = new Map<string, number>();

  for (const [type, handlers] of handlerRegistry.entries()) {
    byType.set(type, handlers.size);
  }

  return {
    byType,
    wildcard: wildcardHandlers.size
  };
}
