/**
 * PortalCard Component
 *
 * Displays individual portal information with action buttons.
 * Used within PortalList to show portal configurations.
 *
 * Features:
 * - Shows portal name, description, route path, and module count
 * - Displays non-removable indicator for system portals
 * - Provides Edit, Delete, and Configure Modules actions
 * - Dark mode support with theme-aware styling
 * - Responsive layout
 */

import { Shield, Edit2, Trash2, Settings } from 'lucide-react';
import type { Portal } from '../../../types/portal';

interface PortalCardProps {
  portal: Portal;
  onEdit: (portalId: string) => void;
  onDelete: (portalId: string) => void;
  onConfigureModules: (portalId: string) => void;
}

export function PortalCard({ portal, onEdit, onDelete, onConfigureModules }: PortalCardProps) {
  const activeModuleCount = portal.activeModules?.length || 0;

  return (
    <article
      role="listitem"
      aria-label={`Portal ${portal.name}`}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Header: Portal Name + Non-removable Indicator */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h2
            id={`portal-${portal.portalId}`}
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
          >
            {portal.name}
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-500">
            ID: {portal.portalId}
          </p>
        </div>

        {/* Non-removable indicator */}
        {!portal.removable && (
          <div
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            title="System portal - cannot be removed"
          >
            <Shield className="h-3 w-3" />
            <span>System</span>
          </div>
        )}
      </div>

      {/* Body: Description and Metadata */}
      <div className="mb-4 space-y-3">
        {/* Description */}
        {portal.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{portal.description}</p>
        )}

        {/* Route Path Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-500">Route:</span>
          <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {portal.path}
          </code>
        </div>

        {/* Active Modules Count */}
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {activeModuleCount} {activeModuleCount === 1 ? 'module' : 'modules'} active
          </span>
        </div>
      </div>

      {/* Footer: Action Buttons */}
      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(portal.portalId)}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          aria-describedby={`portal-${portal.portalId}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>

        {/* Delete Button - disabled for non-removable portals */}
        <button
          onClick={() => onDelete(portal.portalId)}
          disabled={!portal.removable}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
          aria-describedby={`portal-${portal.portalId}`}
          title={!portal.removable ? 'System portals cannot be deleted' : 'Delete portal'}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>

        {/* Configure Modules Button */}
        <button
          onClick={() => onConfigureModules(portal.portalId)}
          className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
          aria-describedby={`portal-${portal.portalId}`}
        >
          <Settings className="h-3.5 w-3.5" />
          Modules
        </button>
      </div>
    </article>
  );
}
