/**
 * Portal Form Page
 *
 * Form for creating or editing a portal.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-UI-009 to SPEC-MS-UI-015)
 * - SPEC-module-setup.md (SPEC-MS-FU-002, SPEC-MS-FU-003)
 */

import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Info } from 'lucide-react';
import { useJQELList, useJQELRecord } from '../../../hooks/useJQELQuery.js';
import { useInsert, useUpdate } from '../../../hooks/useJQELMutation.js';
import { Portal } from '../../../types/portal.js';
import {
  createPortalSchema,
  updatePortalSchema,
  type CreatePortalInput,
  type UpdatePortalInput,
  getPortalRoutePreview,
  isReservedPortalId,
} from '../validation/portalSchema.js';
import { Button } from '../../../components/ui/button.js';
import { Input } from '../../../components/ui/input.js';
import { Label } from '../../../components/ui/label.js';
import { Alert, AlertDescription } from '../../../components/ui/alert.js';
import { Switch } from '../../../components/ui/switch.js';

/**
 * Portal Form Component
 *
 * SPEC-MS-UI-009: Fields: Portal ID, Name, Route, Settings Key
 * SPEC-MS-FU-002: Allow creating new portal
 * SPEC-MS-FU-003: Allow editing existing portal
 */
export default function PortalForm() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const isEditMode = portalId !== 'new' && !!portalId;

  // Fetch existing portal if editing
  // SPEC-MS-PE-009: Load configurations via JQEL
  const {
    data: portalResult,
    isLoading: isLoadingPortal,
    error: loadError,
  } = useJQELRecord<Portal>('platform', 'portal', portalId || '', {
    enabled: isEditMode,
  });

  // Fetch all portals to validate uniqueness and show shared settings keys
  const { data: allPortalsResult } = useJQELList<Portal>('platform', 'portal');
  const allPortals = allPortalsResult?.data || [];
  const existingPortalIds = allPortals.map((p) => p.portalId);

  // SPEC-MS-FU-002: Insert new portal
  const createMutation = useInsert<Portal>('platform', 'portal', {
    invalidation: { scope: 'entity' },
    onSuccess: () => {
      navigate('/setup/portals');
    },
  });

  // SPEC-MS-FU-003: Update existing portal
  const updateMutation = useUpdate<Portal>('platform', 'portal', {
    invalidation: { scope: 'specific' },
    onSuccess: () => {
      navigate('/setup/portals');
    },
  });

  // Setup form with React Hook Form + Zod
  // SPEC-MS-UI-028: Use React Hook Form + Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreatePortalInput | UpdatePortalInput>({
    resolver: zodResolver(isEditMode ? updatePortalSchema : createPortalSchema),
    defaultValues: {
      portalId: '',
      name: '',
      description: '',
      icon: '',
      settingsKey: 'default',
      removable: true,
    },
  });

  // Load portal data into form when editing
  useEffect(() => {
    if (isEditMode && portalResult?.data?.[0]) {
      const portal = portalResult.data[0];
      reset({
        portalId: portal.portalId,
        name: portal.name,
        description: portal.description || '',
        icon: portal.icon || '',
        settingsKey: portal.settingsKey || 'default',
        removable: portal.removable,
      });
    }
  }, [isEditMode, portalResult, reset]);

  // Watch fields for preview and validation
  const watchedPortalId = watch('portalId');
  const watchedSettingsKey = watch('settingsKey');
  const watchedRemovable = watch('removable');

  // SPEC-MS-UI-015: Route preview
  const routePreview = getPortalRoutePreview(watchedPortalId || '');

  // SPEC-MS-UI-013: Show portals sharing Settings Key
  const portalsWithSameSettings = allPortals.filter(
    (p) => p.settingsKey === watchedSettingsKey && p.portalId !== portalId
  );

  // Form submission handler
  const onSubmit = async (data: CreatePortalInput | UpdatePortalInput) => {
    // SPEC-MS-VA-001: Validate Portal ID uniqueness (only on create)
    if (!isEditMode) {
      const isDuplicate = existingPortalIds.includes(data.portalId);
      if (isDuplicate) {
        alert('Portal ID already exists. Please choose a different ID.');
        return;
      }
    }

    // Prepare portal data
    const portalData = {
      ...data,
      active: true,
      activeModules: [],
    };

    // Execute mutation
    // SPEC-MS-PE-001: Save via JQEL
    if (isEditMode) {
      updateMutation.mutate({ id: portalId!, ...portalData });
    } else {
      createMutation.mutate(portalData);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/setup/portals');
  };

  // Loading state
  if (isEditMode && isLoadingPortal) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  // Error loading portal
  if (isEditMode && loadError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load portal: {loadError.message}
            </AlertDescription>
          </Alert>
          <Link to="/setup/portals">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header - SPEC-MS-UI-002: Breadcrumb navigation */}
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground mb-2">
            <Link to="/setup" className="hover:text-foreground">
              Setup
            </Link>
            {' > '}
            <Link to="/setup/portals" className="hover:text-foreground">
              Portals
            </Link>
            {' > '}
            <span>{isEditMode ? 'Edit' : 'New'}</span>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleCancel} className="text-sm px-3 py-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditMode ? 'Edit Portal' : 'New Portal'}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode
                  ? 'Update portal configuration'
                  : 'Create a new isolated sub-application'}
              </p>
            </div>
          </div>
        </div>

        {/* Form - SPEC-MS-UI-009 to SPEC-MS-UI-015 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Portal ID - SPEC-MS-UI-010: Validate Portal ID */}
          <div className="space-y-2">
            <Label htmlFor="portalId">
              Portal ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="portalId"
              {...register('portalId')}
              placeholder="my-portal"
              disabled={isEditMode || isSubmitting}
              className={errors.portalId ? 'border-destructive' : ''}
            />
            {/* SPEC-MS-UI-030: Show errors inline */}
            {errors.portalId && (
              <p className="text-sm text-destructive">{errors.portalId.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Lowercase alphanumeric with hyphens. Used in URLs.
              {isEditMode && ' (cannot be changed)'}
            </p>
          </div>

          {/* Portal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Portal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Portal"
              disabled={isSubmitting}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Human-readable display name for the portal.
            </p>
          </div>

          {/* Portal Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Brief description of this portal"
              disabled={isSubmitting}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Portal Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              {...register('icon')}
              placeholder="Settings"
              disabled={isSubmitting}
              className={errors.icon ? 'border-destructive' : ''}
            />
            {errors.icon && (
              <p className="text-sm text-destructive">{errors.icon.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Lucide icon name (e.g., "Settings", "Home", "Database").
            </p>
          </div>

          {/* Settings Key - SPEC-MS-UI-012: Explain Settings Key concept */}
          <div className="space-y-2">
            <Label htmlFor="settingsKey">
              Settings Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="settingsKey"
              {...register('settingsKey')}
              placeholder="default"
              disabled={isSubmitting}
              className={errors.settingsKey ? 'border-destructive' : ''}
            />
            {errors.settingsKey && (
              <p className="text-sm text-destructive">{errors.settingsKey.message}</p>
            )}
            {/* SPEC-MS-UI-012: Explain Settings Key */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Settings Key</strong> determines theme configuration.
                Portals with the same settings key share theme settings (colors, mode).
                Use "default" to share with most portals, or create a unique key for
                independent theming.
              </AlertDescription>
            </Alert>
            {/* SPEC-MS-UI-013: Show portals sharing Settings Key */}
            {portalsWithSameSettings.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Shared with:{' '}
                {portalsWithSameSettings.map((p) => p.name || p.portalId).join(', ')}
              </p>
            )}
          </div>

          {/* Route Preview - SPEC-MS-UI-015 */}
          <div className="space-y-2">
            <Label>Route Preview</Label>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm">{routePreview}</code>
            </div>
            <p className="text-sm text-muted-foreground">
              {watchedPortalId === 'main'
                ? 'The main portal is accessible at the root URL.'
                : 'This portal will be accessible at the shown route.'}
            </p>
          </div>

          {/* Removable Toggle - SPEC-MS-UI-014 */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="removable">Removable</Label>
              <p className="text-sm text-muted-foreground">
                {isReservedPortalId(watchedPortalId || '')
                  ? 'Main portal cannot be removed.'
                  : 'Allow this portal to be deleted.'}
              </p>
            </div>
            <Switch
              id="removable"
              checked={watchedRemovable}
              onCheckedChange={(checked) => setValue('removable', checked)}
              disabled={
                isSubmitting ||
                isEditMode ||
                isReservedPortalId(watchedPortalId || '')
              }
            />
          </div>

          {/* Form Actions - SPEC-MS-LO-003: Disable during save */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Update Portal'
                  : 'Create Portal'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Mutation Errors - SPEC-MS-FB-008: Show errors clearly */}
          {(createMutation.error || updateMutation.error) && (
            <Alert variant="destructive">
              <AlertDescription>
                {createMutation.error?.message || updateMutation.error?.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
