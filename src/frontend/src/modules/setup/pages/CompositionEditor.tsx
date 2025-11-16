/**
 * CompositionEditor Component
 * DESIGN Reference: DES-COMP-001, DES-ARCH-001
 *
 * Main composition editor page with state management and layout orchestration.
 * Based on the LoginBrandingEditor pattern with ResizablePanel layout.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Save, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { CompositionWithConfigs, CompositionEditorState } from '@/core/composition/types-extended';
import { createDefaultComposition, validateComposition } from '@/core/composition/schemas/compositionSchema';
import {
  useComposition,
  useCreateComposition,
  useUpdateComposition,
} from '@/core/composition/hooks/useCompositionMutations';

// Import composition components
import {
  CompositionEditorLayout,
  CompositionPreview,
  CompositionThemeProvider,
  PreviewPanel,
  ControlsPanel,
} from '../components/composition';

// Import editor components (to be created)
import { LayoutSelector } from '../components/composition/LayoutSelector';
import { SlotToggleList } from '../components/composition/SlotToggleList';
import { SlotCardList } from '../components/composition/SlotCardList';

/**
 * Main composition editor with centralized state management
 * DESIGN Reference: DES-ARCH-001 - Estado Centralizado
 */
export function CompositionEditor() {
  const { portalId, compositionId } = useParams<{ portalId: string; compositionId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!compositionId;

  if (!portalId) {
    return <div>Portal ID is required</div>;
  }

  // Load existing composition if editing
  const { data: loadedComposition, isLoading } = useComposition(compositionId || '');
  const createMutation = useCreateComposition();
  const updateMutation = useUpdateComposition();

  // Centralized state (DES-ARCH-001)
  const [state, setState] = useState<CompositionEditorState>(() => {
    // Initialize with default or loaded composition
    const defaultComp = createDefaultComposition(portalId);
    return {
      compositionId: compositionId || defaultComp.id,
      name: defaultComp.name,
      description: '',
      slots: defaultComp.slots,
      components: defaultComp.components,
      slotConfigs: defaultComp.slotConfigs || {},
      layout: defaultComp.layout,
      providedBy: defaultComp.providedBy,
      hasChanges: false,
      isSaving: false,
    };
  });

  // Store original state for comparison
  const [originalState, setOriginalState] = useState<CompositionEditorState>(state);

  // Update state when loaded composition arrives
  useEffect(() => {
    if (loadedComposition && isEditing) {
      const loadedState: CompositionEditorState = {
        compositionId: loadedComposition.id,
        name: loadedComposition.name,
        description: '',
        slots: loadedComposition.slots,
        components: loadedComposition.components,
        slotConfigs: loadedComposition.slotConfigs || {},
        layout: loadedComposition.layout,
        providedBy: loadedComposition.providedBy,
        hasChanges: false,
        isSaving: false,
      };
      setState(loadedState);
      setOriginalState(loadedState);
    }
  }, [loadedComposition, isEditing]);

  // Change detection (DES-FLOW-001)
  useEffect(() => {
    const hasChanges = JSON.stringify(state) !== JSON.stringify(originalState);
    setState(prev => ({ ...prev, hasChanges }));
  }, [state, originalState]);

  // Convert state to CompositionWithConfigs
  const composition = useMemo<CompositionWithConfigs>(() => ({
    id: state.compositionId,
    name: state.name,
    providedBy: state.providedBy,
    slots: state.slots,
    components: state.components,
    slotConfigs: state.slotConfigs,
    layout: state.layout,
  }), [state]);

  // Handlers for composition updates
  const handleCompositionChange = useCallback((updatedComposition: CompositionWithConfigs) => {
    setState(prev => ({
      ...prev,
      name: updatedComposition.name,
      slots: updatedComposition.slots,
      components: updatedComposition.components,
      slotConfigs: updatedComposition.slotConfigs || {},
      layout: updatedComposition.layout,
    }));
  }, []);

  const handleLayoutChange = useCallback((width: 'full' | 'lg' | 'md' | 'sm') => {
    setState(prev => ({
      ...prev,
      layout: { width },
    }));
  }, []);

  const handleSlotsChange = useCallback((slots: typeof state.slots) => {
    setState(prev => ({
      ...prev,
      slots,
      // Clear components for deactivated slots
      components: {
        ...prev.components,
        ...(slots.navbar === false && { navbar: undefined }),
        ...(slots.sidebar === false && { sidebar: undefined }),
        ...(slots.companion === false && { companion: undefined }),
        ...(slots.breadcrumb === false && { breadcrumb: undefined }),
        ...(slots.footer === false && { footer: undefined }),
      },
    }));
  }, []);

  const handleComponentChange = useCallback((slotType: string, componentId: string | undefined) => {
    setState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [slotType]: componentId,
      },
    }));
  }, []);

  const handleConfigChange = useCallback((componentId: string, config: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      slotConfigs: {
        ...prev.slotConfigs,
        [componentId]: config,
      },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    // Validate composition
    const validation = validateComposition(composition);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      if (isEditing) {
        // Update existing composition
        await updateMutation.mutateAsync(composition);
      } else {
        // Create new composition
        await createMutation.mutateAsync(composition);
      }

      // Update original state after successful save
      setOriginalState(state);

      // Navigate back to list
      navigate(`/setup/portals/${portalId}/compositions`);
    } catch (error) {
      console.error('Failed to save composition:', error);
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [composition, state, portalId, navigate, isEditing, createMutation, updateMutation]);

  const handleCancel = useCallback(() => {
    navigate(`/setup/portals/${portalId}/compositions`);
  }, [portalId, navigate]);

  const handleReset = useCallback(() => {
    setState(originalState);
  }, [originalState]);

  // Show loading state while fetching composition
  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading composition...</p>
        </div>
      </div>
    );
  }

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          {isEditing ? 'Edit Composition' : 'Create Composition'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {state.name || 'New Composition'}
        </p>
      </div>
      {state.hasChanges && (
        <Alert className="w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>You have unsaved changes</AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={handleCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <div className="flex gap-2">
        {state.hasChanges && (
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!state.hasChanges || state.isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {state.isSaving ? 'Saving...' : 'Save Composition'}
        </Button>
      </div>
    </div>
  );

  // Preview content
  const previewContent = (
    <PreviewPanel>
      <CompositionThemeProvider composition={composition} portalId={portalId}>
        <CompositionPreview
          composition={composition}
          onChange={handleCompositionChange}
          readonly={false}
        />
      </CompositionThemeProvider>
    </PreviewPanel>
  );

  // Controls content with tabs
  const controlsContent = (
    <ControlsPanel>
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <LayoutSelector
            value={state.layout.width}
            onChange={handleLayoutChange}
          />
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <SlotToggleList
            slots={state.slots}
            onChange={handleSlotsChange}
          />
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <SlotCardList
            slots={state.slots}
            components={state.components}
            slotConfigs={state.slotConfigs}
            onComponentChange={handleComponentChange}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
      </Tabs>
    </ControlsPanel>
  );

  return (
    <CompositionEditorLayout
      headerContent={headerContent}
      footerContent={footerContent}
      previewContent={previewContent}
      controlsContent={controlsContent}
      className="h-screen"
    />
  );
}