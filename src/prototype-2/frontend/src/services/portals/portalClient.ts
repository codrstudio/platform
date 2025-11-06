/**
 * Portal Client
 *
 * Fetches portal configurations from backend /api/1/portals endpoints
 */

import type { Portal } from '@/types/portal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Fetches all portal configurations
 */
export async function fetchAllPortals(): Promise<Portal[]> {
  const response = await fetch(`${API_URL}/api/1/portals`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch portals: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches a specific portal configuration by ID
 */
export async function fetchPortalById(portalId: string): Promise<Portal> {
  const response = await fetch(`${API_URL}/api/1/portals/${portalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Portal not found: ${portalId}`);
    }
    throw new Error(`Failed to fetch portal: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Determines portal ID from current URL path
 *
 * Rules:
 * - "/" → "main" (main portal)
 * - "/:portalId/*" → portalId
 */
export function getPortalIdFromPath(pathname: string): string {
  // Main portal uses "/"
  if (pathname === '/' || pathname === '') {
    return 'main';
  }

  // Extract first segment from path
  const segments = pathname.split('/').filter(Boolean);

  // If no segments, default to main
  if (segments.length === 0) {
    return 'main';
  }

  // First segment is the portal ID
  return segments[0];
}
