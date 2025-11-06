import { useState, useMemo } from 'react';
import type { Module } from '../../../types/module';
import { ModuleStatusBadge } from './ModuleStatusBadge';
import { ModuleActivationDialog } from './ModuleActivationDialog';
import { ModuleDeactivationDialog } from './ModuleDeactivationDialog';
import { DependencyGraph } from './DependencyGraph';
import { useModuleActivation } from '../hooks/useModuleActivation';
import { useModuleDeactivation } from '../hooks/useModuleDeactivation';
import { useInstances } from '../../../hooks/jqel/useInstanceQueries';
import { usePortals } from '../../../hooks/jqel/usePortalQueries';
import { useModules } from '../../../hooks/jqel/useModuleQueries';
import { Package, Workflow, GitBranch } from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  selectedPortalId?: string;
}

export function ModuleCard({ module, selectedPortalId }: ModuleCardProps) {
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [showDependencyTree, setShowDependencyTree] = useState(false);

  const { activateModule, isActivating } = useModuleActivation();
  const { deactivateModule, checkDependents, isDeactivating } = useModuleDeactivation();
  const { data: instances = [] } = useInstances();
  const { data: portals = [] } = usePortals();
  const { data: allModules = [] } = useModules();

  const Icon = module.type === 'components' ? Package : Workflow;

  const isActiveInPortal = useMemo(() => {
    if (!selectedPortalId) return module.active;
    return module.portals?.includes(selectedPortalId) || false;
  }, [module, selectedPortalId]);

  const selectedPortal = useMemo(() => {
    return portals?.find(p => p.portalId === selectedPortalId);
  }, [portals, selectedPortalId]);

  const instanceCount = useMemo(() => {
    if (!selectedPortalId) return 0;
    return (instances || []).filter(
      i => i.moduleId === module.moduleId && i.portalId === selectedPortalId
    ).length;
  }, [instances, module.moduleId, selectedPortalId]);

  const dependents = useMemo(() => {
    if (!selectedPortalId) return [];
    return checkDependents(module.moduleId, selectedPortalId);
  }, [module.moduleId, selectedPortalId, checkDependents]);

  const handleActivate = async (portalId: string) => {
    await activateModule(module.moduleId, portalId);
    setIsActivateDialogOpen(false);
  };

  const handleDeactivate = async () => {
    if (!selectedPortalId) return;
    await deactivateModule(module.moduleId, selectedPortalId);
    setIsDeactivateDialogOpen(false);
  };

  return (
    <>
      <div className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Icon className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium">{module.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {module.type === 'components'
                ? 'Re-exports specialized component libraries'
                : 'Platform configuration and management tools'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            {module.type === 'components' ? 'Components' : 'Functionality'}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded">
            v{module.version}
          </span>
          {isActiveInPortal && <ModuleStatusBadge active={true} />}
        </div>

        {module.dependencies && module.dependencies.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="w-4 h-4" />
              <span>{module.dependencies.length} {module.dependencies.length === 1 ? 'dependency' : 'dependencies'}</span>
            </div>
            <details className="mt-2" open={showDependencyTree} onToggle={(e) => setShowDependencyTree((e.target as HTMLDetailsElement).open)}>
              <summary className="cursor-pointer text-xs text-primary hover:underline list-none">
                {showDependencyTree ? 'Hide dependency tree' : 'View dependency tree'}
              </summary>
              <div className="mt-2">
                <DependencyGraph
                  rootModuleId={module.moduleId}
                  modules={allModules || []}
                  activeModules={selectedPortalId ? ((portals || []).find(p => p.portalId === selectedPortalId)?.activeModules || []) : []}
                  compact
                />
              </div>
            </details>
          </div>
        )}

        <div className="mt-4">
          {isActiveInPortal && selectedPortalId ? (
            <button
              onClick={() => setIsDeactivateDialogOpen(true)}
              disabled={isDeactivating}
              className="w-full px-4 py-2 text-sm font-medium text-destructive border border-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate from Portal'}
            </button>
          ) : (
            <button
              onClick={() => setIsActivateDialogOpen(true)}
              disabled={isActivating}
              className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isActivating ? 'Activating...' : 'Activate in Portal...'}
            </button>
          )}
        </div>
      </div>

      <ModuleActivationDialog
        module={module}
        isOpen={isActivateDialogOpen}
        onClose={() => setIsActivateDialogOpen(false)}
        onConfirm={handleActivate}
        isActivating={isActivating}
      />

      {selectedPortalId && selectedPortal && (
        <ModuleDeactivationDialog
          module={module}
          portalName={selectedPortal.name}
          dependentModules={dependents}
          instanceCount={instanceCount}
          isOpen={isDeactivateDialogOpen}
          onClose={() => setIsDeactivateDialogOpen(false)}
          onConfirm={handleDeactivate}
          isDeactivating={isDeactivating}
        />
      )}
    </>
  );
}
