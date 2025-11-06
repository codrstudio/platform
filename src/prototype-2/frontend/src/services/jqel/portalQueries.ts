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
