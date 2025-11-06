/**
 * Dependency Management Examples
 *
 * Demonstrates automatic dependency loading, circular dependency detection,
 * parallel loading visualization, and dependency tree display.
 *
 * Story 1.5.4: Manage dependencies
 */

import { useState } from 'react';
import { useDependencies, useDependents } from '../hooks/useDependencies';
import moduleLoader from '../core/modules/ModuleLoader';
import moduleRegistry from '../core/modules/ModuleRegistry';

/**
 * Example 1: Automatic Dependency Loading
 *
 * Demonstrates that dependencies are loaded automatically before the target module.
 */
function AutomaticDependencyLoadingExample() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const loadModule = async (moduleId: string) => {
    setLoading(true);
    setResult('');

    try {
      console.log(`Loading module: ${moduleId}`);
      await moduleLoader.loadModule(moduleId);
      setResult(`✓ Successfully loaded "${moduleId}" with all dependencies`);
    } catch (error) {
      setResult(`✗ Failed to load "${moduleId}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">1. Automatic Dependency Loading</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Try loading "test-module" which depends on "setup". The setup module will be loaded automatically.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => loadModule('test-module')}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load test-module'}
        </button>
        <button
          onClick={() => loadModule('setup')}
          disabled={loading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load setup'}
        </button>
      </div>

      {result && (
        <div className={`p-3 rounded-md ${result.startsWith('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result}
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Circular Dependency Detection
 *
 * Shows how circular dependencies are detected and prevented.
 */
function CircularDependencyDetectionExample() {
  const moduleId = 'setup'; // Use existing module
  const { isResolved, hasCycles, cycles, missing } = useDependencies(moduleId);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">2. Circular Dependency Detection</h3>
      <p className="text-sm text-muted-foreground mb-4">
        The dependency manager detects circular dependencies and prevents module loading.
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Module:</span>
          <code className="px-2 py-1 bg-muted rounded text-sm">{moduleId}</code>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Resolution Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${isResolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isResolved ? '✓ Resolved' : '✗ Failed'}
          </span>
        </div>

        {hasCycles && (
          <div className="mt-2 p-3 bg-red-50 text-red-800 rounded-md">
            <div className="font-medium mb-1">Circular Dependencies Detected:</div>
            {cycles.map((cycle, idx) => (
              <div key={idx} className="text-sm font-mono">
                {cycle.join(' → ')}
              </div>
            ))}
          </div>
        )}

        {missing.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 rounded-md">
            <div className="font-medium mb-1">Missing Dependencies:</div>
            <div className="text-sm">{missing.join(', ')}</div>
          </div>
        )}

        {isResolved && !hasCycles && (
          <div className="mt-2 p-3 bg-green-50 text-green-800 rounded-md text-sm">
            ✓ No circular dependencies detected
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Dependency Load Order Visualization
 *
 * Shows the topologically sorted load order for a module.
 */
function LoadOrderVisualizationExample() {
  const [moduleId, setModuleId] = useState('test-module');
  const { loadOrder, isResolved } = useDependencies(moduleId);
  const registeredModules = moduleRegistry.getAllModules().map(m => m.manifest.id);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">3. Load Order Visualization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Modules are loaded in topological order: dependencies first, then dependents.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Module:</label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {registeredModules.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {isResolved ? (
        <div className="space-y-2">
          <div className="font-medium text-sm">Load Order:</div>
          <div className="flex flex-wrap gap-2">
            {loadOrder.map((id, idx) => (
              <div key={id} className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-mono">
                  {idx + 1}. {id}
                </span>
                {idx < loadOrder.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
          ✗ Cannot determine load order (check dependencies)
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Dependency Tree Display
 *
 * Visual representation of dependency tree.
 */
function DependencyTreeExample() {
  const [moduleId, setModuleId] = useState('test-module');
  const { tree } = useDependencies(moduleId);
  const registeredModules = moduleRegistry.getAllModules().map(m => m.manifest.id);

  const renderTree = (node: any, depth = 0): JSX.Element => {
    if (!node) return <div>No dependencies</div>;

    return (
      <div className={depth > 0 ? 'ml-6 mt-2' : ''}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{depth > 0 ? '└─' : '📦'}</span>
          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
            {node.module}
          </code>
        </div>
        {node.dependencies && node.dependencies.length > 0 && (
          <div className="ml-4 border-l-2 border-muted pl-2">
            {node.dependencies.map((dep: any, idx: number) => (
              <div key={idx}>{renderTree(dep, depth + 1)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">4. Dependency Tree</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Visual representation of module dependency hierarchy.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Module:</label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {registeredModules.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-muted/50 rounded-md">
        {renderTree(tree)}
      </div>
    </div>
  );
}

/**
 * Example 5: Dependent Modules
 *
 * Shows which modules depend on a given module.
 */
function DependentsExample() {
  const [moduleId, setModuleId] = useState('setup');
  const dependents = useDependents(moduleId);
  const registeredModules = moduleRegistry.getAllModules().map(m => m.manifest.id);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">5. Dependent Modules</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Shows which modules depend on the selected module.
        Useful for determining impact of deactivation.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Module:</label>
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {registeredModules.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="font-medium text-sm">
          Modules that depend on "{moduleId}":
        </div>
        {dependents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dependents.map((id) => (
              <span key={id} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm font-mono">
                {id}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No modules depend on this module
          </div>
        )}
        {dependents.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
            ⚠️ To deactivate "{moduleId}", you must first deactivate: {dependents.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Example Component
 */
export function DependencyExample() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dependency Management Examples</h1>
        <p className="text-muted-foreground">
          Demonstrates the module dependency system with automatic loading,
          circular dependency detection, and visualization.
        </p>
      </div>

      <div className="space-y-6">
        <AutomaticDependencyLoadingExample />
        <CircularDependencyDetectionExample />
        <LoadOrderVisualizationExample />
        <DependencyTreeExample />
        <DependentsExample />
      </div>

      <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg">
        <h3 className="font-semibold mb-2">Implementation Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Dependencies are resolved using topological sorting (Kahn's algorithm)</li>
          <li>Circular dependencies are detected using depth-first search</li>
          <li>Load order is deterministic (same input produces same output)</li>
          <li>Modules without dependencies load first</li>
          <li>Missing dependencies prevent module loading</li>
          <li>Future optimization: parallel loading of independent modules</li>
        </ul>
      </div>
    </div>
  );
}

export default DependencyExample;
