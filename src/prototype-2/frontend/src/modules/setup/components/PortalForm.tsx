/**
 * PortalForm Component
 *
 * Reusable form component for creating and editing portals.
 * Implements form validation with React Hook Form + Zod.
 *
 * Features:
 * - Field-level validation with inline error display
 * - Loading states during submission
 * - Accessible form with ARIA attributes
 * - Dark mode support
 * - Responsive layout
 * - Edit mode with immutable field protection
 *
 * Based on SPEC-module-setup.md SPEC-MS-UI-009:015
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, AlertCircle, Loader2, Lock } from 'lucide-react';
import { portalSchema, type PortalFormData } from '../schemas/portalSchema';
import type { CreatePortalVariables } from '../../../services/jqel/portalQueries';

interface PortalFormProps {
  /**
   * Form mode (create or edit)
   * @default 'create'
   */
  mode?: 'create' | 'edit';

  /**
   * Initial form values (for edit mode)
   */
  initialValues?: Partial<CreatePortalVariables>;

  /**
   * Form submission handler
   */
  onSubmit: (data: CreatePortalVariables) => void;

  /**
   * Form submission in progress
   */
  isLoading?: boolean;

  /**
   * Server-side error
   */
  error?: Error | null;

  /**
   * Cancel button handler
   */
  onCancel?: () => void;

  /**
   * Submit button label
   * @default "Create Portal" or "Update Portal" based on mode
   */
  submitLabel?: string;
}

/**
 * PortalForm - Reusable form for portal creation/editing
 *
 * @example
 * ```tsx
 * // Create mode
 * <PortalForm
 *   mode="create"
 *   onSubmit={(data) => createPortalMutation.mutate(data)}
 *   isLoading={createPortalMutation.isPending}
 *   error={createPortalMutation.error}
 *   onCancel={() => navigate('/setup/portals')}
 * />
 *
 * // Edit mode
 * <PortalForm
 *   mode="edit"
 *   initialValues={portal}
 *   onSubmit={(data) => updatePortalMutation.mutate(data)}
 *   isLoading={updatePortalMutation.isPending}
 *   error={updatePortalMutation.error}
 *   onCancel={() => navigate('/setup/portals')}
 * />
 * ```
 */
