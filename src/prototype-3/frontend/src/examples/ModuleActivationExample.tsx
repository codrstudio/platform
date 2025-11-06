/**
 * Module Activation Examples
 *
 * Examples demonstrating module activation and deactivation functionality.
 * Shows various scenarios including dependencies, validation, and runtime activation.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-009 to SPEC-MO-LC-017)
 * - SPEC-module-loading.md (SPEC-LOAD-D-*)
 *
 * Story: Activate and deactivate modules
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Info, Zap } from 'lucide-react';
import {
  ModuleActivationToggle,
  ModuleActivationToggleCompact,
} from '../components/modules/ModuleActivationToggle';
import {
  useActiveModules,
  useActivateModule,
  useModuleDependencies,
  useModuleActivation,
} from '../hooks/useModuleActivation';
import activationManager from '../core/modules/ActivationManager';

/**
 * Example 1: Basic Activation Toggle
 *
 * Demonstrates:
 * - Simple toggle switch for activate/deactivate
 * - Loading states during operations
 * - Success/error feedback
 */
export function Example1_BasicToggle() {
  const [activated, setActivated] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Basic Activation Toggle</CardTitle>
        <CardDescription>
          Simple toggle to activate/deactivate a module with loading and error states
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModuleActivationToggle
          portalId="main"
          moduleId="setup"
          moduleName="Setup Module"
          onActivationChange={(active) => setActivated(active)}
          onError={(error) => console.error('Activation error:', error)}
        />

        {activated && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Module Activated</AlertTitle>
            <AlertDescription>
              The setup module is now active and its routes/components are available.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Module with Dependencies
 *
 * Demonstrates:
 * - Activating module loads dependencies automatically
 * - Dependency information displayed
 * - Validation prevents activation if dependencies missing
 */
export function Example2_WithDependencies() {
  const portalId = 'main';
  const moduleId = 'chat'; // Assume chat depends on media-components and export-components

  const state = useModuleActivation(portalId, moduleId);
  const { dependencies, dependents } = useModuleDependencies(moduleId);
  const { activate, loading, activated } = useActivateModule();

  const handleActivate = async () => {
    try {
      await activate(portalId, moduleId);
    } catch (error) {
      console.error('Failed to activate:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Module with Dependencies</CardTitle>
        <CardDescription>
          Activation automatically loads and activates dependencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Module Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Chat Module</span>
            <Badge variant={state.isActive ? 'default' : 'secondary'}>
              {state.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {dependencies.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <strong>Dependencies:</strong> {dependencies.join(', ')}
            </div>
          )}

          {dependents.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <strong>Dependents:</strong> {dependents.join(', ')}
            </div>
          )}
        </div>

        <Separator />

        {/* Activation Button */}
        <div className="space-y-2">
          <Button
            onClick={handleActivate}
            disabled={loading || state.isActive || !state.canActivate}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading module and dependencies...
              </>
            ) : state.isActive ? (
              'Already Active'
            ) : (
              'Activate Chat Module'
            )}
          </Button>

          {!state.canActivate && !state.isActive && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cannot Activate</AlertTitle>
              <AlertDescription>{state.validationError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Activated Modules */}
        {activated.length > 0 && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>Modules Activated</AlertTitle>
            <AlertDescription>
              The following modules were activated: {activated.join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Deactivation with Dependents
 *
 * Demonstrates:
 * - Deactivation checks for active dependents
 * - Warning about dependent modules
 * - Confirmation dialog before deactivation
 */
export function Example3_DeactivationWithDependents() {
  // Assume media-components is active and chat depends on it
  const portalId = 'main';
  const moduleId = 'media-components';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Deactivation with Dependents</CardTitle>
        <CardDescription>
          System warns about dependent modules before deactivation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Scenario</AlertTitle>
          <AlertDescription>
            Attempting to deactivate a module that other modules depend on will show a confirmation dialog.
          </AlertDescription>
        </Alert>

        <ModuleActivationToggle
          portalId={portalId}
          moduleId={moduleId}
          moduleName="Media Components"
          onActivationChange={(active) => console.log('Active:', active)}
        />

        <div className="text-sm text-muted-foreground">
          Try deactivating this module. If other modules depend on it, you'll see a confirmation dialog.
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Runtime Activation
 *
 * Demonstrates:
 * - Activating module downloads code in background
 * - No page reload needed
 * - Routes and components immediately available
 */
export function Example4_RuntimeActivation() {
  const portalId = 'main';
  const moduleId = 'notifications';

  const state = useModuleActivation(portalId, moduleId);
  const { activate, loading } = useActivateModule();

  const handleRuntimeActivate = async () => {
    try {
      console.log('Starting runtime activation...');
      await activate(portalId, moduleId);
      console.log('Module activated! Routes are now available.');
    } catch (error) {
      console.error('Runtime activation failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Runtime Activation</CardTitle>
        <CardDescription>
          Activate module at runtime without page reload (hot activation)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertTitle>Hot Activation</AlertTitle>
          <AlertDescription>
            Module code is downloaded in the background. Once loaded, routes and components are immediately available without page reload.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Button
            onClick={handleRuntimeActivate}
            disabled={loading || state.isActive}
            className="w-full"
            variant={state.isActive ? 'outline' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading and activating...
              </>
            ) : state.isActive ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Module Active
              </>
            ) : (
              'Activate Notifications Module'
            )}
          </Button>

          {state.isActive && (
            <p className="text-xs text-green-600">
              Module is now active! Try navigating to /notifications (if routes exist).
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Portal-Scoped Activation
 *
 * Demonstrates:
 * - Same module can be active in one portal and inactive in another
 * - Activation state is portal-specific
 * - Independent control per portal
 */
export function Example5_PortalScopedActivation() {
  const moduleId = 'dashboard';
  const portals = ['main', 'setup', 'admin'];

  const activeModules = {
    main: useActiveModules('main'),
    setup: useActiveModules('setup'),
    admin: useActiveModules('admin'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 5: Portal-Scoped Activation</CardTitle>
        <CardDescription>
          Same module can have different activation states in different portals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Portal Isolation</AlertTitle>
          <AlertDescription>
            Each portal maintains independent activation state. Activating a module in "main" does not affect "setup" portal.
          </AlertDescription>
        </Alert>

        {portals.map((portalId) => (
          <div key={portalId} className="space-y-2">
            <div className="font-medium text-sm">Portal: {portalId}</div>
            <ModuleActivationToggleCompact
              portalId={portalId}
              moduleId={moduleId}
              moduleName="Dashboard Module"
            />
            <div className="text-xs text-muted-foreground pl-8">
              Active modules in this portal: {activeModules[portalId as keyof typeof activeModules].join(', ') || 'None'}
            </div>
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Validation and Error Handling
 *
 * Demonstrates:
 * - Validation prevents activation if dependencies missing
 * - Circular dependencies detected
 * - Clear error messages
 */
export function Example6_ValidationErrors() {
  const portalId = 'main';

  // Assume this module has missing dependencies or circular deps
  const problematicModuleId = 'broken-module';

  const state = useModuleActivation(portalId, problematicModuleId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 6: Validation and Error Handling</CardTitle>
        <CardDescription>
          System validates dependencies and shows clear error messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Problematic Module</span>
            <Badge variant="destructive">Cannot Activate</Badge>
          </div>

          {!state.canActivate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Failed</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{state.validationError}</p>

                {state.missingDependencies.length > 0 && (
                  <div>
                    <strong>Missing dependencies:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {state.missingDependencies.map((dep) => (
                        <li key={dep}>{dep}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {state.circularDependencies.length > 0 && (
                  <div>
                    <strong>Circular dependencies:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {state.circularDependencies.map((cycle, idx) => (
                        <li key={idx}>{cycle.join(' → ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 7: Programmatic Activation
 *
 * Demonstrates:
 * - Direct use of ActivationManager API
 * - Batch activation of multiple modules
 * - Fine-grained control
 */
export function Example7_ProgrammaticActivation() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBatchActivate = async () => {
    setLoading(true);
    setResult('');

    try {
      const modules = ['media-components', 'export-components', 'chat'];
      const results = [];

      for (const moduleId of modules) {
        const res = await activationManager.activateModule('main', moduleId);
        results.push(`${moduleId}: ${res.success ? 'OK' : 'FAILED'}`);
      }

      setResult(results.join('\n'));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStats = () => {
    const stats = activationManager.getStats();
    setResult(JSON.stringify(stats, null, 2));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 7: Programmatic Activation</CardTitle>
        <CardDescription>
          Using ActivationManager API directly for advanced control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleBatchActivate} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Batch Activate Modules'
            )}
          </Button>

          <Button onClick={handleGetStats} variant="outline">
            Get Stats
          </Button>
        </div>

        {result && (
          <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
            {result}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Examples Component
 */
export function ModuleActivationExamples() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Module Activation Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating module activation and deactivation with dependency management
        </p>
      </div>

      <Separator />

      <Example1_BasicToggle />
      <Example2_WithDependencies />
      <Example3_DeactivationWithDependents />
      <Example4_RuntimeActivation />
      <Example5_PortalScopedActivation />
      <Example6_ValidationErrors />
      <Example7_ProgrammaticActivation />
    </div>
  );
}

export default ModuleActivationExamples;
