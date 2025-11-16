/**
 * SlotCardList Component
 *
 * Manages the list of SlotCards for all active slots in a composition.
 * Handles component selection and configuration for each slot.
 */

import React, { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

import type { SlotType } from '@/core/composition/types';
import type { CompositionWithConfigs } from '@/core/composition/types-extended';
import { SlotCard } from './SlotCard';

interface SlotCardListProps {
  slots: CompositionWithConfigs['slots'];
  components: CompositionWithConfigs['components'];
  slotConfigs: CompositionWithConfigs['slotConfigs'];
  onComponentChange: (slotType: string, componentId: string | undefined) => void;
  onConfigChange: (componentId: string, config: Record<string, any>) => void;
  disabled?: boolean;
}

// Order of slots for display
const slotOrder: SlotType[] = ['navbar', 'sidebar', 'breadcrumb', 'companion', 'footer'];

export function SlotCardList({
  slots,
  components,
  slotConfigs = {},
  onComponentChange,
  onConfigChange,
  disabled,
}: SlotCardListProps) {
  // Get list of active slots
  const activeSlots = useMemo(() => {
    return slotOrder.filter(slotType => {
      // Desktop is always true, don't show it as a configurable slot
      if (slotType === 'desktop' as any) return false;
      // Check if slot is active
      return slots[slotType] === true;
    });
  }, [slots]);

  // Handle config change for a specific component
  const handleConfigChange = (slotType: SlotType, componentId: string | undefined) => {
    return (config: Record<string, any>) => {
      if (componentId) {
        onConfigChange(componentId, config);
      }
    };
  };

  if (activeSlots.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No slots are currently active. Enable slots in the "Slots" tab to configure components.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info message */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure components for each active slot. Components can be customized with their own settings.
        </AlertDescription>
      </Alert>

      {/* Slot cards */}
      {activeSlots.map(slotType => {
        const componentId = components[slotType];
        const config = componentId ? slotConfigs[componentId] : undefined;

        return (
          <SlotCard
            key={slotType}
            slotType={slotType}
            componentId={componentId}
            config={config}
            onComponentChange={(newComponentId) => onComponentChange(slotType, newComponentId)}
            onConfigChange={handleConfigChange(slotType, componentId)}
            disabled={disabled}
          />
        );
      })}

      {/* Desktop slot reminder */}
      <Alert variant="default" className="bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Desktop Slot:</strong> The main content area is always active and displays your primary content.
          It doesn't need component configuration as it's managed by the application's routing system.
        </AlertDescription>
      </Alert>
    </div>
  );
}