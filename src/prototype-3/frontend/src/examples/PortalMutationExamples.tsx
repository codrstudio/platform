/**
 * Portal Mutation Examples
 *
 * Demonstrates usage of JQEL mutation hooks for creating, updating, and deleting portals.
 * Shows both basic and advanced patterns including optimistic updates.
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-MU-*, SPEC-DA-TQ-016 to SPEC-DA-TQ-033)
 */

import { useState } from 'react';
import {
  useInsert,
  useUpdate,
  useDelete,
  useJQELMutation,
} from '../hooks/useJQELMutation.js';
import { useJQELList } from '../hooks/useJQELQuery.js';

// ============================================================================
// EXAMPLE 1: BASIC INSERT
// ============================================================================

/**
 * Example: Create a new portal using useInsert hook
 *
 * SPEC-DA-MU-001 to SPEC-DA-MU-004: Basic mutation with TanStack Query
 */
export function CreatePortalExample() {
  const [portalId, setPortalId] = useState('');
  const [displayName, setDisplayName] = useState('');

  // SPEC-DA-TQ-016: useInsert hook for creating records
  const createPortal = useInsert('backend', 'portal', {
    // SPEC-DA-MU-005: Invalidate entity queries on success
    invalidation: { scope: 'entity' },

    // SPEC-DA-MU-013: Success callback
    onSuccess: (result) => {
      console.log('Portal created:', result.data?.[0]);
      // Clear form
      setPortalId('');
      setDisplayName('');
    },

    // SPEC-DA-MU-013: Error callback
    onError: (error) => {
      console.error('Failed to create portal:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // SPEC-DA-TQ-020: Execute mutation
    createPortal.mutate({
      portalId,
      displayName,
      activeModules: [],
    });
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Create Portal (Basic)</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Portal ID</label>
          <input
            type="text"
            value={portalId}
            onChange={(e) => setPortalId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={createPortal.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {createPortal.isPending ? 'Creating...' : 'Create Portal'}
        </button>

        {createPortal.isError && (
          <div className="text-red-600 text-sm">
            Error: {createPortal.error.message}
          </div>
        )}

        {createPortal.isSuccess && (
          <div className="text-green-600 text-sm">
            Portal created successfully!
          </div>
        )}
      </form>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: BASIC UPDATE
// ============================================================================

/**
 * Example: Update an existing portal using useUpdate hook
 *
 * SPEC-DA-TQ-024: Update mutation with specific record invalidation
 */
export function UpdatePortalExample() {
  const [selectedId, setSelectedId] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  // Fetch portals for selection
  const { data: portalsResult } = useJQELList('backend', 'portal');
  const portals = portalsResult?.data || [];

  // SPEC-DA-TQ-024: useUpdate hook for modifying records
  const updatePortal = useUpdate('backend', 'portal', {
    // SPEC-DA-MU-006: Specific invalidation (only affected record)
    invalidation: { scope: 'specific' },

    onSuccess: () => {
      console.log('Portal updated successfully');
      setNewDisplayName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // SPEC-DA-TQ-025: Execute update with id and values
    updatePortal.mutate({
      id: selectedId,
      displayName: newDisplayName,
    });
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Update Portal (Basic)</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Portal</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">-- Select --</option>
            {portals.map((portal) => (
              <option key={portal.portalId} value={portal.portalId}>
                {portal.displayName} ({portal.portalId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Display Name</label>
          <input
            type="text"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={updatePortal.isPending || !selectedId}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {updatePortal.isPending ? 'Updating...' : 'Update Portal'}
        </button>

        {updatePortal.isError && (
          <div className="text-red-600 text-sm">
            Error: {updatePortal.error.message}
          </div>
        )}

        {updatePortal.isSuccess && (
          <div className="text-green-600 text-sm">
            Portal updated successfully!
          </div>
        )}
      </form>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: BASIC DELETE
// ============================================================================

/**
 * Example: Delete a portal using useDelete hook
 *
 * SPEC-DA-TQ-028: Delete mutation with entity-wide invalidation
 */
export function DeletePortalExample() {
  const [selectedId, setSelectedId] = useState('');

  // Fetch portals for selection
  const { data: portalsResult } = useJQELList('backend', 'portal');
  const portals = portalsResult?.data || [];

  // SPEC-DA-TQ-028: useDelete hook for removing records
  const deletePortal = useDelete('backend', 'portal', {
    // SPEC-DA-MU-007: Entity-wide invalidation (refresh all portal queries)
    invalidation: { scope: 'entity' },

    onSuccess: () => {
      console.log('Portal deleted successfully');
      setSelectedId('');
    },
  });

  const handleDelete = () => {
    if (!selectedId) return;

    if (confirm(`Are you sure you want to delete portal "${selectedId}"?`)) {
      // SPEC-DA-TQ-029: Execute delete with record ID
      deletePortal.mutate(selectedId);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Delete Portal (Basic)</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Portal</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select --</option>
            {portals.map((portal) => (
              <option key={portal.portalId} value={portal.portalId}>
                {portal.displayName} ({portal.portalId})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDelete}
          disabled={deletePortal.isPending || !selectedId}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          {deletePortal.isPending ? 'Deleting...' : 'Delete Portal'}
        </button>

        {deletePortal.isError && (
          <div className="text-red-600 text-sm">
            Error: {deletePortal.error.message}
          </div>
        )}

        {deletePortal.isSuccess && (
          <div className="text-green-600 text-sm">
            Portal deleted successfully!
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: OPTIMISTIC UPDATE
// ============================================================================

/**
 * Example: Create portal with optimistic update
 *
 * SPEC-DA-MU-009 to SPEC-DA-MU-012: Optimistic updates with rollback
 */
export function OptimisticCreatePortalExample() {
  const [portalId, setPortalId] = useState('');
  const [displayName, setDisplayName] = useState('');

  // SPEC-DA-TQ-030: Custom mutation with optimistic updates
  const createPortal = useJQELMutation({
    buildQuery: (values: any) => ({
      schema: 'backend',
      mutate: 'portal',
      action: 'insert',
      values,
    }),

    // SPEC-DA-MU-009: Enable optimistic updates
    optimistic: true,

    // SPEC-DA-MU-010: Generate optimistic data
    optimisticData: (values) => ({
      ...values,
      // Add temporary ID for optimistic UI
      _optimistic: true,
      _timestamp: Date.now(),
    }),

    // SPEC-DA-MU-010: Specify keys to update
    optimisticKeys: ['backend', 'portal'],

    invalidation: { scope: 'entity' },

    onSuccess: () => {
      setPortalId('');
      setDisplayName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createPortal.mutate({
      portalId,
      displayName,
      activeModules: [],
    });
  };

  return (
    <div className="p-4 border rounded bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">
        Create Portal (Optimistic Update)
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        This example updates the UI immediately before the server responds.
        If the mutation fails, changes are automatically rolled back.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Portal ID</label>
          <input
            type="text"
            value={portalId}
            onChange={(e) => setPortalId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={createPortal.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {createPortal.isPending ? 'Creating...' : 'Create Portal (Optimistic)'}
        </button>

        {createPortal.isError && (
          <div className="text-red-600 text-sm">
            Error: {createPortal.error.message}
            <br />
            <span className="text-xs">(Changes were rolled back automatically)</span>
          </div>
        )}

        {createPortal.isSuccess && (
          <div className="text-green-600 text-sm">
            Portal created successfully!
          </div>
        )}
      </form>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: PORTAL LIST WITH MUTATIONS
// ============================================================================

/**
 * Example: Complete portal management with inline mutations
 *
 * SPEC-DA-TQ-033: Integration of queries and mutations
 */
export function PortalManagementExample() {
  // Query portals
  const { data: portalsResult, isLoading, error } = useJQELList('backend', 'portal');
  const portals = portalsResult?.data || [];

  // Mutations
  const updatePortal = useUpdate('backend', 'portal');
  const deletePortal = useDelete('backend', 'portal');

  const handleToggleActive = (portalId: string, currentModules: string[]) => {
    // Example: toggle a module activation
    const newModules = currentModules.includes('setup')
      ? currentModules.filter((m) => m !== 'setup')
      : [...currentModules, 'setup'];

    updatePortal.mutate({
      id: portalId,
      activeModules: newModules,
    });
  };

  const handleDelete = (portalId: string) => {
    if (confirm(`Delete portal "${portalId}"?`)) {
      deletePortal.mutate(portalId);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading portals...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Portal Management</h3>

      <div className="space-y-2">
        {portals.map((portal) => (
          <div
            key={portal.portalId}
            className="flex items-center justify-between p-3 border rounded"
          >
            <div>
              <div className="font-medium">{portal.displayName}</div>
              <div className="text-sm text-gray-600">
                ID: {portal.portalId} | Modules: {portal.activeModules?.length || 0}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(portal.portalId, portal.activeModules || [])}
                disabled={updatePortal.isPending}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Toggle Setup
              </button>

              <button
                onClick={() => handleDelete(portal.portalId)}
                disabled={deletePortal.isPending}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded disabled:bg-gray-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {portals.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No portals found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN EXAMPLES CONTAINER
// ============================================================================

/**
 * Container component showing all mutation examples
 */
export function PortalMutationExamples() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">JQEL Mutation Examples</h1>
        <p className="text-gray-600">
          Demonstrations of insert, update, delete, and optimistic updates using JQEL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreatePortalExample />
        <UpdatePortalExample />
        <DeletePortalExample />
        <OptimisticCreatePortalExample />
      </div>

      <PortalManagementExample />

      <div className="p-4 bg-gray-100 rounded text-sm">
        <h4 className="font-semibold mb-2">Key Concepts Demonstrated:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>SPEC-DA-TQ-016 to SPEC-DA-TQ-033: TanStack Query mutations</li>
          <li>SPEC-DA-MU-001 to SPEC-DA-MU-014: Mutation lifecycle and callbacks</li>
          <li>SPEC-DA-MU-005 to SPEC-DA-MU-008: Cache invalidation strategies</li>
          <li>SPEC-DA-MU-009 to SPEC-DA-MU-012: Optimistic updates with rollback</li>
        </ul>
      </div>
    </div>
  );
}
