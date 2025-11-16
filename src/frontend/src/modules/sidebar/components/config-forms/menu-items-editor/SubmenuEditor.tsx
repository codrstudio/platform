/**
 * SubmenuEditor - Editor de Submenus Nested
 *
 * Editor de lista de submenus (children) com CRUD e reordenação.
 * Simplificado com botões Up/Down (sem DnD adicional).
 */

import * as React from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SubmenuEditorProps, MenuItem } from './types';

export function SubmenuEditor({ submenus, onChange }: SubmenuEditorProps) {
  const handleAdd = () => {
    const newSubmenu: MenuItem = {
      id: `submenu-${Date.now()}`,
      label: 'Novo Submenu',
      route: '#',
    };
    onChange([...submenus, newSubmenu]);
  };

  const handleUpdate = (index: number, updates: Partial<MenuItem>) => {
    const updated = submenus.map((sub, i) =>
      i === index ? { ...sub, ...updates } : sub
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(submenus.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= submenus.length) return;

    const updated = [...submenus];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">Submenus</h4>
          <p className="text-xs text-muted-foreground">
            Itens do dropdown deste menu
          </p>
        </div>
        <Button type="button" onClick={handleAdd} size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Adicionar Submenu
        </Button>
      </div>

      {submenus.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Nenhum submenu. Clique em "Adicionar Submenu" para criar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submenus.map((submenu, index) => (
            <div
              key={submenu.id}
              className="border rounded-lg p-3 bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                {/* Move Buttons */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                    title="Mover para cima"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === submenus.length - 1}
                    className="h-6 w-6 p-0"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`submenu-${submenu.id}-label`} className="text-xs">
                      Label
                    </Label>
                    <Input
                      id={`submenu-${submenu.id}-label`}
                      value={submenu.label}
                      onChange={(e) => handleUpdate(index, { label: e.target.value })}
                      placeholder="Label do submenu"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor={`submenu-${submenu.id}-route`} className="text-xs">
                      Rota
                    </Label>
                    <Input
                      id={`submenu-${submenu.id}-route`}
                      value={submenu.route || ''}
                      onChange={(e) => handleUpdate(index, { route: e.target.value })}
                      placeholder="/path or #"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 mt-6"
                  title="Remover submenu"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
