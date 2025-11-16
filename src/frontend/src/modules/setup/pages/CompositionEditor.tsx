/**
 * CompositionEditor Component
 * DESIGN Reference: DES-COMP-001, DES-ARCH-001
 *
 * Editor for configuring composition slot components.
 * Compositions structures come from modules (registry).
 * This editor only allows customizing slotConfigs per portal.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Save, X, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

import type { CompositionConfig } from '@/core/composition/hooks/useCompositionMutations';
import {
  useSaveCompositionConfig,
  useCompositionConfig,
} from '@/core/composition/hooks/useCompositionMutations';
import { Page, useComposition } from '@/core/composition';
import type { Composition, LayoutWidth } from '@/core/composition/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import editor components
import { SlotCardList } from '../components/composition/SlotCardList';
import { LayoutWidthSelector } from '../components/composition/LayoutWidthSelector';

// Type for composition with configs
interface CompositionWithConfigs extends Composition {
  slotConfigs?: Record<string, Record<string, any>>;
}

/**
 * Composition configuration editor
 * Configures slotConfigs for a base composition
 */
export function CompositionEditor() {
  const { portalId, compositionId } = useParams<{ portalId: string; compositionId?: string }>();
  const navigate = useNavigate();

  if (!portalId || !compositionId) {
    return <div>Portal ID and Composition ID are required</div>;
  }

  // Get composition from registry
  const { compositionRegistry } = useComposition();
  const baseComposition = compositionRegistry.get(compositionId);

  // Generate config ID for this portal + composition
  const configId = `${portalId}-${compositionId}`;

  // Load existing config if it exists
  const { data: savedConfig, isLoading: configLoading } = useCompositionConfig(configId);
  const saveMutation = useSaveCompositionConfig();

  // State for component selections and their configs
  const [components, setComponents] = useState<Record<string, string | undefined>>({});
  const [slotConfigs, setSlotConfigs] = useState<Record<string, Record<string, any>>>({});
  const [layoutWidth, setLayoutWidth] = useState<LayoutWidth>(baseComposition.layout.width);
  const [originalComponents, setOriginalComponents] = useState<Record<string, string | undefined>>({});
  const [originalConfigs, setOriginalConfigs] = useState<Record<string, Record<string, any>>>({});
  const [originalWidth, setOriginalWidth] = useState<LayoutWidth>(baseComposition.layout.width);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load saved configs when available
  useEffect(() => {
    if (savedConfig) {
      const savedComponents = (savedConfig as any).components || baseComposition.components || {};
      const configs = savedConfig.slotConfigs || {};
      const savedWidth = (savedConfig as any).layout?.width || baseComposition.layout.width;
      setComponents(savedComponents);
      setOriginalComponents(savedComponents);
      setSlotConfigs(configs);
      setOriginalConfigs(configs);
      setLayoutWidth(savedWidth);
      setOriginalWidth(savedWidth);
    } else {
      // If no saved config, use base composition defaults
      setComponents(baseComposition.components || {});
      setOriginalComponents(baseComposition.components || {});
      setLayoutWidth(baseComposition.layout.width);
      setOriginalWidth(baseComposition.layout.width);
    }
  }, [savedConfig, baseComposition]);

  // Check if composition exists in registry
  if (!baseComposition) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
              <p className="text-lg text-red-600 mb-4">Composição "{compositionId}" não encontrada</p>
              <Button onClick={() => navigate(`/setup/portals/${portalId}/compositions`)}>
                Voltar para Lista
              </Button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // Change detection
  const hasChanges = useMemo(() => {
    const componentsChanged = JSON.stringify(components) !== JSON.stringify(originalComponents);
    const configsChanged = JSON.stringify(slotConfigs) !== JSON.stringify(originalConfigs);
    const widthChanged = layoutWidth !== originalWidth;
    return componentsChanged || configsChanged || widthChanged;
  }, [components, originalComponents, slotConfigs, originalConfigs, layoutWidth, originalWidth]);

  // Handlers
  const handleComponentChange = useCallback((slotType: string, componentId: string | undefined) => {
    setComponents(prev => ({
      ...prev,
      [slotType]: componentId,
    }));
  }, []);

  const handleConfigChange = useCallback((componentId: string, config: Record<string, any>) => {
    setSlotConfigs(prev => ({
      ...prev,
      [componentId]: config,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const compositionConfig: any = {
        id: configId,
        portalId,
        baseCompositionId: compositionId,
        name: baseComposition.name,
        components, // Save component selections
        slotConfigs,
        layout: {
          width: layoutWidth, // Save layout width
        },
      };

      await saveMutation.mutateAsync(compositionConfig);

      // Update original state after successful save
      setOriginalComponents(components);
      setOriginalConfigs(slotConfigs);
      setOriginalWidth(layoutWidth);

      // Show success message
      setSaveSuccess(true);

      // Auto-hide success message and navigate after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        navigate(`/setup/portals/${portalId}/compositions`);
      }, 2000);

    } catch (error) {
      console.error('Failed to save composition config:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  }, [configId, portalId, compositionId, baseComposition, components, slotConfigs, layoutWidth, saveMutation, navigate]);

  const handleCancel = useCallback(() => {
    navigate(`/setup/portals/${portalId}/compositions`);
  }, [portalId, navigate]);

  const handleReset = useCallback(() => {
    setComponents(originalComponents);
    setSlotConfigs(originalConfigs);
    setLayoutWidth(originalWidth);
  }, [originalComponents, originalConfigs, originalWidth]);

  // Show loading state
  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Carregando configuração...</p>
        </div>
      </div>
    );
  }

  // Merge base composition with saved configs
  const compositionWithConfigs: CompositionWithConfigs = {
    ...baseComposition,
    slotConfigs,
  };

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Configurar Composição</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {baseComposition.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Fornecido por: {baseComposition.providedBy}
        </p>
      </div>
      {hasChanges && (
        <Alert className="w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>Alterações não salvas</AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={handleCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <div className="flex gap-2">
        {hasChanges && (
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </div>
  );

  return (
    <Page composition="settings">
      <div className="p-6 space-y-8">
        {/* Header */}
        {headerContent}

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Configuração salva com sucesso! Redirecionando...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {saveError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Layout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Layout</CardTitle>
            <CardDescription>
              Configure a largura padrão para páginas usando esta composição. Páginas individuais podem sobrescrever esta configuração se necessário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LayoutWidthSelector
              value={layoutWidth}
              onChange={setLayoutWidth}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações dos Componentes</CardTitle>
            <CardDescription>
              Configure os componentes dos slots. A estrutura (layout e slots) é definida pelo módulo e não pode ser alterada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SlotCardList
              slots={baseComposition.slots}
              components={components}
              slotConfigs={slotConfigs}
              onComponentChange={handleComponentChange}
              onConfigChange={handleConfigChange}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        {footerContent}
      </div>
    </Page>
  );
}