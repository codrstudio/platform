/**
 * Composition Mutations Hooks
 *
 * JQEL-based hooks for creating, updating, and deleting compositions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jqelClient } from '@/services/jqelClient';
import type { CompositionWithConfigs } from '../types-extended';
import { validateComposition } from '../schemas/compositionSchema';

/**
 * Create a new composition
 */
export function useCreateComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (composition: CompositionWithConfigs) => {
      // Validate before saving
      const validation = validateComposition(composition);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Save via JQEL to backend schema
      const response = await jqelClient.mutate({
        schema: 'backend',
        mutate: 'composition',
        action: 'insert',
        values: composition,
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate compositions queries
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}

/**
 * Update an existing composition
 */
export function useUpdateComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (composition: CompositionWithConfigs) => {
      // Validate before saving
      const validation = validateComposition(composition);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Update via JQEL
      const response = await jqelClient.mutate({
        schema: 'backend',
        mutate: 'composition',
        action: 'update',
        values: composition,
        where: {
          id: { $eq: composition.id },
        },
      });

      return response.data;
    },
    onSuccess: (_, composition) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
      queryClient.invalidateQueries({ queryKey: ['composition', composition.id] });
    },
  });
}

/**
 * Delete a composition
 */
export function useDeleteComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (compositionId: string) => {
      const response = await jqelClient.mutate({
        schema: 'backend',
        mutate: 'composition',
        action: 'delete',
        where: {
          id: { $eq: compositionId },
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}

/**
 * Get a single composition by ID
 */
export function useComposition(compositionId: string) {
  return useQuery({
    queryKey: ['composition', compositionId],
    queryFn: async () => {
      const response = await jqelClient.query({
        schema: 'backend',
        select: 'composition',
        where: {
          id: { $eq: compositionId },
        },
      });

      return response.data?.[0] as CompositionWithConfigs | undefined;
    },
    enabled: !!compositionId,
  });
}

/**
 * Get all compositions for a portal
 */
export function useCompositions(portalId?: string) {
  return useQuery({
    queryKey: ['compositions', portalId],
    queryFn: async () => {
      const response = await jqelClient.query({
        schema: 'backend',
        select: 'composition',
        where: portalId
          ? { providedBy: { $eq: portalId } }
          : undefined,
      });

      return response.data as CompositionWithConfigs[];
    },
  });
}