/**
 * Hook for resolving compositions with saved configurations
 *
 * This hook:
 * 1. Gets the base composition from registry
 * 2. Fetches saved configuration from backend (portal-specific)
 * 3. Merges saved component selections with base composition
 * 4. Resolves component React elements
 * 5. Wraps components with InstanceSlotWrapper when instanceId is present
 */

import React, { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompositionConfig } from './useCompositionMutations';
import { compositionRegistry } from '../CompositionRegistry';
import { slotComponentRegistry } from '../SlotComponentRegistry';
import { InstanceSlotWrapper, type InstanceSlotConfig } from '../components/InstanceSlotWrapper';
import type { ResolvedComposition } from '../types';

/**
 * Hook to resolve a composition with saved configuration
 *
 * @param compositionId - ID of the composition to resolve
 * @returns Resolved composition with components and saved configs applied
 */
export function useResolvedComposition(compositionId: string): ResolvedComposition {
  const { portalId } = useTheme();

  // Generate config ID for this portal + composition
  const configId = portalId ? `${portalId}-${compositionId}` : '';

  // Fetch saved configuration (only if we have a portalId)
  const { data: savedConfig } = useCompositionConfig(configId);

  // Get base composition from registry
  const baseComposition = compositionRegistry.get(compositionId);

  if (!baseComposition) {
    throw new Error(`Composition "${compositionId}" not found`);
  }

  // Memoize the resolved composition
  const resolved = useMemo(() => {
    // Merge components: savedConfig overrides base composition
    const mergedComponents = {
      ...baseComposition.components,
      ...(savedConfig?.components || {}),
    };

    // Merge layout: savedConfig.layout overrides base composition layout
    const mergedLayout = {
      ...baseComposition.layout,
      ...(savedConfig?.layout || {}),
    };

    // Resolve React components for each slot
    const resolvedComponents: ResolvedComposition['resolvedComponents'] = {};
    const replaceWrappers: ResolvedComposition['replaceWrappers'] = {};
    const slotConfigs = savedConfig?.slotConfigs || baseComposition.slotConfigs || {};

    Object.entries(mergedComponents).forEach(([slot, componentId]) => {
      if (componentId) {
        const slotComponent = slotComponentRegistry.get(componentId);
        const slotConfig = slotConfigs[componentId];

        if (slotComponent) {
          // Marcar se componente usa replace=true
          if (slotComponent.replace) {
            replaceWrappers[slot as keyof typeof replaceWrappers] = true;
          }

          // Se slotConfig tem instanceId, envolver com InstanceSlotWrapper
          if (slotConfig && 'instanceId' in slotConfig && slotConfig.instanceId) {
            const instanceConfig = slotConfig as InstanceSlotConfig;
            const baseComponent = slotComponent.component;
            resolvedComponents[slot as keyof typeof resolvedComponents] = () =>
              React.createElement(InstanceSlotWrapper, {
                slotConfig: instanceConfig,
                Component: baseComponent,
              });
          } else {
            // Renderização direta sem wrapper
            resolvedComponents[slot as keyof typeof resolvedComponents] = slotComponent.component;
          }
        }
      }
    });

    return {
      ...baseComposition,
      components: mergedComponents,
      layout: mergedLayout,
      resolvedComponents,
      replaceWrappers,
      // Include saved slotConfigs if available
      slotConfigs,
    };
  }, [baseComposition, savedConfig]);

  return resolved;
}
