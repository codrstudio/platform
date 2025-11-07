// Portal Form Page
// Based on spec/ui/setup-module-interfaces.md Section 4.2

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { usePortal, useCreatePortal, useUpdatePortal } from '@/hooks/useJQEL';

export function PortalForm() {
  const { portalId } = useParams<{ portalId: string }>();
  const navigate = useNavigate();
  const isEditing = portalId && portalId !== 'new';

  const { data: portalResult, isLoading } = usePortal(portalId || '');
  const createPortalMutation = useCreatePortal();
  const updatePortalMutation = useUpdatePortal();

  const [formData, setFormData] = useState({
    portalId: '',
    name: '',
    description: '',
    settingsKey: 'default',
    removable: true,
    activeModules: [] as string[],
  });

  useEffect(() => {
    if (isEditing && portalResult?.data?.[0]) {
      const portal = portalResult.data[0];
      setFormData({
        portalId: portal.portalId,
        name: portal.name,
        description: portal.description || '',
        settingsKey: portal.settingsKey || 'default',
        removable: portal.removable,
        activeModules: portal.activeModules || [],
      });
    }
  }, [isEditing, portalResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updatePortalMutation.mutateAsync({
          values: {
            name: formData.name,
            description: formData.description,
            settingsKey: formData.settingsKey,
            removable: formData.removable,
          },
          where: { portalId: { $eq: portalId! } },
        });
      } else {
        await createPortalMutation.mutateAsync({
          values: {
            portalId: formData.portalId,
            name: formData.name,
            description: formData.description,
            settingsKey: formData.settingsKey,
            removable: formData.removable,
            activeModules: [],
          },
        });
      }

      navigate('/setup/portals');
    } catch (error) {
      console.error('Error saving portal:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSaving = createPortalMutation.isPending || updatePortalMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando portal...</p>
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
          onClick={() => navigate('/setup/portals')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Portal' : 'Novo Portal'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? 'Atualize as configurações do portal'
              : 'Crie um novo portal na plataforma'}
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
            {/* Portal ID */}
            <div className="space-y-2">
              <Label htmlFor="portalId">Portal ID</Label>
              <Input
                id="portalId"
                value={formData.portalId}
                onChange={(e) => handleChange('portalId', e.target.value)}
                disabled={!!isEditing}
                placeholder="ex: meu-portal"
                required
              />
              <p className="text-sm text-muted-foreground">
                Identificador único do portal (apenas letras minúsculas, números e hífen)
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

            {/* Settings Key */}
            <div className="space-y-2">
              <Label htmlFor="settingsKey">Settings Key</Label>
              <Input
                id="settingsKey"
                value={formData.settingsKey}
                onChange={(e) => handleChange('settingsKey', e.target.value)}
                placeholder="ex: portal-settings"
              />
              <p className="text-sm text-muted-foreground">
                Chave para armazenamento de configurações (opcional)
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
            {isSaving ? 'Salvando...' : 'Salvar Portal'}
          </Button>
        </div>
      </form>

      {/* Additional Actions (only when editing) */}
      {isEditing && (
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
      )}
    </div>
  );
}
