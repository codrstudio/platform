/**
 * PortalCreate Page
 *
 * Page for creating new portal configurations.
 * Wraps PortalForm component with mutation logic and navigation.
 *
 * Features:
 * - Form validation with React Hook Form + Zod
 * - Optimistic updates with TanStack Query
 * - Toast notifications for success/error
 * - Navigation after successful creation
 * - Loading states and error handling
 *
 * Based on SPEC-module-setup.md SPEC-MS-UI-009:015
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PortalForm } from '../components/PortalForm';
import { useCreatePortal } from '../../../hooks/jqel/usePortalMutations';
import { toast } from '../../../hooks/use-toast';
import type { CreatePortalVariables } from '../../../services/jqel/portalQueries';

export default function PortalCreate() {
  const navigate = useNavigate();
  const createPortalMutation = useCreatePortal();

  /**
   * Handle form submission
   */
  const handleSubmit = (data: CreatePortalVariables) => {
    createPortalMutation.mutate(data, {
      onSuccess: (portal) => {
        // Show success notification
        toast({
          title: 'Portal created',
          description: `Portal "${portal.name}" has been created successfully.`,
          variant: 'success',
          duration: 3000,
        });

        // Navigate back to portal list
        navigate('/setup/portals');
      },
      onError: (error) => {
        // Error is displayed in form component
        console.error('Failed to create portal:', error);

        // Also show toast for visibility
        toast({
          title: 'Failed to create portal',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      },
    });
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    navigate('/setup/portals');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => navigate('/setup')}
            className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Setup
          </button>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <button
            onClick={() => navigate('/setup/portals')}
            className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Portals
          </button>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="text-gray-900 dark:text-gray-100">New Portal</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Back to portal list"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1
              id="portal-form-title"
              className="text-3xl font-bold text-gray-900 dark:text-gray-100"
            >
              Create New Portal
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure a new isolated sub-application within the platform. Each portal has its own
            routing, modules, and settings.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <PortalForm
            onSubmit={handleSubmit}
            isLoading={createPortalMutation.isPending}
            error={createPortalMutation.error}
            onCancel={handleCancel}
            submitLabel="Create Portal"
          />
        </div>

        {/* Help Text */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Portal Configuration Tips
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>
              • <strong>Portal ID:</strong> Must be unique and cannot be changed after creation
            </li>
            <li>
              • <strong>Route Path:</strong> Main portal should use "/", others use unique paths
              like "/customers"
            </li>
            <li>
              • <strong>Settings Key:</strong> Portals with the same key share theme preferences
            </li>
            <li>
              • <strong>Removable:</strong> System portals (like "main") should not be removable
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
