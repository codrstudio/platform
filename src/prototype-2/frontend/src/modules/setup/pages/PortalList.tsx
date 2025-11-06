/**
 * PortalList Page
 *
 * Main portal listing page within Setup module.
 * Displays all configured portals with management actions.
 *
 * Features:
 * - Fetches portals using JQEL + TanStack Query
 * - Loading, error, and empty states
 * - Responsive grid layout
 * - Action handlers for Edit, Delete, Configure Modules
 * - Dark mode support
 *
 * Based on SPEC-module-setup.md SPEC-MS-UI-004:008
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, AlertCircle } from 'lucide-react';
import { usePortals } from '../../../hooks/jqel/usePortalQueries';
import { useDeletePortal } from '../../../hooks/jqel/usePortalMutations';
import { toast } from '../../../hooks/use-toast';
import { PortalCard } from '../components/PortalCard';
import { PortalDeleteDialog } from '../components/PortalDeleteDialog';
import type { Portal } from '../../../types/portal';

export default function PortalList() {
  const navigate = useNavigate();
  const { data: portals, isLoading, error, refetch } = usePortals();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<Portal | null>(null);

  // Delete mutation
  const deletePortalMutation = useDeletePortal();

  /**
   * Handle edit portal action
   * Navigate to edit page
   */
  const handleEdit = (portalId: string) => {
    navigate(`/setup/portals/${portalId}/edit`);
  };

  /**
   * Handle delete portal action
   * Validates portal is removable, then shows confirmation dialog
   */
  const handleDelete = (portalId: string) => {
    const portal = portals?.find((p) => p.portalId === portalId);

    if (!portal) {
      toast({
        title: 'Portal not found',
        description: 'The portal could not be found.',
        variant: 'destructive',
      });
      return;
    }

    // Validate portal is removable
    if (!portal.removable) {
      toast({
        title: 'Cannot delete portal',
        description: `The portal "${portal.name}" is marked as non-removable and cannot be deleted.`,
        variant: 'destructive',
      });
      return;
    }

    // Show confirmation dialog
    setPortalToDelete(portal);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   * Executes delete mutation with optimistic updates
   */
  const handleConfirmDelete = () => {
    if (!portalToDelete) return;

    deletePortalMutation.mutate(portalToDelete.portalId, {
      onSuccess: () => {
        toast({
          title: 'Portal deleted',
          description: `Portal "${portalToDelete.name}" has been deleted successfully.`,
          variant: 'success',
        });
        setDeleteDialogOpen(false);
        setPortalToDelete(null);
      },
      onError: (error) => {
        // Handle specific error codes
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        toast({
          title: 'Failed to delete portal',
          description: errorMessage,
          variant: 'destructive',
        });
        // Dialog stays open for potential retry
      },
    });
  };

  /**
   * Handle configure modules action
   * TODO: Navigate to module configuration (Future task)
   */
  const handleConfigureModules = (portalId: string) => {
    console.log('Configure modules for portal:', portalId);
    // Future: navigate to module configuration page
  };

  /**
   * Handle create new portal action
   */
  const handleCreatePortal = () => {
    navigate('/setup/portals/new');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-9 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Failed to Load Portals
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!portals || portals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              No portals configured
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new portal.
            </p>
            <button
              onClick={handleCreatePortal}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Display Portal List
  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Portals</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage platform portals and their configurations.
            </p>
          </div>

          {/* Add New Portal Button */}
          <button
            onClick={handleCreatePortal}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New Portal
          </button>
        </div>

        {/* Portal Grid */}
        <div
          role="list"
          aria-label="Portal configurations"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {portals.map((portal) => (
            <PortalCard
              key={portal.portalId}
              portal={portal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConfigureModules={handleConfigureModules}
            />
          ))}
        </div>

        {/* Portal Count Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          Showing {portals.length} {portals.length === 1 ? 'portal' : 'portals'}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {portalToDelete && (
        <PortalDeleteDialog
          portal={portalToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isDeleting={deletePortalMutation.isPending}
        />
      )}
    </div>
  );
}
