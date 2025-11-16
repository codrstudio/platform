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
  // Get list of available slots (both true and false, but not undefined)
  const availableSlots = useMemo(() => {
    return slotOrder.filter(slotType => {
      // Desktop is always true, don't show it as a configurable slot
      if (slotType === 'desktop' as any) return false;
      // Check if slot is defined in the composition (true or false, not undefined)
      return slots[slotType] !== undefined;
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

  if (availableSlots.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nenhum slot está disponível nesta composição.
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
          Configure componentes para cada slot disponível. Componentes podem ser customizados com suas próprias configurações.
        </AlertDescription>
      </Alert>

      {/* Slot cards */}
      {availableSlots.map(slotType => {
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
          <strong>Slot Desktop:</strong> A área de conteúdo principal está sempre ativa e exibe seu conteúdo primário.
          Ela não precisa de configuração de componente, pois é gerenciada pelo sistema de roteamento da aplicação.
        </AlertDescription>
      </Alert>
    </div>
  );
}