/**
 * Portal List Page
 *
 * Displays a list of all portals with actions to create,
 * edit, and manage modules.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-004 to SPEC-MS-UI-008)
 * - SPEC-module-setup.md (SPEC-MS-FU-001 to SPEC-MS-FU-005)
 */

import { Link } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import { useJQELList } from '../../../hooks/useJQELQuery.js';
import { useDelete } from '../../../hooks/useJQELMutation.js';
import { Portal } from '../../../types/portal.js';
import PortalCard from '../components/PortalCard.js';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert.js';
import { Button } from '../../../components/ui/button.js';
import { useState } from 'react';
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

/**
 * Portal List Component
 * SPEC-MS-UI-004: Show cards or table with all portals
 * SPEC-MS-FU-001: Allow listing all portals
 */
export default function PortalList() {
  // SPEC-MS-FU-001: Fetch all portals via JQEL
  // SPEC-MS-PE-009: Load configurations via JQEL
  const { data: portalsResult, isLoading, error } = useJQELList<Portal>(
    'platform',
    'portal'
  );

  // SPEC-MS-FU-004: Allow removing portal (except "main")
  const deletePortalMutation = useDelete('platform', 'portal', {
    invalidation: { scope: 'entity' },
  });

  // State for delete confirmation dialog
  const [portalToDelete, setPortalToDelete] = useState<Portal | null>(null);

  // Extract portals from JResult
  const portals = portalsResult?.data || [];

  // SPEC-MS-FB-001: Request confirmation before removal
  const handleDeleteClick = (portal: Portal) => {
    setPortalToDelete(portal);
  };

  // SPEC-MS-FU-004: Execute portal deletion
  const handleDeleteConfirm = () => {
    if (portalToDelete) {
      deletePortalMutation.mutate(portalToDelete.portalId);
      setPortalToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header - SPEC-MS-UI-002: Breadcrumb navigation */}
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-2">
          <Link to="/setup" className="hover:text-foreground">Setup</Link>
          {' > '}
          <span>Portals</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portals</h1>
            <p className="text-muted-foreground">
              Manage isolated sub-applications within the platform
            </p>
          </div>
          {/* SPEC-MS-UI-007: Button to create new portal */}
          <Link to="new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State - SPEC-MS-FB-008: Show errors clearly */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Portals</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load portals. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State - SPEC-MS-LO-001: Show skeleton loader */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-muted rounded mb-4 w-1/3"></div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-muted rounded"></div>
                <div className="flex-1 h-10 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - SPEC-MS-LO-005 */}
      {!isLoading && !error && portals.length === 0 && (
        <div className="mt-8 p-8 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">
            No portals created yet. Click "New Portal" to get started.
          </p>
        </div>
      )}

      {/* Portal Cards Grid - SPEC-MS-UI-004 */}
      {!isLoading && !error && portals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <PortalCard
              key={portal.portalId}
              portal={portal}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog - SPEC-MS-FB-001 */}
      <AlertDialog open={!!portalToDelete} onOpenChange={(open) => !open && setPortalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
            <AlertDialogDescription>
              {/* SPEC-MS-FB-004: Show consequences */}
              Are you sure you want to delete the portal "{portalToDelete?.name || portalToDelete?.portalId}"?
              This will deactivate all modules and remove all instances in this portal.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePortalMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
