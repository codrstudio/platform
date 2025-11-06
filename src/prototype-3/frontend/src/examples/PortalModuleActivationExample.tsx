/**
 * Portal Module Activation Examples
 *
 * Demonstrates portal-scoped module activation/deactivation with dependency management.
 * Shows all features from the "Ativar módulos por portal" story.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-FU-006:012)
 * - SPEC-modules.md (SPEC-MO-LC-009:017, SPEC-MO-DE-005:011)
 */

import { useState } from 'react';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.js';
import { CheckCircle2, XCircle, Package, AlertTriangle } from 'lucide-react';
import { usePortalModules } from '../modules/setup/hooks/usePortalModules.js';
import ModuleActivationCard from '../modules/setup/components/ModuleActivationCard.js';

/**
 * Example 1: Listing Modules with Activation Status
 *
 * SPEC-MS-FU-006: List modules available
 * SPEC-MS-UI-017: Separate active vs available
 */
function Example1ListingModules() {
  const { modules, activeModules, inactiveModules, isLoading } = usePortalModules('main');

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Listing Modules</CardTitle>
        <CardDescription>
          Shows all modules with their activation status for the "main" portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Badge variant="outline">{modules.length} Total</Badge>
          <Badge variant="default">{activeModules.length} Active</Badge>
          <Badge variant="secondary">{inactiveModules.length} Available</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Active Modules:</h3>
          {activeModules.map((module) => (
            <div key={module.id} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{module.name}</span>
              <Badge variant="outline">{module.type}</Badge>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Available Modules:</h3>
          {inactiveModules.map((module) => (
            <div key={module.id} className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span>{module.name}</span>
              <Badge variant="secondary">{module.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Activating Module (Auto-Activates Dependencies)
 *
 * SPEC-MS-FU-007: Activate module in portal
 * SPEC-MS-FU-010: Auto-activate dependencies
 * SPEC-MO-DE-007: Auto-activate dependencies if not active
 */
function Example2ActivatingModule() {
  const { modules, activateModule, isLoading } = usePortalModules('main');
  const [result, setResult] = useState<string>('');
  const [isActivating, setIsActivating] = useState(false);

  // Find a module with dependencies to demonstrate
  const moduleToActivate = modules.find((m) => !m.isActive && m.dependsOn.length > 0);

  const handleActivate = async () => {
    if (!moduleToActivate) return;

    setIsActivating(true);
    setResult('');

    try {
      await activateModule(moduleToActivate.id);
      setResult(`Successfully activated ${moduleToActivate.name} and its dependencies!`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!moduleToActivate) {
    return (
      <Alert>
        <AlertTitle>No Module to Demonstrate</AlertTitle>
        <AlertDescription>
          All modules with dependencies are already active or no such modules exist.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Activating Module with Dependencies</CardTitle>
        <CardDescription>
          Demonstrates auto-activation of dependencies when activating a module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Module:</strong> {moduleToActivate.name}
          </p>
          <p className="text-sm">
            <strong>Dependencies:</strong> {moduleToActivate.dependsOn.join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            When you activate this module, all its dependencies will be activated automatically.
          </p>
        </div>

        <Button onClick={handleActivate} disabled={isActivating}>
          {isActivating ? 'Activating...' : 'Activate Module'}
        </Button>

        {result && (
          <Alert variant={result.startsWith('Error') ? 'destructive' : 'default'}>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Deactivating Module (Checks Dependents)
 *
 * SPEC-MS-FU-008: Deactivate module from portal
 * SPEC-MS-FU-011: Validate dependencies when deactivating
 * SPEC-MS-FU-012: List dependents when attempting deactivation
 * SPEC-MO-DE-010: All dependents must be deactivated first
 */
function Example3DeactivatingModule() {
  const { modules, deactivateModule, isLoading } = usePortalModules('main');
  const [result, setResult] = useState<string>('');
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Find an active module with dependents
  const moduleToDeactivate = modules.find(
    (m) => m.isActive && m.activeDependents.length > 0
  );

  const handleDeactivate = async () => {
    if (!moduleToDeactivate) return;

    setIsDeactivating(true);
    setResult('');

    try {
      await deactivateModule(moduleToDeactivate.id);
      setResult(`Successfully deactivated ${moduleToDeactivate.name}!`);
    } catch (error: any) {
      const dependents = error.dependents || [];
      setResult(
        `Cannot deactivate: ${dependents.length} module(s) depend on it [${dependents.join(', ')}]`
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!moduleToDeactivate) {
    return (
      <Alert>
        <AlertTitle>No Module to Demonstrate</AlertTitle>
        <AlertDescription>
          No active modules with dependents found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Deactivating Module with Dependents</CardTitle>
        <CardDescription>
          Shows validation preventing deactivation when dependents exist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Module:</strong> {moduleToDeactivate.name}
          </p>
          <p className="text-sm">
            <strong>Active Dependents:</strong> {moduleToDeactivate.activeDependents.join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            This module cannot be deactivated because other active modules depend on it.
          </p>
        </div>

        <Button onClick={handleDeactivate} disabled={isDeactivating} variant="destructive">
          {isDeactivating ? 'Deactivating...' : 'Try to Deactivate'}
        </Button>

        {result && (
          <Alert variant={result.startsWith('Cannot') ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Portal-Specific Activation
 *
 * Shows that same module can have different activation states per portal
 */
function Example4PortalSpecificActivation() {
  const mainPortal = usePortalModules('main');
  const setupPortal = usePortalModules('setup');

  if (mainPortal.isLoading || setupPortal.isLoading) return <div>Loading...</div>;

  // Find a module that has different states in different portals
  const moduleId = 'setup';
  const inMain = mainPortal.isModuleActive(moduleId);
  const inSetup = setupPortal.isModuleActive(moduleId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Portal-Specific Activation</CardTitle>
        <CardDescription>
          Same module can be active in one portal and inactive in another
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Portal: main</p>
              <p className="text-sm text-muted-foreground">Module: setup</p>
            </div>
            <Badge variant={inMain ? 'default' : 'secondary'}>
              {inMain ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Portal: setup</p>
              <p className="text-sm text-muted-foreground">Module: setup</p>
            </div>
            <Badge variant={inSetup ? 'default' : 'secondary'}>
              {inSetup ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Module activation is portal-scoped. The same module can have different activation
          states in different portals.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Using ModuleActivationCard Component
 *
 * Shows the full-featured card component for module activation
 */
function Example5ModuleActivationCard() {
  const { modules, activateModule, deactivateModule, isLoading } = usePortalModules('main');

  // Get first few modules to display
  const displayModules = modules.slice(0, 3);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Example 5: ModuleActivationCard Component</CardTitle>
          <CardDescription>
            Full-featured card with activation toggle, dependencies, and validation
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayModules.map((module) => (
          <ModuleActivationCard
            key={module.id}
            module={module}
            onActivate={activateModule}
            onDeactivate={deactivateModule}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main Example Component
 *
 * Renders all examples in a organized layout
 */
export default function PortalModuleActivationExample() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Portal Module Activation Examples
        </h1>
        <p className="text-muted-foreground mt-2">
          Interactive examples demonstrating module activation per portal with dependency management
        </p>
      </div>

      <div className="space-y-6">
        <Example1ListingModules />
        <Example2ActivatingModule />
        <Example3DeactivatingModule />
        <Example4PortalSpecificActivation />
        <Example5ModuleActivationCard />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-006:</strong> List all available modules with their metadata
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-007:</strong> Activate modules in portals via JQEL persistence
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-008:</strong> Deactivate modules from portals with validation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-009:</strong> Display module dependencies visually
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-010:</strong> Auto-activate dependencies with confirmation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-011:</strong> Validate dependencies before deactivation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>SPEC-MS-FU-012:</strong> List dependent modules preventing deactivation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Portal-Scoped:</strong> Same module different states per portal
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Runtime Activation:</strong> No page reload needed (SPEC-MO-LC-013)
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
