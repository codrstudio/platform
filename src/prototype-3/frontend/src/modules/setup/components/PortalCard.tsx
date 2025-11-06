/**
 * Portal Card Component
 *
 * Card component for displaying portal information with actions.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-005, SPEC-MS-UI-006, SPEC-MS-UI-008)
 * - SPEC-concepts.md (SPEC-C-P-019 to SPEC-C-P-022)
 */

import { Link } from 'react-router-dom';
import { Edit, Trash2, Package, Lock, Settings } from 'lucide-react';
import { Portal } from '../../../types/portal.js';
import { Badge } from '../../../components/ui/badge.js';
import { Button } from '../../../components/ui/button.js';

/**
 * Props for PortalCard component
 */
interface PortalCardProps {
  /**
   * Portal to display
   */
  portal: Portal;

  /**
   * Callback when delete button is clicked
   */
  onDelete: (portal: Portal) => void;
}

/**
 * Portal Card Component
 *
 * SPEC-MS-UI-005: Show portal information
 * SPEC-MS-UI-006: Indicate non-removable portals visually
 * SPEC-MS-UI-008: Provide edit/delete/configure actions
 */
export default function PortalCard({ portal, onDelete }: PortalCardProps) {
  // SPEC-C-P-021: Portal "main" cannot be removed (removable=false)
  const isRemovable = portal.portalId !== 'main' && (portal.removable ?? true);
  const isMainPortal = portal.portalId === 'main';

  // Count active modules
  const activeModulesCount = portal.activeModules?.length || 0;

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Portal Header - SPEC-MS-UI-005 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{portal.name || portal.portalId}</h3>

            {/* SPEC-MS-UI-006: Visually indicate portal "main" (not removable) */}
            {isMainPortal && (
              <Lock
                className="h-4 w-4 text-muted-foreground"
                aria-label="Main portal - not removable"
              />
            )}

            {/* Active status badge */}
            {portal.active && (
              <Badge variant="default" className="text-xs">Active</Badge>
            )}
            {!portal.active && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>

          {/* Portal ID (if different from name) */}
          {portal.name && portal.name !== portal.portalId && (
            <p className="text-xs text-muted-foreground mb-1">ID: {portal.portalId}</p>
          )}

          {/* Portal route */}
          <p className="text-sm text-muted-foreground">
            Route: {portal.portalId === 'main' ? '/' : `/${portal.portalId}`}
          </p>

          {/* Portal description */}
          {portal.description && (
            <p className="text-sm text-muted-foreground mt-2">{portal.description}</p>
          )}
        </div>
      </div>

      {/* Portal Stats - SPEC-MS-UI-005: Show active modules */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {activeModulesCount} {activeModulesCount === 1 ? 'module' : 'modules'} active
          </span>
        </div>

        {/* Settings key info */}
        {portal.settingsKey && portal.settingsKey !== 'default' && (
          <div className="flex items-center gap-2 text-sm mt-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">
              Theme: {portal.settingsKey}
            </span>
          </div>
        )}
      </div>

      {/* Portal Actions - SPEC-MS-UI-008 */}
      <div className="flex gap-2">
        {/* Edit Portal */}
        <Link to={portal.portalId} className="flex-1">
          <Button variant="secondary" className="w-full text-sm px-3 py-2">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>

        {/* Manage Modules */}
        <Link to={`${portal.portalId}/modules`} className="flex-1">
          <Button variant="secondary" className="w-full text-sm px-3 py-2">
            <Package className="h-4 w-4 mr-1" />
            Modules
          </Button>
        </Link>

        {/* Delete Portal - SPEC-MS-UI-008: Show delete only if removable */}
        {isRemovable && (
          <Button
            variant="destructive"
            onClick={() => onDelete(portal)}
            aria-label={`Delete portal ${portal.name || portal.portalId}`}
            className="text-sm px-3 py-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
