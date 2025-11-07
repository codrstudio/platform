// Instance List Page
// Based on spec/ui/setup-module-interfaces.md Section 4.5

import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Settings, Trash2, Layers } from 'lucide-react';
import { usePortal, useInstances, useUpdateInstance, useDeleteInstance } from '@/hooks/useJQEL';

export function InstanceList() {
  const { portalId, moduleId } = useParams<{ portalId: string; moduleId: string }>();
  const navigate = useNavigate();

  const { data: portalResult, isLoading: isLoadingPortal } = usePortal(portalId!);
  const { data: instancesResult, isLoading: isLoadingInstances } = useInstances(portalId, moduleId);
  const updateInstanceMutation = useUpdateInstance();
  const deleteInstanceMutation = useDeleteInstance();

  const portal = portalResult?.data?.[0];
  const instances = instancesResult?.data || [];
  const isLoading = isLoadingPortal || isLoadingInstances;

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

  const deleteInstance = async (instanceId: string) => {
    if (!confirm(`Tem certeza que deseja excluir esta instância?`)) {
      return;
    }

    try {
      await deleteInstanceMutation.mutateAsync({
        where: {
          instanceId: { $eq: instanceId },
          portalId: { $eq: portalId! },
        },
      });
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando instâncias...</p>
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
            Instâncias do Módulo
          </h1>
          <p className="text-muted-foreground mt-2">
            {portal.name} - {moduleId}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Instância
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Instâncias</CardTitle>
          <CardDescription>
            Uma instância representa uma configuração específica de um módulo.
            O mesmo módulo pode ter múltiplas instâncias com configurações diferentes.
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => deleteInstance(instance.instanceId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Instância
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
