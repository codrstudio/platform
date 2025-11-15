// Realm Form Page
// Realm System - Formulário de criação/edição de Ambiente
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { useRealm, useCreateRealm, useUpdateRealm } from '@/hooks/jqel/useRealm';
import { toastError } from '@/lib/toast';
export function RealmForm() {
  const { realmId } = useParams<{ realmId: string }>();
  const navigate = useNavigate();
  const isEditing = realmId && realmId !== 'new';
  const { data: realmResult, isLoading } = useRealm(realmId || '');
  const createRealmMutation = useCreateRealm();
  const updateRealmMutation = useUpdateRealm();
  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const realmName = realmResult?.data?.[0]?.name || 'Novo Ambiente';
    return [
      { label: 'Setup', href: '/setup' },
      { label: 'Ambientes', href: '/setup/realms' },
      { label: isEditing ? realmName : 'Novo Ambiente' }
    ];
  }, [isEditing, realmResult?.data]);
  const [formData, setFormData] = useState({
    realmId: '',
    name: '',
    description: '',
  });
  useEffect(() => {
    if (isEditing && realmResult?.data?.[0]) {
      const realm = realmResult.data[0];
      setFormData({
        realmId: realm.realmId,
        name: realm.name,
        description: realm.description || '',
      });
    }
  }, [isEditing, realmResult]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateRealmMutation.mutateAsync({
          values: {
            name: formData.name,
            description: formData.description,
          },
          where: {
            realmId: { $eq: realmId! },
          },
        });
      } else {
        await createRealmMutation.mutateAsync({
          values: {
            realmId: formData.realmId,
            name: formData.name,
            description: formData.description,
            removable: true,
          },
        });
      }
      navigate('/setup/realms');
    } catch (error) {
      console.error('Error saving realm:', error);
      toastError('Erro ao salvar ambiente', {
        description: 'Verifique o console para mais detalhes'
      });
    }
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const isSaving = createRealmMutation.isPending || updateRealmMutation.isPending;
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando ambiente...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/setup/realms')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Ambiente' : 'Novo Ambiente'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? 'Atualize as configurações do ambiente'
              : 'Crie um novo ambiente para agrupar portais'}
          </p>
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure as informações principais do ambiente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Realm ID */}
            <div className="space-y-2">
              <Label htmlFor="realmId">Realm ID</Label>
              <Input
                id="realmId"
                value={formData.realmId}
                onChange={(e) => handleChange('realmId', e.target.value)}
                disabled={!!isEditing}
                placeholder="ex: meu-ambiente"
                required
              />
              <p className="text-sm text-muted-foreground">
                Identificador único do ambiente (apenas letras minúsculas, números e hífen)
              </p>
              {isEditing && (
                <p className="text-sm text-amber-600">
                  O ID do ambiente não pode ser alterado após a criação
                </p>
              )}
            </div>
            <Separator />
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ex: Meu Ambiente"
                required
              />
              <p className="text-sm text-muted-foreground">
                Nome exibido do ambiente
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
                placeholder="Descrição do ambiente"
              />
              <p className="text-sm text-muted-foreground">
                Breve descrição sobre o propósito do ambiente (opcional)
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/setup/realms')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Ambiente'}
          </Button>
        </div>
      </form>
    </div>
  );
}
