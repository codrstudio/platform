/**
 * Portal Management Examples
 *
 * Comprehensive examples demonstrating portal management functionality.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-FU-001 to SPEC-MS-FU-005)
 * - SPEC-concepts.md (SPEC-C-P-*)
 */

import { useState } from 'react';
import { useJQELList } from '../hooks/useJQELQuery.js';
import { useInsert, useUpdate, useDelete } from '../hooks/useJQELMutation.js';
import { Portal } from '../types/portal.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Label } from '../components/ui/label.js';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.js';
import { Badge } from '../components/ui/badge.js';
import { Separator } from '../components/ui/separator.js';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Example 1: Listing Portals
 *
 * SPEC-MS-FU-001: Allow listing all portals
 */
function Example1ListingPortals() {
  const { data, isLoading, error } = useJQELList<Portal>('platform', 'portal');
  const portals = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Listing Portals</CardTitle>
        <CardDescription>
          Fetches and displays all portals using JQEL with useJQELList hook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading portals...
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {portals.length} portal(s)
            </p>
            {portals.map((portal) => (
              <div
                key={portal.portalId}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{portal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {portal.portalId} | Route: {portal.portalId === 'main' ? '/' : `/${portal.portalId}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={portal.active ? 'default' : 'secondary'}>
                    {portal.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {portal.activeModules?.length || 0} modules
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Creating New Portal
 *
 * SPEC-MS-FU-002: Allow creating new portal
 */
function Example2CreatingPortal() {
  const [portalId, setPortalId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useInsert<Portal>('platform', 'portal', {
    invalidation: { scope: 'entity' },
  });

  const handleCreate = () => {
    createMutation.mutate({
      portalId,
      name,
      description,
      active: true,
      removable: true,
      activeModules: [],
      settingsKey: 'default',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Creating New Portal</CardTitle>
        <CardDescription>
          Creates a portal using JQEL insert mutation with useInsert hook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="create-portal-id">Portal ID</Label>
          <Input
            id="create-portal-id"
            value={portalId}
            onChange={(e) => setPortalId(e.target.value)}
            placeholder="my-new-portal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-portal-name">Portal Name</Label>
          <Input
            id="create-portal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My New Portal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-portal-desc">Description</Label>
          <Input
            id="create-portal-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A portal for..."
          />
        </div>

        <Button
          onClick={handleCreate}
          disabled={!portalId || !name || createMutation.isPending}
        >
          {createMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Create Portal
        </Button>

        {createMutation.isSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Portal "{name}" created successfully!
            </AlertDescription>
          </Alert>
        )}

        {createMutation.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{createMutation.error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Editing Portal
 *
 * SPEC-MS-FU-003: Allow editing existing portal
 */
function Example3EditingPortal() {
  const [portalId, setPortalId] = useState('');
  const [newName, setNewName] = useState('');

  const updateMutation = useUpdate<Portal>('platform', 'portal', {
    invalidation: { scope: 'specific' },
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      id: portalId,
      name: newName,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Editing Portal</CardTitle>
        <CardDescription>
          Updates portal name using JQEL update mutation with useUpdate hook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-portal-id">Portal ID to Edit</Label>
          <Input
            id="edit-portal-id"
            value={portalId}
            onChange={(e) => setPortalId(e.target.value)}
            placeholder="existing-portal-id"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-portal-name">New Name</Label>
          <Input
            id="edit-portal-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Updated Portal Name"
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={!portalId || !newName || updateMutation.isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Update Portal
        </Button>

        {updateMutation.isSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Portal "{portalId}" updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {updateMutation.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Deleting Portal
 *
 * SPEC-MS-FU-004: Allow removing portal (except "main")
 * SPEC-MS-FU-005: Validate that portal "main" cannot be removed
 */
function Example4DeletingPortal() {
  const [portalId, setPortalId] = useState('');

  const deleteMutation = useDelete<Portal>('platform', 'portal', {
    invalidation: { scope: 'entity' },
  });

  const handleDelete = () => {
    // SPEC-MS-FU-005: Validate main portal cannot be removed
    if (portalId === 'main') {
      alert('Portal "main" cannot be removed!');
      return;
    }

    if (confirm(`Are you sure you want to delete portal "${portalId}"?`)) {
      deleteMutation.mutate(portalId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Deleting Portal</CardTitle>
        <CardDescription>
          Deletes a portal using JQEL delete mutation. Main portal cannot be deleted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Portal "main" is protected and cannot be deleted.
            This is enforced by SPEC-MS-FU-005.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="delete-portal-id">Portal ID to Delete</Label>
          <Input
            id="delete-portal-id"
            value={portalId}
            onChange={(e) => setPortalId(e.target.value)}
            placeholder="portal-id-to-delete"
          />
        </div>

        <Button
          onClick={handleDelete}
          disabled={!portalId || deleteMutation.isPending}
          variant="destructive"
        >
          {deleteMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Delete Portal
        </Button>

        {deleteMutation.isSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Portal "{portalId}" deleted successfully!
            </AlertDescription>
          </Alert>
        )}

        {deleteMutation.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{deleteMutation.error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 5: Portal Validation Errors
 *
 * Demonstrates validation error handling
 */
function Example5ValidationErrors() {
  const createMutation = useInsert<Portal>('platform', 'portal', {
    invalidation: { scope: 'entity' },
  });

  const handleInvalidPortal = () => {
    // Try to create portal with invalid ID (uppercase, spaces, special chars)
    createMutation.mutate({
      portalId: 'Invalid Portal ID!', // Invalid: has spaces, uppercase, special chars
      name: '',                        // Invalid: name is required
      active: true,
      removable: true,
      activeModules: [],
      settingsKey: 'default',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 5: Validation Errors</CardTitle>
        <CardDescription>
          Demonstrates how validation errors are handled from backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Click the button to attempt creating a portal with invalid data.
            The backend will reject it with validation errors.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleInvalidPortal}
          disabled={createMutation.isPending}
          variant="secondary"
        >
          {createMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Try Invalid Portal
        </Button>

        {createMutation.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              <strong>Error Code:</strong> {createMutation.error.code}
              <br />
              <strong>Message:</strong> {createMutation.error.message}
              {createMutation.error.field && (
                <>
                  <br />
                  <strong>Field:</strong> {createMutation.error.field}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Portal Management Example Component
 *
 * Displays all portal management examples in a grid layout.
 */
export default function PortalManagementExample() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portal Management Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive examples demonstrating CRUD operations for portal management.
        </p>
      </div>

      <div className="space-y-6">
        {/* Example 1: Listing */}
        <Example1ListingPortals />

        <Separator />

        {/* Example 2: Creating */}
        <Example2CreatingPortal />

        <Separator />

        {/* Example 3: Editing */}
        <Example3EditingPortal />

        <Separator />

        {/* Example 4: Deleting */}
        <Example4DeletingPortal />

        <Separator />

        {/* Example 5: Validation */}
        <Example5ValidationErrors />
      </div>

      {/* Implementation Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">SPEC Compliance:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>SPEC-MS-FU-001: List all portals via JQEL</li>
              <li>SPEC-MS-FU-002: Create new portal with validation</li>
              <li>SPEC-MS-FU-003: Edit existing portal (immutable fields protected)</li>
              <li>SPEC-MS-FU-004: Delete removable portals</li>
              <li>SPEC-MS-FU-005: Main portal cannot be deleted</li>
              <li>SPEC-MS-VA-001: Portal ID must be unique</li>
              <li>SPEC-MS-VA-002: Portal ID validation (alphanumeric)</li>
              <li>SPEC-MS-PE-001: All operations use JQEL mutations</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Automatic cache invalidation after mutations</li>
              <li>Loading states with spinners</li>
              <li>Error handling with clear messages</li>
              <li>Success feedback</li>
              <li>Form validation (client and server)</li>
              <li>Protected main portal</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
