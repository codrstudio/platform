/**
 * PlatformProvider Usage Example
 *
 * This file demonstrates how to use the PlatformProvider and usePlatform hook
 * in components. This is an EXAMPLE ONLY and not part of the application.
 *
 * Based on Task 1.9 (SISTEMA 1.9: Estado Frontend)
 */

import { usePlatform } from '../providers/PlatformProvider';

/**
 * Example component using the platform context
 */
export function PortalSwitcher() {
  const {
    portals,
    currentPortal,
    isLoading,
    error,
    setCurrentPortal,
  } = usePlatform();

  if (isLoading) {
    return <div>Loading portals...</div>;
  }

  if (error) {
    return <div>Error loading portals: {error.message}</div>;
  }

  return (
    <div>
      <h2>Available Portals</h2>
      <p>Current Portal: {currentPortal}</p>

      <ul>
        {portals.map((portal) => (
          <li key={portal.portalId}>
            <button
              onClick={() => setCurrentPortal(portal.portalId)}
              disabled={portal.portalId === currentPortal}
            >
              {portal.name}
            </button>
            <span>
              ({portal.activeModules.length} active modules)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example component displaying active modules
 */
export function ActiveModulesList() {
  const {
    currentPortal,
    getActiveModulesForPortal,
  } = usePlatform();

  const currentModules = getActiveModulesForPortal(currentPortal);

  return (
    <div>
      <h2>Active Modules in {currentPortal}</h2>
      <ul>
        {currentModules.map((moduleId) => (
          <li key={moduleId}>{moduleId}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example component tracking loaded modules
 */
export function LoadedModulesTracker() {
  const {
    loadedModules,
    isModuleLoaded,
    markModuleLoaded,
    markModuleUnloaded,
  } = usePlatform();

  const handleLoadModule = (moduleId: string) => {
    // Simulate module loading
    console.log(`Loading module: ${moduleId}`);
    markModuleLoaded(moduleId);
  };

  const handleUnloadModule = (moduleId: string) => {
    // Simulate module unloading
    console.log(`Unloading module: ${moduleId}`);
    markModuleUnloaded(moduleId);
  };

  return (
    <div>
      <h2>Loaded Modules</h2>
      <p>Total loaded: {loadedModules.size}</p>

      <div>
        <h3>Check Module Status</h3>
        <p>setup: {isModuleLoaded('setup') ? 'Loaded' : 'Not loaded'}</p>
        <p>auth: {isModuleLoaded('auth') ? 'Loaded' : 'Not loaded'}</p>
      </div>

      <div>
        <h3>Actions</h3>
        <button onClick={() => handleLoadModule('test-module')}>
          Load Test Module
        </button>
        <button onClick={() => handleUnloadModule('test-module')}>
          Unload Test Module
        </button>
      </div>
    </div>
  );
}

/**
 * Complete example component combining all features
 */
export function PlatformDashboard() {
  const {
    portals,
    currentPortal,
    loadedModules,
    getActiveModulesForPortal,
    isLoading,
    error,
  } = usePlatform();

  if (isLoading) {
    return <div>Loading platform configuration...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Platform Dashboard</h1>

      <section>
        <h2>Platform State</h2>
        <dl>
          <dt>Total Portals:</dt>
          <dd>{portals.length}</dd>

          <dt>Current Portal:</dt>
          <dd>{currentPortal}</dd>

          <dt>Loaded Modules:</dt>
          <dd>{loadedModules.size}</dd>

          <dt>Active Modules in Current Portal:</dt>
          <dd>{getActiveModulesForPortal(currentPortal).length}</dd>
        </dl>
      </section>

      <PortalSwitcher />
      <ActiveModulesList />
      <LoadedModulesTracker />
    </div>
  );
}
