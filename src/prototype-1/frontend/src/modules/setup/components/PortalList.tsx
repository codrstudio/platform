/**
 * Portal List Component
 * Displays list of portals in a table
 * SPEC-MS-PL-* compliance
 */

import { useJQEL } from '@/services/jqel/jqelHooks';
import type { Portal } from '@/core/portals/types';

interface PortalListProps {
  onEdit?: (portal: Portal) => void;
  onDelete?: (portal: Portal) => void;
}

export function PortalList({ onEdit, onDelete }: PortalListProps) {
  const { data: result, isLoading, error } = useJQEL<Portal[]>({
    schema: 'backend',
    select: 'portal',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
        <p className="text-destructive">Failed to load portals: {error.message}</p>
      </div>
    );
  }

  const portals = result?.data || [];

  if (portals.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border">
        <p className="text-muted-foreground">No portals found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Portal ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Path</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Active Modules
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Removable</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {portals.map((portal) => (
              <tr key={portal.portalId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {portal.portalId}
                  </code>
                </td>
                <td className="px-4 py-3 font-medium">{portal.name}</td>
                <td className="px-4 py-3">
                  <code className="text-sm">{portal.path}</code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {portal.activeModules?.length || 0}
                    </span>
                    {portal.activeModules && portal.activeModules.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {portal.activeModules.map((moduleId) => (
                          <span
                            key={moduleId}
                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                          >
                            {moduleId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {portal.removable ? (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-muted-foreground">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(portal)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Edit portal"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {onDelete && portal.removable && (
                      <button
                        onClick={() => onDelete(portal)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Delete portal"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
