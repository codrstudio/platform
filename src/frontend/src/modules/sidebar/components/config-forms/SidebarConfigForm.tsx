/**
 * Sidebar Configuration Form
 *
 * Formulário customizado para configuração do módulo Sidebar
 * Segue o padrão Blueprint com React Hook Form + Zod
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  sidebarConfigSchema,
  type SidebarConfigFormData,
} from '../../schemas/sidebarConfigSchema';
import { MenuItemsEditor } from './menu-items-editor';
import type { ConfigComponentProps } from '@/types/module';

export function SidebarConfigForm({
  portalId,
  config,
  onSave,
  onCancel,
}: ConfigComponentProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  // React Hook Form + Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<SidebarConfigFormData>({
    resolver: zodResolver(sidebarConfigSchema),
    defaultValues: {
      layout: (config.layout as 'sidebar-left' | 'sidebar-right') || 'sidebar-left',
      items: (config.items as any) || [],
      enableSearch: (config.enableSearch as boolean) ?? false,
      enableUserMenu: (config.enableUserMenu as boolean) ?? false,
      enableThemeToggle: (config.enableThemeToggle as boolean) ?? false,
      portalName: (config.brand?.portalName as string) || 'Portal',
      showLogo: (config.brand?.showLogo as boolean) ?? true,
      width: (config.width as number) || 256,
      collapsedWidth: (config.collapsedWidth as number) || 80,
      collapsible: (config.collapsible as boolean) ?? true,
      defaultCollapsed: (config.defaultCollapsed as boolean) ?? false,
      persistState: (config.persistState as boolean) ?? true,
      closeOnNavigate: (config.closeOnNavigate as boolean) ?? true,
      variant: (config.variant as 'default' | 'bordered' | 'floating') || 'default',
      showIcons: (config.showIcons as boolean) ?? true,
      showBadges: (config.showBadges as boolean) ?? true,
      checkPermissions: (config.checkPermissions as boolean) ?? false,
    },
  });

  // Sync form quando config muda (important para cache updates)
  React.useEffect(() => {
    reset({
      layout: (config.layout as 'sidebar-left' | 'sidebar-right') || 'sidebar-left',
      items: (config.items as any) || [],
      enableSearch: (config.enableSearch as boolean) ?? false,
      enableUserMenu: (config.enableUserMenu as boolean) ?? false,
      enableThemeToggle: (config.enableThemeToggle as boolean) ?? false,
      portalName: (config.brand?.portalName as string) || 'Portal',
      showLogo: (config.brand?.showLogo as boolean) ?? true,
      width: (config.width as number) || 256,
      collapsedWidth: (config.collapsedWidth as number) || 80,
      collapsible: (config.collapsible as boolean) ?? true,
      defaultCollapsed: (config.defaultCollapsed as boolean) ?? false,
      persistState: (config.persistState as boolean) ?? true,
      closeOnNavigate: (config.closeOnNavigate as boolean) ?? true,
      variant: (config.variant as 'default' | 'bordered' | 'floating') || 'default',
      showIcons: (config.showIcons as boolean) ?? true,
      showBadges: (config.showBadges as boolean) ?? true,
      checkPermissions: (config.checkPermissions as boolean) ?? false,
    });
  }, [config, reset]);

  // Submit handler
  const onSubmit = async (data: SidebarConfigFormData) => {
    setIsSaving(true);
    try {
      await onSave({
        layout: data.layout,
        items: data.items,
        enableSearch: data.enableSearch,
        enableUserMenu: data.enableUserMenu,
        enableThemeToggle: data.enableThemeToggle,
        brand: {
          portalName: data.portalName,
          showLogo: data.showLogo,
        },
        width: data.width,
        collapsedWidth: data.collapsedWidth,
        collapsible: data.collapsible,
        defaultCollapsed: data.defaultCollapsed,
        persistState: data.persistState,
        closeOnNavigate: data.closeOnNavigate,
        variant: data.variant,
        showIcons: data.showIcons,
        showBadges: data.showBadges,
        checkPermissions: data.checkPermissions,
      });
    } catch (error) {
      console.error('Erro ao salvar configuração do sidebar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Card 1: Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>
            Escolha a posição do sidebar na interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="layout">Posição</Label>
            <Select
              value={watch('layout')}
              onValueChange={(value) =>
                setValue('layout', value as 'sidebar-left' | 'sidebar-right', {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sidebar-left">Sidebar Esquerda</SelectItem>
                <SelectItem value="sidebar-right">Sidebar Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Brand (Logo + Nome) */}
      <Card>
        <CardHeader>
          <CardTitle>Marca</CardTitle>
          <CardDescription>
            Configure o logo e nome exibidos no topo do sidebar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portalName">Nome do Portal</Label>
            <Input
              id="portalName"
              {...register('portalName')}
              placeholder="Meu Portal"
            />
            {errors.portalName && (
              <p className="text-sm text-destructive">{errors.portalName.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Nome exibido ao lado do logo no sidebar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="showLogo"
              checked={watch('showLogo')}
              onCheckedChange={(checked) =>
                setValue('showLogo', checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="showLogo" className="cursor-pointer">
              Exibir Logo
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Menu</CardTitle>
          <CardDescription>
            Arraste para reordenar, clique para editar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemsEditor
            items={watch('items') || []}
            onChange={(items) => setValue('items', items, { shouldDirty: true })}
          />
          {errors.items && (
            <p className="text-sm text-destructive mt-2">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Card 4: Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
          <CardDescription>
            Habilite recursos adicionais do sidebar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="enableSearch"
              checked={watch('enableSearch')}
              onCheckedChange={(checked) =>
                setValue('enableSearch', checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="enableSearch" className="cursor-pointer">
              Habilitar Busca
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="enableUserMenu"
              checked={watch('enableUserMenu')}
              onCheckedChange={(checked) =>
                setValue('enableUserMenu', checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="enableUserMenu" className="cursor-pointer">
              Habilitar User Menu
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="enableThemeToggle"
              checked={watch('enableThemeToggle')}
              onCheckedChange={(checked) =>
                setValue('enableThemeToggle', checked, { shouldDirty: true })
              }
            />
            <Label htmlFor="enableThemeToggle" className="cursor-pointer">
              Habilitar Toggle de Tema
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensões</CardTitle>
          <CardDescription>
            Configure a largura do sidebar (expandido e colapsado)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Largura (px)</Label>
              <Input
                id="width"
                type="number"
                {...register('width', { valueAsNumber: true })}
                min={200}
                max={400}
              />
              {errors.width && (
                <p className="text-sm text-destructive">{errors.width.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collapsedWidth">Colapsada (px)</Label>
              <Input
                id="collapsedWidth"
                type="number"
                {...register('collapsedWidth', { valueAsNumber: true })}
                min={60}
                max={120}
              />
              {errors.collapsedWidth && (
                <p className="text-sm text-destructive">
                  {errors.collapsedWidth.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 6: Configurações Avançadas (Collapsible) */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle>Configurações Avançadas</CardTitle>
                  <CardDescription>
                    Comportamento, estilo e permissões (opcional)
                  </CardDescription>
                </div>
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${
                    advancedOpen ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Behavior */}
              <div>
                <h4 className="text-sm font-medium mb-3">Comportamento</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="collapsible"
                      checked={watch('collapsible')}
                      onCheckedChange={(checked) =>
                        setValue('collapsible', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="collapsible" className="cursor-pointer">
                      Permitir colapsar sidebar
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="defaultCollapsed"
                      checked={watch('defaultCollapsed')}
                      onCheckedChange={(checked) =>
                        setValue('defaultCollapsed', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="defaultCollapsed" className="cursor-pointer">
                      Iniciar colapsado por padrão
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="persistState"
                      checked={watch('persistState')}
                      onCheckedChange={(checked) =>
                        setValue('persistState', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="persistState" className="cursor-pointer">
                      Persistir estado (localStorage)
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="closeOnNavigate"
                      checked={watch('closeOnNavigate')}
                      onCheckedChange={(checked) =>
                        setValue('closeOnNavigate', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="closeOnNavigate" className="cursor-pointer">
                      Fechar ao navegar (mobile)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div>
                <h4 className="text-sm font-medium mb-3">Estilo</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="variant">Variante Visual</Label>
                    <Select
                      value={watch('variant')}
                      onValueChange={(value) =>
                        setValue(
                          'variant',
                          value as 'default' | 'bordered' | 'floating',
                          { shouldDirty: true }
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="bordered">Com Borda</SelectItem>
                        <SelectItem value="floating">Flutuante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="showIcons"
                      checked={watch('showIcons')}
                      onCheckedChange={(checked) =>
                        setValue('showIcons', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="showIcons" className="cursor-pointer">
                      Exibir ícones nos items
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="showBadges"
                      checked={watch('showBadges')}
                      onCheckedChange={(checked) =>
                        setValue('showBadges', checked, { shouldDirty: true })
                      }
                    />
                    <Label htmlFor="showBadges" className="cursor-pointer">
                      Exibir badges nos items
                    </Label>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-medium mb-3">Permissões</h4>
                <div className="flex items-center gap-2">
                  <Switch
                    id="checkPermissions"
                    checked={watch('checkPermissions')}
                    onCheckedChange={(checked) =>
                      setValue('checkPermissions', checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="checkPermissions" className="cursor-pointer">
                    Verificar permissões dos items
                  </Label>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? 'Salvando...' : 'Salvar Instância'}
        </Button>
      </div>
    </form>
  );
}
