/**
 * Instance Form Component
 *
 * Form for creating and editing module instances.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-I-*)
 * - SPEC-modules.md (SPEC-MO-IN-*)
 *
 * Story 1.5.5: Configure module instances
 */

import { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import type { InstanceConfig } from '../../types/module';

interface InstanceFormProps {
  /** Portal ID */
  portalId: string;

  /** Module ID */
  moduleId: string;

  /** Existing instance to edit (undefined for create) */
  instance?: InstanceConfig;

  /** Callback when form is submitted */
  onSubmit: (instanceId: string, config: Record<string, unknown>) => void;

  /** Callback when form is cancelled */
  onCancel: () => void;

  /** Optional title */
  title?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: Error | null;
}

/**
 * InstanceForm - Form component for creating/editing instances
 *
 * Features:
 * - instanceId input (required, unique)
 * - config JSON editor (with validation)
 * - Save/Cancel buttons
 * - Error display
 * - Loading states
 *
 * SPEC-C-I-003: instanceId must be alphanumeric
 * SPEC-MO-IN-004: Configuration must be JSON-serializable
 * SPEC-MO-IN-006: Validation happens at create/edit
 */
export function InstanceForm({
  portalId,
  moduleId,
  instance,
  onSubmit,
  onCancel,
  title,
  isLoading = false,
  error = null,
}: InstanceFormProps) {
  const isEditMode = Boolean(instance);

  // Form state
  const [instanceId, setInstanceId] = useState(instance?.instanceId || '');
  const [configJson, setConfigJson] = useState(() =>
    instance?.config ? JSON.stringify(instance.config, null, 2) : '{}'
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Update form when instance prop changes
  useEffect(() => {
    if (instance) {
      setInstanceId(instance.instanceId);
      setConfigJson(JSON.stringify(instance.config, null, 2));
    }
  }, [instance]);

  // Validate JSON on change
  const handleConfigChange = (value: string) => {
    setConfigJson(value);

    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate instanceId
    if (!instanceId.trim()) {
      setJsonError('Instance ID is required');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(instanceId)) {
      setJsonError(
        'Instance ID must be alphanumeric (hyphens and underscores allowed)'
      );
      return;
    }

    // Validate JSON
    try {
      const config = JSON.parse(configJson);

      // Ensure config is an object
      if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        setJsonError('Configuration must be a JSON object');
        return;
      }

      onSubmit(instanceId, config);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}

      {/* Context Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <div>
          <span className="font-medium">Portal:</span> {portalId}
        </div>
        <div>
          <span className="font-medium">Module:</span> {moduleId}
        </div>
      </div>

      {/* Instance ID Input */}
      <div>
        <label
          htmlFor="instanceId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Instance ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="instanceId"
          value={instanceId}
          onChange={(e) => setInstanceId(e.target.value)}
          disabled={isEditMode || isLoading}
          placeholder="e.g., support-chat"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Alphanumeric characters, hyphens, and underscores only.
          {isEditMode && ' Cannot be changed after creation.'}
        </p>
      </div>

      {/* Configuration JSON Editor */}
      <div>
        <label
          htmlFor="config"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Configuration (JSON)
        </label>
        <textarea
          id="config"
          value={configJson}
          onChange={(e) => handleConfigChange(e.target.value)}
          disabled={isLoading}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          placeholder='{\n  "key": "value"\n}'
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Module-specific configuration as JSON object.
        </p>
      </div>

      {/* JSON Error */}
      {jsonError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Validation Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {jsonError}
            </p>
          </div>
        </div>
      )}

      {/* Form Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="inline-block h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || Boolean(jsonError)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="inline-block h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal wrapper for InstanceForm
 */
interface InstanceFormModalProps extends InstanceFormProps {
  /** Whether modal is open */
  isOpen: boolean;
}

export function InstanceFormModal({
  isOpen,
  onCancel,
  ...props
}: InstanceFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <InstanceForm onCancel={onCancel} {...props} />
        </div>
      </div>
    </div>
  );
}
