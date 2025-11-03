/**
 * Module List Component
 * Displays list of registered modules
 * SPEC-MS-ML-* compliance
 */

import { useEffect, useState } from 'react';
import { moduleRegistry } from '@/core/modules/ModuleRegistry';
import { moduleLoader } from '@/core/modules/ModuleLoader';
import { useJQEL } from '@/services/jqel/jqelHooks';
import type { ModuleManifest } from '@/core/modules/types';
import type { Portal } from '@/core/portals/types';

interface ModuleListProps {
  onActivate?: (moduleId: string, portalId: string) => void;
  onDeactivate?: (moduleId: string, portalId: string) => void;
}

export function ModuleList({ onActivate, onDeactivate }: ModuleListProps) {
  const [modules, setModules] = useState<ModuleManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: portalsResult } = useJQEL<Portal[]>({
    schema: 'backend',
    select: 'portal',
  });

  const portals = portalsResult?.data || [];

  useEffect(() => {
    const loadModules = async () => {
      const moduleIds = moduleRegistry.list();
      const loadedModules: ModuleManifest[] = [];

      for (const moduleId of moduleIds) {
        try {
          const manifest = await moduleLoader.loadModule(moduleId);
          loadedModules.push(manifest);
        } catch (error) {
          console.error(`Failed to load module ${moduleId}:`, error);
        }
      }

      setModules(loadedModules);
      setIsLoading(false);
    };

    loadModules();
  }, []);

  const getPortalsUsingModule = (moduleId: string): Portal[] => {
    return portals.filter((portal) =>
      portal.activeModules?.includes(moduleId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border">
        <p className="text-muted-foreground">No modules registered</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => {
        const activePortals = getPortalsUsingModule(module.moduleId);

        return (
          <div key={module.moduleId} className="bg-card rounded-lg border p-6">
            {/* Module Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{module.name}</h3>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {module.moduleId}
                </code>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  module.type === 'functionality'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-purple-500/10 text-purple-600'
                }`}
              >
                {module.type}
              </span>
            </div>

            {/* Module Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono">{module.version}</span>
              </div>

              {module.dependencies.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-muted-foreground">Dependencies:</span>
                  <span className="text-xs">
                    {module.dependencies.join(', ')}
                  </span>
                </div>
              )}

              {module.exports.routes && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <span className="text-muted-foreground">Routes:</span>
                  <span>{module.exports.routes.length}</span>
                </div>
              )}
            </div>

            {/* Active in Portals */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Active in Portals:</div>
              {activePortals.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">
                  Not active in any portal
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {activePortals.map((portal) => (
                    <span
                      key={portal.portalId}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {portal.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {(onActivate || onDeactivate) && (
              <div className="pt-4 border-t flex gap-2">
                {onActivate && (
                  <button
                    onClick={() => {
                      const portalId = prompt(
                        'Enter portal ID to activate this module:'
                      );
                      if (portalId) {
                        onActivate(module.moduleId, portalId);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Activate
                  </button>
                )}
                {onDeactivate && activePortals.length > 0 && (
                  <button
                    onClick={() => {
                      const portalId = prompt(
                        'Enter portal ID to deactivate this module:'
                      );
                      if (portalId) {
                        onDeactivate(module.moduleId, portalId);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded hover:bg-accent transition-colors"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
