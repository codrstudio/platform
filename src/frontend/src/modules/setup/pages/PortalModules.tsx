// Portal Modules Page - Unified View with Toggle
// Based on spec/ui/setup-module-interfaces.md Section 5

import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  Link2,
} from 'lucide-react';
import { usePortal, useUpdatePortal } from '@/hooks/jqel/usePortal';
import { useModules } from '@/hooks/jqel/useModule';
import { useInstances } from '@/hooks/jqel/useInstance';
import type { BackendModule as ModuleType } from '@/types/module';
import { ModuleBrowser } from '../components/ModuleBrowser';
import { toastSuccess, toastError } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { Page } from '@/core/composition';

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

// Unified Module Card Component
function UnifiedModuleCard({
  module,
  allModules,
  activeModuleIds,
  onToggleActive,
  onManageInstances
}: {
  module: ModuleWithStatus;
  allModules: ModuleType[];
  activeModuleIds: string[];
  onToggleActive: (module: ModuleWithStatus, newState: boolean) => void;
  onManageInstances: (moduleId: string) => void;
}) {
  const isActive = module.isActive;
  const hasBlockingDependents = (module.dependents?.length || 0) > 0;
  const missingDeps = module.dependencies.filter(
    dep => !activeModuleIds.includes(dep)
  );
  const hasMissingDeps = missingDeps.length > 0;

  return (
    <Card className={`relative border-l-4 ${isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
      <CardHeader className="pb-3">
        {/* Toggle Switch - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Label
            htmlFor={`switch-${module.moduleId}`}
            className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}
          >
            {isActive ? 'Ativado' : 'Desativado'}
          </Label>
          <Switch
            id={`switch-${module.moduleId}`}
            checked={isActive}
            onCheckedChange={(checked) => onToggleActive(module, checked)}
            disabled={!isActive && hasMissingDeps ? false : (!isActive ? false : hasBlockingDependents)}
          />
        </div>

        <div className="flex items-start gap-3 pr-28">
          {/* Module Icon */}
          <div className={`p-3 rounded-lg ${isActive ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'}`}>
            {isActive ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
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
          {isActive && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instâncias:</span>
              <span className="font-medium">{module.instanceCount}</span>
            </div>
          )}

          {/* Dependencies with Hover Card */}
          {module.dependencies.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Dependências:</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge
                    variant={!isActive && hasMissingDeps ? "destructive" : "outline"}
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
                        const isDepActive = activeModuleIds.includes(dep);
                        return (
                          <li key={dep} className="flex items-center gap-2">
                            {isDepActive ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                            <span className={isDepActive ? '' : 'text-destructive'}>
                              {getModuleName(allModules, dep)}
                            </span>
                            {!isActive && !isDepActive && (
                              <span className="text-xs text-muted-foreground">(será ativado)</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {hasBlockingDependents && isActive && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        Este módulo não pode ser desativado enquanto outros módulos dependem dele.
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          )}

          {/* Dependents with Hover Card */}
          {hasBlockingDependents && isActive && (
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

        {/* Warning for auto-activation */}
        {!isActive && hasMissingDeps && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Ativará também: {missingDeps.map(id => getModuleName(allModules, id)).join(', ')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {isActive && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onManageInstances(module.moduleId)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Instâncias
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export function PortalModules() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI State
  const [showBrowser, setShowBrowser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  // Filter modules based on search and filters
  const filteredModules = useMemo(() => {
    let filtered = allEnrichedModules;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.moduleId.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(m => m.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(m => m.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(m => !m.isActive);
    }

    // Sort: alphabetically by name (fixed order)
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [allEnrichedModules, searchQuery, typeFilter, statusFilter]);

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
  const handleToggleActive = (module: ModuleWithStatus, newState: boolean) => {
    if (newState) {
      // Activating
      handleActivateClick(module);
    } else {
      // Deactivating
      handleDeactivateClick(module);
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

      // IMPORTANTE: Invalidar cache de instâncias para refletir instâncias criadas automaticamente
      // (especialmente para módulos single-instance que criam instância "default" automaticamente)
      queryClient.invalidateQueries({
        queryKey: ['backend', 'instance'],
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

      // IMPORTANTE: Invalidar cache de instâncias para refletir instâncias removidas automaticamente
      // (especialmente para módulos single-instance que removem instância "default" automaticamente)
      queryClient.invalidateQueries({
        queryKey: ['backend', 'instance'],
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

  if (isLoading) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>Carregando módulos...</p>
          </div>
        </div>
      </Page>
    );
  }

  if (!portal) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Portal não encontrado</AlertDescription>
          </Alert>
        </div>
      </Page>
    );
  }

  const activeCount = allEnrichedModules.filter(m => m.isActive).length;
  const inactiveCount = allEnrichedModules.filter(m => !m.isActive).length;

  return (
    <Page composition="settings">
      <div className="p-6 space-y-6">
      {/* Breadcrumb */}

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
            {portal.name} - {activeCount} ativos, {inactiveCount} inativos
          </p>
        </div>
        <Button onClick={() => setShowBrowser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulos
        </Button>
      </div>

      {/* Filters */}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos ({activeCount})</SelectItem>
            <SelectItem value="inactive">Inativos ({inactiveCount})</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Nenhum módulo encontrado
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => (
            <UnifiedModuleCard
              key={module.moduleId}
              module={module}
              allModules={allModules}
              activeModuleIds={portal.activeModules}
              onToggleActive={handleToggleActive}
              onManageInstances={(moduleId) =>
                navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)
              }
            />
          ))}
        </div>
      )}

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
    </Page>
  );
}
