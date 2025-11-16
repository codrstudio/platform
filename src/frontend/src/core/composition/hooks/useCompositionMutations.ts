/**
 * Composition Config Mutations Hooks
 *
 * JQEL-based hooks for saving composition configurations (slotConfigs).
 * Composition structures come from modules via CompositionRegistry.
 * This only persists portal-specific customizations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jqelClient } from '@/services/jqelClient';
import type { CompositionWithConfigs } from '../types-extended';

/**
 * CompositionConfig stored in backend
 */
export interface CompositionConfig {
  id: string;                      // Unique ID for this configuration
  portalId: string;                // Portal this configuration belongs to
  baseCompositionId: string;       // ID of the base composition from module
  name: string;                    // Custom name for this configuration
  components?: {                   // Component selections for each slot
    [slotType: string]: string | undefined;
  };
  slotConfigs?: {                  // Slot component configurations
    [componentId: string]: Record<string, any>;
  };
  layout?: {                       // Layout configuration overrides
    width?: 'full' | 'lg' | 'md' | 'sm';
  };
}

/**
 * Save composition configuration for a portal
 * Creates or updates a CompositionConfig in backend
 */
export function useSaveCompositionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: CompositionConfig) => {
      // Check if config already exists
      const existing = await jqelClient.query({
        schema: 'backend',
        select: 'composition',
        where: { id: { $eq: config.id } },
      });

      const hasExisting = existing.data && existing.data.length > 0;

      // Insert or update
      const response = await jqelClient.mutate(
        'backend',
        'composition',
        hasExisting ? 'update' : 'insert',
        {
          values: config,
          ...(hasExisting && { where: { id: { $eq: config.id } } }),
        }
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all composition config queries
      queryClient.invalidateQueries({ queryKey: ['composition-configs'] });
      // Invalidate specific config query
      queryClient.invalidateQueries({ queryKey: ['composition-config', variables.id] });
      // Also invalidate by portalId
      queryClient.invalidateQueries({ queryKey: ['composition-configs', variables.portalId] });
    },
  });
}

/**
 * Delete a composition configuration
 */
export function useDeleteCompositionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configId: string) => {
      const response = await jqelClient.mutate({
        schema: 'backend',
        mutate: 'composition',
        action: 'delete',
        where: {
          id: { $eq: configId },
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composition-configs'] });
    },
  });
}

/**
 * Get composition configuration by ID
 */
export function useCompositionConfig(configId: string) {
  return useQuery({
    queryKey: ['composition-config', configId],
    queryFn: async () => {
      const response = await jqelClient.query({
        schema: 'backend',
        select: 'composition',
        where: {
          id: { $eq: configId },
        },
      });

      // Return null instead of undefined if not found (TanStack Query requirement)
      return (response.data?.[0] as CompositionConfig) || null;
    },
    enabled: !!configId,
  });
}

/**
 * Get all composition configurations for a portal
 */
export function useCompositionConfigs(portalId?: string) {
  return useQuery({
    queryKey: ['composition-configs', portalId],
    queryFn: async () => {
      const response = await jqelClient.query({
        schema: 'backend',
        select: 'composition',
        where: portalId
          ? { portalId: { $eq: portalId } }
          : undefined,
      });

      return response.data as CompositionConfig[];
    },
    enabled: !!portalId,
  });
}