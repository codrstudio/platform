/**
 * Module Loading Examples
 *
 * Demonstrates different ways to load modules dynamically.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-*, SPEC-MO-PE-*)
 * - SPEC-architecture.md (SPEC-A-LL-*)
 *
 * Story 1.5.3: Load modules dynamically
 */

import { useState } from 'react';
import { ModuleLoader } from '../components/modules/ModuleLoader';
import { useModuleLoader, useModulePreloader } from '../hooks/useModuleLoader';
import { moduleLoader } from '../core/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Package, CheckCircle, XCircle } from 'lucide-react';

/**
 * Example 1: Using ModuleLoader Component (Render Props Pattern)
 *
 * Easiest way to load modules with automatic loading/error states.
 *
 * SPEC-MO-LC-001: Module loaded when needed
 * SPEC-MO-LC-003: Asynchronous loading
 * SPEC-MO-LC-004: Graceful error handling
 */
function Example1_ComponentPattern() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: ModuleLoader Component</CardTitle>
        <CardDescription>
          Render props pattern with automatic loading and error handling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModuleLoader moduleId="setup">
          {(module) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Module Loaded</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {module.manifest.id}</p>
                <p><strong>Name:</strong> {module.manifest.name}</p>
                <p><strong>Version:</strong> {module.manifest.version}</p>
                <p><strong>Type:</strong> {module.manifest.type}</p>
                <p><strong>Routes:</strong> {module.routes?.length || 0}</p>
              </div>
            </div>
          )}
        </ModuleLoader>
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Using useModuleLoader Hook (Hook Pattern)
 *
 * More control over loading process and state management.
 *
 * SPEC-MO-LC-007: Fast initialization (non-blocking)
 */
function Example2_HookPattern() {
  const { module, isLoading, error, state, retry } = useModuleLoader('setup');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: useModuleLoader Hook</CardTitle>
        <CardDescription>
          Hook pattern for more control over loading states
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={
            state === 'loaded' ? 'default' :
            state === 'loading' ? 'secondary' :
            state === 'error' ? 'destructive' :
            'outline'
          }>
            {state.toUpperCase()}
          </Badge>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading module...</span>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Load Failed</span>
            </div>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" onClick={retry}>
              Retry
            </Button>
          </div>
        )}

        {module && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Module Loaded</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {module.manifest.name}</p>
              <p><strong>Version:</strong> {module.manifest.version}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Manual Loading (Imperative Pattern)
 *
 * Direct use of moduleLoader for imperative loading.
 * Useful for programmatic loading based on user actions.
 */
function Example3_ImperativePattern() {
  const [loadState, setLoadState] = useState<string>('idle');
  const [moduleInfo, setModuleInfo] = useState<string>('');

  const handleLoad = async () => {
    setLoadState('loading');
    setModuleInfo('');

    try {
      const module = await moduleLoader.loadModule('setup');
      setLoadState('loaded');
      setModuleInfo(
        `Loaded: ${module.manifest.name} v${module.manifest.version}`
      );
    } catch (error) {
      setLoadState('error');
      setModuleInfo(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Imperative Loading</CardTitle>
        <CardDescription>
          Direct moduleLoader usage for manual control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleLoad}
          disabled={loadState === 'loading'}
        >
          {loadState === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Load Module
            </>
          )}
        </Button>

        {moduleInfo && (
          <div className="text-sm">
            <Badge variant={loadState === 'loaded' ? 'default' : 'destructive'}>
              {loadState}
            </Badge>
            <p className="mt-2">{moduleInfo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Module Preloading
 *
 * Eager loading of critical modules on app mount.
 *
 * SPEC-A-LL-002: Only active modules are loaded
 */
function Example4_PreloadingPattern() {
  // Preload critical modules
  useModulePreloader(['setup', 'auth', 'notifications']);

  const stats = moduleLoader.getStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Module Preloading</CardTitle>
        <CardDescription>
          Eager loading of critical modules (check console logs)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>Loader Statistics:</strong></p>
          <div className="grid grid-cols-2 gap-2">
            <div>Total: {stats.total}</div>
            <div>Loaded: {stats.loaded}</div>
            <div>Loading: {stats.loading}</div>
            <div>Errors: {stats.error}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Lazy Loading State Management
 *
 * Demonstrates caching behavior and load state tracking.
 */
function Example5_CachingBehavior() {
  const [moduleId] = useState('setup');
  const isLoaded = moduleLoader.isLoaded(moduleId);
  const isLoading = moduleLoader.isLoading(moduleId);
  const loadState = moduleLoader.getLoadState(moduleId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 5: Caching Behavior</CardTitle>
        <CardDescription>
          Shows module load state and caching status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span><strong>Module ID:</strong></span>
            <code className="font-mono bg-muted px-2 py-1 rounded">{moduleId}</code>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span>Loaded:</span>{' '}
              <Badge variant={isLoaded ? 'default' : 'secondary'}>
                {isLoaded ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <span>Loading:</span>{' '}
              <Badge variant={isLoading ? 'secondary' : 'outline'}>
                {isLoading ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="col-span-2">
              <span>State:</span>{' '}
              <Badge>{loadState}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Example Component
 *
 * Showcases all module loading patterns in one view.
 */
export function ModuleLoadingExample() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Module Loading Examples</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates various patterns for loading modules dynamically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Example1_ComponentPattern />
        <Example2_HookPattern />
        <Example3_ImperativePattern />
        <Example4_PreloadingPattern />
        <Example5_CachingBehavior />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Concepts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Lazy Loading (SPEC-MO-LC-002):</strong> Modules loaded with dynamic import()
          </div>
          <div>
            <strong>Code Splitting (SPEC-A-LL-004):</strong> Each module becomes separate chunk
          </div>
          <div>
            <strong>Caching:</strong> Loaded modules cached to prevent duplicate loads
          </div>
          <div>
            <strong>Error Handling (SPEC-MO-LC-004):</strong> Graceful degradation with retry
          </div>
          <div>
            <strong>Non-Blocking (SPEC-MO-LC-007):</strong> Async loading doesn't block UI
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModuleLoadingExample;
