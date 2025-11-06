/**
 * Module Activation Card Component
 *
 * Displays a module with its activation status, dependencies, and toggle control.
 * Provides visual feedback for activation state and dependency information.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-016:021)
 * - SPEC-modules.md (SPEC-MO-DE-005:011)
 */

import { useState } from 'react';
import { Badge } from '../../../components/ui/badge.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Switch } from '../../../components/ui/switch.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog.js';
import { AlertTriangle, CheckCircle2, XCircle, Package } from 'lucide-react';
import type { ModuleWithStatus } from '../hooks/usePortalModules.js';

/**
 * Props for ModuleActivationCard
 */
export interface ModuleActivationCardProps {
  /** Module with activation status */
  module: ModuleWithStatus;

  /** Callback when activation toggle is clicked */
  onActivate: (moduleId: string) => Promise<void>;

  /** Callback when deactivation toggle is clicked */
  onDeactivate: (moduleId: string) => Promise<void>;

  /** Loading state */
  isLoading?: boolean;
}

/**
 * ModuleActivationCard Component
 *
 * SPEC-MS-UI-016: Show modules available
 * SPEC-MS-UI-017: Separate active vs available
 * SPEC-MS-UI-018: Show name, type, version, dependencies
 * SPEC-MS-UI-019: Indicate dependencies visually
 * SPEC-MS-UI-020: Toggle for activate/deactivate
 * SPEC-MS-UI-021: Alert when deactivating module with dependents
 *
 * @example
 * ```tsx
 * <ModuleActivationCard
 *   module={moduleWithStatus}
 *   onActivate={handleActivate}
 *   onDeactivate={handleDeactivate}
 * />
 * ```
 */
