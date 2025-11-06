// JQEL HTTP client
// Based on SPEC-data-access.md JQEL integration requirements

import type { JQELQuery } from '../../types/jqel';
import { parseJQELResponse } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Execute JQEL query against backend
 * Based on SPEC-DA-W-001:008
 *
 * @throws {JQELError} When query fails (4xx/5xx)
 * @returns Array of results (SPEC-JQEL-RES-013: data is ALWAYS array)
 */
export async function jqelQuery<T>(query: JQELQuery): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/api/jqel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  // Parse response - throws JQELError if code >= 400
  return parseJQELResponse<T>(response);
}
