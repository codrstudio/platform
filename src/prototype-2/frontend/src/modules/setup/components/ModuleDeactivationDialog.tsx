import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import type { Module } from '../../../types/module';

interface ModuleDeactivationDialogProps {
  module: Module;
  portalName: string;
  dependentModules: string[];
  instanceCount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeactivating: boolean;
}

export function ModuleDeactivationDialog({
  module,
  portalName,
  dependentModules,
  instanceCount,
  isOpen,
  onClose,
  onConfirm,
  isDeactivating
}: ModuleDeactivationDialogProps) {
  const hasBlockingDependents = dependentModules.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Deactivate Module
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>You are about to deactivate:</p>
            <p className="font-medium text-foreground mt-1">{module.name}</p>
            <p className="text-sm">from portal: <span className="font-medium">{portalName}</span></p>
          </div>

          {hasBlockingDependents && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex gap-2">
                <X className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200 text-sm">
                    Cannot Deactivate
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    The following modules depend on this module and must be deactivated first:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mt-2">
                    {dependentModules.map((dep) => (
                      <li key={dep}>{dep}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Deactivate these modules first, then try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasBlockingDependents && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                    Warning: Consequences
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                    <li>Module features will become unavailable in this portal</li>
                    <li>{instanceCount} {instanceCount === 1 ? 'instance' : 'instances'} will be deleted</li>
                  </ul>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
                    This action cannot be undone. Deleted instances cannot be recovered.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {hasBlockingDependents ? (
            <AlertDialogCancel>Close</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                disabled={isDeactivating}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeactivating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Deactivate'
                )}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
