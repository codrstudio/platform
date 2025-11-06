/**
 * CreateInstance Page
 *
 * Page for creating new module instances within a portal.
 * Provides form interface for defining instance ID and configuration.
 *
 * Route: /setup/portals/:portalId/modules/:moduleId/instances/new
 *
 * Features:
 * - Extract portalId and moduleId from URL params
 * - Submit form via useCreateInstance mutation hook
 * - Success: Navigate back to instance list with success toast
 * - Error: Display error toast, keep user on page to fix
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-014
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InstanceForm } from '../components/InstanceForm';
import { useCreateInstance } from '../../../hooks/jqel/useInstanceMutations';
import { toast } from '../../../hooks/use-toast';
import type { InstanceFormData } from '../schemas/instanceSchema';

/**
 * CreateInstance Page Component
 *
 * Orchestrates instance creation flow:
 * 1. Extracts URL params (portalId, moduleId)
 * 2. Renders InstanceForm
 * 3. Handles form submission via mutation
 * 4. Shows success/error feedback
 * 5. Navigates back to instance list on success
 */
export default function CreateInstance() {
  const { portalId, moduleId } = useParams<{
    portalId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const createInstance = useCreateInstance();

  // Guard: Ensure required params are present
  if (!portalId || !moduleId) {
    return (
      <div className="p-6">
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            Error: Portal ID and Module ID are required.
          </p>
        </div>
      </div>
    );
  }

  const instanceListPath = `/setup/portals/${portalId}/modules/${moduleId}/instances`;

  /**
   * Handle form submission
   * - Mutate via useCreateInstance
   * - On success: Navigate + toast
   * - On error: Toast error (form stays open)
   */
  const handleSubmit = async (data: InstanceFormData) => {
    try {
      await createInstance.mutateAsync({
        instanceId: data.instanceId,
        portalId: data.portalId,
        moduleId: data.moduleId,
        config: data.config || {},
        active: data.active ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Success: Navigate first, then show toast
      navigate(instanceListPath);

      // Show success toast after navigation
      toast({
        title: 'Success',
        description: `Instance "${data.instanceId}" created successfully.`,
        variant: 'success',
        duration: 4000,
      });
    } catch (error) {
      // Error: Show toast, keep user on page
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create instance';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  /**
   * Handle cancel button
   * Navigate back to instance list
   */
  const handleCancel = () => {
    navigate(instanceListPath);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Instances
        </button>

        <h1
          id="instance-form-title"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          Create New Instance
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a new instance of module "{moduleId}" in portal "{portalId}".
        </p>
      </div>

      {/* Instance Form */}
      <InstanceForm
        mode="create"
        portalId={portalId}
        moduleId={moduleId}
        onSubmit={handleSubmit}
        isLoading={createInstance.isPending}
        error={createInstance.error}
        onCancel={handleCancel}
      />
    </div>
  );
}
