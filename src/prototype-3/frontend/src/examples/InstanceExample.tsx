/**
 * Instance Management Examples
 *
 * Examples demonstrating instance configuration system.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-I-*)
 * - SPEC-modules.md (SPEC-MO-IN-*)
 *
 * Story 1.5.5: Configure module instances
 */

import { useState } from 'react';
import { Settings, Trash2, Edit, Plus, CheckCircle } from 'lucide-react';
import {
  useInstanceManager,
  useInstance,
} from '../hooks/useInstance';
import {
  InstanceSelector,
  InstanceSelectorCompact,
} from '../components/modules/InstanceSelector';
import {
  InstanceFormModal,
} from '../components/modules/InstanceForm';

/**
 * Example 1: Basic Instance CRUD Operations
 *
 * Demonstrates:
 * - Creating instances
 * - Reading instance configuration
 * - Updating instances
 * - Deleting instances
 *
 * SPEC-C-I-001 to SPEC-C-I-021
 */
export function Example1_BasicCRUD() {
  const portalId = 'main';
  const moduleId = 'setup';

  const {
    instances,
    createInstance,
    updateInstance,
    deleteInstance,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  } = useInstanceManager(portalId, moduleId);

  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();

  const handleCreate = async () => {
    const timestamp = Date.now();
    const config = {
      theme: 'light',
      maxItems: 100,
      createdAt: new Date().toISOString(),
    };

    const instance = await createInstance(
      portalId,
      moduleId,
      `instance-${timestamp}`,
      config
    );

    if (instance) {
      setSelectedInstanceId(instance.instanceId);
    }
  };

  const handleUpdate = async (instanceId: string) => {
    const config = {
      theme: 'dark',
      maxItems: 200,
      updatedAt: new Date().toISOString(),
    };

    await updateInstance(portalId, moduleId, instanceId, config);
  };

  const handleDelete = async (instanceId: string) => {
    await deleteInstance(portalId, moduleId, instanceId);
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(undefined);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Example 1: Basic CRUD Operations
      </h3>

      {/* Create Button */}
      <div className="mb-4">
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Creating...' : 'Create Instance'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
          {error.message}
        </div>
      )}

      {/* Instances List */}
      <div className="space-y-2">
        {instances.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No instances created yet. Click "Create Instance" to get started.
          </p>
        ) : (
          instances.map((instance) => (
            <div
              key={instance.instanceId}
              className={`p-3 border rounded-md ${
                instance.instanceId === selectedInstanceId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {instance.instanceId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <pre className="font-mono text-xs">
                      {JSON.stringify(instance.config, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(instance.instanceId)}
                    disabled={isUpdating}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="Update instance"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(instance.instanceId)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Delete instance"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Instance Selector Component
 *
 * Demonstrates:
 * - Using InstanceSelector component
 * - Selecting between instances
 * - Creating new instances from selector
 *
 * SPEC-C-I-006: Module can have multiple instances
 */
export function Example2_InstanceSelector() {
  const portalId = 'main';
  const moduleId = 'setup';
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { createInstance, isCreating, error } = useInstanceManager(
    portalId,
    moduleId
  );

  const handleCreate = async (instanceId: string, config: Record<string, unknown>) => {
    const instance = await createInstance(portalId, moduleId, instanceId, config);
    if (instance) {
      setSelectedInstanceId(instance.instanceId);
      setShowCreateForm(false);
    }
  };

  const selectedInstance = useInstance(
    portalId,
    moduleId,
    selectedInstanceId || ''
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">
        Example 2: Instance Selector
      </h3>

      {/* Instance Selector */}
      <div className="mb-4">
        <InstanceSelector
          portalId={portalId}
          moduleId={moduleId}
          selectedInstanceId={selectedInstanceId}
          onSelect={setSelectedInstanceId}
          onCreate={() => setShowCreateForm(true)}
          label="Select Instance"
          placeholder="Choose an instance"
        />
      </div>

      {/* Selected Instance Display */}
      {selectedInstance && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Selected Instance: {selectedInstance.instanceId}
          </h4>
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400">
            {JSON.stringify(selectedInstance.config, null, 2)}
          </pre>
        </div>
      )}

      {/* Create Form Modal */}
      <InstanceFormModal
        isOpen={showCreateForm}
        portalId={portalId}
        moduleId={moduleId}
        onSubmit={handleCreate}
        onCancel={() => setShowCreateForm(false)}
        title="Create New Instance"
        isLoading={isCreating}
        error={error}
      />
    </div>
  );
}

/**
 * Example 3: Compact Instance Selector
 *
 * Demonstrates:
 * - Using compact selector for inline use
 * - Switching between instances
 */
export function Example3_CompactSelector() {
  const portalId = 'setup';
  const moduleId = 'setup';
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">
        Example 3: Compact Selector (Inline)
      </h3>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Current Instance:
        </span>
        <InstanceSelectorCompact
          portalId={portalId}
          moduleId={moduleId}
          selectedInstanceId={selectedInstanceId}
          onSelect={setSelectedInstanceId}
        />
      </div>
    </div>
  );
}

/**
 * Example 4: Instance Form Component
 *
 * Demonstrates:
 * - Creating instances with form
 * - Editing existing instances
 * - JSON configuration editor
 * - Validation
 *
 * SPEC-MO-IN-004: Configuration must be JSON-serializable
 * SPEC-MO-IN-006: Validation at create/edit
 */
export function Example4_InstanceForm() {
  const portalId = 'main';
  const moduleId = 'setup';
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [editInstanceId, setEditInstanceId] = useState<string>();

  const {
    instances,
    createInstance,
    updateInstance,
    isCreating,
    isUpdating,
    error,
  } = useInstanceManager(portalId, moduleId);

  const editInstance = useInstance(portalId, moduleId, editInstanceId || '');

  const handleCreate = async (instanceId: string, config: Record<string, unknown>) => {
    const instance = await createInstance(portalId, moduleId, instanceId, config);
    if (instance) {
      setMode(null);
    }
  };

  const handleUpdate = async (instanceId: string, config: Record<string, unknown>) => {
    const instance = await updateInstance(portalId, moduleId, instanceId, config);
    if (instance) {
      setMode(null);
      setEditInstanceId(undefined);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Example 4: Instance Form</h3>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode('create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="inline-block h-4 w-4 mr-2" />
          Create Instance
        </button>
      </div>

      {/* Instances List */}
      <div className="mb-4 space-y-2">
        {instances.map((instance) => (
          <div
            key={instance.instanceId}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{instance.instanceId}</div>
              <div className="text-xs text-gray-500">
                {Object.keys(instance.config).length} config keys
              </div>
            </div>
            <button
              onClick={() => {
                setEditInstanceId(instance.instanceId);
                setMode('edit');
              }}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {mode === 'create' && (
        <InstanceFormModal
          isOpen={true}
          portalId={portalId}
          moduleId={moduleId}
          onSubmit={handleCreate}
          onCancel={() => setMode(null)}
          title="Create New Instance"
          isLoading={isCreating}
          error={error}
        />
      )}

      {/* Edit Form Modal */}
      {mode === 'edit' && editInstance && (
        <InstanceFormModal
          isOpen={true}
          portalId={portalId}
          moduleId={moduleId}
          instance={editInstance}
          onSubmit={(instanceId, config) => handleUpdate(instanceId, config)}
          onCancel={() => {
            setMode(null);
            setEditInstanceId(undefined);
          }}
          title="Edit Instance"
          isLoading={isUpdating}
          error={error}
        />
      )}
    </div>
  );
}

/**
 * Example 5: Instance Isolation
 *
 * Demonstrates:
 * - Same instanceId in different portals
 * - Independent configurations
 * - Portal-scoped instances
 *
 * SPEC-C-I-004: Same instanceId can exist in different portals
 * SPEC-C-I-005: Instances in same portal cannot have duplicate instanceId
 * SPEC-C-I-008: Each instance configured independently
 */
export function Example5_InstanceIsolation() {
  const instanceId = 'default-config';

  // Same instanceId in different portals
  const mainInstance = useInstance('main', 'setup', instanceId);
  const setupInstance = useInstance('setup', 'setup', instanceId);

  const { createInstance } = useInstanceManager('main', 'setup');

  const handleCreateInBothPortals = async () => {
    // Create instance in 'main' portal
    await createInstance('main', 'setup', instanceId, {
      portal: 'main',
      theme: 'dark',
    });

    // Create instance with same ID in 'setup' portal
    await createInstance('setup', 'setup', instanceId, {
      portal: 'setup',
      theme: 'light',
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">
        Example 5: Instance Isolation (Portal-Scoped)
      </h3>

      <button
        onClick={handleCreateInBothPortals}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create "{instanceId}" in Both Portals
      </button>

      <div className="grid grid-cols-2 gap-4">
        {/* Main Portal */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="font-medium mb-2">Portal: main</h4>
          {mainInstance ? (
            <pre className="text-xs font-mono">
              {JSON.stringify(mainInstance.config, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">No instance</p>
          )}
        </div>

        {/* Setup Portal */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <h4 className="font-medium mb-2">Portal: setup</h4>
          {setupInstance ? (
            <pre className="text-xs font-mono">
              {JSON.stringify(setupInstance.config, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">No instance</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Same instanceId ("{instanceId}") exists in both portals with different
        configurations. They are completely isolated.
      </p>
    </div>
  );
}

/**
 * All Examples Component
 */
export function InstanceExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-950">
      <div>
        <h1 className="text-3xl font-bold mb-2">Instance Management Examples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating instance configuration system for modules
        </p>
      </div>

      <Example1_BasicCRUD />
      <Example2_InstanceSelector />
      <Example3_CompactSelector />
      <Example4_InstanceForm />
      <Example5_InstanceIsolation />
    </div>
  );
}

export default InstanceExamples;
