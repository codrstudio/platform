// Instance Form Page
// Allows creating and editing module instances with dynamic configuration

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useInstance, useModule, useCreateInstance, useUpdateInstance } from '@/hooks/useJQEL';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';

export function InstanceForm() {
  const { portalId, moduleId, instanceId } = useParams<{ portalId: string; moduleId: string; instanceId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!instanceId;

  const { data: instanceResult } = useInstance(instanceId || '', portalId!);
  const { data: moduleResult } = useModule(moduleId!);
  const createMutation = useCreateInstance();
  const updateMutation = useUpdateInstance();

  const instance = instanceResult?.data?.[0];
  const module = moduleResult?.data?.[0];

  const [formData, setFormData] = useState({
    instanceId: '',
    name: '',
    description: '',
    config: {} as Record<string, unknown>,
    active: true,
  });

  // Update form when instance data loads
  useEffect(() => {
    if (instance) {
      setFormData({
        instanceId: instance.instanceId,
        name: instance.instanceId, // Instance doesn't have 'name' field
        description: '',
        config: instance.config || {},
        active: instance.active ?? true,
      });
    }
  }, [instance]);

  // Breadcrumb dinâmico
  const breadcrumbItems = useMemo<BreadcrumbItemData[]>(() => {
    const moduleName = module?.name || 'Módulo';
    return [
      { label: 'Home', href: '/' },
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalId || 'Portal', href: `/setup/portals/${portalId}` },
      { label: 'Módulos', href: `/setup/portals/${portalId}/modules` },
      { label: moduleName, href: `/setup/portals/${portalId}/modules/${moduleId}/instances` },
      { label: isEdit ? 'Editar Instância' : 'Nova Instância' }
    ];
  }, [module?.name, portalId, moduleId, isEdit]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          values: {
            config: formData.config,
            active: formData.active
          },
          where: {
            portalId: { $eq: portalId! },
            instanceId: { $eq: instanceId! },
          },
        });
      } else {
        await createMutation.mutateAsync({
          values: {
            instanceId: formData.instanceId,
            portalId: portalId!,
            moduleId: moduleId!,
            config: formData.config,
            active: formData.active,
          },
        });
      }

      navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
    } catch (error) {
      console.error('Error saving instance:', error);
      alert('Erro ao salvar instância');
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  if (!module) {
    return (
      <div className="container mx-auto p-6">
        <p>Carregando módulo...</p>
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
          onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar' : 'Nova'} Instância
          </h1>
          <p className="text-muted-foreground mt-2">
            {module.name} - Configure os parâmetros da instância
          </p>
        </div>
      </div>

      {/* Basic Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Configure as informações básicas da instância do módulo {module.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instanceId">ID da Instância</Label>
            <Input
              id="instanceId"
              value={formData.instanceId}
              onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
              disabled={isEdit}
              placeholder="ex: main-chat"
            />
            {!isEdit && (
              <p className="text-sm text-muted-foreground mt-1">
                Identificador único da instância (não pode ser alterado depois)
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label>Instância ativa</Label>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Configure parâmetros específicos do módulo {module.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {module.metadata?.configSchema ? (
            <div className="space-y-4">
              {Object.entries(module.metadata.configSchema as Record<string, any>).map(([key, schema]) => (
                <div key={key}>
                  <Label htmlFor={`config-${key}`}>{schema.label || key}</Label>
                  {schema.type === 'string' && (
                    <Input
                      id={`config-${key}`}
                      value={(formData.config[key] as string) || ''}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      placeholder={schema.placeholder}
                    />
                  )}
                  {schema.type === 'number' && (
                    <Input
                      id={`config-${key}`}
                      type="number"
                      value={(formData.config[key] as number) || ''}
                      onChange={(e) => handleConfigChange(key, Number(e.target.value))}
                      placeholder={schema.placeholder}
                    />
                  )}
                  {schema.type === 'boolean' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={(formData.config[key] as boolean) || false}
                        onCheckedChange={(checked) => handleConfigChange(key, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {schema.description || 'Ativar/desativar'}
                      </span>
                    </div>
                  )}
                  {schema.description && schema.type !== 'boolean' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {schema.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Este módulo não possui configurações específicas.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!formData.instanceId || createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Salvando...'
            : isEdit ? 'Salvar' : 'Criar'} Instância
        </Button>
      </div>
    </div>
  );
}
