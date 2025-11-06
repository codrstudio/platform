/**
 * Dependency Resolution Dialog Component
 *
 * Displays module dependencies and offers automatic resolution.
 * Shows two different UIs:
 * 1. Circular dependency error (blocking)
 * 2. Normal resolution with activation order
 *
 * Features:
 * - Dependency tree visualization
 * - Activation order display
 * - Progress feedback during batch activation
 * - Circular dependency detection and blocking
 *
 * SPEC References:
 * - SPEC-MS-FU-010:012: Automatic dependency resolution
 * - SPEC-MO-DE-008: Circular dependency validation
 * - SPEC-MS-VA-009: Pre-activation validation
 */

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
import { DependencyGraph } from './DependencyGraph';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Module } from '../../../types/module';
import type { DependencyResolution } from '../utils/dependencyResolver';

interface DependencyResolutionDialogProps {
  targetModule: Module;
  resolution: DependencyResolution;
  portalId: string;
  allModules: Module[];
  activeModules: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isActivating: boolean;
}

/**
 * Dialog for resolving module dependencies before activation
 *
 * Handles two scenarios:
 * 1. Circular dependencies: Shows error and blocks activation
 * 2. Valid dependencies: Shows tree, order, and allows batch activation
 */
export function DependencyResolutionDialog({
  targetModule,
  resolution,
  portalId: _portalId,
  allModules,
  activeModules,
  isOpen,
  onClose,
  onConfirm,
  isActivating
}: DependencyResolutionDialogProps) {
  // Circular dependency error UI
  if (resolution.hasCircular) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Cannot Activate
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>Circular dependency detected:</p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm font-mono">
                  {resolution.circularPath?.join(' → ')} → {resolution.circularPath?.[0]}
                </div>
                <p className="text-sm">
                  This configuration is invalid. Contact administrator to fix module dependencies.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Normal resolution UI
  const totalToActivate = resolution.toActivate.length + 1; // +1 for target module

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Module with Dependencies</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>Target: <span className="font-medium text-foreground">{targetModule.name}</span></p>

              <div>
                <h4 className="text-sm font-medium mb-2 text-foreground">Dependency Tree:</h4>
                <DependencyGraph
                  rootModuleId={targetModule.moduleId}
                  modules={allModules}
                  activeModules={activeModules}
                />
              </div>

              {resolution.toActivate.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-foreground">Activation Order:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {resolution.order.map((moduleId) => {
                      const module = allModules.find(m => m.moduleId === moduleId);
                      return (
                        <li key={moduleId} className="text-muted-foreground">
                          {module?.name}
                        </li>
                      );
                    })}
                    <li className="text-foreground font-medium">{targetModule.name}</li>
                  </ol>
                </div>
              )}

              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <p>
                  {totalToActivate} {totalToActivate === 1 ? 'module' : 'modules'} will be activated
                  {resolution.alreadyActive.length > 0 && (
                    <span className="text-muted-foreground">
                      {' '}({resolution.alreadyActive.length} already active)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isActivating}
          >
            {isActivating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating {totalToActivate} {totalToActivate === 1 ? 'Module' : 'Modules'}...
              </>
            ) : (
              `Activate ${totalToActivate} ${totalToActivate === 1 ? 'Module' : 'Modules'}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
