/**
 * Setup Dashboard Page
 *
 * Main dashboard for the Setup module showing overview
 * of portals, modules, and instances.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-*)
 * - SPEC-modules.md (SPEC-MO-CO-*)
 */

import { Link } from 'react-router-dom';
import { Settings, Layout, Package, Layers } from 'lucide-react';

/**
 * Setup Dashboard Component
 * SPEC-MS-RO-002: Main route component for Setup module
 * SPEC-MS-UI-001: Clear navigation between sections
 */
export default function SetupDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Setup</h1>
        <p className="text-muted-foreground">
          Configure portals, modules, and instances for your platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portals Card - SPEC-MS-UI-004 */}
        <Link
          to="/portals"
          className="block p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <Layout className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Portals</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage isolated sub-applications within the platform
          </p>
        </Link>

        {/* Modules Card - SPEC-MS-UI-016 */}
        <Link
          to="/portals"
          className="block p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Modules</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Activate and configure modules for each portal
          </p>
        </Link>

        {/* Instances Card - SPEC-MS-UI-022 */}
        <Link
          to="/portals"
          className="block p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <Layers className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Instances</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Create multiple configurations of activated modules
          </p>
        </Link>

        {/* Platform Settings Card - SPEC-MS-PS-001 */}
        <Link
          to="/platform-settings"
          className="block p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <Settings className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Platform Settings</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            View platform configuration and service health
          </p>
        </Link>
      </div>

      {/* Quick Stats - SPEC-MS-UI-005 */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Portals</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Modules</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Instances</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Stats will be loaded dynamically via JQEL queries
        </p>
      </div>
    </div>
  );
}
