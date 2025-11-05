import { RegisteredRoute, RouteRegistryMap } from './types';

// Module-level state
const registry: RouteRegistryMap = new Map();
const listeners = new Set<() => void>();

/**
 * Get routes for a specific portal
 * @param portalId - Portal identifier
 * @returns Array of routes registered for the portal
 */
export function getPortalRoutes(portalId: string): RegisteredRoute[] {
  return registry.get(portalId) || [];
}

/**
 * Set routes for a portal (replaces existing routes)
 * @param portalId - Portal identifier
 * @param routes - Array of routes to set
 */
export function setPortalRoutes(portalId: string, routes: RegisteredRoute[]): void {
  registry.set(portalId, routes);
  notifyListeners();
}

/**
 * Add routes to a portal (appends to existing routes)
 * @param portalId - Portal identifier
 * @param routes - Array of routes to add
 */
export function addPortalRoutes(portalId: string, routes: RegisteredRoute[]): void {
  const existing = registry.get(portalId) || [];
  registry.set(portalId, [...existing, ...routes]);
  notifyListeners();
}

/**
 * Remove all routes for a portal
 * @param portalId - Portal identifier
 */
export function clearPortalRoutes(portalId: string): void {
  registry.delete(portalId);
  notifyListeners();
}

/**
 * Get list of all portals that have routes registered
 * @returns Array of portal IDs
 */
export function getRegisteredPortals(): string[] {
  return Array.from(registry.keys());
}

/**
 * Subscribe to registry changes
 * @param listener - Function to call when registry changes
 * @returns Unsubscribe function
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of registry changes
 */
function notifyListeners(): void {
  listeners.forEach(fn => fn());
}

/**
 * Debug helper to log registry state (development only)
 */
export function debugRegistry(): void {
  if (import.meta.env.DEV) {
    console.log('Route Registry:', Object.fromEntries(registry));
  }
}
