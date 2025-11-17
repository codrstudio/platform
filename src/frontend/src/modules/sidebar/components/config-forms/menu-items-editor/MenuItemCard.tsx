/**
 * MenuItemCard - Draggable Menu Item Card
 *
 * Card individual de menu item com suporte a drag-and-drop,
 * edição inline rápida e preview visual.
 */

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { kebabToPascal } from '@/lib/utils';
import type { MenuItemCardProps } from './types';

export function MenuItemCard({
  item,
  index,
  onUpdate,
  onRemove,
  onEdit,
}: MenuItemCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // @dnd-kit/sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get Lucide icon component (supports both PascalCase and kebab-case)
  const IconComponent = item.icon
    ? (LucideIcons as any)[kebabToPascal(item.icon)]
    : null;

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg bg-card hover:shadow-md transition-shadow">
          {/* Header - Compact Preview */}
          <div className="flex items-center gap-2 p-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Icon Preview */}
            {IconComponent && (
              <div className="flex items-center justify-center w-8 h-8 rounded bg-muted/50 flex-shrink-0">
                <IconComponent className="h-4 w-4" />
              </div>
            )}

            {/* Label & Route */}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.label || 'Sem título'}</div>
              <div className="text-sm text-muted-foreground truncate">
                {item.route || '#'}
              </div>
            </div>

            {/* Badge (se tiver submenus) */}
            {item.children && item.children.length > 0 && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {item.children.length} submenu{item.children.length > 1 ? 's' : ''}
              </Badge>
            )}

            {/* Badge customizado (se configurado) */}
            {item.badge && (
              <Badge
                variant={
                  item.badge.variant === 'primary'
                    ? 'default'
                    : item.badge.variant === 'danger'
                    ? 'destructive'
                    : 'secondary'
                }
                className="text-xs flex-shrink-0"
              >
                {item.badge.text}
              </Badge>
            )}

            {/* Actions (aparecem no hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {/* Expand/Collapse */}
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="sr-only">Quick edit</span>
                </Button>
              </CollapsibleTrigger>

              {/* Edit (full) */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit item</span>
              </Button>

              {/* Delete */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete item</span>
              </Button>
            </div>
          </div>

          {/* Expanded - Quick Edit */}
          <CollapsibleContent>
            <Separator />
            <div className="p-3 space-y-3 bg-muted/20">
              <div className="grid gap-2">
                <Label htmlFor={`item-${item.id}-label`} className="text-xs">
                  Label
                </Label>
                <Input
                  id={`item-${item.id}-label`}
                  value={item.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Dashboard, Usuários..."
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`item-${item.id}-route`} className="text-xs">
                  Rota
                </Label>
                <Input
                  id={`item-${item.id}-route`}
                  value={item.route || ''}
                  onChange={(e) => onUpdate({ route: e.target.value })}
                  placeholder="/dashboard, /users..."
                  className="h-8 text-sm"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="w-full h-8 text-xs"
              >
                Edição Completa
              </Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
