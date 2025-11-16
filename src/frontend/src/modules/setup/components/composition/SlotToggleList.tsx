/**
 * SlotToggleList Component
 *
 * Provides toggles for activating/deactivating slots in a composition
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Navigation,
  PanelLeft,
  PanelRight,
  Breadcrumb,
  FootprintIcon,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotToggleListProps {
  slots: {
    navbar?: boolean;
    sidebar?: boolean;
    companion?: boolean;
    breadcrumb?: boolean;
    desktop: true;
    footer?: boolean;
  };
  onChange: (slots: typeof slots) => void;
  disabled?: boolean;
}

const slotDefinitions = [
  {
    key: 'navbar' as const,
    label: 'Navigation Bar',
    description: 'Horizontal navigation at the top',
    icon: Navigation,
  },
  {
    key: 'sidebar' as const,
    label: 'Sidebar',
    description: 'Vertical navigation on the left',
    icon: PanelLeft,
  },
  {
    key: 'breadcrumb' as const,
    label: 'Breadcrumb',
    description: 'Hierarchical navigation path',
    icon: Breadcrumb,
  },
  {
    key: 'companion' as const,
    label: 'Companion',
    description: 'Secondary sidebar on the right',
    icon: PanelRight,
  },
  {
    key: 'footer' as const,
    label: 'Footer',
    description: 'Content at the bottom',
    icon: FootprintIcon,
  },
];

export function SlotToggleList({ slots, onChange, disabled }: SlotToggleListProps) {
  const handleToggle = (slotKey: keyof typeof slots, checked: boolean) => {
    if (slotKey === 'desktop') return; // Desktop is always true

    onChange({
      ...slots,
      [slotKey]: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Slots</CardTitle>
        <CardDescription>
          Choose which layout areas to include in your composition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The main content area (Desktop) is always active and cannot be disabled.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {slotDefinitions.map((slot) => {
            const Icon = slot.icon;
            const isActive = !!slots[slot.key];

            return (
              <div
                key={slot.key}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                  isActive && 'bg-accent/50 border-primary/20',
                  disabled && 'opacity-50'
                )}
              >
                <Checkbox
                  id={`slot-${slot.key}`}
                  checked={isActive}
                  onCheckedChange={(checked) => handleToggle(slot.key, !!checked)}
                  disabled={disabled}
                  className="mt-1"
                />
                <Label
                  htmlFor={`slot-${slot.key}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{slot.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {slot.description}
                  </p>
                </Label>
              </div>
            );
          })}

          {/* Desktop slot (always active) */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-primary/5 border-primary/20">
            <Checkbox
              id="slot-desktop"
              checked={true}
              disabled
              className="mt-1"
            />
            <Label htmlFor="slot-desktop" className="flex-1 opacity-75">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="h-4 w-4" />
                <span className="font-medium">Main Content (Desktop)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The primary content area - always required
              </p>
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Fix for missing Monitor icon
import { Monitor } from 'lucide-react';