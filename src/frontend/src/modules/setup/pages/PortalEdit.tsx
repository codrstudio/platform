// Portal Edit Page
// Based on spec/ui/setup-module-interfaces.md Section 4.2
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { usePortal, useUpdatePortal, useRealms } from '@/hooks/useJQEL';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';
import { RealmQuickCreate } from '../components/RealmQuickCreate';
export function PortalEdit() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const { data: portalResult, isLoading } = usePortal(portalId || '');
  const { data: realmsResult, isLoading: realmsLoading } = useRealms();
  const updatePortalMutation = useUpdatePortal();
  const portal = portalResult?.data?.[0];
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => [
    { label: 'Setup', href: '/setup' },
    { label: 'Portais', href: '/setup/portals' },
    { label: portal?.name || 'Editar Portal' }
  ], [portal?.name]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    realmId: 'default',
    removable: true,
  });
  const realms = realmsResult?.data || [];
  useEffect(() => {
    if (portal) {
      setFormData({
        name: portal.name,
        description: portal.description || '',
        realmId: portal.realmId || 'default',
        removable: portal.removable,
      });
    }
  }, [portal]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalId) return;
    try {
      await updatePortalMutation.mutateAsync({
        values: {
          name: formData.name,
          description: formData.description,
          realmId: formData.realmId,
          removable: formData.removable,
        },
        where: { portalId: { $eq: portalId } },
      });
      navigate('/setup/portals');
    } catch (error) {
      console.error('Error updating portal:', error);
    }
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleRealmCreated = (newRealmId: string) => {
    // Seleciona automaticamente o ambiente recém-criado
    setFormData(prev => ({ ...prev, realmId: newRealmId }));
  };
  const isSaving = updatePortalMutation.isPending;
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando portal...</p>
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
          onClick={() => navigate('/setup/portals')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Atualize as configurações do portal "{portal.name}"
          </p>
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure as informações principais do portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portal ID - Read only */}
            <div className="space-y-2">
              <Label htmlFor="portalId">Portal ID</Label>
              <Input
                id="portalId"
                value={portalId}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                O ID do portal não pode ser alterado
              </p>
            </div>
            <Separator />
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ex: Meu Portal"
                required
              />
              <p className="text-sm text-muted-foreground">
                Nome exibido do portal
              </p>
            </div>
            <Separator />
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição do portal"
              />
              <p className="text-sm text-muted-foreground">
                Breve descrição sobre o propósito do portal (opcional)
              </p>
            </div>
            <Separator />
            {/* Realm ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="realmId">Ambiente</Label>
                <RealmQuickCreate onRealmCreated={handleRealmCreated} />
              </div>
              <Select
                value={formData.realmId}
                onValueChange={(value) => handleChange('realmId', value)}
                disabled={realmsLoading}
              >
                <SelectTrigger id="realmId">
                  <SelectValue placeholder="Selecione um ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {realms.map((realm) => (
                    <SelectItem key={realm.realmId} value={realm.realmId}>
                      {realm.name}
                      {realm.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({realm.description})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Ambiente ao qual este portal pertence (compartilha configurações como tema)
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/setup/portals')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
      {/* Additional Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/setup/portals/${portalId}/theme`)}>
          <CardHeader>
            <CardTitle>Tema do Portal</CardTitle>
            <CardDescription>
              Configure cores e aparência personalizada
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/setup/portals/${portalId}/modules`)}>
          <CardHeader>
            <CardTitle>Módulos Ativos</CardTitle>
            <CardDescription>
              Gerencie módulos e instâncias do portal
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
