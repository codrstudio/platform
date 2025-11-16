/**
 * ComponentSelector Component
 *
 * Dropdown selector for choosing components for a specific slot type.
 * Groups components by provider and shows metadata.
 */

import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { SlotType } from '@/core/composition/types';
import { slotComponentRegistry } from '@/core/composition/SlotComponentRegistry';

interface ComponentSelectorProps {
  slotType: SlotType;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function ComponentSelector({
  slotType,
  value,
  onChange,
  disabled,
  className,
}: ComponentSelectorProps) {
  // Get available components for this slot type, grouped by provider
  const componentGroups = useMemo(() => {
    const components = slotComponentRegistry.getBySlot(slotType);

    // Group by provider
    const groups = new Map<string, typeof components>();

    components.forEach(component => {
      const provider = component.providedBy || 'System';
      if (!groups.has(provider)) {
        groups.set(provider, []);
      }
      groups.get(provider)!.push(component);
    });

    // Sort groups alphabetically, with 'System' first
    const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'System') return -1;
      if (b === 'System') return 1;
      return a.localeCompare(b);
    });

    return sortedGroups;
  }, [slotType]);

  const handleValueChange = (newValue: string) => {
    // Handle "none" special value
    if (newValue === '__none__') {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };

  // Get current component details
  const currentComponent = value ? slotComponentRegistry.get(value) : null;

  return (
    <Select
      value={value || '__none__'}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="Select a component">
          {currentComponent ? (
            <div className="flex items-center gap-2">
              <span>{currentComponent.name}</span>
              {currentComponent.version && (
                <Badge variant="outline" className="text-xs">
                  v{currentComponent.version}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">No component selected</span>
          )}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {/* None option */}
        <SelectItem value="__none__">
          <div className="flex flex-col">
            <span>No component</span>
            <span className="text-xs text-muted-foreground">
              Leave this slot empty
            </span>
          </div>
        </SelectItem>

        {/* Component groups */}
        {componentGroups.map(([provider, components]) => (
          <SelectGroup key={provider}>
            <SelectLabel className="flex items-center gap-2">
              <span>{provider}</span>
              <Badge variant="secondary" className="text-xs">
                {components.length}
              </Badge>
            </SelectLabel>

            {components.map(component => (
              <SelectItem
                key={component.id}
                value={component.id}
                className="pl-6"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span>{component.name}</span>
                    {component.version && (
                      <Badge variant="outline" className="text-xs">
                        v{component.version}
                      </Badge>
                    )}
                  </div>
                  {component.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {component.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}

        {componentGroups.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No components available for {slotType} slot
          </div>
        )}
      </SelectContent>
    </Select>
  );
}