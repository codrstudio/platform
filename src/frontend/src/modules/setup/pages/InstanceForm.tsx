// Instance Form Page
// Allows creating and editing module instances with dynamic configuration
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Info, Lock } from 'lucide-react';
import { useInstance, useCreateInstance, useUpdateInstance } from '@/hooks/jqel/useInstance';
import { useModule } from '@/hooks/jqel/useModule';
import { PageBreadcrumb, type BreadcrumbItemData } from '@/components/navigation';
import { toastError } from '@/lib/toast';
import { moduleRegistry } from '@/core/modules';
export function InstanceForm() {
  const { portalId, moduleId, instanceId } = useParams<{ portalId: string; moduleId: string; instanceId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!instanceId;
  const { data: instanceResult } = useInstance(instanceId || '', portalId!, moduleId!);  // ← Passa moduleId
  const { data: moduleResult } = useModule(moduleId!);
  const createMutation = useCreateInstance();
  const updateMutation = useUpdateInstance();
  const instance = instanceResult?.data?.[0];
  const module = moduleResult?.data?.[0];

  // Get module exports for custom config component
  const moduleExports = moduleId ? moduleRegistry.getModule(moduleId) : undefined;
  const CustomConfigComponent = moduleExports?.configComponent;
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
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: portalId || 'Portal', href: `/setup/portals/${portalId}` },
      { label: 'Módulos', href: `/setup/portals/${portalId}/modules` },
      { label: moduleName, href: `/setup/portals/${portalId}/modules/${moduleId}/instances` },
      { label: isEdit ? 'Editar Instância' : 'Nova Instância' }
    ];
  }, [module?.name, portalId, moduleId, isEdit]);
  const handleSave = async (configOverride?: Record<string, any>) => {
    try {
      // Use configOverride if provided, otherwise use formData.config
      const configToSave = configOverride ?? formData.config;

      if (isEdit) {
        await updateMutation.mutateAsync({
          values: {
            config: configToSave,
            active: formData.active
          },
          where: {
            portalId: { $eq: portalId! },
            instanceId: { $eq: instanceId! },
            moduleId: { $eq: moduleId! },  // ← CRÍTICO: incluir moduleId no where!
          },
        });
      } else {
        await createMutation.mutateAsync({
          values: {
            instanceId: formData.instanceId,
            portalId: portalId!,
            moduleId: moduleId!,
            config: configToSave,
            active: formData.active,
          },
        });
      }
      navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
    } catch (error) {
      console.error('Error saving instance:', error);
      toastError('Erro ao salvar instância', {
        description: 'Verifique o console para mais detalhes'
      });
    }
  };
  const handleConfigChange = (key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  // Handlers for custom config component
  const handleCustomConfigSave = async (newConfig: Record<string, any>) => {
    // Pass newConfig directly to handleSave to avoid race condition
    await handleSave(newConfig);
  };

  const handleCustomConfigCancel = () => {
    navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
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
      {CustomConfigComponent ? (
        // Render custom configuration component
        <Suspense fallback={
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando configurações...</p>
            </CardContent>
          </Card>
        }>
          <CustomConfigComponent
            instanceId={instanceId || ''}
            portalId={portalId || ''}
            moduleId={moduleId || ''}
            config={formData.config}
            onSave={handleCustomConfigSave}
            onCancel={handleCustomConfigCancel}
          />
        </Suspense>
      ) : (
        // Render default schema-based configuration
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
                    {schema.type === 'array' && schema.ui === 'tag-input' && (
                      <div className="space-y-3">
                        <TagInput
                          value={(formData.config[key] as string[]) || []}
                          onChange={(values) => handleConfigChange(key, values)}
                          label=""
                          description={schema.description}
                          placeholder="Digite um papel e pressione Enter"
                        />
                        {/* Info card dinâmico */}
                        {(!formData.config[key] || !Array.isArray(formData.config[key]) || (formData.config[key] as string[]).length === 0) ? (
                          <Alert variant="default" className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
                            <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription>
                              <strong>Acesso Autenticado:</strong> Somente usuários autenticados têm acesso ao sistema.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="default" className="border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">
                            <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <AlertDescription>
                              <strong>Acesso Restrito:</strong> Apenas usuários com os papéis listados podem acessar este portal.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    {schema.description && schema.type !== 'boolean' && schema.type !== 'array' && (
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
      )}

      {/* Actions - Only show when there's NO custom config component */}
      {!CustomConfigComponent && (
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
      )}
    </div>
  );
}
