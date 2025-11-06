/**
 * Portal Modules Page
 *
 * Manage module activation for a specific portal.
 * Lists all available modules with their activation status and allows
 * activating/deactivating modules with dependency management.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-016 to SPEC-MS-UI-021)
 * - SPEC-module-setup.md (SPEC-MS-FU-006:012)
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button.js';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert.js';
import { Badge } from '../../../components/ui/badge.js';
import ModuleActivationCard from '../components/ModuleActivationCard.js';
import { usePortalModules } from '../hooks/usePortalModules.js';

/**
 * Portal Modules Page Component
 *
 * SPEC-MS-UI-016: Show modules available
 * SPEC-MS-UI-017: Separate active vs available
 * SPEC-MS-FU-006: List modules available
 * SPEC-MS-FU-007: Activate module in portal
 * SPEC-MS-FU-008: Deactivate module from portal
 */
export default function PortalModules() {
  const { portalId } = useParams<{ portalId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');

  // Get portal modules data
  const {
    portal,
    modules,
    activeModules,
    inactiveModules,
    isLoading,
    error,
    activateModule,
    deactivateModule,
  } = usePortalModules(portalId || '');

  // Filter modules based on search and filter type
  const filteredModules = (() => {
    let result = modules;

    // Apply type filter
    // SPEC-MS-UI-017: Separate active vs available
    if (filterType === 'active') {
      result = activeModules;
    } else if (filterType === 'inactive') {
      result = inactiveModules;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.manifest.description?.toLowerCase().includes(query)
      );
    }

    return result;
  })();

  // Loading state
  // SPEC-MS-LO-001: Show skeleton loader during loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/setup/portals">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portals
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/setup/portals">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portals
            </Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertTitle>Error Loading Portal</AlertTitle>
          <AlertDescription>
            Failed to load portal data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Portal not found
  if (!portal) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/setup/portals">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portals
            </Button>
          </Link>
        </div>

        <Alert>
          <AlertTitle>Portal Not Found</AlertTitle>
          <AlertDescription>
            Portal with ID "{portalId}" does not exist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* SPEC-MS-UI-002: Show breadcrumb */}
      {/* SPEC-MS-UI-003: Allow returning to previous page */}
      <div className="flex items-center gap-4">
        <Link to="/setup/portals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portals
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Modules for {portal.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage module activation and configuration for this portal.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-base py-1">
          {activeModules.length} Active
        </Badge>
        <Badge variant="secondary" className="text-base py-1">
          {inactiveModules.length} Available
        </Badge>
        <Badge variant="secondary" className="text-base py-1">
          {modules.length} Total
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter buttons */}
        {/* SPEC-MS-UI-017: Separate active vs available */}
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All ({modules.length})
          </Button>
          <Button
            variant={filterType === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterType('active')}
          >
            Active ({activeModules.length})
          </Button>
          <Button
            variant={filterType === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilterType('inactive')}
          >
            Available ({inactiveModules.length})
          </Button>
        </div>
      </div>

      {/* Module Grid */}
      {/* SPEC-MS-UI-016: Show modules available */}
      {/* SPEC-MS-UI-018: Show name, type, version, dependencies */}
      {filteredModules.length === 0 ? (
        // SPEC-MS-LO-005: Empty state with appropriate message
        <Alert>
          <AlertTitle>No Modules Found</AlertTitle>
          <AlertDescription>
            {searchQuery
              ? `No modules match your search "${searchQuery}".`
              : `No ${filterType} modules available.`}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => (
            <ModuleActivationCard
              key={module.id}
              module={module}
              onActivate={activateModule}
              onDeactivate={deactivateModule}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
