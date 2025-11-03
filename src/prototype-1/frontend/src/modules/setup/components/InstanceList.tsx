/**
 * Instance List Component
 * Displays list of module instances
 * SPEC-MS-IL-* compliance
 */

import type { ModuleInstance } from '@/core/modules/types';

interface InstanceListProps {
  portalId: string;
  moduleId: string;
  onEdit?: (instance: ModuleInstance) => void;
  onDelete?: (instance: ModuleInstance) => void;
}

export function InstanceList({
  portalId,
  moduleId,
  onEdit,
  onDelete,
}: InstanceListProps) {
  // TODO: Fetch instances from backend when implemented
  // For now, return placeholder

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 text-muted-foreground mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">Module Instances</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Module instances allow you to configure the same module differently in
          different contexts.
        </p>
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded inline-block">
          <p>
            <strong>Portal:</strong> <code>{portalId}</code>
          </p>
          <p>
            <strong>Module:</strong> <code>{moduleId}</code>
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4 italic">
          Instance management coming soon...
        </p>
      </div>
    </div>
  );
}
