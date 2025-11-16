/**
 * CompositionList Page
 *
 * Lists all available compositions for a portal (from modules in availableModules)
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Eye } from 'lucide-react';

import { Page, useComposition } from '@/core/composition';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { usePortal } from '@/hooks/jqel/usePortal';
import { useCompositionConfigs } from '@/core/composition/hooks/useCompositionMutations';

export function CompositionList() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  // Access composition registry from context
  const { compositionRegistry } = useComposition();

  // Get portal data to check availableModules
  const { data: portalResult, isLoading: portalLoading } = usePortal(portalId || '');
  const portal = portalResult?.data?.[0];

  // Get saved composition configurations for this portal
  const { data: savedConfigs, isLoading: configsLoading } = useCompositionConfigs(portalId);

  // Filter compositions based on portal's availableModules
  const compositions = useMemo(() => {
    if (!portal) return [];

    const allCompositions = compositionRegistry.getAll();

    // Include platform compositions (always available) + module compositions (if module in availableModules)
    return allCompositions.filter(comp =>
      comp.providedBy === 'platform' ||
      portal.availableModules?.includes(comp.providedBy)
    );
  }, [portal, compositionRegistry]);

  const isLoading = portalLoading || configsLoading;

  const handleConfigure = (compositionId: string) => {
    navigate(`/setup/portals/${portalId}/compositions/${compositionId}/configure`);
  };

  if (isLoading) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <p>Carregando composições...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page composition="settings">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Composições</h1>
            <p className="text-muted-foreground mt-2">
              Layouts disponíveis para o portal (fornecidos por módulos)
            </p>
          </div>
        </div>

      {/* Compositions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Composições Disponíveis</CardTitle>
          <CardDescription>
            Templates de layout fornecidos pelos módulos em availableModules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!compositions || compositions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhuma composição disponível. Adicione módulos ao portal para visualizar composições.
              </p>
              <Button onClick={() => navigate(`/setup/portals/${portalId}/modules`)}>
                Gerenciar Módulos
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Fornecido Por</TableHead>
                  <TableHead>Largura</TableHead>
                  <TableHead>Slots em Uso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compositions.map((composition) => {
                  // Find saved config for this composition
                  const configId = `${portalId}-${composition.id}`;
                  const savedConfig = savedConfigs?.find(c => c.id === configId);

                  // Get slots that have components selected
                  // Start with base composition components, override with saved components
                  const mergedComponents = {
                    ...composition.components,
                    ...(savedConfig?.components || {}),
                  };

                  // Filter to only show slots that have a component selected
                  // Exclude 'desktop' as it's always mandatory
                  const slotsInUse = Object.entries(mergedComponents)
                    .filter(([slotKey, componentId]) => componentId && slotKey !== 'desktop')
                    .map(([slotKey]) => slotKey);

                  // Get layout width (saved config overrides base)
                  const layoutWidth = savedConfig?.layout?.width || composition.layout.width;

                  return (
                    <TableRow key={composition.id}>
                      <TableCell>
                        <div className="font-medium">{composition.name}</div>
                        {composition.metadata?.description && (
                          <div className="text-sm text-muted-foreground">
                            {composition.metadata.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={composition.providedBy === 'platform' ? 'default' : 'secondary'}>
                          {composition.providedBy}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {layoutWidth}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {slotsInUse.length > 0 ? (
                            slotsInUse.map((slotKey) => (
                              <Badge
                                key={slotKey}
                                variant="default"
                                className="text-xs"
                              >
                                {slotKey}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Nenhum</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfigure(composition.id)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </Page>
  );
}