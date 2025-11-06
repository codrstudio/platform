/**
 * InstanceForm Component
 *
 * Reusable form component for creating and editing instances.
 * Implements form validation with React Hook Form + Zod.
 *
 * Features:
 * - Field-level validation with inline error display
 * - Loading states during submission
 * - JSON config textarea with validation
 * - Accessible form with ARIA attributes
 * - Dark mode support
 * - Responsive layout
 * - Edit mode with immutable field protection
 *
 * Based on SPEC-module-setup.md SPEC-MS-UI-027:032
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, AlertCircle, Loader2, Lock } from 'lucide-react';
import { instanceSchema, type InstanceFormData } from '../schemas/instanceSchema';
import type { Instance } from '../../../types/module';

interface InstanceFormProps {
  /**
   * Form mode (create or edit)
   * @default 'create'
   */
  mode?: 'create' | 'edit';

  /**
   * Portal ID (from URL params)
   */
  portalId: string;

  /**
   * Module ID (from URL params)
   */
  moduleId: string;

  /**
   * Initial form values (for edit mode)
   */
  initialValues?: Partial<Instance>;

  /**
   * Form submission handler
   */
  onSubmit: (data: InstanceFormData) => void;

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
   * @default "Create Instance" or "Update Instance" based on mode
   */
  submitLabel?: string;
}

/**
 * InstanceForm - Reusable form for instance creation/editing
 *
 * @example
 * ```tsx
 * // Create mode
 * <InstanceForm
 *   mode="create"
 *   portalId="main"
 *   moduleId="chat"
 *   onSubmit={(data) => createInstanceMutation.mutate(data)}
 *   isLoading={createInstanceMutation.isPending}
 *   error={createInstanceMutation.error}
 *   onCancel={() => navigate('/setup/portals/main/modules/chat/instances')}
 * />
 *
 * // Edit mode
 * <InstanceForm
 *   mode="edit"
 *   portalId="main"
 *   moduleId="chat"
 *   initialValues={instance}
 *   onSubmit={(data) => updateInstanceMutation.mutate(data)}
 *   isLoading={updateInstanceMutation.isPending}
 *   error={updateInstanceMutation.error}
 *   onCancel={() => navigate('/setup/portals/main/modules/chat/instances')}
 * />
 * ```
 */
export function InstanceForm({
  mode = 'create',
  portalId,
  moduleId,
  initialValues,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
  submitLabel,
}: InstanceFormProps) {
  const [configError, setConfigError] = useState<string | null>(null);
  const [configValue, setConfigValue] = useState<string>('{}');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      instanceId: initialValues?.instanceId || '',
      portalId,
      moduleId,
      config: initialValues?.config || {},
      active: initialValues?.active ?? true,
    },
  });

  // Initialize config textarea value
  useEffect(() => {
    if (initialValues?.config) {
      setConfigValue(JSON.stringify(initialValues.config, null, 2));
    }
  }, [initialValues]);

  // Reset form when initialValues change (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      reset({
        instanceId: initialValues.instanceId || '',
        portalId,
        moduleId,
        config: initialValues.config || {},
        active: initialValues.active ?? true,
      });
      if (initialValues.config) {
        setConfigValue(JSON.stringify(initialValues.config, null, 2));
      }
    }
  }, [mode, initialValues, portalId, moduleId, reset]);

  const isDisabled = isLoading || isSubmitting;
  const isEditMode = mode === 'edit';

  // Determine button label
  const buttonLabel = submitLabel || (isEditMode ? 'Update Instance' : 'Create Instance');

  // Handle config textarea change with JSON validation
  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setConfigValue(value);

    // Validate JSON on blur (not on every keystroke)
    // For now, just update the value
    setConfigError(null);
  };

  // Validate JSON on blur
  const handleConfigBlur = () => {
    try {
      const parsed = configValue.trim() === '' ? {} : JSON.parse(configValue);
      setValue('config', parsed, { shouldValidate: true });
      setConfigError(null);
    } catch (err) {
      setConfigError('Invalid JSON format');
    }
  };

  // Transform form data before submission
  const handleFormSubmit = (data: InstanceFormData) => {
    // Ensure config is parsed from textarea
    try {
      const parsed = configValue.trim() === '' ? {} : JSON.parse(configValue);
      onSubmit({
        ...data,
        config: parsed,
      });
    } catch (err) {
      setConfigError('Invalid JSON format');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      aria-labelledby="instance-form-title"
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
                Failed to save instance
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error.message || 'An unknown error occurred. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instance ID Field */}
      <div className="space-y-2">
        <label
          htmlFor="instanceId"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Instance ID <span className="text-red-500">*</span>
          {isEditMode && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              <Lock className="h-3 w-3" />
              Read-only
            </span>
          )}
        </label>
        <input
          id="instanceId"
          type="text"
          placeholder="e.g., sales-dashboard"
          disabled={isDisabled || isEditMode}
          readOnly={isEditMode}
          aria-required="true"
          aria-readonly={isEditMode}
          aria-invalid={!!errors.instanceId}
          aria-describedby={errors.instanceId ? 'instanceId-error' : 'instanceId-help'}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
            ${
              errors.instanceId
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
          `}
          {...register('instanceId')}
        />
        <p id="instanceId-help" className="text-xs text-gray-500 dark:text-gray-400">
          {isEditMode
            ? 'Instance ID cannot be changed after creation'
            : 'Unique identifier within this portal (lowercase letters, numbers, hyphens only)'}
        </p>
        {errors.instanceId && (
          <p
            id="instanceId-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.instanceId.message}
          </p>
        )}
      </div>

      {/* Portal ID (Hidden) */}
      <input type="hidden" {...register('portalId')} />

      {/* Module ID (Hidden) */}
      <input type="hidden" {...register('moduleId')} />

      {/* Config Field (JSON Textarea) */}
      <div className="space-y-2">
        <label
          htmlFor="config"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Configuration
        </label>
        <textarea
          id="config"
          rows={8}
          placeholder='{"key": "value"}'
          disabled={isDisabled}
          value={configValue}
          onChange={handleConfigChange}
          onBlur={handleConfigBlur}
          aria-describedby={configError ? 'config-error' : 'config-help'}
          aria-invalid={!!configError}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm shadow-sm
            font-mono transition-colors placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-gray-900 dark:placeholder:text-gray-500
            ${
              configError
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }
          `}
        />
        <p id="config-help" className="text-xs text-gray-500 dark:text-gray-400">
          JSON object with instance-specific configuration (optional)
        </p>
        {configError && (
          <p
            id="config-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {configError}
          </p>
        )}
      </div>

      {/* Active Toggle */}
      <div className="flex items-start space-x-3">
        <input
          id="active"
          type="checkbox"
          disabled={isDisabled}
          aria-describedby="active-help"
          className={`
            mt-1 h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-700 dark:bg-gray-900
          `}
          {...register('active')}
        />
        <div className="flex-1">
          <label
            htmlFor="active"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Active
          </label>
          <p id="active-help" className="text-xs text-gray-500 dark:text-gray-400">
            Enable this instance immediately after creation
          </p>
        </div>
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
          disabled={isDisabled || !!configError}
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
