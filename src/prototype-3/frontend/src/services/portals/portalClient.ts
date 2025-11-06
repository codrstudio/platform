/**
 * Portal Client
 *
 * HTTP client for portal configuration API.
 * Provides methods for fetching portal data from backend.
 */

import type { Portal, PortalResponse, PortalListResponse } from '@/types/portal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fetch all portals
 *
 * GET /api/portals
 */
export async function fetchAllPortals(): Promise<Portal[]> {
  const response = await fetch(`${API_BASE_URL}/api/portals`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch portals: ${response.statusText}`);
  }

  const result: PortalListResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch portals');
  }

  return result.data;
}

/**
 * Fetch a specific portal by ID
 *
 * GET /api/portals/:portalId
 */
export async function fetchPortalById(portalId: string): Promise<Portal> {
  const response = await fetch(`${API_BASE_URL}/api/portals/${portalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Portal '${portalId}' not found`);
    }
    throw new Error(`Failed to fetch portal: ${response.statusText}`);
  }

  const result: PortalResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch portal');
  }

  return result.data;
}

/**
 * Create a new portal
 *
 * POST /api/portals
 */
export async function createPortal(portal: Portal): Promise<Portal> {
  const response = await fetch(`${API_BASE_URL}/api/portals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(portal),
  });

  if (!response.ok) {
    throw new Error(`Failed to create portal: ${response.statusText}`);
  }

  const result: PortalResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to create portal');
  }

  return result.data;
}

/**
 * Update an existing portal
 *
 * PUT /api/portals/:portalId
 */
export async function updatePortal(
  portalId: string,
  updates: Partial<Portal>
): Promise<Portal> {
  const response = await fetch(`${API_BASE_URL}/api/portals/${portalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Portal '${portalId}' not found`);
    }
    throw new Error(`Failed to update portal: ${response.statusText}`);
  }

  const result: PortalResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to update portal');
  }

  return result.data;
}

/**
 * Delete a portal
 *
 * DELETE /api/portals/:portalId
 */
export async function deletePortal(portalId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/portals/${portalId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Portal '${portalId}' not found`);
    }
    throw new Error(`Failed to delete portal: ${response.statusText}`);
  }

  const result: PortalResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to delete portal');
  }
}
