/**
 * Instance Selector Component
 *
 * Dropdown for selecting and switching between module instances.
 *
 * References:
 * - SPEC-concepts.md (SPEC-C-I-*)
 * - SPEC-modules.md (SPEC-MO-IN-*)
 *
 * Story 1.5.5: Configure module instances
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useInstances } from '../../hooks/useInstance';

interface InstanceSelectorProps {
  /** Portal ID */
  portalId: string;

  /** Module ID */
  moduleId: string;

  /** Currently selected instance ID */
  selectedInstanceId?: string;

  /** Callback when instance is selected */
  onSelect?: (instanceId: string) => void;

  /** Callback when "Create New Instance" is clicked */
  onCreate?: () => void;

  /** Optional label for the selector */
  label?: string;

  /** Optional placeholder when no instance is selected */
  placeholder?: string;
}

/**
 * InstanceSelector - UI component for selecting/switching instances
 *
 * Features:
 * - Dropdown showing all instances for a module
 * - "Create New Instance" button
 * - Display instance config summary
 * - Keyboard navigation support
 *
 * SPEC-C-I-006: Module can have zero or more instances
 * SPEC-C-I-008: Each instance configured independently
 */
export function InstanceSelector({
  portalId,
  moduleId,
  selectedInstanceId,
  onSelect,
  onCreate,
  label = 'Instance',
  placeholder = 'Select an instance',
}: InstanceSelectorProps) {
  const instances = useInstances(portalId, moduleId);
  const [isOpen, setIsOpen] = useState(false);

  const selectedInstance = instances.find(
    (inst) => inst.instanceId === selectedInstanceId
  );

  const handleSelect = (instanceId: string) => {
    onSelect?.(instanceId);
    setIsOpen(false);
  };

  const handleCreate = () => {
    onCreate?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 truncate">
            {selectedInstance ? (
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedInstance.instanceId}
                </div>
                {Object.keys(selectedInstance.config).length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Object.keys(selectedInstance.config).length} config{' '}
                    {Object.keys(selectedInstance.config).length === 1
                      ? 'key'
                      : 'keys'}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            )}
          </div>
          <svg
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Instances List */}
            {instances.length > 0 ? (
              <div className="py-1">
                {instances.map((instance) => (
                  <button
                    key={instance.instanceId}
                    type="button"
                    onClick={() => handleSelect(instance.instanceId)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      instance.instanceId === selectedInstanceId
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="font-medium">{instance.instanceId}</div>
                    {Object.keys(instance.config).length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Object.entries(instance.config)
                          .slice(0, 2)
                          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                          .join(', ')}
                        {Object.keys(instance.config).length > 2 && '...'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No instances found
              </div>
            )}

            {/* Create New Instance Button */}
            {onCreate && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full px-4 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create New Instance</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact Instance Selector (for inline use)
 */
export function InstanceSelectorCompact({
  portalId,
  moduleId,
  selectedInstanceId,
  onSelect,
  onCreate,
}: Omit<InstanceSelectorProps, 'label' | 'placeholder'>) {
  const instances = useInstances(portalId, moduleId);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (instanceId: string) => {
    onSelect?.(instanceId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="font-medium">
          {selectedInstanceId || 'Select instance'}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
            {instances.map((instance) => (
              <button
                key={instance.instanceId}
                type="button"
                onClick={() => handleSelect(instance.instanceId)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  instance.instanceId === selectedInstanceId
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : ''
                }`}
              >
                {instance.instanceId}
              </button>
            ))}
            {onCreate && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  type="button"
                  onClick={() => {
                    onCreate();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
