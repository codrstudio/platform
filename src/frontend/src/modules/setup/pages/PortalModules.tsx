// Portal Modules Page - Refactored with Tabs and Enhanced UX
// Based on spec/ui/setup-module-interfaces.md Section 5

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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  Settings,
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Trash2,
  PowerOff,
  AlertCircle,
  Search,
  Link2,
  Info
} from 'lucide-react';
import { usePortal, useModules, useInstances, useUpdatePortal, type Module as ModuleType } from '@/hooks/useJQEL';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';
import { ModuleBrowser } from '../components/ModuleBrowser';
import { toastSuccess, toastError, toastWarning } from '@/lib/toast';

interface ModuleWithStatus extends ModuleType {
  instanceCount: number;
  isAvailable: boolean;
  isActive: boolean;
  dependents?: string[]; // Modules that depend on this one
}

interface ConfirmationDialog {
  type: 'activate' | 'deactivate' | 'blocked' | null;
  module: ModuleWithStatus | null;
  dependencies?: string[];
  dependents?: string[];
}

// Helper to get module name by ID
function getModuleName(modules: ModuleType[], moduleId: string): string {
  return modules.find(m => m.moduleId === moduleId)?.name || moduleId;
}

// Active Module Card Component (with drag & drop, selection)
function ActiveModuleCard({
  module,
  allModules,
  isSelected,
  onSelect,
  onDeactivate,
  onManageInstances
}: {
  module: ModuleWithStatus;
  allModules: ModuleType[];
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDeactivate: (module: ModuleWithStatus) => void;
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

  const hasBlockingDependents = (module.dependents?.length || 0) > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`relative border-l-4 border-l-green-500 ${isDragging ? 'shadow-2xl' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
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
            <div className="p-3 rounded-lg bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base truncate">{module.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
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

          {/* Module Details with Hover Cards */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instâncias:</span>
              <span className="font-medium">{module.instanceCount}</span>
            </div>

            {/* Dependencies with Hover Card */}
            {module.dependencies.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dependências:</span>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="outline" className="cursor-help text-xs">
                      {module.dependencies.length}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Dependências:</h4>
                      <ul className="text-sm space-y-1">
                        {module.dependencies.map(dep => (
                          <li key={dep} className="flex items-center gap-2">
                            <Link2 className="h-3 w-3" />
                            {getModuleName(allModules, dep)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            )}

            {/* Dependents with Hover Card */}
            {hasBlockingDependents && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dependentes:</span>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="secondary" className="cursor-help text-xs">
                      {module.dependents!.length}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Dependência de:</h4>
                      <ul className="text-sm space-y-1">
                        {module.dependents!.map(dep => (
                          <li key={dep} className="flex items-center gap-2">
                            <Link2 className="h-3 w-3" />
                            {dep}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">
                        Desative estes módulos primeiro para poder desativar este.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {/* Manage Instances Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onManageInstances(module.moduleId)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Instâncias
          </Button>

          {/* Deactivate Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onDeactivate(module)}
            disabled={hasBlockingDependents}
          >
            Desativar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Available Module Card Component (simpler, just activate button)
function AvailableModuleCard({
  module,
  allModules,
  activeModuleIds,
  onActivate
}: {
  module: ModuleWithStatus;
  allModules: ModuleType[];
  activeModuleIds: string[];
  onActivate: (module: ModuleWithStatus) => void;
}) {
  const missingDeps = module.dependencies.filter(
    dep => !activeModuleIds.includes(dep)
  );
  const hasMissingDeps = missingDeps.length > 0;

  return (
    <Card className="relative border-l-4 border-l-gray-300">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Module Icon */}
          <div className="p-3 rounded-lg bg-muted">
            <Circle className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base truncate">{module.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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

        {/* Dependencies Info */}
        {module.dependencies.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dependências:</span>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge
                      variant={hasMissingDeps ? "destructive" : "outline"}
                      className="cursor-help text-xs"
                    >
                      {module.dependencies.length}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Dependências:</h4>
                      <ul className="text-sm space-y-1">
                        {module.dependencies.map(dep => {
                          const isActive = activeModuleIds.includes(dep);
                          return (
                            <li key={dep} className="flex items-center gap-2">
                              {isActive ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-destructive" />
                              )}
                              <span className={isActive ? '' : 'text-destructive'}>
                                {getModuleName(allModules, dep)}
                              </span>
                              {!isActive && <span className="text-xs text-muted-foreground">(será ativado)</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </>
        )}

        {/* Warning for auto-activation */}
        {hasMissingDeps && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Ativará também: {missingDeps.map(id => getModuleName(allModules, id)).join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onActivate(module)}
        >
          Ativar
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PortalModules() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();

  // UI State
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({ type: null, module: null });

  // Data fetching
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
  const allEnrichedModules: ModuleWithStatus[] = useMemo(() => {
    // Only show modules that are in availableModules
    const availableModuleIds = portal?.availableModules || [];
    const activeModuleIds = portal?.activeModules || [];
    const filtered = allModules.filter(m => availableModuleIds.includes(m.moduleId));

    // Calculate dependents for each module
    const dependentsMap = new Map<string, string[]>();
    filtered.forEach(module => {
      module.dependencies.forEach(depId => {
        if (!dependentsMap.has(depId)) {
          dependentsMap.set(depId, []);
        }
        // Only count as dependent if the dependent module is active
        if (activeModuleIds.includes(module.moduleId)) {
          dependentsMap.get(depId)!.push(module.name);
        }
      });
    });

    // Enrich with status
    const enriched = filtered.map(m => {
      const isActive = activeModuleIds.includes(m.moduleId);
      const instanceCount = instances.filter(i => i.moduleId === m.moduleId).length;
      const dependents = dependentsMap.get(m.moduleId) || [];

      return {
        ...m,
        isAvailable: true,
        isActive,
        instanceCount,
        dependents,
      };
    });

    return enriched;
  }, [allModules, portal, instances]);

  // Separate active and available modules
  const activeModules = useMemo(() => {
    const active = allEnrichedModules.filter(m => m.isActive);

    // Sort by custom order
    if (moduleOrder.length > 0) {
      active.sort((a, b) => {
        const aIndex = moduleOrder.indexOf(a.moduleId);
        const bIndex = moduleOrder.indexOf(b.moduleId);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return active;
  }, [allEnrichedModules, moduleOrder]);

  const availableModules = useMemo(() => {
    let available = allEnrichedModules.filter(m => !m.isActive);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      available = available.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.moduleId.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      available = available.filter(m => m.type === typeFilter);
    }

    return available;
  }, [allEnrichedModules, searchQuery, typeFilter]);

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
      const oldIndex = activeModules.findIndex(m => m.moduleId === active.id);
      const newIndex = activeModules.findIndex(m => m.moduleId === over.id);

      const newOrder = arrayMove(
        activeModules.map(m => m.moduleId),
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

  // Show dialog for activation with missing dependencies
  const handleActivateClick = (module: ModuleWithStatus) => {
    if (!portal) return;

    const missingDeps = module.dependencies.filter(
      dep => !portal.activeModules.includes(dep)
    );

    if (missingDeps.length > 0) {
      // Show confirmation dialog
      setConfirmDialog({
        type: 'activate',
        module,
        dependencies: missingDeps
      });
    } else {
      // No missing deps, activate directly
      handleActivateModule(module);
    }
  };

  // Show dialog for deactivation with blocking dependents
  const handleDeactivateClick = (module: ModuleWithStatus) => {
    if (!portal) return;

    if (module.dependents && module.dependents.length > 0) {
      // Show blocked dialog
      setConfirmDialog({
        type: 'blocked',
        module,
        dependents: module.dependents
      });
    } else {
      // No dependents, show simple confirmation
      setConfirmDialog({
        type: 'deactivate',
        module
      });
    }
  };

  // Actually activate module (called after confirmation)
  const handleActivateModule = async (module: ModuleWithStatus) => {
    if (!portal) return;

    const missingDeps = module.dependencies.filter(
      dep => !portal.activeModules.includes(dep)
    );

    // Activate module + all missing dependencies
    const newActiveModules = [...new Set([...portal.activeModules, module.moduleId, ...missingDeps])];

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
      const depCount = missingDeps.length;
      toastSuccess(
        'Módulo ativado',
        {
          description: depCount > 0
            ? `${module.name} e ${depCount} dependência(s) ativadas`
            : `${module.name} ativado com sucesso`
        }
      );
      setConfirmDialog({ type: null, module: null });
    } catch (error) {
      console.error('Error activating module:', error);
      toastError('Erro', { description: 'Não foi possível ativar o módulo' });
    }
  };

  // Actually deactivate module (called after confirmation)
  const handleDeactivateModule = async (module: ModuleWithStatus) => {
    if (!portal) return;

    const newActiveModules = portal.activeModules.filter(id => id !== module.moduleId);

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
      toastSuccess('Módulo desativado', { description: `${module.name} desativado com sucesso` });
      setConfirmDialog({ type: null, module: null });
    } catch (error) {
      console.error('Error deactivating module:', error);
      toastError('Erro', { description: 'Não foi possível desativar o módulo' });
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
      setSelectedModules(new Set(activeModules.map(m => m.moduleId)));
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

  const allSelected = selectedModules.size === activeModules.length && activeModules.length > 0;
  const someSelected = selectedModules.size > 0 && selectedModules.size < activeModules.length;

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
            {portal.name} - Gerencie módulos ativos e disponíveis
          </p>
        </div>
        <Button onClick={() => setShowBrowser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulos
        </Button>
      </div>

      {/* Tabs: Active vs Available */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            Ativos
            <Badge variant="secondary" className="ml-1">
              {activeModules.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            Disponíveis
            <Badge variant="secondary" className="ml-1">
              {allEnrichedModules.filter(m => !m.isActive).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE MODULES TAB */}
        <TabsContent value="active" className="space-y-4">
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
          {activeModules.length > 0 && (
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

          {/* Active Modules Grid with Drag & Drop */}
          {activeModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Nenhum módulo ativo neste portal
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Vá para a aba "Disponíveis" para ativar módulos
                </p>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeModules.map(m => m.moduleId)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {activeModules.map((module) => (
                    <ActiveModuleCard
                      key={module.moduleId}
                      module={module}
                      allModules={allModules}
                      isSelected={selectedModules.has(module.moduleId)}
                      onSelect={(checked) => handleSelectModule(module.moduleId, checked)}
                      onDeactivate={handleDeactivateClick}
                      onManageInstances={(moduleId) =>
                        navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {/* AVAILABLE MODULES TAB */}
        <TabsContent value="available" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar módulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="functionality">Funcionalidade</SelectItem>
                <SelectItem value="components">Componentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Available Modules Grid */}
          {availableModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                {searchQuery || typeFilter !== 'all' ? (
                  <>
                    <p className="text-muted-foreground text-center mb-4">
                      Nenhum módulo encontrado
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-center mb-4">
                      Todos os módulos já estão ativos
                    </p>
                    <Button onClick={() => setShowBrowser(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Mais Módulos
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableModules.map((module) => (
                <AvailableModuleCard
                  key={module.moduleId}
                  module={module}
                  allModules={allModules}
                  activeModuleIds={portal.activeModules}
                  onActivate={handleActivateClick}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Module Browser Dialog */}
      {showBrowser && (
        <ModuleBrowser
          excludeModuleIds={portal.availableModules}
          onAddModules={handleAddModules}
          onClose={() => setShowBrowser(false)}
        />
      )}

      {/* Confirmation Dialogs */}
      {/* Activate with Dependencies */}
      <AlertDialog open={confirmDialog.type === 'activate'} onOpenChange={(open) => !open && setConfirmDialog({ type: null, module: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Ativar Módulo "{confirmDialog.module?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Este módulo depende de:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {confirmDialog.dependencies?.map(depId => (
                    <li key={depId}>
                      <strong>{getModuleName(allModules, depId)}</strong> (será ativado automaticamente)
                    </li>
                  ))}
                </ul>
                <p className="mt-4">Deseja continuar?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog.module && handleActivateModule(confirmDialog.module)}>
              Ativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={confirmDialog.type === 'deactivate'} onOpenChange={(open) => !open && setConfirmDialog({ type: null, module: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Desativar Módulo "{confirmDialog.module?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O módulo será desativado e não estará mais disponível neste portal.
              Suas instâncias serão mantidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.module && handleDeactivateModule(confirmDialog.module)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blocked Deactivation (has dependents) */}
      <AlertDialog open={confirmDialog.type === 'blocked'} onOpenChange={(open) => !open && setConfirmDialog({ type: null, module: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Não é possível desativar
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>O módulo "{confirmDialog.module?.name}" é usado por:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {confirmDialog.dependents?.map(depName => (
                    <li key={depName}>{depName}</li>
                  ))}
                </ul>
                <p className="mt-4">Desative estes módulos primeiro para poder desativar este.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
