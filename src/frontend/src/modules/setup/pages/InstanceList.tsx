// Instance List Page
// Based on spec/ui/setup-module-interfaces.md Section 4.5
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Plus, Settings, Trash2, Layers, Info } from 'lucide-react';
import { usePortal } from '@/hooks/jqel/usePortal';
import { useInstances, useUpdateInstance, useDeleteInstance } from '@/hooks/jqel/useInstance';
import { useModule } from '@/hooks/jqel/useModule';
import { Page } from '@/core/composition';
export function InstanceList() {
  const { portalId, moduleId } = useParams<{ portalId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { data: portalResult, isLoading: isLoadingPortal } = usePortal(portalId!);
  const { data: instancesResult, isLoading: isLoadingInstances } = useInstances(portalId, moduleId);
  const { data: moduleResult, isLoading: isLoadingModule } = useModule(moduleId!);
  const updateInstanceMutation = useUpdateInstance();
  const deleteInstanceMutation = useDeleteInstance();
  const portal = portalResult?.data?.[0];
  const module = moduleResult?.data?.[0]; // Fix: module is an array
  const instances = instancesResult?.data || [];
  const isLoading = isLoadingPortal || isLoadingInstances || isLoadingModule;
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    instanceId: string;
  }>({
    open: false,
    instanceId: '',
  });
  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const portalName = portal?.name || 'Portal';
    const moduleName = module?.name || moduleId || 'Módulo';
    return [
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalName, href: `/setup/portals/${portalId}` },
      { label: 'Módulos', href: `/setup/portals/${portalId}/modules` },
      { label: moduleName },
      { label: 'Instâncias' }
    ];
  }, [portal?.name, portalId, module?.name, moduleId]);
  const toggleInstance = async (instanceId: string) => {
    const instance = instances.find(i => i.instanceId === instanceId);
    if (!instance) return;
    try {
      await updateInstanceMutation.mutateAsync({
        values: { active: !instance.active },
        where: {
          instanceId: { $eq: instanceId },
          portalId: { $eq: portalId! },
        },
      });
    } catch (error) {
      console.error('Error toggling instance:', error);
    }
  };
  const deleteInstance = (instanceId: string) => {
    setDeleteDialog({ open: true, instanceId });
  };
  const confirmDeleteInstance = async () => {
    try {
      await deleteInstanceMutation.mutateAsync({
        where: {
          instanceId: { $eq: deleteDialog.instanceId },
          portalId: { $eq: portalId! },
        },
      });
      setDeleteDialog({ open: false, instanceId: '' });
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };
  if (isLoading) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <p>Carregando instâncias...</p>
        </div>
      </Page>
    );
  }
  if (!portal) {
    return (
      <Page composition="settings">
        <div className="p-6">
          <p>Portal não encontrado</p>
        </div>
      </Page>
    );
  }
  return (
    <Page composition="settings">
      <div className="p-6 space-y-8">
      {/* Breadcrumb */}
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/setup/portals/${portalId}/modules`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Instâncias do Módulo: {module?.name || moduleId}
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} - {moduleId}
          </p>
        </div>
        {/* SPEC-MS-UI-025: Ocultar botão Nova Instância para módulos single-instance */}
        {!module?.singleInstance && (
          <Button onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Instância
          </Button>
        )}
      </div>
      {/* SPEC-MS-UI-028: Aviso informativo para módulos single-instance */}
      {module?.singleInstance && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este módulo permite apenas UMA instância por portal. A instância é criada automaticamente ao ativar o módulo.
          </AlertDescription>
        </Alert>
      )}
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Instâncias</CardTitle>
          <CardDescription>
            {module?.singleInstance ? (
              <>
                Este é um módulo <strong>single-instance</strong>. Apenas uma instância é permitida por portal,
                criada automaticamente com o ID "default". Você pode configurar e ativar/desativar a instância,
                mas não pode criar instâncias adicionais ou remover a instância default.
              </>
            ) : (
              <>
                Uma instância representa uma configuração específica de um módulo.
                O mesmo módulo pode ter múltiplas instâncias com configurações diferentes.
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
      {/* Instances List */}
      <div className="space-y-4">
        {instances.map((instance) => (
          <Card key={instance.instanceId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{instance.instanceId}</CardTitle>
                      <Badge variant={instance.active ? 'default' : 'secondary'}>
                        {instance.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {/* SPEC-MS-UI-028: Badge "Instância Única" para módulos single-instance */}
                      {module?.singleInstance && (
                        <Badge variant="outline" className="gap-1">
                          <Layers className="h-3 w-3" />
                          Instância Única
                        </Badge>
                      )}
                    </div>
                    {instance.createdAt && (
                      <CardDescription className="mt-1">
                        Criado em {new Date(instance.createdAt).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Módulo: <span className="text-foreground">{instance.moduleId}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Portal: <span className="text-foreground">{instance.portalId}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/${instance.instanceId}`)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                  <Button
                    variant={instance.active ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => toggleInstance(instance.instanceId)}
                  >
                    {instance.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  {/* SPEC-MS-UI-027: Ocultar botão deletar para instância default de módulo single-instance */}
                  {!(module?.singleInstance && instance.instanceId === 'default') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteInstance(instance.instanceId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {instances.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma instância encontrada</p>
            <Button onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Instância
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir instância?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a instância <strong>{deleteDialog.instanceId}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteInstance} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </Page>
  );
}
