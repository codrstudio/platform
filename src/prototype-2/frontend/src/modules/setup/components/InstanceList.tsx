/**
 * InstanceList Component
 *
 * Container for displaying a list of instances with loading, empty, and error states.
 * Manages the grid layout and provides filtering/sorting capabilities.
 */

import { Settings, AlertCircle, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { InstanceCard } from './InstanceCard';
import type { Instance } from '../../../types/module';

export interface InstanceListProps {
  portalId: string;
  moduleId: string;
  instances: Instance[];
  isLoading: boolean;
  error?: Error | null;
  onCreateNew: () => void;
  onEdit: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
}

/**
 * Loading skeleton for instance cards
 */
function InstanceCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

/**
 * Empty state when no instances exist
 */
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="region"
      aria-labelledby="empty-state-heading"
    >
      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 id="empty-state-heading" className="text-xl font-medium mb-2">
        No instances configured
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        This module has no instances in this portal yet. Create your first instance to get started.
      </p>
      <Button onClick={onCreateNew} size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Create First Instance
      </Button>
    </div>
  );
}

/**
 * Main InstanceList component
 */
export function InstanceList({
  portalId,
  moduleId,
  instances,
  isLoading,
  error,
  onCreateNew,
  onEdit,
  onDelete,
}: InstanceListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Loading instances"
          aria-busy="true"
          aria-live="polite"
        >
          {[1, 2, 3].map((i) => (
            <InstanceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Module Instances</h2>
            <p className="text-muted-foreground">
              Portal: {portalId} / Module: {moduleId}
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              <strong>Failed to load instances</strong>
              <p className="mt-1">{error.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onCreateNew} className="self-start">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty State
  if (instances.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Module Instances</h2>
            <p className="text-muted-foreground">
              Portal: {portalId} / Module: {moduleId}
            </p>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Instance
          </Button>
        </div>

        <EmptyState onCreateNew={onCreateNew} />
      </div>
    );
  }

  // Success State (Has Data)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Module Instances</h2>
          <p className="text-muted-foreground mt-1">
            Portal: {portalId} / Module: {moduleId}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {instances.length} {instances.length === 1 ? 'instance' : 'instances'} configured
          </p>
        </div>
        <Button onClick={onCreateNew} className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          New Instance
        </Button>
      </div>

      {/* Instance Grid */}
      <div
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Module instances"
      >
        {instances.map((instance) => (
          <div key={instance.instanceId} role="listitem">
            <InstanceCard
              instance={instance}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
