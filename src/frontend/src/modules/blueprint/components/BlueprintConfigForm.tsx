// BlueprintConfigForm.tsx
// Custom configuration component for Blueprint module instance
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HomepageToggle } from '@/components/module';
import type { ConfigComponentProps } from '@/types/module';

// Validation schema
const blueprintConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  mainRoute: z
    .string()
    .regex(/^\/[a-z0-9-]+$/, 'Rota deve começar com / e conter apenas letras minúsculas, números e hífens')
    .min(2, 'Rota deve ter pelo menos 2 caracteres'),
});

type BlueprintConfigFormData = z.infer<typeof blueprintConfigSchema>;

export function BlueprintConfigForm({
  portalId,
  config,
  onSave,
  onCancel,
}: ConfigComponentProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<BlueprintConfigFormData>({
    resolver: zodResolver(blueprintConfigSchema),
    defaultValues: {
      title: (config.title as string) || 'Blueprint Module',
      description: (config.description as string) || '',
      mainRoute: (config.mainRoute as string) || '/ola',
    },
  });

  // Reset form when config changes (important for cache updates)
  useEffect(() => {
    reset({
      title: (config.title as string) || 'Blueprint Module',
      description: (config.description as string) || '',
      mainRoute: (config.mainRoute as string) || '/ola',
    });
  }, [config, reset]);

  // Watch mainRoute para passar para HomepageToggle
  const mainRoute = watch('mainRoute');

  const onSubmit = async (data: BlueprintConfigFormData) => {
    setIsSaving(true);
    try {
      await onSave({
        ...config,
        title: data.title,
        description: data.description,
        mainRoute: data.mainRoute,
      });
    } catch (error) {
      console.error('Error saving blueprint config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Configure os parâmetros do módulo Blueprint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Blueprint Module"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Título exibido na página do módulo
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Exemplo de módulo bem estruturado"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Descrição do módulo
            </p>
          </div>

          {/* Main Route Field */}
          <div className="space-y-2">
            <Label htmlFor="mainRoute">Rota Principal</Label>
            <Input
              id="mainRoute"
              {...register('mainRoute')}
              placeholder="/ola"
            />
            {errors.mainRoute && (
              <p className="text-sm text-destructive">{errors.mainRoute.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Rota principal do módulo (deve começar com /, apenas minúsculas, números e hífens)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Homepage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage do Portal</CardTitle>
          <CardDescription>
            Configure se este módulo deve ser a homepage do portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HomepageToggle
            portalId={portalId}
            moduleRoute={mainRoute}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Quando ativado, os usuários serão redirecionados para <code className="px-1 py-0.5 bg-muted rounded text-xs">{mainRoute}</code> ao acessar a raiz do portal.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
        >
          {isSaving ? 'Salvando...' : 'Salvar Instância'}
        </Button>
      </div>
    </form>
  );
}
