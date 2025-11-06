/**
 * EditInstance Page
 *
 * Allows administrators to edit existing instance configurations.
 * Pre-fills form with current instance data and handles updates.
 *
 * Features:
 * - Fetches instance data with loading skeleton
 * - Pre-fills form with existing values
 * - Handles 404 errors (instance not found)
 * - Disables immutable fields (instanceId, portalId, moduleId)
 * - Shows success/error toast notifications
 * - Navigates back to instance list after save
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-015
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { InstanceForm } from '../components/InstanceForm';
import { useInstance } from '../../../hooks/jqel/useInstanceQueries';
import { useUpdateInstance } from '../../../hooks/jqel/useInstanceMutations';
import { useToast } from '../../../hooks/use-toast';
import type { InstanceFormData } from '../schemas/instanceSchema';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

/**
 * EditInstance - Page for editing existing instances
 *
 * @example
 * URL: /setup/portals/:portalId/modules/:moduleId/instances/:instanceId/edit
 * Route: /setup/portals/main/modules/chat/instances/chat-1/edit
 */
export default function EditInstance() {
  const { portalId, moduleId, instanceId } = useParams<{
    portalId: string;
    moduleId: string;
    instanceId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch instance data
  const {
    data: instance,
    isLoading,
    error: fetchError,
  } = useInstance(instanceId!, {
    // Retry once in case of transient errors
    retry: 1,
  });

  // Update mutation
  const updateInstance = useUpdateInstance();

  // Handle missing params
  useEffect(() => {
    if (!portalId || !moduleId || !instanceId) {
      toast({
        title: 'Invalid URL',
        description: 'Missing required parameters in URL',
        variant: 'destructive',
      });
      navigate('/setup/portals');
    }
  }, [portalId, moduleId, instanceId, navigate, toast]);

  // Handle form submission
  const handleSubmit = async (data: InstanceFormData) => {
    try {
      await updateInstance.mutateAsync({
        instanceId: instanceId!,
        values: {
          config: data.config,
          active: data.active,
          // Note: instanceId, portalId, moduleId are immutable
        },
      });

      toast({
        title: 'Instance updated',
        description: `Instance "${instanceId}" has been updated successfully.`,
      });

      // Navigate back to instance list
      navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
    } catch (error) {
      toast({
        title: 'Failed to update instance',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
  };

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-3 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Accessibility announcement */}
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="sr-only"
        >
          Loading instance data...
        </div>
      </div>
    );
  }

  // Error state - instance not found or fetch error
  if (fetchError || (!isLoading && !instance)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instances
        </Button>

        {/* Error alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <h3 className="font-semibold mb-2">Instance not found</h3>
            <p className="text-sm">
              The instance "{instanceId}" could not be found or failed to load.
              It may have been deleted or you may not have permission to view it.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
            >
              Back to Instances
            </Button>
          </AlertDescription>
        </Alert>

        {/* Accessibility announcement */}
        <div
          role="alert"
          aria-live="assertive"
          className="sr-only"
        >
          Error: Instance not found or failed to load.
        </div>
      </div>
    );
  }

  // Render form with instance data
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instances
        </Button>

        <h1
          id="page-title"
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Edit Instance
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update configuration for instance "{instanceId}"
        </p>
      </div>

      {/* Instance Form */}
      <InstanceForm
        mode="edit"
        portalId={portalId!}
        moduleId={moduleId!}
        initialValues={instance || undefined}
        onSubmit={handleSubmit}
        isLoading={updateInstance.isPending}
        error={updateInstance.error}
        onCancel={handleCancel}
        submitLabel="Save Changes"
      />

      {/* Accessibility announcement for edit mode */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        Editing instance {instanceId}. Some fields are read-only.
      </div>
    </div>
  );
}
