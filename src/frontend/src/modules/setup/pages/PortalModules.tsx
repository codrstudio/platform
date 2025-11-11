// Portal Modules Page - Refactored with Grid Layout and Bulk Actions
// Based on spec/ui/setup-module-interfaces.md Section 4.3

import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Package,
  Settings,
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Trash2,
  Power,
  PowerOff,
  AlertCircle
} from 'lucide-react';
import { usePortal, useModules, useInstances, useUpdatePortal, type Module as ModuleType } from '@/hooks/useJQEL';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';
import { ModuleBrowser } from '../components/ModuleBrowser';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';

interface ModuleWithStatus extends ModuleType {
  instanceCount: number;
  isAvailable: boolean;
  isActive: boolean;
}

// Sortable Module Card Component
function SortableModuleCard({
  module,
  isSelected,
  onSelect,
  onToggleActive,
  onManageInstances
}: {
  module: ModuleWithStatus;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onToggleActive: (moduleId: string, active: boolean) => void;
  onManageInstances: (moduleId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.moduleId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`relative ${isDragging ? 'shadow-2xl' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />

            {/* Module Icon */}
            <div className={`p-3 rounded-lg ${module.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
              <Package className={`h-6 w-6 ${module.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base truncate">{module.name}</CardTitle>
                {module.isActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={module.isActive ? 'default' : 'secondary'} className="text-xs">
                  {module.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{module.version}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {module.type}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          <CardDescription className="text-sm line-clamp-2">
            {module.description || 'Sem descrição'}
          </CardDescription>

          <Separator />

          {/* Module Details */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instâncias:</span>
              <span className="font-medium">{module.instanceCount}</span>
            </div>
            {module.dependencies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dependências:</span>
                <span className="font-medium text-xs">{module.dependencies.length}</span>
              </div>
            )}
          </div>

          {/* Activation Switch */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">
              {module.isActive ? 'Desativar módulo' : 'Ativar módulo'}
            </span>
            <Switch
              checked={module.isActive}
              onCheckedChange={(checked) => onToggleActive(module.moduleId, checked)}
            />
          </div>
        </CardContent>

        <CardFooter>
          {/* Manage Instances Button */}
          {module.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onManageInstances(module.moduleId)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Instâncias
            </Button>
          )}
          {!module.isActive && (
            <p className="text-xs text-muted-foreground text-center w-full">
              Ative o módulo para gerenciar instâncias
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export function PortalModules() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());

  const { data: portalResult, isLoading: isLoadingPortal } = usePortal(portalId!);
  const { data: modulesResult, isLoading: isLoadingModules } = useModules();
  const { data: instancesResult } = useInstances(portalId);
  const updatePortalMutation = useUpdatePortal();

  const portal = portalResult?.data?.[0];
  const allModules = modulesResult?.data || [];
  const instances = instancesResult?.data || [];
  const isLoading = isLoadingPortal || isLoadingModules;

  // Get module order from portal metadata
  const moduleOrder = useMemo(() => {
    return (portal?.metadata?.moduleOrder as string[]) || portal?.availableModules || [];
  }, [portal]);

  // Filter and enrich modules with portal-specific data
  const modules: ModuleWithStatus[] = useMemo(() => {
    // Only show modules that are in availableModules
    const availableModuleIds = portal?.availableModules || [];
    const filtered = allModules.filter(m => availableModuleIds.includes(m.moduleId));

    // Enrich with status
    const enriched = filtered.map(m => {
      const isActive = portal?.activeModules.includes(m.moduleId) || false;
      const instanceCount = instances.filter(i => i.moduleId === m.moduleId).length;
      return {
        ...m,
        isAvailable: true,
        isActive,
        instanceCount,
      };
    });

    // Sort by custom order
    if (moduleOrder.length > 0) {
      enriched.sort((a, b) => {
        const aIndex = moduleOrder.indexOf(a.moduleId);
        const bIndex = moduleOrder.indexOf(b.moduleId);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return enriched;
  }, [allModules, portal, instances, moduleOrder]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const portalName = portal?.name || 'Portal';
    return [
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalName, href: `/setup/portals/${portalId}` },
      { label: 'Módulos' }
    ];
  }, [portal?.name, portalId]);

  // Handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex(m => m.moduleId === active.id);
      const newIndex = modules.findIndex(m => m.moduleId === over.id);

      const newOrder = arrayMove(
        modules.map(m => m.moduleId),
        oldIndex,
        newIndex
      );

      try {
        await updatePortalMutation.mutateAsync({
          values: {
            metadata: {
              ...portal?.metadata,
              moduleOrder: newOrder
            }
          },
          where: { portalId: { $eq: portalId! } },
        });
        toastSuccess('Ordem atualizada', { description: 'A ordem dos módulos foi salva' });
      } catch (error) {
        console.error('Error updating module order:', error);
        toastError('Erro ao salvar ordem', { description: 'Não foi possível salvar a ordem dos módulos' });
      }
    }
  };

  const handleToggleActive = async (moduleId: string, active: boolean) => {
    if (!portal) return;

    // Check if module is in availableModules
    if (!portal.availableModules.includes(moduleId)) {
      toastWarning('Módulo não disponível', {
        description: 'Este módulo não está adicionado ao portal'
      });
      return;
    }

    // If activating, check dependencies
    if (active) {
      const module = allModules.find(m => m.moduleId === moduleId);
      if (module?.dependencies && module.dependencies.length > 0) {
        const missingDeps = module.dependencies.filter(
          dep => !portal.activeModules.includes(dep)
        );
        if (missingDeps.length > 0) {
          const depNames = missingDeps.map(id =>
            allModules.find(m => m.moduleId === id)?.name || id
          ).join(', ');
          toastWarning('Dependências faltantes', {
            description: `Este módulo requer: ${depNames}`
          });
          return;
        }
      }
    }

    const newActiveModules = active
      ? [...portal.activeModules, moduleId]
      : portal.activeModules.filter(id => id !== moduleId);

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
      toastSuccess(
        active ? 'Módulo ativado' : 'Módulo desativado',
        { description: `O módulo foi ${active ? 'ativado' : 'desativado'} com sucesso` }
      );
    } catch (error) {
      console.error('Error toggling module:', error);
      toastError('Erro', { description: 'Não foi possível alterar o status do módulo' });
    }
  };

  const handleAddModules = async (moduleIds: string[]) => {
    if (!portal) return;

    // Add to availableModules (not activeModules)
    const newAvailableModules = [...new Set([...portal.availableModules, ...moduleIds])];

    try {
      await updatePortalMutation.mutateAsync({
        values: { availableModules: newAvailableModules },
        where: { portalId: { $eq: portalId! } },
      });
      toastSuccess('Módulos adicionados', {
        description: `${moduleIds.length} módulo(s) adicionado(s) ao portal`
      });
    } catch (error) {
      console.error('Error adding modules:', error);
      toastError('Erro', { description: 'Não foi possível adicionar os módulos' });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedModules(new Set(modules.map(m => m.moduleId)));
    } else {
      setSelectedModules(new Set());
    }
  };

  const handleSelectModule = (moduleId: string, checked: boolean) => {
    const newSelection = new Set(selectedModules);
    if (checked) {
      newSelection.add(moduleId);
    } else {
      newSelection.delete(moduleId);
    }
    setSelectedModules(newSelection);
  };

  const handleBulkRemove = async () => {
    if (!portal || selectedModules.size === 0) return;

    const modulesToRemove = Array.from(selectedModules);
    const newAvailableModules = portal.availableModules.filter(
      (id: string) => !modulesToRemove.includes(id)
    );
    const newActiveModules = portal.activeModules.filter(
      (id: string) => !modulesToRemove.includes(id)
    );

    try {
      await updatePortalMutation.mutateAsync({
        values: {
          availableModules: newAvailableModules,
          activeModules: newActiveModules
        },
        where: { portalId: { $eq: portalId! } },
      });
      setSelectedModules(new Set());
      toastSuccess('Módulos removidos', {
        description: `${modulesToRemove.length} módulo(s) removido(s) do portal`
      });
    } catch (error) {
      console.error('Error removing modules:', error);
      toastError('Erro', { description: 'Não foi possível remover os módulos' });
    }
  };

  const handleBulkActivate = async () => {
    if (!portal || selectedModules.size === 0) return;

    const modulesToActivate = Array.from(selectedModules).filter(
      id => !portal.activeModules.includes(id)
    );

    if (modulesToActivate.length === 0) {
      toastWarning('Nenhum módulo para ativar', {
        description: 'Todos os módulos selecionados já estão ativos'
      });
      return;
    }

    // Check dependencies for all modules
    for (const moduleId of modulesToActivate) {
      const module = allModules.find(m => m.moduleId === moduleId);
      if (module?.dependencies && module.dependencies.length > 0) {
        const missingDeps = module.dependencies.filter(
          dep => !portal.activeModules.includes(dep) && !modulesToActivate.includes(dep)
        );
        if (missingDeps.length > 0) {
          const depNames = missingDeps.map(id =>
            allModules.find(m => m.moduleId === id)?.name || id
          ).join(', ');
          toastWarning('Dependências faltantes', {
            description: `O módulo "${module.name}" requer: ${depNames}`
          });
          return;
        }
      }
    }

    const newActiveModules = [...new Set([...portal.activeModules, ...modulesToActivate])];

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
      toastSuccess('Módulos ativados', {
        description: `${modulesToActivate.length} módulo(s) ativado(s)`
      });
    } catch (error) {
      console.error('Error activating modules:', error);
      toastError('Erro', { description: 'Não foi possível ativar os módulos' });
    }
  };

  const handleBulkDeactivate = async () => {
    if (!portal || selectedModules.size === 0) return;

    const modulesToDeactivate = Array.from(selectedModules).filter(
      id => portal.activeModules.includes(id)
    );

    if (modulesToDeactivate.length === 0) {
      toastWarning('Nenhum módulo para desativar', {
        description: 'Nenhum dos módulos selecionados está ativo'
      });
      return;
    }

    const newActiveModules = portal.activeModules.filter(
      id => !modulesToDeactivate.includes(id)
    );

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
      toastSuccess('Módulos desativados', {
        description: `${modulesToDeactivate.length} módulo(s) desativado(s)`
      });
    } catch (error) {
      console.error('Error deactivating modules:', error);
      toastError('Erro', { description: 'Não foi possível desativar os módulos' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Carregando módulos...</p>
        </div>
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Portal não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const allSelected = selectedModules.size === modules.length && modules.length > 0;
  const someSelected = selectedModules.size > 0 && selectedModules.size < modules.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
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
          <p className="text-muted-foreground mt-1">
            {portal.name} - Gerencie módulos disponíveis e sua ativação
          </p>
        </div>
        <Button onClick={() => setShowBrowser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulos
        </Button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedModules.size > 0 && (
        <Alert>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedModules.size} módulo(s) selecionado(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
              >
                <Power className="h-4 w-4 mr-2" />
                Ativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeactivate}
              >
                <PowerOff className="h-4 w-4 mr-2" />
                Desativar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Select All */}
      {modules.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el && 'indeterminate' in el) {
                (el as any).indeterminate = someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
          </span>
        </div>
      )}

      {/* Modules Grid with Drag & Drop */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Nenhum módulo disponível neste portal
            </p>
            <Button onClick={() => setShowBrowser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Módulos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map(m => m.moduleId)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <SortableModuleCard
                  key={module.moduleId}
                  module={module}
                  isSelected={selectedModules.has(module.moduleId)}
                  onSelect={(checked) => handleSelectModule(module.moduleId, checked)}
                  onToggleActive={handleToggleActive}
                  onManageInstances={(moduleId) =>
                    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Module Browser Dialog */}
      {showBrowser && (
        <ModuleBrowser
          excludeModuleIds={portal.availableModules}
          onAddModules={handleAddModules}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  );
}