export function PortalForm({
  mode = 'create',
  initialValues,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
  submitLabel,
}: PortalFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PortalFormData>({
    resolver: zodResolver(portalSchema),
    defaultValues: {
      portalId: initialValues?.portalId || '',
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      path: initialValues?.path || '',
      removable: initialValues?.removable ?? true,
      settingsKey: initialValues?.settings?.['key'] as string || 'default',
      activeModules: initialValues?.activeModules || [],
      settings: initialValues?.settings || {},
    },
  });

  // Reset form when initialValues change (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      reset({
        portalId: initialValues.portalId || '',
        name: initialValues.name || '',
        description: initialValues.description || '',
        path: initialValues.path || '',
        removable: initialValues.removable ?? true,
        settingsKey: initialValues.settings?.['key'] as string || 'default',
        activeModules: initialValues.activeModules || [],
        settings: initialValues.settings || {},
      });
    }
  }, [mode, initialValues, reset]);

  const isDisabled = isLoading || isSubmitting;
  const isEditMode = mode === 'edit';
  const isMainPortal = initialValues?.portalId === 'main';

  // Determine button label
  const buttonLabel = submitLabel || (isEditMode ? 'Update Portal' : 'Create Portal');

  // Transform form data to CreatePortalVariables format
  const handleFormSubmit = (data: PortalFormData) => {
    const portalData: CreatePortalVariables = {
      portalId: data.portalId,
      name: data.name,
      description: data.description || '',
      path: data.path,
      removable: data.removable ?? true,
      activeModules: data.activeModules || [],
      settings: {
        ...(data.settings || {}),
        key: data.settingsKey || 'default',
      },
    };
    onSubmit(portalData);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      aria-labelledby="portal-form-title"
      className="space-y-6"
    >
      {/* Server Error Display */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to save portal
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error.message || 'An unknown error occurred. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portal ID Field */}
      <div className="space-y-2">
        <label
          htmlFor="portalId"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Portal ID <span className="text-red-500">*</span>
          {isEditMode && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              <Lock className="h-3 w-3" />
              Read-only
            </span>
          )}
        </label>
        <input
          id="portalId"
          type="text"
          placeholder="e.g., customer-portal"
          disabled={isDisabled || isEditMode}
          readOnly={isEditMode}
          aria-required="true"
          aria-readonly={isEditMode}
          aria-invalid={!!errors.portalId}
          aria-describedby={errors.portalId ? 'portalId-error' : 'portalId-help'}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
            ${
              errors.portalId
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
          `}
          {...register('portalId')}
        />
        <p id="portalId-help" className="text-xs text-gray-500 dark:text-gray-400">
          {isEditMode
            ? 'Portal ID cannot be changed after creation'
            : 'Unique identifier (lowercase letters, numbers, hyphens only)'}
        </p>
        {errors.portalId && (
          <p
            id="portalId-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.portalId.message}
          </p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Portal Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g., Customer Portal"
          disabled={isDisabled}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : 'name-help'}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            ${
              errors.name
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
          `}
          {...register('name')}
        />
        <p id="name-help" className="text-xs text-gray-500 dark:text-gray-400">
          Display name for the portal
        </p>
        {errors.name && (
          <p
            id="name-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Brief description of portal purpose..."
          disabled={isDisabled}
          aria-describedby="description-help"
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            border-gray-300 dark:border-gray-700
          `}
          {...register('description')}
        />
        <p id="description-help" className="text-xs text-gray-500 dark:text-gray-400">
          Optional description of what this portal is for
        </p>
      </div>

      {/* Path Field */}
      <div className="space-y-2">
        <label
          htmlFor="path"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Route Path <span className="text-red-500">*</span>
          {isMainPortal && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              <Lock className="h-3 w-3" />
              Fixed for main portal
            </span>
          )}
        </label>
        <input
          id="path"
          type="text"
          placeholder="e.g., /customers"
          disabled={isDisabled || isMainPortal}
          readOnly={isMainPortal}
          aria-required="true"
          aria-readonly={isMainPortal}
          aria-invalid={!!errors.path}
          aria-describedby={errors.path ? 'path-error' : 'path-help'}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            ${isMainPortal ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
            ${
              errors.path
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
          `}
          {...register('path')}
        />
        <p id="path-help" className="text-xs text-gray-500 dark:text-gray-400">
          {isMainPortal
            ? 'Main portal route must be "/" and cannot be changed'
            : 'URL path for the portal (must start with /)'}
        </p>
        {errors.path && (
          <p
            id="path-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.path.message}
          </p>
        )}
      </div>

      {/* Settings Key Field */}
      <div className="space-y-2">
        <label
          htmlFor="settingsKey"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Settings Key
        </label>
        <input
          id="settingsKey"
          type="text"
          placeholder="default"
          disabled={isDisabled}
          aria-describedby="settingsKey-help"
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            border-gray-300 dark:border-gray-700
          `}
          {...register('settingsKey')}
        />
        <p id="settingsKey-help" className="text-xs text-gray-500 dark:text-gray-400">
          Theme sharing key (portals with same key share theme settings)
        </p>
      </div>

      {/* Removable Checkbox */}
      <div className="flex items-start space-x-3">
        {isEditMode ? (
          <>
            <div className="mt-1">
              {initialValues?.removable ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Removable
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <Lock className="mr-1 h-3 w-3" />
                  Non-removable
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Removable Status
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  (Cannot be changed)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This setting was determined when the portal was created
              </p>
            </div>
          </>
        ) : (
          <>
            <input
              id="removable"
              type="checkbox"
              disabled={isDisabled}
              aria-describedby="removable-help"
              className={`
                mt-1 h-4 w-4 rounded border-gray-300 text-blue-600
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50
                dark:border-gray-700 dark:bg-gray-900
              `}
              {...register('removable')}
            />
            <div className="flex-1">
              <label
                htmlFor="removable"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Removable
              </label>
              <p id="removable-help" className="text-xs text-gray-500 dark:text-gray-400">
                Allow this portal to be deleted later
              </p>
            </div>
          </>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            className={`
              inline-flex items-center justify-center gap-2 rounded-md
              border border-gray-300 bg-white px-4 py-2 text-sm font-medium
              text-gray-700 shadow-sm transition-colors
              hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300
              dark:hover:bg-gray-700
            `}
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className={`
            inline-flex items-center justify-center gap-2 rounded-md
            bg-blue-600 px-4 py-2 text-sm font-medium text-white
            shadow-sm transition-colors hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-blue-700 dark:hover:bg-blue-800
          `}
        >
          {isDisabled ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {buttonLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
