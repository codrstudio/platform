/**
 * InstanceCard Component
 *
 * Displays a single instance with summary information and action buttons.
 * Shows instance ID, module ID, status badge, and config summary.
 * Includes integrated delete confirmation dialog.
 */

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useDeleteInstance } from '../../../hooks/jqel/useInstanceMutations';
import { useToast } from '../../../hooks/use-toast';
import { DeleteInstanceDialog } from './DeleteInstanceDialog';
import type { Instance } from '../../../types/module';

export interface InstanceCardProps {
  instance: Instance;
  onEdit: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
}

function formatConfigSummary(config: Record<string, unknown>): string {
  const entries = Object.entries(config).slice(0, 3);
  if (entries.length === 0) {
    return 'No configuration';
  }
  return entries
    .map(([key, value]) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const truncated = stringValue.length > 30 ? stringValue.slice(0, 27) + '...' : stringValue;
      return `${key}: ${truncated}`;
    })
    .join(', ');
}

export function InstanceCard({ instance, onEdit, onDelete }: InstanceCardProps) {
  const configSummary = formatConfigSummary(instance.config);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteInstance = useDeleteInstance();
  const { toast } = useToast();

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteInstance.mutateAsync(instance.instanceId);
      toast({
        title: 'Instance deleted',
        description: `Instance "${instance.instanceId}" has been removed successfully.`,
      });
      setIsDeleteDialogOpen(false);
      onDelete(instance.instanceId);
    } catch (error) {
      toast({
        title: 'Failed to delete instance',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="group relative hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{instance.instanceId}</CardTitle>
              <CardDescription className="mt-1 truncate">
                Module: {instance.moduleId}
              </CardDescription>
            </div>
            <Badge
              variant={instance.active ? 'success' : 'secondary'}
              aria-label={`Status: ${instance.active ? 'active' : 'inactive'}`}
            >
              {instance.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Configuration</p>
            <p className="text-sm text-foreground break-words" title={JSON.stringify(instance.config, null, 2)}>
              {configSummary}
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(instance.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(instance.updatedAt).toLocaleDateString()}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(instance.instanceId)}
              aria-label={`Edit instance ${instance.instanceId}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              aria-label={`Delete instance ${instance.instanceId}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteInstanceDialog
        instanceId={instance.instanceId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteInstance.isPending}
      />
    </>
  );
}
