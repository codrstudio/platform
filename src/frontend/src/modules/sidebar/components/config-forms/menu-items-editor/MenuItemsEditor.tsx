/**
 * MenuItemsEditor - Container Principal com Drag-and-Drop
 *
 * Editor visual completo de menu items com:
 * - Drag-and-drop para reordenação (@dnd-kit)
 * - CRUD (Create, Read, Update, Delete)
 * - Dialog modal para edição completa
 * - Preview visual inline
 */

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemDialog } from './MenuItemDialog';
import type { MenuItemsEditorProps, MenuItem } from './types';

export function MenuItemsEditor({ items, onChange }: MenuItemsEditorProps) {
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Configure @dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimento antes de iniciar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      onChange(reordered);
    }
  };

  // CRUD Operations
  const handleAdd = () => {
    setEditingItem(null); // null = novo item
    setDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (updatedItem: MenuItem) => {
    if (editingItem) {
      // Update existing item
      const updated = items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      onChange(updated);
    } else {
      // Add new item
      onChange([...items, updatedItem]);
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleUpdate = (index: number, updates: Partial<MenuItem>) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    // Confirmação antes de remover
    const item = items[index];
    const confirmed = window.confirm(
      `Tem certeza que deseja remover "${item.label}"?${
        item.children && item.children.length > 0
          ? `\n\nEste item tem ${item.children.length} submenu(s) que também serão removidos.`
          : ''
      }`
    );

    if (confirmed) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-3">
      {/* Lista de items (vazio ou com items) */}
      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum item de menu configurado.
          </p>
          <Button type="button" onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Item
          </Button>
        </div>
      ) : (
        <>
          {/* Instruções de uso */}
          <div className="text-xs text-muted-foreground px-1">
            <strong>Dica:</strong> Arraste os itens para reordenar. Use teclado: Space
            para segurar, setas para mover, Space para soltar.
          </div>

          {/* DnD Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdate={(updates) => handleUpdate(index, updates)}
                    onRemove={() => handleRemove(index)}
                    onEdit={() => handleEdit(item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Button */}
          <Button type="button" onClick={handleAdd} variant="outline" className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </>
      )}

      {/* Edit Dialog */}
      <MenuItemDialog
        item={editingItem}
        open={dialogOpen}
        onSave={handleSave}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
