// Portal JQEL queries
// Based on SPEC-jqel-syntax.md query structure

import { jqelQuery } from './client';
import type { Portal } from '../../types/portal';

/**
 * Fetch single portal by ID
 * @deprecated Use useJQELQuery hook instead
 */
export async function fetchPortalConfig(portalId: string): Promise<Portal> {
  const portals = await jqelQuery<Portal>({
    schema: 'backend',
    select: 'portal',
    where: {
      portalId: { $eq: portalId }, // Already using $eq correctly
    },
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable'],
  });

  // portals is now Portal[] (not Portal)
  if (!portals || portals.length === 0) {
    throw new Error(`Portal "${portalId}" not found`);
  }

  return portals[0]; // Extract first item
}

/**
 * Fetch all portals
 * @deprecated Use useJQELQuery hook instead
 */
export async function fetchAllPortals(): Promise<Portal[]> {
  // No change needed - already returns array
  return jqelQuery<Portal>({
    schema: 'backend',
    select: 'portal',
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable'],
  });
}

/**
 * Update portal optimistically
 * Example of optimistic mutation for JQEL
 */
export interface UpdatePortalVariables {
  portalId: string;
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export async function updatePortal(variables: UpdatePortalVariables): Promise<Portal> {
  const { portalId, ...values } = variables;

  const result = await jqelQuery<Portal>({
    schema: 'backend',
    mutate: 'portal',
    action: 'update',
    where: {
      portalId: { $eq: portalId }
    },
    values,
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable']
  });

  if (!result || result.length === 0) {
    throw new Error(`Failed to update portal "${portalId}"`);
  }

  return result[0];
}

/**
 * Create portal (for optimistic create example)
 */
export interface CreatePortalVariables {
  portalId: string;
  name: string;
  description?: string;
  path: string;
  activeModules?: string[];
  settings?: Record<string, unknown>;
  removable?: boolean;
}

export async function createPortal(variables: CreatePortalVariables): Promise<Portal> {
  const result = await jqelQuery<Portal>({
    schema: 'backend',
    mutate: 'portal',
    action: 'insert',
    values: variables as unknown as Record<string, unknown>,
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable']
  });

  if (!result || result.length === 0) {
    throw new Error('Failed to create portal');
  }

  return result[0];
}

/**
 * Delete portal (for optimistic delete example)
 */
export async function deletePortal(portalId: string): Promise<void> {
  await jqelQuery<void>({
    schema: 'backend',
    mutate: 'portal',
    action: 'delete',
    where: {
      portalId: { $eq: portalId }
    }
  });
}
