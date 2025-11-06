import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { usePortals } from '../../../hooks/jqel/usePortalQueries';
import { useModules } from '../../../hooks/jqel/useModuleQueries';
import { useModuleActivation } from '../hooks/useModuleActivation';
import { DependencyResolutionDialog } from './DependencyResolutionDialog';
import { resolveDependencies, type DependencyResolution } from '../utils/dependencyResolver';
import { queryKeys } from '../../../services/jqel/queryKeys';
import { toast } from '../../../hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Module } from '../../../types/module';

export interface ModuleActivationDialogProps {
  module: Module;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (portalId: string) => void;
  isActivating: boolean;
}

/**
 * Dialog for activating a module in a portal
 *
 * Features:
 * - Portal selection dropdown
 * - Dependencies warning (if module has dependencies)
 * - Automatic dependency resolution
 * - Loading state during activation
 * - Keyboard navigation support
 * - ARIA attributes for accessibility
 */
export function ModuleActivationDialog({
  module,
  isOpen,
  onClose,
  onConfirm,
  isActivating,
}: ModuleActivationDialogProps) {
  const [selectedPortalId, setSelectedPortalId] = useState('');
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState<DependencyResolution | null>(null);
  const [isBatchActivating, setIsBatchActivating] = useState(false);

  const queryClient = useQueryClient();
  const { data: portals = [] } = usePortals();
  const { data: allModules = [] } = useModules();
  const { activateModule: activateModuleFn } = useModuleActivation();

  const hasDependencies = module.dependencies && module.dependencies.length > 0;

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPortalId('');
      setShowResolutionDialog(false);
      setResolution(null);
      setIsBatchActivating(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedPortalId) return;

    // Check if module has dependencies
    if (!hasDependencies || !module.dependencies || module.dependencies.length === 0) {
      // No dependencies, proceed with simple activation
      onConfirm(selectedPortalId);
      return;
    }

    // Get portal data
    const portal = (portals || []).find(p => p.portalId === selectedPortalId);
    if (!portal) {
      toast({
        title: 'Error',
        description: 'Portal not found',
        variant: 'error',
      });
      return;
    }

    // Resolve dependencies
    try {
      const res = resolveDependencies(module.moduleId, selectedPortalId, allModules || [], portal);
      setResolution(res);

      if (res.hasCircular || res.toActivate.length > 0) {
        // Show resolution dialog
        setShowResolutionDialog(true);
      } else {
        // All dependencies already active, proceed with simple activation
        onConfirm(selectedPortalId);
      }
    } catch (error) {
      toast({
        title: 'Dependency resolution failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  /**
   * Handle batch activation of dependencies + target module
   */
  const handleBatchActivation = async () => {
    if (!resolution || !selectedPortalId) return;

    setIsBatchActivating(true);

    try {
      // Activate dependencies in topological order
      for (const depModuleId of resolution.order) {
        await activateModuleFn(depModuleId, selectedPortalId);
      }

      // Then activate target module
      await activateModuleFn(module.moduleId, selectedPortalId);

      // Success
      const totalActivated = resolution.toActivate.length + 1;
      const activatedNames = [
        ...resolution.order.map(id => (allModules || []).find(m => m.moduleId === id)?.name || id),
        module.name
      ];

      toast({
        title: 'Modules activated',
        description: `Successfully activated ${totalActivated} module${totalActivated > 1 ? 's' : ''}: ${activatedNames.join(', ')}`,
        variant: 'success',
        duration: 5000,
      });

      // Close dialogs
      setShowResolutionDialog(false);
      onClose();
    } catch (error) {
      // Error handling with rollback
      toast({
        title: 'Batch activation failed',
        description: error instanceof Error ? error.message : 'Failed to activate modules. Changes may have been partially applied.',
        variant: 'error',
        duration: 5000,
      });

      // Close resolution dialog, keep activation dialog open for retry
      setShowResolutionDialog(false);

      // Invalidate queries to refresh state
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.portals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.backend.modules() });
    } finally {
      setIsBatchActivating(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen && !showResolutionDialog} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Module</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>You are about to activate:</p>
              <p className="font-medium text-foreground">{module.name}</p>

              <div>
                <label htmlFor="portal-select" className="block text-sm font-medium mb-2 text-foreground">
                  Select target portal:
                </label>
                <select
                  id="portal-select"
                  value={selectedPortalId}
                  onChange={(e) => setSelectedPortalId(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isActivating}
                >
                  <option value="">Select portal...</option>
                  {(portals || []).map((portal) => (
                    <option key={portal.portalId} value={portal.portalId}>
                      {portal.name} ({portal.portalId})
                    </option>
                  ))}
                </select>
              </div>

              {hasDependencies && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                        Dependencies Required
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        This module depends on:
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        {module.dependencies.map((dep) => (
                          <li key={dep}>{dep}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        Dependencies will be automatically resolved and activated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm">
                This will make the module's features available in the selected portal.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={!selectedPortalId || isActivating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {resolution && selectedPortalId && (
        <DependencyResolutionDialog
          targetModule={module}
          resolution={resolution}
          portalId={selectedPortalId}
          allModules={allModules || []}
          activeModules={(portals || []).find(p => p.portalId === selectedPortalId)?.activeModules || []}
          isOpen={showResolutionDialog}
          onClose={() => {
            setShowResolutionDialog(false);
            setResolution(null);
          }}
          onConfirm={handleBatchActivation}
          isActivating={isBatchActivating}
        />
      )}
    </>
  );
}
