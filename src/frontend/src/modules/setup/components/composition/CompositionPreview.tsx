/**
 * CompositionPreview Component
 * DESIGN Reference: DES-UI-002
 *
 * Renders a live preview of the composition structure with
 * inline editing capabilities and real-time updates.
 */

import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CompositionWithConfigs } from '@/core/composition/types-extended';
import type { SlotType } from '@/core/composition/types';
import { Palette, Plus, Settings } from 'lucide-react';

interface CompositionPreviewProps {
  /** The composition being previewed */
  composition: CompositionWithConfigs;

  /** Callback when composition changes */
  onChange?: (composition: CompositionWithConfigs) => void;

  /** Whether the preview is in read-only mode */
  readonly?: boolean;

  /** Custom className */
  className?: string;
}

interface SlotPreviewProps {
  slotType: SlotType;
  isActive: boolean;
  componentId?: string;
  onClick?: () => void;
  readonly?: boolean;
}

/**
 * Individual slot preview
 */
function SlotPreview({
  slotType,
  isActive,
  componentId,
  onClick,
  readonly,
}: SlotPreviewProps) {
  const slotLabels: Record<SlotType, string> = {
    navbar: 'Navbar',
    sidebar: 'Sidebar',
    companion: 'Companion',
    breadcrumb: 'Breadcrumb',
    footer: 'Footer',
  };

  const slotStyles: Record<SlotType, string> = {
    navbar: 'h-12 border-b',
    sidebar: 'w-48 border-r min-h-[200px]',
    companion: 'w-48 border-l min-h-[200px]',
    breadcrumb: 'h-8 border-b',
    footer: 'h-16 border-t',
  };

  if (!isActive) return null;

  return (
    <div
      className={cn(
        'bg-muted/30 flex items-center justify-center relative group transition-colors',
        !readonly && 'hover:bg-muted/50 cursor-pointer',
        slotStyles[slotType]
      )}
      onClick={!readonly ? onClick : undefined}
    >
      <div className="text-center p-2">
        <p className="text-xs font-medium text-muted-foreground">
          {slotLabels[slotType]}
        </p>
        {componentId ? (
          <p className="text-xs mt-1">{componentId}</p>
        ) : (
          !readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Component
            </Button>
          )
        )}
      </div>
      {componentId && !readonly && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // Open component config
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Main composition preview component
 */
export function CompositionPreview({
  composition,
  onChange,
  readonly = false,
  className,
}: CompositionPreviewProps) {
  const [editingSlot, setEditingSlot] = useState<SlotType | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleSlotClick = useCallback(
    (slotType: SlotType) => {
      if (readonly) return;
      setEditingSlot(slotType);
      setTempValue(composition.components[slotType] || '');
    },
    [composition, readonly]
  );

  const handleSlotSave = useCallback(() => {
    if (!editingSlot || !onChange) return;

    onChange({
      ...composition,
      components: {
        ...composition.components,
        [editingSlot]: tempValue || undefined,
      },
    });

    setEditingSlot(null);
    setTempValue('');
  }, [editingSlot, tempValue, composition, onChange]);

  const handleLayoutClick = useCallback(() => {
    if (readonly || !onChange) return;
    // Could open a popover to change layout width
  }, [readonly, onChange]);

  return (
    <div
      className={cn(
        'relative bg-background border rounded-lg overflow-hidden',
        className
      )}
      data-composition-preview="true"
    >
      {/* Preview Badge */}
      {!readonly && (
        <Badge
          variant="default"
          className="absolute top-2 left-2 z-10 gap-2"
        >
          <Palette className="h-3 w-3" />
          PREVIEW - Click to edit
        </Badge>
      )}

      {/* Layout Structure */}
      <div className="p-4">
        <div
          className={cn(
            'mx-auto border rounded-md overflow-hidden bg-card',
            composition.layout.width === 'full' && 'w-full',
            composition.layout.width === 'lg' && 'max-w-4xl',
            composition.layout.width === 'md' && 'max-w-2xl',
            composition.layout.width === 'sm' && 'max-w-lg'
          )}
        >
          {/* Navbar */}
          {composition.slots.navbar && (
            <Popover
              open={editingSlot === 'navbar'}
              onOpenChange={(open) => !open && setEditingSlot(null)}
            >
              <PopoverTrigger asChild>
                <div>
                  <SlotPreview
                    slotType="navbar"
                    isActive={true}
                    componentId={composition.components.navbar}
                    onClick={() => handleSlotClick('navbar')}
                    readonly={readonly}
                  />
                </div>
              </PopoverTrigger>
              {!readonly && (
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Navbar Component</h4>
                      <Label htmlFor="navbar-component">Component ID</Label>
                      <Input
                        id="navbar-component"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder="e.g., blueprint-header"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSlotSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSlot(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          )}

          {/* Breadcrumb */}
          {composition.slots.breadcrumb && (
            <SlotPreview
              slotType="breadcrumb"
              isActive={true}
              componentId={composition.components.breadcrumb}
              onClick={() => handleSlotClick('breadcrumb')}
              readonly={readonly}
            />
          )}

          {/* Main Content Area */}
          <div className="flex">
            {/* Sidebar */}
            {composition.slots.sidebar && (
              <SlotPreview
                slotType="sidebar"
                isActive={true}
                componentId={composition.components.sidebar}
                onClick={() => handleSlotClick('sidebar')}
                readonly={readonly}
              />
            )}

            {/* Desktop (Main Content) */}
            <div
              className="flex-1 min-h-[300px] bg-background p-8 cursor-pointer"
              onClick={handleLayoutClick}
            >
              <div className="text-center text-muted-foreground">
                <p className="text-sm font-medium mb-2">Main Content Area</p>
                <p className="text-xs">
                  Layout: {composition.layout.width}
                </p>
                {!readonly && (
                  <p className="text-xs mt-2 opacity-60">
                    Click to change layout width
                  </p>
                )}
              </div>
            </div>

            {/* Companion */}
            {composition.slots.companion && (
              <SlotPreview
                slotType="companion"
                isActive={true}
                componentId={composition.components.companion}
                onClick={() => handleSlotClick('companion')}
                readonly={readonly}
              />
            )}
          </div>

          {/* Footer */}
          {composition.slots.footer && (
            <SlotPreview
              slotType="footer"
              isActive={true}
              componentId={composition.components.footer}
              onClick={() => handleSlotClick('footer')}
              readonly={readonly}
            />
          )}
        </div>
      </div>
    </div>
  );
}