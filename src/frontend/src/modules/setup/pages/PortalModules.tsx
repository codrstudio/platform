// Portal Modules Page
// Based on spec/ui/setup-module-interfaces.md Section 4.3

import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Settings, Plus } from 'lucide-react';
import { usePortal, useModules, useInstances, useUpdatePortal, type Module as ModuleType } from '@/hooks/useJQEL';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';
import { ModuleBrowser } from '../components/ModuleBrowser';

interface ModuleWithInstances extends ModuleType {
  instanceCount: number;
  active: boolean;
}

export function PortalModules() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const [showBrowser, setShowBrowser] = useState(false);

  const { data: portalResult, isLoading: isLoadingPortal } = usePortal(portalId!);
  const { data: modulesResult, isLoading: isLoadingModules } = useModules();
  const { data: instancesResult } = useInstances(portalId);
  const updatePortalMutation = useUpdatePortal();

  const portal = portalResult?.data?.[0];

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const portalName = portal?.name || 'Portal';
    return [
      { label: 'Home', href: '/' },
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalName, href: `/setup/portals/${portalId}` },
      { label: 'Módulos' }
    ];
  }, [portal?.name, portalId]);
  const allModules = modulesResult?.data || [];
  const instances = instancesResult?.data || [];

  const isLoading = isLoadingPortal || isLoadingModules;

  // Enrich modules with portal-specific data
  const modules: ModuleWithInstances[] = allModules.map(m => {
    const isActive = portal?.activeModules.includes(m.moduleId) || false;
    const instanceCount = instances.filter(i => i.moduleId === m.moduleId).length;

    return {
      ...m,
      active: isActive,
      instanceCount,
    };
  });

  const toggleModule = async (moduleId: string) => {
    if (!portal) return;

    const isCurrentlyActive = portal.activeModules.includes(moduleId);
    const newActiveModules = isCurrentlyActive
      ? portal.activeModules.filter(id => id !== moduleId)
      : [...portal.activeModules, moduleId];

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
    } catch (error) {
      console.error('Error toggling module:', error);
    }
  };

  const handleAddModules = async (moduleIds: string[]) => {
    if (!portal) return;

    const newActiveModules = [...portal.activeModules, ...moduleIds];

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
    } catch (error) {
      console.error('Error adding modules:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando módulos...</p>
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="container mx-auto p-6">
        <p>Portal não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/setup/portals/${portalId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Módulos do Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} - Gerencie módulos ativos e instâncias
          </p>
        </div>
      </div>

      {/* Active Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Módulos Disponíveis</h2>
          <Button variant="outline" onClick={() => setShowBrowser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Módulos
          </Button>
        </div>

        <div className="grid gap-4">
          {modules.map((module) => (
            <Card key={module.moduleId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{module.name}</CardTitle>
                        <Badge variant={module.active ? 'default' : 'secondary'}>
                          {module.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          v{module.version}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {module.category && (
                      <p className="text-sm text-muted-foreground">
                        Categoria: <span className="text-foreground capitalize">{module.category}</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Instâncias: <span className="text-foreground">{module.instanceCount}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {module.active && module.instanceCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/setup/portals/${portalId}/modules/${module.moduleId}/instances`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Instâncias
                      </Button>
                    )}
                    <Button
                      variant={module.active ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleModule(module.moduleId)}
                    >
                      {module.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {modules.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum módulo disponível</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module Browser Dialog */}
      {showBrowser && (
        <ModuleBrowser
          excludeModuleIds={portal.activeModules}
          onAddModules={handleAddModules}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  );
}
