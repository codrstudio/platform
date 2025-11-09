// Realm List Page
// Realm System - Gerenciamento de Ambientes

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Globe } from 'lucide-react';
import { useRealms, useDeleteRealm, usePortals } from '@/hooks/useJQEL';
import { useMemo } from 'react';
import { PageBreadcrumb } from '@/components/navigation';
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb';

export function RealmList() {
  const breadcrumbItems = useSetupBreadcrumb('Ambientes');
  const { data: realmsResult, isLoading: realmsLoading } = useRealms();
  const { data: portalsResult } = usePortals();
  const deleteRealmMutation = useDeleteRealm();

  const realms = realmsResult?.data || [];
  const portals = portalsResult?.data || [];

  // Calculate portal count per realm
  const realmPortalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    portals.forEach((portal) => {
      counts[portal.realmId] = (counts[portal.realmId] || 0) + 1;
    });
    return counts;
  }, [portals]);

  const handleDeleteRealm = async (realmId: string, realmName: string) => {
    const portalCount = realmPortalCounts[realmId] || 0;
    const message = portalCount > 0
      ? `Tem certeza que deseja excluir o ambiente "${realmName}"?\n\n${portalCount} portal(is) será(ão) movido(s) para o ambiente "default".`
      : `Tem certeza que deseja excluir o ambiente "${realmName}"?`;

    if (!confirm(message)) {
      return;
    }

    try {
      await deleteRealmMutation.mutateAsync(realmId);
    } catch (error) {
      console.error('Error deleting realm:', error);
      alert('Erro ao excluir ambiente. Verifique o console para mais detalhes.');
    }
  };

  if (realmsLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando ambientes...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Ambientes</h1>
          <p className="text-muted-foreground mt-2">
            Configure ambientes para agrupar portais e compartilhar configurações
          </p>
        </div>
        <Link to="/setup/realms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Ambiente
          </Button>
        </Link>
      </div>

      {/* Realm Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {realms.map((realm) => {
          const portalCount = realmPortalCounts[realm.realmId] || 0;

          return (
            <Card key={realm.realmId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {realm.name}
                      {!realm.removable && (
                        <Badge variant="secondary" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {realm.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Realm ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {realm.realmId}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Portais:</span>
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      {portalCount}
                    </Badge>
                  </div>
                  {realm.config?.theme?.brandColor && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cor do tema:</span>
                      <div
                        className="h-5 w-5 rounded-full border-2 border-border"
                        style={{
                          backgroundColor: `hsl(${realm.config.theme.brandColor})`,
                        }}
                        title={realm.config.theme.brandColor}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/setup/realms/${realm.realmId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </Link>
                  {realm.removable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteRealm(realm.realmId, realm.name)}
                      disabled={deleteRealmMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {realms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum ambiente encontrado</p>
            <Link to="/setup/realms/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Ambiente
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
