/**
 * SlotCard Component
 * DESIGN Reference: DES-COMP-002
 *
 * Dynamic card for configuring slot components with inline configuration forms
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { SlotType } from '@/core/composition/types';
import { useSlotConfigForm } from '@/core/composition/hooks/useSlotConfigForm';
import { slotComponentRegistry } from '@/core/composition/SlotComponentRegistry';

import { ComponentSelector } from './ComponentSelector';

interface SlotCardProps {
  slotType: SlotType;
  componentId?: string;
  config?: Record<string, any>;
  onComponentChange: (componentId: string | undefined) => void;
  onConfigChange: (config: Record<string, any>) => void;
  validationError?: string;
  disabled?: boolean;
}

const slotLabels: Record<SlotType, string> = {
  navbar: 'Navigation Bar',
  sidebar: 'Sidebar',
  companion: 'Companion Panel',
  breadcrumb: 'Breadcrumb',
  footer: 'Footer',
};

const slotDescriptions: Record<SlotType, string> = {
  navbar: 'Top navigation component',
  sidebar: 'Left side navigation',
  companion: 'Right side panel for tools or chat',
  breadcrumb: 'Hierarchical navigation trail',
  footer: 'Bottom content area',
};

export function SlotCard({
  slotType,
  componentId,
  config = {},
  onComponentChange,
  onConfigChange,
  validationError,
  disabled,
}: SlotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get config form for the selected component
  const { formMetadata, FormComponent } = useSlotConfigForm(componentId);

  // Get component details
  const componentDetails = useMemo(() => {
    if (!componentId) return null;
    return slotComponentRegistry.get(componentId);
  }, [componentId]);

  const handleComponentChange = (newComponentId: string | undefined) => {
    onComponentChange(newComponentId);

    // Reset config when component changes
    if (newComponentId !== componentId) {
      onConfigChange({});

      // Auto-expand if new component has config
      if (newComponentId && formMetadata) {
        setIsExpanded(true);
      }
    }
  };

  return (
    <Card
      className={cn(
        'transition-all',
        validationError && 'border-destructive',
        disabled && 'opacity-50'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {slotLabels[slotType]}
              {componentId && (
                <Badge variant="secondary" className="ml-2">
                  {componentDetails?.name || componentId}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {slotDescriptions[slotType]}
            </CardDescription>
            {componentDetails?.providedBy && (
              <p className="text-xs text-muted-foreground mt-1">
                Provided by: {componentDetails.providedBy}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {validationError && (
          <p className="text-sm text-destructive mt-2">{validationError}</p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Component Selector */}
          <div className="space-y-2">
            <ComponentSelector
              slotType={slotType}
              value={componentId}
              onChange={handleComponentChange}
              disabled={disabled}
            />
          </div>

          {/* Configuration Form (if available) */}
          {componentId && FormComponent && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Component Configuration</p>
              </div>
              <div className="pl-6">
                <FormComponent
                  slotType={slotType}
                  componentId={componentId}
                  config={config}
                  onChange={onConfigChange}
                />
              </div>
            </div>
          )}

          {/* No configuration message */}
          {componentId && !FormComponent && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center py-4">
                This component doesn't have configuration options
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}