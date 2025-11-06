/**
 * useEventHandler Hook
 *
 * Register event handler with automatic cleanup
 *
 * SPEC References:
 * - SPEC-EV-FE-007: Event handler registration
 */

import { useEffect, useRef, type DependencyList } from 'react';
import { registerHandler, registerWildcardHandler } from '../services/events';
import type { EventHandler } from '../types/events';

/**
 * Register event handler with automatic cleanup
 *
 * @param type - Event type(s) to listen for ('*' for all events)
 * @param handler - Handler function
 * @param deps - Dependency array (like useEffect)
 *
 * @example
 * // Listen to notifications
 * useEventHandler('notification', (event) => {
 *   console.log('Notification:', event);
 * });
 *
 * @example
 * // Listen to multiple types
 * useEventHandler(['notification', 'task'], (event) => {
 *   console.log('Event:', event);
 * });
 *
 * @example
 * // Listen to all events
 * useEventHandler('*', (event) => {
 *   console.log('Any event:', event);
 * });
 */
export function useEventHandler(
  type: string | string[],
  handler: EventHandler,
  deps: DependencyList = []
): void {
  // Use ref to store handler to avoid re-registering on every render
  const handlerRef = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Wrapped handler that calls current ref
    const wrappedHandler: EventHandler = (event) => {
      return handlerRef.current(event);
    };

    // Handle wildcard
    if (type === '*') {
      const unsubscribe = registerWildcardHandler(wrappedHandler);
      return unsubscribe;
    }

    // Handle array of types
    if (Array.isArray(type)) {
      const unsubscribes = type.map(t => registerHandler(t, wrappedHandler));
      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    }

    // Handle single type
    const unsubscribe = registerHandler(type, wrappedHandler);
    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