export default function ModuleActivationCard({
  module,
  onActivate,
  onDeactivate,
  isLoading = false,
}: ModuleActivationCardProps) {
  const [showDependentsDialog, setShowDependentsDialog] = useState(false);
  const [showDependenciesDialog, setShowDependenciesDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle toggle change
   *
   * SPEC-MS-UI-020: Toggle for activate/deactivate module
   * SPEC-MS-FU-010: Show list of dependencies that will be auto-activated
   * SPEC-MS-FU-012: Show list of dependents when attempting deactivation
   */
  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Activating
      // SPEC-MS-FU-010: If module has dependencies, show confirmation
      if (module.dependsOn.length > 0 && !module.isActive) {
        setShowDependenciesDialog(true);
      } else {
        await handleActivation();
      }
    } else {
      // Deactivating
      // SPEC-MS-UI-021: Alert when deactivating module with dependents
      if (module.activeDependents.length > 0) {
        setShowDependentsDialog(true);
      } else {
        await handleDeactivation();
      }
    }
  };

  /**
   * Execute activation
   *
   * SPEC-MS-FU-007: Activate module in portal
   * SPEC-MS-FU-010: Auto-activate dependencies
   */
  const handleActivation = async () => {
    try {
      setIsProcessing(true);
      await onActivate(module.id);
      setShowDependenciesDialog(false);
    } catch (error) {
      console.error('Failed to activate module:', error);
      // Error handling will be done by parent component or error boundary
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Execute deactivation
   *
   * SPEC-MS-FU-008: Deactivate module from portal
   * SPEC-MS-VA-008: Dependents must be deactivated first
   */
  const handleDeactivation = async () => {
    try {
      setIsProcessing(true);
      await onDeactivate(module.id);
      setShowDependentsDialog(false);
    } catch (error) {
      console.error('Failed to deactivate module:', error);
      // Error handling will be done by parent component or error boundary
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get module type badge variant
   */
  const getTypeBadgeVariant = (type: string) => {
    return type === 'components' ? 'secondary' : 'default';
  };

  /**
   * Get dependency status icon
   */
  const getDependencyIcon = (depId: string) => {
    // Check if dependency is active (we assume it is if we can activate this module)
    const isActive = !module.missingDependencies.includes(depId);
    return isActive ? (
      <CheckCircle2 className="h-3 w-3 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 text-red-600" />
    );
  };

  return (
    <>
      {/* SPEC-MS-UI-016: Show modules available */}
      {/* SPEC-MS-UI-018: Show name, type, version, dependencies */}
      <Card className={module.isActive ? 'border-green-200 bg-green-50' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {module.name}
                {/* SPEC-MS-UI-017: Indicate active vs available */}
                {module.isActive && (
                  <Badge variant="outline" className="ml-2 border-green-600 text-green-600">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {module.manifest.description || 'No description'}
              </CardDescription>
            </div>

            {/* SPEC-MS-UI-020: Toggle for activate/deactivate */}
            <Switch
              checked={module.isActive}
              onCheckedChange={handleToggle}
              disabled={isLoading || isProcessing || (!module.isActive && !module.canActivate)}
              aria-label={`${module.isActive ? 'Deactivate' : 'Activate'} ${module.name}`}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Module metadata */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={getTypeBadgeVariant(module.type)}>{module.type}</Badge>
            <span>v{module.version}</span>
            {module.manifest.author && <span>by {module.manifest.author}</span>}
          </div>

          {/* SPEC-MS-UI-019: Indicate dependencies visually */}
          {/* SPEC-MS-FU-009: Show dependencies of modules */}
          {module.dependsOn.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Dependencies:</p>
              <div className="flex flex-wrap gap-2">
                {module.dependsOn.map((depId) => (
                  <Badge key={depId} variant="outline" className="flex items-center gap-1">
                    {getDependencyIcon(depId)}
                    {depId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Show missing dependencies warning */}
          {module.missingDependencies.length > 0 && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Missing dependencies</p>
                <p className="text-xs mt-1">
                  Required: {module.missingDependencies.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Show dependents (when module is active) */}
          {module.isActive && module.dependedBy.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Used by:</p>
              <div className="flex flex-wrap gap-2">
                {module.dependedBy.map((depId) => (
                  <Badge key={depId} variant="secondary">
                    {depId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Show active dependents warning */}
          {module.activeDependents.length > 0 && (
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  {module.activeDependents.length} active dependent(s)
                </p>
                <p className="text-xs mt-1">
                  Deactivate these first: {module.activeDependents.join(', ')}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground">
          Module ID: {module.id}
          {module.manifest.category && ` • Category: ${module.manifest.category}`}
        </CardFooter>
      </Card>

      {/* SPEC-MS-UI-021: Alert when deactivating module with dependents */}
      {/* SPEC-MS-FU-012: List dependents when attempting deactivation */}
      <AlertDialog open={showDependentsDialog} onOpenChange={setShowDependentsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Cannot Deactivate Module
            </AlertDialogTitle>
            <AlertDialogDescription>
              The module <strong>{module.name}</strong> cannot be deactivated because{' '}
              <strong>{module.activeDependents.length}</strong> active module(s) depend on it.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <p className="text-sm font-medium mb-2">Active dependents:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {module.activeDependents.map((depId) => (
                <li key={depId}>{depId}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Please deactivate these modules first before deactivating <strong>{module.name}</strong>.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDependentsDialog(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SPEC-MS-FU-010: Show dependencies that will be auto-activated */}
      <AlertDialog open={showDependenciesDialog} onOpenChange={setShowDependenciesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Module with Dependencies</AlertDialogTitle>
            <AlertDialogDescription>
              The module <strong>{module.name}</strong> requires{' '}
              <strong>{module.dependsOn.length}</strong> dependency module(s) to be active.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <p className="text-sm font-medium mb-2">Dependencies that will be activated:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {module.dependsOn.map((depId) => (
                <li key={depId}>{depId}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              These dependencies will be automatically activated along with <strong>{module.name}</strong>.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDependenciesDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleActivation} disabled={isProcessing}>
              {isProcessing ? 'Activating...' : 'Activate All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
