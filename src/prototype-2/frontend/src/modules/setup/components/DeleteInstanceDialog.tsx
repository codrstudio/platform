/**
 * DeleteInstanceDialog Component
 *
 * Confirmation dialog for deleting instances.
 * Follows SPEC-MS-FB-001:004 - Destructive actions require confirmation.
 *
 * Features:
 * - Modal dialog with focus trap
 * - Clear warning message
 * - Loading state during deletion
 * - Keyboard navigation support (Escape to cancel, Enter to confirm)
 * - Accessible ARIA attributes
 *
 * Based on SPEC-module-setup.md SPEC-MS-FB-001:004
 */

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../../../components/ui/alert-dialog';

export interface DeleteInstanceDialogProps {
  /**
   * Instance ID to delete
   */
  instanceId: string;

  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Callback when user confirms deletion
   * Should be an async function that performs the deletion
   */
  onConfirm: () => Promise<void>;

  /**
   * Whether deletion is in progress
   */
  isDeleting: boolean;
}

/**
 * DeleteInstanceDialog - Confirmation dialog for instance deletion
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const deleteInstance = useDeleteInstance();
 *
 * const handleConfirm = async () => {
 *   await deleteInstance.mutateAsync(instanceId);
 * };
 *
 * <DeleteInstanceDialog
 *   instanceId="chat-1"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleConfirm}
 *   isDeleting={deleteInstance.isPending}
 * />
 * ```
 */
export function DeleteInstanceDialog({
  instanceId,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteInstanceDialogProps) {
  // Handle confirm with error boundary
  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await onConfirm();
    } catch (error) {
      // Error handled by parent component (toast notification)
      console.error('Failed to delete instance:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Instance?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete instance <strong>"{instanceId}"</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>

        {/* Screen reader announcement */}
        {isDeleting && (
          <div
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            Deleting instance...
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
