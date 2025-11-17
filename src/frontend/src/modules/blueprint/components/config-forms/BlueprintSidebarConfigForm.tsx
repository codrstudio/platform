/**
 * BlueprintSidebarConfigForm Component
 *
 * Configuration form for BlueprintSidebar slot component.
 * Allows editing menu items, width, and collapsible settings.
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import type { SlotConfigFormProps } from '@/core/composition/types';
import {
  blueprintSidebarConfigSchema,
  type BlueprintSidebarConfig,
  type MenuItem,
  defaultBlueprintSidebarConfig,
} from '../../schemas/slotConfigSchemas';

import { IconEmojiPicker } from '@/components/platform/IconEmojiPicker';

const widthOptions = [
  { value: 'sm', label: 'Small', description: '200px', preview: 'w-1/5' },
  { value: 'md', label: 'Medium', description: '256px', preview: 'w-2/5' },
  { value: 'lg', label: 'Large', description: '320px', preview: 'w-3/5' },
] as const;

export function BlueprintSidebarConfigForm({
  slotType,
  componentId,
  config = {},
  onChange,
}: SlotConfigFormProps) {
  // Merge with defaults
  const currentConfig: BlueprintSidebarConfig = {
    ...defaultBlueprintSidebarConfig,
    ...config,
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>(currentConfig.menuItems);
  const [width, setWidth] = useState(currentConfig.width);
  const [collapsible, setCollapsible] = useState(currentConfig.collapsible);
  const [defaultCollapsed, setDefaultCollapsed] = useState(currentConfig.defaultCollapsed);

  // Propagate changes to parent
  const propagateChanges = (updates: Partial<BlueprintSidebarConfig>) => {
    const newConfig = {
      menuItems,
      width,
      collapsible,
      defaultCollapsed,
      ...updates,
    };

    // Validate with Zod
    const result = blueprintSidebarConfigSchema.safeParse(newConfig);
    if (result.success) {
      onChange(result.data);
    }
  };

  const handleAddMenuItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      href: '#',
      icon: 'Circle',
    };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleUpdateMenuItem = (index: number, updates: Partial<MenuItem>) => {
    const updated = menuItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleRemoveMenuItem = (index: number) => {
    const updated = menuItems.filter((_, i) => i !== index);
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const updated = [...menuItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleAddSubmenu = (itemIndex: number) => {
    const item = menuItems[itemIndex];
    const newSubmenu = {
      id: `submenu-${Date.now()}`,
      label: 'New Submenu',
      href: '#',
    };
    const updated = menuItems.map((item, i) =>
      i === itemIndex
        ? { ...item, submenus: [...(item.submenus || []), newSubmenu] }
        : item
    );
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleUpdateSubmenu = (
    itemIndex: number,
    submenuIndex: number,
    updates: Partial<MenuItem['submenus'][0]>
  ) => {
    const updated = menuItems.map((item, i) =>
      i === itemIndex
        ? {
            ...item,
            submenus: item.submenus?.map((submenu, si) =>
              si === submenuIndex ? { ...submenu, ...updates } : submenu
            ),
          }
        : item
    );
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  const handleRemoveSubmenu = (itemIndex: number, submenuIndex: number) => {
    const updated = menuItems.map((item, i) =>
      i === itemIndex
        ? {
            ...item,
            submenus: item.submenus?.filter((_, si) => si !== submenuIndex),
          }
        : item
    );
    setMenuItems(updated);
    propagateChanges({ menuItems: updated });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Settings</CardTitle>
          <CardDescription>
            Configure sidebar width and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Width Selector */}
          <div className="space-y-3">
            <Label>Sidebar Width</Label>
            <RadioGroup
              value={width}
              onValueChange={(value: 'sm' | 'md' | 'lg') => {
                setWidth(value);
                propagateChanges({ width: value });
              }}
            >
              {widthOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`width-${option.value}`} />
                  <Label
                    htmlFor={`width-${option.value}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div className="w-20 h-12 bg-muted rounded border flex items-center p-2">
                      <div className={cn('h-full bg-primary/20 rounded', option.preview)} />
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Collapsible Settings */}
          <div className="flex items-center justify-between">
            <Label htmlFor="collapsible" className="flex-1">
              <div className="font-medium">Collapsible</div>
              <p className="text-sm text-muted-foreground">
                Allow users to collapse the sidebar
              </p>
            </Label>
            <Switch
              id="collapsible"
              checked={collapsible}
              onCheckedChange={(checked) => {
                setCollapsible(checked);
                propagateChanges({ collapsible: checked });
              }}
            />
          </div>

          {collapsible && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="default-collapsed" className="flex-1">
                  <div className="font-medium">Start Collapsed</div>
                  <p className="text-sm text-muted-foreground">
                    Sidebar starts in collapsed state
                  </p>
                </Label>
                <Switch
                  id="default-collapsed"
                  checked={defaultCollapsed}
                  onCheckedChange={(checked) => {
                    setDefaultCollapsed(checked);
                    propagateChanges({ defaultCollapsed: checked });
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Menu Items</CardTitle>
              <CardDescription>
                Add, remove, or reorder navigation menu items
              </CardDescription>
            </div>
            <Button onClick={handleAddMenuItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items. Click "Add Item" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <MenuItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  canMoveUp={index > 0}
                  canMoveDown={index < menuItems.length - 1}
                  onUpdate={(updates) => handleUpdateMenuItem(index, updates)}
                  onRemove={() => handleRemoveMenuItem(index)}
                  onMoveUp={() => handleMoveMenuItem(index, 'up')}
                  onMoveDown={() => handleMoveMenuItem(index, 'down')}
                  onAddSubmenu={() => handleAddSubmenu(index)}
                  onUpdateSubmenu={(submenuIndex, updates) =>
                    handleUpdateSubmenu(index, submenuIndex, updates)
                  }
                  onRemoveSubmenu={(submenuIndex) =>
                    handleRemoveSubmenu(index, submenuIndex)
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MenuItemEditorProps {
  item: MenuItem;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (updates: Partial<MenuItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSubmenu: () => void;
  onUpdateSubmenu: (index: number, updates: Partial<MenuItem['submenus'][0]>) => void;
  onRemoveSubmenu: (index: number) => void;
}

function MenuItemEditor({
  item,
  index,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddSubmenu,
  onUpdateSubmenu,
  onRemoveSubmenu,
}: MenuItemEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-4 p-0 hover:bg-transparent"
              onClick={onMoveUp}
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 p-0 hover:bg-transparent"
              onClick={onMoveDown}
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          <GripVertical className="h-4 w-4 text-muted-foreground" />

          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {item.submenus && item.submenus.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {item.submenus.length} submenu{item.submenus.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent className="space-y-3">
          <Separator />

          <div className="grid gap-3 pl-6">
            <div className="grid gap-2">
              <Label htmlFor={`label-${index}`}>Label</Label>
              <Input
                id={`label-${index}`}
                value={item.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Menu item label"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`href-${index}`}>URL</Label>
              <Input
                id={`href-${index}`}
                value={item.href}
                onChange={(e) => onUpdate({ href: e.target.value })}
                placeholder="/path or #"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`icon-${index}`}>Icon</Label>
              <IconEmojiPicker
                value={item.icon || ''}
                onChange={(icon) => onUpdate({ icon })}
                mode="icon"
              />
            </div>

            {/* Submenus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Submenus</Label>
                <Button onClick={onAddSubmenu} size="sm" variant="outline">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Submenu
                </Button>
              </div>

              {item.submenus && item.submenus.length > 0 && (
                <div className="space-y-2 pl-4 border-l-2">
                  {item.submenus.map((submenu, submenuIndex) => (
                    <div
                      key={submenu.id}
                      className="flex items-center gap-2 p-2 rounded border bg-muted/50"
                    >
                      <div className="flex-1 grid gap-2">
                        <Input
                          value={submenu.label}
                          onChange={(e) =>
                            onUpdateSubmenu(submenuIndex, { label: e.target.value })
                          }
                          placeholder="Submenu label"
                          className="h-8"
                        />
                        <Input
                          value={submenu.href}
                          onChange={(e) =>
                            onUpdateSubmenu(submenuIndex, { href: e.target.value })
                          }
                          placeholder="/path or #"
                          className="h-8"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSubmenu(submenuIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}