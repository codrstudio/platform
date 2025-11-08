// Portal List Page
// Based on spec/ui/setup-module-interfaces.md Section 4.1

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Layers } from 'lucide-react';
import { PageBreadcrumb } from '@/components/navigation';
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb';
import { usePortals, useDeletePortal } from '@/hooks/useJQEL';

export function PortalList() {
  const { data: portalsResult, isLoading } = usePortals();
  const deletePortalMutation = useDeletePortal();
  const breadcrumbItems = useSetupBreadcrumb('Portais');

  const portals = portalsResult?.data || [];

  const handleDeletePortal = async (portalId: string) => {
    if (!confirm(`Tem certeza que deseja excluir o portal ${portalId}?`)) {
      return;
    }

    try {
      await deletePortalMutation.mutateAsync({
        where: { portalId: { $eq: portalId } },
      });
    } catch (error) {
      console.error('Error deleting portal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando portais...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Portais</h1>
          <p className="text-muted-foreground mt-2">
            Configure portais, módulos e instâncias
          </p>
        </div>
        <Link to="/setup/portals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Portal
          </Button>
        </Link>
      </div>

      {/* Portal Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portals.map((portal) => (
          <Card key={portal.portalId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {portal.name}
                    {!portal.removable && (
                      <Badge variant="secondary" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {portal.description || 'Sem descrição'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Portal ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {portal.portalId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reino:</span>
                  <Badge variant="outline" className="text-xs">
                    {portal.realmId}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Módulos Ativos:</span>
                  <Badge variant="outline">
                    <Layers className="h-3 w-3 mr-1" />
                    {portal.activeModules.length}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link to={`/setup/portals/${portal.portalId}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </Link>
                {portal.removable && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeletePortal(portal.portalId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum portal encontrado</p>
            <Link to="/setup/portals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
