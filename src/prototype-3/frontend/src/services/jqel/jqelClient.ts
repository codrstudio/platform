/**
 * JQEL HTTP Client
 *
 * Core client for executing JQEL queries against the backend.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-W-*)
 * - SPEC-jqel-syntax.md
 */

import { JQELQuery, JResult, JQELError } from '../../types/jqel.js';
import { tokenStorage } from '../auth/tokenStorage.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * JQEL endpoint URL
 * SPEC-DA-W-005: POST to /api/jqel
 */
const JQEL_ENDPOINT = '/api/jqel';

/**
 * Get the full JQEL endpoint URL
 */
function getJQELUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}${JQEL_ENDPOINT}`;
}

// ============================================================================
// JQEL CLIENT
// ============================================================================

/**
 * Execute a JQEL query
 *
 * SPEC-DA-W-001: Function jqel.query()
 * SPEC-DA-W-002: Accepts JQEL query object
 * SPEC-DA-W-003: Returns Promise with JResult
 * SPEC-DA-W-005: POST to /api/jqel
 * SPEC-DA-W-006: Include Content-Type: application/json
 * SPEC-DA-W-007: Include JWT automatically if available
 *
 * @param query - JQEL query object
 * @returns Promise with JResult
 * @throws JQELError on HTTP errors (4xx, 5xx)
 */
export async function executeJQEL<T = any>(query: JQELQuery): Promise<JResult<T>> {
  // Get access token from storage
  // SPEC-DA-W-007: Include JWT automatically if available
  const accessToken = tokenStorage.getAccessToken();

  // Build headers
  // SPEC-DA-W-006: Content-Type: application/json
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    // SPEC-DA-W-005: POST to /api/jqel
    const response = await fetch(getJQELUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(query),
      credentials: 'include', // Include cookies for refresh token
    });

    // Parse response body
    const jresult: JResult<T> = await response.json();

    // SPEC-DA-W-009: Throw exception on HTTP errors (4xx, 5xx)
    if (!response.ok) {
      // SPEC-DA-W-010: Exception includes complete JResult
      throw new JQELError(jresult);
    }

    // Return successful JResult
    return jresult;
  } catch (error) {
    // If error is already a JQELError, rethrow it
    if (error instanceof JQELError) {
      throw error;
    }

    // Network errors or JSON parse errors
    if (error instanceof Error) {
      throw new JQELError({
        code: 0,
        message: `Network error: ${error.message}`,
      });
    }

    // Unknown error type
    throw new JQELError({
      code: 0,
      message: 'Unknown error occurred',
    });
  }
}

/**
 * Execute a JQEL query with automatic token refresh on 401
 *
 * SPEC-DA-AUTH-005: Automatic token refresh on 401
 * SPEC-DA-AUTH-006: Transparent to component
 *
 * This wrapper automatically retries the query once with a refreshed token
 * if the initial request returns 401 Unauthorized.
 *
 * @param query - JQEL query object
 * @returns Promise with JResult
 * @throws JQELError on errors
 */
export async function executeJQELWithRefresh<T = any>(
  query: JQELQuery
): Promise<JResult<T>> {
  try {
    // Try executing query normally
    return await executeJQEL<T>(query);
  } catch (error) {
    // Check if error is 401 Unauthorized
    if (error instanceof JQELError && error.code === 401) {
      // Try refreshing token
      const refreshed = await tryRefreshToken();

      if (refreshed) {
        // Retry query with new token
        return await executeJQEL<T>(query);
      } else {
        // Refresh failed, propagate error
        throw error;
      }
    }

    // Not a 401, propagate error
    throw error;
  }
}

/**
 * Attempt to refresh access token
 *
 * @returns true if refresh succeeded, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      tokenStorage.clearAll();
      return false;
    }

    const result = await response.json();
    if (result.data?.[0]?.accessToken && result.data?.[0]?.expiresIn) {
      tokenStorage.setAccessToken(result.data[0].accessToken, result.data[0].expiresIn);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default JQEL client object
 * SPEC-DA-W-001: jqel.query() function
 */
export const jqel = {
  /**
   * Execute JQEL query
   */
  query: executeJQELWithRefresh,

  /**
   * Execute JQEL query without automatic refresh
   */
  queryRaw: executeJQEL,
};
