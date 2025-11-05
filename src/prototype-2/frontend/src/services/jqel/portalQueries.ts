// Portal JQEL queries
// Based on SPEC-jqel-syntax.md query structure

import { jqelQuery } from './client';
import type { Portal } from '../../types/portal';

export async function fetchPortalConfig(portalId: string): Promise<Portal> {
  const portals = await jqelQuery<Portal[]>({
    schema: 'backend',
    select: 'portal',
    where: {
      portalId: { $eq: portalId },
    },
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable'],
  });

  if (!portals || portals.length === 0) {
    throw new Error(`Portal "${portalId}" not found`);
  }

  return portals[0];
}

export async function fetchAllPortals(): Promise<Portal[]> {
  return jqelQuery<Portal[]>({
    schema: 'backend',
    select: 'portal',
    output: ['portalId', 'name', 'description', 'path', 'activeModules', 'settings', 'removable'],
  });
}
