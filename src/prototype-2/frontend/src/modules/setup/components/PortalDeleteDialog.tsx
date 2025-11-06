/**
 * PortalDeleteDialog Component
 *
 * Confirmation dialog for portal deletion with clear consequences display.
 * Implements destructive action pattern with warnings per SPEC-module-setup.md.
 *
 * Features:
 * - Shows portal name and consequences before deletion
 * - Displays affected modules and instances count
 * - Loading state during deletion
 * - Accessibility attributes (WCAG 2.1 AA compliant)
 * - Cannot be closed during deletion operation
 * - Dark mode support
 */

import { AlertTriangle, Loader2 } from 'lucide-react';
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
import type { Portal } from '../../../types/portal';

export interface PortalDeleteDialogProps {
  portal: Portal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function PortalDeleteDialog({
  portal,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: PortalDeleteDialogProps) {
  const activeModuleCount = portal.activeModules?.length || 0;

  /**
   * Handle dialog close
   * Prevent closing during deletion operation
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (isDeleting) {
      // Don't allow closing during deletion
      return;
    }
    onOpenChange(newOpen);
  };

  /**
   * Handle delete confirmation
   * Calls parent's onConfirm handler
   */
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Warning Icon + Title */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
          </div>

          {/* Consequences Description */}
          <AlertDialogDescription>
            <span className="block">
              You are about to delete the portal{' '}
              <strong className="font-semibold text-gray-900 dark:text-gray-100">
                {portal.name}
              </strong>
              .
            </span>

            <span className="mt-4 block">This will:</span>

            {/* Consequences List */}
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Deactivate {activeModuleCount} {activeModuleCount === 1 ? 'module' : 'modules'}
              </li>
              <li>Remove all associated instances</li>
              <li>Delete all portal configuration settings</li>
            </ul>

            {/* Warning Text */}
            <strong className="mt-4 block text-red-600 dark:text-red-400">
              This action cannot be undone.
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Action Buttons */}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            aria-label={isDeleting ? 'Deleting portal...' : 'Confirm delete portal'}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Delete Portal'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
