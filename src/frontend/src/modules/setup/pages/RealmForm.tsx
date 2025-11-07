// Realm Form Page
// Realm System - Formulário de criação/edição de Reino

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { useRealm, useCreateRealm, useUpdateRealm } from '@/hooks/useJQEL';

export function RealmForm() {
  const { realmId } = useParams<{ realmId: string }>();
  const navigate = useNavigate();
  const isEditing = realmId && realmId !== 'new';

  const { data: realmResult, isLoading } = useRealm(realmId || '');
  const createRealmMutation = useCreateRealm();
  const updateRealmMutation = useUpdateRealm();

  const [formData, setFormData] = useState({
    realmId: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (isEditing && realmResult?.data) {
      const realm = realmResult.data;
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
          realmId: realmId!,
          updates: {
            name: formData.name,
            description: formData.description,
          },
        });
      } else {
        await createRealmMutation.mutateAsync({
          realmId: formData.realmId,
          name: formData.name,
          description: formData.description,
          removable: true,
        });
      }

      navigate('/setup/realms');
    } catch (error) {
      console.error('Error saving realm:', error);
      alert('Erro ao salvar reino. Verifique o console para mais detalhes.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSaving = createRealmMutation.isPending || updateRealmMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando reino...</p>
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
          onClick={() => navigate('/setup/realms')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Reino' : 'Novo Reino'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? 'Atualize as configurações do reino'
              : 'Crie um novo reino para agrupar portais'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure as informações principais do reino
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
                placeholder="ex: meu-reino"
                required
              />
              <p className="text-sm text-muted-foreground">
                Identificador único do reino (apenas letras minúsculas, números e hífen)
              </p>
              {isEditing && (
                <p className="text-sm text-amber-600">
                  O ID do reino não pode ser alterado após a criação
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
                placeholder="ex: Meu Reino"
                required
              />
              <p className="text-sm text-muted-foreground">
                Nome exibido do reino
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
                placeholder="Descrição do reino"
              />
              <p className="text-sm text-muted-foreground">
                Breve descrição sobre o propósito do reino (opcional)
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
            {isSaving ? 'Salvando...' : 'Salvar Reino'}
          </Button>
        </div>
      </form>

      {/* Additional Actions (only when editing) */}
      {isEditing && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/setup/realms/${realmId}/theme`)}>
            <CardHeader>
              <CardTitle>Tema do Reino</CardTitle>
              <CardDescription>
                Configure cores e aparência padrão para todos os portais deste reino
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/setup/realms/${realmId}/portals`)}>
            <CardHeader>
              <CardTitle>Portais do Reino</CardTitle>
              <CardDescription>
                Visualize e gerencie portais que pertencem a este reino
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
