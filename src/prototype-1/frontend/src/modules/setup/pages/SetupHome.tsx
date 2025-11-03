/**
 * Setup Home Page
 * Overview of platform configuration
 * SPEC-MS-SH-* compliance
 */

import { Link } from 'react-router-dom';
import { useJQEL } from '@/services/jqel/jqelHooks';
import { moduleRegistry } from '@/core/modules/ModuleRegistry';
import type { Portal } from '@/core/portals/types';

export function SetupHome() {
  // Fetch portals count
  const { data: portalsResult, isLoading: loadingPortals } = useJQEL<Portal[]>({
    schema: 'backend',
    select: 'portal',
  });

  // Get registered modules count
  const registeredModulesCount = moduleRegistry.size;

  // Calculate active modules count
  const activeModulesCount =
    portalsResult?.data?.reduce((count, portal) => {
      return count + (portal.activeModules?.length || 0);
    }, 0) || 0;

  const portalsCount = portalsResult?.data?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Setup & Configuration</h1>
          <p className="text-muted-foreground">
            Manage platform portals, modules, and instances
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portals Card */}
          <Link
            to="/setup/portals"
            className="bg-card p-6 rounded-lg border hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Portals</h2>
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2">
              {loadingPortals ? '...' : portalsCount}
            </div>
            <p className="text-sm text-muted-foreground">
              Active portals in platform
            </p>
          </Link>

          {/* Modules Card */}
          <Link
            to="/setup/modules"
            className="bg-card p-6 rounded-lg border hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Modules</h2>
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2">{registeredModulesCount}</div>
            <p className="text-sm text-muted-foreground">
              Registered modules available
            </p>
          </Link>

          {/* Active Modules Card */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Instances</h2>
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2">
              {loadingPortals ? '...' : activeModulesCount}
            </div>
            <p className="text-sm text-muted-foreground">
              Module instances across portals
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/setup/portals"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <div>
                <div className="font-medium">Create Portal</div>
                <div className="text-sm text-muted-foreground">
                  Add a new portal to the platform
                </div>
              </div>
            </Link>

            <Link
              to="/setup/modules"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <div>
                <div className="font-medium">Manage Modules</div>
                <div className="text-sm text-muted-foreground">
                  Activate or deactivate modules
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Platform Version:</span>
              <span className="ml-2 font-mono">1.0.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <span className="ml-2 font-mono">{import.meta.env.MODE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
