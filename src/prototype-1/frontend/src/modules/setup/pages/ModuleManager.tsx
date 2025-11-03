/**
 * Module Manager Page
 * Activate and deactivate modules in portals
 * SPEC-MS-MM-* compliance
 */

import { Link } from 'react-router-dom';
import { useJQEL, useJQELMutation, useJQELInvalidate } from '@/services/jqel/jqelHooks';
import { ModuleList } from '../components/ModuleList';
import type { Portal } from '@/core/portals/types';

export function ModuleManager() {
  const { data: portalsResult } = useJQEL<Portal[]>({
    schema: 'backend',
    select: 'portal',
  });

  const mutation = useJQELMutation();
  const invalidate = useJQELInvalidate();

  const portals = portalsResult?.data || [];

  const handleActivate = async (moduleId: string, portalId: string) => {
    const portal = portals.find((p) => p.portalId === portalId);

    if (!portal) {
      alert(`Portal "${portalId}" not found`);
      return;
    }

    if (portal.activeModules?.includes(moduleId)) {
      alert(`Module "${moduleId}" is already active in portal "${portalId}"`);
      return;
    }

    try {
      const updatedModules = [...(portal.activeModules || []), moduleId];

      await mutation.mutateAsync({
        schema: 'backend',
        mutate: 'portal',
        action: 'update',
        where: { portalId: { eq: portalId } },
        values: {
          activeModules: updatedModules,
        },
      });

      invalidate.entity('backend', 'portal');
      alert(`Module "${moduleId}" activated in portal "${portalId}"`);
    } catch (error: any) {
      alert(`Failed to activate module: ${error.message}`);
    }
  };

  const handleDeactivate = async (moduleId: string, portalId: string) => {
    const portal = portals.find((p) => p.portalId === portalId);

    if (!portal) {
      alert(`Portal "${portalId}" not found`);
      return;
    }

    if (!portal.activeModules?.includes(moduleId)) {
      alert(`Module "${moduleId}" is not active in portal "${portalId}"`);
      return;
    }

    try {
      const updatedModules = portal.activeModules.filter((id) => id !== moduleId);

      await mutation.mutateAsync({
        schema: 'backend',
        mutate: 'portal',
        action: 'update',
        where: { portalId: { eq: portalId } },
        values: {
          activeModules: updatedModules,
        },
      });

      invalidate.entity('backend', 'portal');
      alert(`Module "${moduleId}" deactivated in portal "${portalId}"`);
    } catch (error: any) {
      alert(`Failed to deactivate module: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/setup"
            className="text-sm text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Setup
          </Link>
          <h1 className="text-4xl font-bold">Module Management</h1>
          <p className="text-muted-foreground mt-2">
            Activate and deactivate modules in portals
          </p>
        </div>

        {/* Available Portals Info */}
        <div className="bg-card p-4 rounded-lg border mb-6">
          <h2 className="font-semibold mb-2">Available Portals:</h2>
          <div className="flex flex-wrap gap-2">
            {portals.map((portal) => (
              <div
                key={portal.portalId}
                className="text-sm bg-muted px-3 py-1.5 rounded"
              >
                <code>{portal.portalId}</code>
                <span className="text-muted-foreground ml-2">
                  ({portal.activeModules?.length || 0} modules)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module List */}
        <ModuleList
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />

        {/* Help Text */}
        <div className="mt-8 bg-muted/50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Click "Activate" to add a module to a portal</li>
            <li>Click "Deactivate" to remove a module from a portal</li>
            <li>You'll be prompted to enter the portal ID</li>
            <li>Changes take effect immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
