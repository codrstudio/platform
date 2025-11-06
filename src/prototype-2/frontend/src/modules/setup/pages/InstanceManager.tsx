/**
 * InstanceManager Page
 *
 * Route handler for instance management.
 * Fetches instances for a specific portal and module, and renders the InstanceList component.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { usePortalInstances } from '../../../hooks/jqel/useInstanceQueries';
import { InstanceList } from '../components/InstanceList';

export default function InstanceManager() {
  const { portalId, moduleId } = useParams<{ portalId: string; moduleId: string }>();
  const navigate = useNavigate();

  // Validate required params
  if (!portalId || !moduleId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
          <p className="font-medium">Invalid URL</p>
          <p className="text-sm mt-1">Portal ID and Module ID are required.</p>
        </div>
      </div>
    );
  }

  // Fetch instances for the portal
  const { data: allInstances, isLoading, error } = usePortalInstances(portalId);

  // Filter instances by moduleId (client-side filtering)
  const moduleInstances = (allInstances || []).filter((instance) => instance.moduleId === moduleId);

  // Navigation handlers
  const handleCreateNew = () => {
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/new`);
  };

  const handleEdit = (instanceId: string) => {
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/${instanceId}/edit`);
  };

  const handleDelete = (instanceId: string) => {
    // Navigate to delete confirmation page (will be implemented in task 2.2.4)
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/${instanceId}/delete`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <InstanceList
        portalId={portalId}
        moduleId={moduleId}
        instances={moduleInstances}
        isLoading={isLoading}
        error={error}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
