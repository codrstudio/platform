// JQEL HTTP client
// Based on SPEC-data-access.md JQEL integration requirements

import type { JQELQuery, JResult } from '../../types/jqel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function jqelQuery<T>(query: JQELQuery): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/jqel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`JQEL request failed: ${response.statusText}`);
  }

  const result: JResult<T> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'JQEL query failed');
  }

  return result.data;
}
