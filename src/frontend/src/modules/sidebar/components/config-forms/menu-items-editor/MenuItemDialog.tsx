/**
 * MenuItemDialog - Editor Completo de Menu Item
 *
 * Dialog modal com todas as opções de configuração do menu item.
 * Tabs: General (label, route, icon) + Submenus
 */

import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { kebabToPascal } from '@/lib/utils';
import { IconEmojiPicker } from '@/components/platform/IconEmojiPicker';
import { SubmenuEditor } from './SubmenuEditor';
import type { MenuItemDialogProps, MenuItem } from './types';

export function MenuItemDialog({
  item,
  open,
  onSave,
  onClose,
}: MenuItemDialogProps) {
  const [formData, setFormData] = React.useState<MenuItem>(
    item || {
      id: `item-${Date.now()}`,
      label: '',
      route: '#',
      icon: undefined,
      children: [],
    }
  );

  // Sync form data quando item muda
  React.useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        label: '',
        route: '#',
        icon: undefined,
        children: [],
      });
    }
  }, [item]);

  const handleSave = () => {
    // Validação básica
    if (!formData.label.trim()) {
      alert('Label é obrigatório');
      return;
    }

    onSave(formData);
  };

  // Preview icon (supports both PascalCase and kebab-case)
  const PreviewIcon = formData.icon ? (LucideIcons as any)[kebabToPascal(formData.icon)] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Menu Item' : 'Novo Menu Item'}
          </DialogTitle>
          <DialogDescription>
            Configure as propriedades do item de menu
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="submenus">
              Submenus
              {formData.children && formData.children.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5">
                  {formData.children.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: General */}
          <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 mt-4">
            <div className="space-y-4 px-1">
              {/* Label */}
              <div className="grid gap-2">
                <Label htmlFor="label">
                  Label <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="Dashboard, Usuários, Configurações..."
                />
                <p className="text-xs text-muted-foreground">
                  Texto exibido no menu
                </p>
              </div>

              {/* Route */}
              <div className="grid gap-2">
                <Label htmlFor="route">Rota</Label>
                <Input
                  id="route"
                  value={formData.route || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, route: e.target.value })
                  }
                  placeholder="/dashboard, /users, https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Caminho da rota ou URL externa
                </p>
              </div>

              {/* Icon */}
              <div className="grid gap-2">
                <Label>Ícone</Label>
                <IconEmojiPicker
                  value={formData.icon || ''}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  mode="icon"
                />
                <p className="text-xs text-muted-foreground">
                  Escolha um ícone
                </p>
              </div>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-3 rounded border bg-muted/20">
                    {PreviewIcon && <PreviewIcon className="h-5 w-5" />}
                    <span className="font-medium">
                      {formData.label || 'Sem título'}
                    </span>
                    {formData.children && formData.children.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {formData.children.length} submenu{formData.children.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Rota: {formData.route || '#'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Submenus */}
          <TabsContent value="submenus" className="flex-1 overflow-y-auto mt-4">
            <div className="px-1">
              <SubmenuEditor
                submenus={formData.children || []}
                onChange={(children) => setFormData({ ...formData, children })}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
