/**
 * Portal Manager Page
 * Create, edit, and delete portals
 * SPEC-MS-PM-* compliance
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJQELMutation, useJQELInvalidate } from '@/services/jqel/jqelHooks';
import { PortalList } from '../components/PortalList';
import type { Portal } from '@/core/portals/types';

export function PortalManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<Portal | null>(null);
  const [formData, setFormData] = useState({
    portalId: '',
    name: '',
    path: '',
    settingsKey: 'default',
    removable: true,
  });

  const invalidate = useJQELInvalidate();
  const mutation = useJQELMutation();

  const handleCreate = () => {
    setEditingPortal(null);
    setFormData({
      portalId: '',
      name: '',
      path: '',
      settingsKey: 'default',
      removable: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (portal: Portal) => {
    setEditingPortal(portal);
    setFormData({
      portalId: portal.portalId,
      name: portal.name,
      path: portal.path,
      settingsKey: portal.settingsKey,
      removable: portal.removable,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (portal: Portal) => {
    if (!confirm(`Are you sure you want to delete portal "${portal.name}"?`)) {
      return;
    }

    try {
      await mutation.mutateAsync({
        schema: 'backend',
        mutate: 'portal',
        action: 'delete',
        where: { portalId: { eq: portal.portalId } },
      });

      invalidate.entity('backend', 'portal');
      alert('Portal deleted successfully');
    } catch (error: any) {
      alert(`Failed to delete portal: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPortal) {
        // Update existing portal
        await mutation.mutateAsync({
          schema: 'backend',
          mutate: 'portal',
          action: 'update',
          where: { portalId: { eq: editingPortal.portalId } },
          values: {
            name: formData.name,
            path: formData.path,
            settingsKey: formData.settingsKey,
            removable: formData.removable,
          },
        });
        alert('Portal updated successfully');
      } else {
        // Create new portal
        await mutation.mutateAsync({
          schema: 'backend',
          mutate: 'portal',
          action: 'insert',
          values: {
            ...formData,
            activeModules: [],
          },
        });
        alert('Portal created successfully');
      }

      invalidate.entity('backend', 'portal');
      setIsDialogOpen(false);
    } catch (error: any) {
      alert(`Failed to save portal: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/setup"
              className="text-sm text-primary hover:underline mb-2 inline-block"
            >
              ← Back to Setup
            </Link>
            <h1 className="text-4xl font-bold">Portal Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage platform portals and their configurations
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            Create Portal
          </button>
        </div>

        {/* Portal List */}
        <PortalList onEdit={handleEdit} onDelete={handleDelete} />

        {/* Create/Edit Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingPortal ? 'Edit Portal' : 'Create Portal'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Portal ID
                    </label>
                    <input
                      type="text"
                      value={formData.portalId}
                      onChange={(e) =>
                        setFormData({ ...formData, portalId: e.target.value })
                      }
                      disabled={!!editingPortal}
                      className="w-full px-3 py-2 border rounded-lg bg-background disabled:opacity-50"
                      required
                      pattern="[a-z0-9-]+"
                      title="Only lowercase letters, numbers, and hyphens"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lowercase letters, numbers, and hyphens only
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Path</label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) =>
                        setFormData({ ...formData, path: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                      required
                      pattern="/.*"
                      title="Must start with /"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must start with / (e.g., /admin)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Settings Key
                    </label>
                    <input
                      type="text"
                      value={formData.settingsKey}
                      onChange={(e) =>
                        setFormData({ ...formData, settingsKey: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {mutation.isPending
                        ? 'Saving...'
                        : editingPortal
                        ? 'Update'
                        : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
