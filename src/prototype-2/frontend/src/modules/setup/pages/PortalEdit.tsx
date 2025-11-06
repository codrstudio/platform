/**
 * PortalEdit Page
 *
 * Page for editing an existing portal configuration.
 * Fetches portal data and renders PortalForm in edit mode.
 *
 * Features:
 * - Fetches portal by ID from URL params
 * - Loading, error, and not found states
 * - Reuses PortalForm component
 * - Update mutation with optimistic updates
 * - Success/error feedback via toast
 * - Navigation on success
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-003
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { usePortal } from '../../../hooks/jqel/usePortalQueries';
import { useUpdatePortal } from '../../../hooks/jqel/usePortalMutations';
import { PortalForm } from '../components/PortalForm';
import { toast } from '../../../hooks/use-toast';
import type { CreatePortalVariables } from '../../../services/jqel/portalQueries';

export default function PortalEdit() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  // Fetch portal data
  const {
    data: portal,
    isLoading: isLoadingPortal,
    error: fetchError,
    refetch,
  } = usePortal(portalId!);

  // Update mutation
  const updatePortalMutation = useUpdatePortal();

  /**
   * Handle form submission
   */
  const handleSubmit = (data: CreatePortalVariables) => {
    if (!portalId) return;

    updatePortalMutation.mutate(
      {
        portalId,
        name: data.name,
        description: data.description,
        settings: {
          ...data.settings,
          key: data.settings?.['key'] || 'default',
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Portal updated successfully',
            description: `Portal "${data.name}" has been updated.`,
            variant: 'success',
          });
          navigate('/setup/portals');
        },
        onError: (error) => {
          toast({
            title: 'Failed to update portal',
            description: error.message || 'An unknown error occurred. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    navigate('/setup/portals');
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    navigate('/setup/portals');
  };

  // Loading State
  if (isLoadingPortal) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-9 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (fetchError || (!isLoadingPortal && !portal)) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Portal Not Found
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {fetchError
                ? `Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
                : `The portal "${portalId}" does not exist.`}
            </p>
            <div className="mt-6 flex gap-3">
              {fetchError && (
                <button
                  onClick={() => refetch()}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  Retry
                </button>
              )}
              <button
                onClick={handleBack}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back to Portals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Render Edit Form
  // Portal is guaranteed to exist here due to guards above
  if (!portal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portals
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Portal: {portal.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Update the configuration for this portal.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <PortalForm
            mode="edit"
            initialValues={portal}
            onSubmit={handleSubmit}
            isLoading={updatePortalMutation.isPending}
            error={updatePortalMutation.error}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
