/**
 * Portal List Example Component
 *
 * Demonstrates usage of useJQELQuery hook to fetch portals from backend schema.
 *
 * This is an example component showing how to:
 * - Use useJQELQuery for SELECT queries
 * - Handle loading and error states
 * - Access data from JResult
 * - Type-safe JQEL query construction
 */

import { useJQELList } from '../../hooks/useJQELQuery.js';
import type { Portal } from '../../types/portal.js';

export function PortalListExample() {
  // SPEC-DA-TQ-004: Example of useQuery with JQEL
  const { data, isLoading, error } = useJQELList<Portal>(
    'backend',  // schema
    'portal'    // entity
  );

  // SPEC-DA-ERR-001: Handle error states
  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded bg-red-50">
        <h3 className="font-semibold text-red-700">Error loading portals</h3>
        <p className="text-sm text-red-600">{error.message}</p>
        {error.field && (
          <p className="text-xs text-red-500">Field: {error.field}</p>
        )}
      </div>
    );
  }

  // SPEC-DA-BP-009: Handle loading states
  if (isLoading) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-gray-600">Loading portals...</p>
      </div>
    );
  }

  // Extract data array from JResult
  // SPEC-JQEL-RES-013: data is always array
  const portals = data?.data || [];

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">Portals (JQEL Example)</h2>

      {portals.length === 0 ? (
        <p className="text-gray-500">No portals found</p>
      ) : (
        <ul className="space-y-2">
          {portals.map((portal) => (
            <li
              key={portal.portalId}
              className="p-2 border rounded bg-gray-50"
            >
              <div className="font-medium">{portal.portalId}</div>
              {portal.activeModules && (
                <div className="text-sm text-gray-600">
                  Modules: {portal.activeModules.join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-700 font-mono">
          Query: {`{ schema: 'backend', select: 'portal' }`}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Total portals: {portals.length}
        </p>
      </div>
    </div>
  );
}

/**
 * Example with filters
 */
export function ActivePortalsExample() {
  // Example of using WHERE clause
  const { data, isLoading, error } = useJQELList<Portal>(
    'backend',
    'portal',
    // WHERE clause: only active portals
    { active: { eq: true } }
  );

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  const portals = data?.data || [];

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Active Portals Only</h2>
      <p className="text-sm text-gray-600 mb-4">
        Using WHERE clause: {`{ active: { eq: true } }`}
      </p>
      <div className="space-y-2">
        {portals.map((portal) => (
          <div key={portal.portalId} className="p-2 bg-green-50 border rounded">
            {portal.portalId}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example with raw useJQELQuery
 */
export function CustomQueryExample() {
  // Direct usage of useJQELQuery for more control
  const { data, isLoading, error } = useJQELList<Portal>(
    'backend',
    'portal',
    undefined, // no filters
    {
      // Custom TanStack Query options
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Custom Configuration Example</h2>
      <p className="text-xs text-gray-600 mb-4">
        With custom staleTime and refetchOnWindowFocus
      </p>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
        {JSON.stringify(data?.data, null, 2)}
      </pre>
    </div>
  );
}
