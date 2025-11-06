/**
 * Module Activation Toggle Component
 *
 * UI component for activating/deactivating modules with dependency validation.
 * Shows loading states, errors, and dependent module warnings.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-009 to SPEC-MO-LC-017)
 * - SPEC-module-loading.md (SPEC-LOAD-D-*)
 *
 * Story: Activate and deactivate modules
 */

import { useState } from 'react';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import {
  useModuleActivation,
  useActivateModule,
  useDeactivateModule,
  useModuleDependencies,
} from '../../hooks/useModuleActivation';

/**
 * Props for ModuleActivationToggle
 */
export interface ModuleActivationToggleProps {
  /** Portal ID */
  portalId: string;

  /** Module ID */
  moduleId: string;

  /** Module display name */
  moduleName?: string;

  /** Whether the component is disabled */
  disabled?: boolean;

  /** Callback when activation state changes */
  onActivationChange?: (isActive: boolean) => void;

  /** Callback when error occurs */
  onError?: (error: string) => void;
}

/**
 * ModuleActivationToggle - Toggle switch for module activation
 *
 * Features:
 * - Toggle switch for activate/deactivate
 * - Shows loading state during operations
 * - Displays validation errors
 * - Confirmation dialog for deactivation with dependents
 * - Shows dependency information
 *
 * SPEC-MO-LC-009: Runtime activation downloads immediately
 * SPEC-MO-LC-013: No page reload needed
 * SPEC-MO-DE-010: Deactivation checks for dependents
 * SPEC-MO-DE-011: Lists dependents when attempting deactivation
 *
 * Example:
 * ```tsx
 * <ModuleActivationToggle
 *   portalId="main"
 *   moduleId="chat"
 *   moduleName="Chat Module"
 *   onActivationChange={(active) => console.log('Active:', active)}
 * />
 * ```
 */
export function ModuleActivationToggle({
  portalId,
  moduleId,
  moduleName,
  disabled = false,
  onActivationChange,
  onError,
}: ModuleActivationToggleProps) {
  // State
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Hooks
  const state = useModuleActivation(portalId, moduleId);
  const { activate, loading: activating, error: activateError } = useActivateModule();
  const { deactivate, loading: deactivating, error: deactivateError, dependents } = useDeactivateModule();
  const { dependencies } = useModuleDependencies(moduleId);

  // Combined loading state
  const loading = activating || deactivating;

  // Combined error
  const error = activateError || deactivateError;

  // Display name
  const displayName = moduleName || moduleId;

  /**
   * Handle toggle change
   */
  const handleToggle = async (checked: boolean) => {
    // Clear previous success message
    setShowSuccessMessage(false);

    if (checked) {
      // Activate module
      await handleActivate();
    } else {
      // Check for dependents before deactivating
      if (state.dependents.length > 0) {
        // Show confirmation dialog
        setShowDeactivateDialog(true);
      } else {
        // Deactivate directly
        await handleDeactivate(false);
      }
    }
  };

  /**
   * Handle activation
   */
  const handleActivate = async () => {
    try {
      await activate(portalId, moduleId);
      setShowSuccessMessage(true);
      onActivationChange?.(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to activate module';
      onError?.(errorMsg);
    }
  };

  /**
   * Handle deactivation
   */
  const handleDeactivate = async (force: boolean) => {
    try {
      await deactivate(portalId, moduleId, force);
      setShowSuccessMessage(true);
      setShowDeactivateDialog(false);
      onActivationChange?.(false);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to deactivate module';
      onError?.(errorMsg);
      setShowDeactivateDialog(false);
    }
  };

  /**
   * Handle force deactivate from dialog
   */
  const handleForceDeactivate = async () => {
    await handleDeactivate(true);
  };

  return (
    <div className="space-y-2">
      {/* Toggle Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={state.isActive}
            onCheckedChange={handleToggle}
            disabled={disabled || loading || !state.canActivate}
            aria-label={`Toggle ${displayName}`}
          />

          <span className="text-sm font-medium">
            {displayName}
          </span>

          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {showSuccessMessage && !loading && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {state.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Dependencies Info */}
      {dependencies.length > 0 && (
        <div className="text-xs text-muted-foreground pl-10">
          Depends on: {dependencies.join(', ')}
        </div>
      )}

      {/* Dependents Warning */}
      {state.dependents.length > 0 && state.isActive && (
        <div className="flex items-start gap-2 pl-10 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            {state.dependents.length} module(s) depend on this: {state.dependents.join(', ')}
          </span>
        </div>
      )}

      {/* Validation Error */}
      {!state.canActivate && !state.isActive && (
        <div className="flex items-start gap-2 pl-10 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{state.validationError}</span>
        </div>
      )}

      {/* Operation Error */}
      {error && (
        <div className="flex items-start gap-2 pl-10 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && !error && (
        <div className="text-xs text-green-600 pl-10">
          {state.isActive ? 'Module activated successfully' : 'Module deactivated successfully'}
        </div>
      )}

      {/* Deactivation Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {displayName}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This module has {dependents.length} active dependent module(s) that rely on it:
              </p>

              <ul className="list-disc list-inside space-y-1 text-sm">
                {dependents.map((depId) => (
                  <li key={depId}>{depId}</li>
                ))}
              </ul>

              <p className="text-destructive font-medium">
                Deactivating this module will also deactivate all dependent modules.
              </p>

              <p className="text-xs text-muted-foreground">
                Note: Modules remain in memory until page refresh. Routes and components will stop working after deactivation.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDeactivate}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Compact version without dependencies info
 */
export function ModuleActivationToggleCompact({
  portalId,
  moduleId,
  moduleName,
  disabled = false,
  onActivationChange,
}: Omit<ModuleActivationToggleProps, 'onError'>) {
  const state = useModuleActivation(portalId, moduleId);
  const { activate, loading: activating } = useActivateModule();
  const { deactivate, loading: deactivating } = useDeactivateModule();

  const loading = activating || deactivating;
  const displayName = moduleName || moduleId;

  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await activate(portalId, moduleId);
        onActivationChange?.(true);
      } else {
        // Force deactivation in compact mode (no dialog)
        await deactivate(portalId, moduleId, true);
        onActivationChange?.(false);
      }
    } catch (err) {
      console.error('Activation toggle failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={state.isActive}
        onCheckedChange={handleToggle}
        disabled={disabled || loading || !state.canActivate}
        aria-label={`Toggle ${displayName}`}
      />

      {loading && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
