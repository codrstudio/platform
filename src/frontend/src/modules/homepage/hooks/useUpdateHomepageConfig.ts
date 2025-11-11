/**
 * useUpdateHomepageConfig Hook
 *
 * Mutation hook para atualizar configuração de instância Homepage via JQEL.
 * Automaticamente invalida o cache da query após sucesso.
 *
 * @see spec/SPEC-module-homepage.md - Data Access
 * @see spec/SPEC-data-access.md - JQEL Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { HomepageConfig } from '../types';

interface UpdateHomepageConfigVariables {
  /**
   * ID da instância a ser atualizada
   */
  instanceId: string;

  /**
   * Nova configuração (parcial ou completa)
   */
  config: Partial<HomepageConfig>;
}

interface UpdateHomepageConfigResult {
  /**
   * Indica se a atualização foi bem-sucedida
   */
  success: boolean;

  /**
   * Mensagem de resultado
   */
  message?: string;
}

interface UseUpdateHomepageConfigReturn {
  /**
   * Função para executar a mutation (fire-and-forget)
   */
  mutate: (variables: UpdateHomepageConfigVariables) => void;

  /**
   * Função async para executar a mutation (com Promise)
   */
  mutateAsync: (variables: UpdateHomepageConfigVariables) => Promise<UpdateHomepageConfigResult>;

  /**
   * Indica se a mutation está em execução
   */
  isLoading: boolean;

  /**
   * Indica se ocorreu um erro
   */
  isError: boolean;

  /**
   * Indica se a mutation foi bem-sucedida
   */
  isSuccess: boolean;

  /**
   * Objeto de erro se isError for true
   */
  error: Error | null;

  /**
   * Reseta o estado da mutation
   */
  reset: () => void;
}

/**
 * Hook para atualizar configuração de instância Homepage via JQEL
 *
 * Automaticamente invalida o cache da query useHomepageConfig após sucesso.
 *
 * @example
 * ```tsx
 * function HomepageEditor() {
 *   const { mutate, isLoading, isSuccess } = useUpdateHomepageConfig();
 *
 *   const handleSave = (newConfig: HomepageConfig) => {
 *     mutate(
 *       { instanceId: 'main-homepage', config: newConfig },
 *       {
 *         onSuccess: () => {
 *           toast.success('Configuration saved!');
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to save: ${error.message}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Button onClick={() => handleSave(config)} disabled={isLoading}>
 *       {isLoading ? 'Saving...' : 'Save Configuration'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useUpdateHomepageConfig(): UseUpdateHomepageConfigReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      instanceId,
      config,
    }: UpdateHomepageConfigVariables): Promise<UpdateHomepageConfigResult> => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: 'platform',
          mutate: 'instance',
          action: 'update',
          values: {
            config,
          },
          where: {
            instanceId: { $eq: instanceId },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update homepage config: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }

      return {
        success: true,
        message: result.message,
      };
    },

    onSuccess: (_, variables) => {
      // Invalidar cache da query específica
      queryClient.invalidateQueries({
        queryKey: ['module', 'homepage', 'instance', variables.instanceId],
      });

      // Também invalidar listagens de instâncias (se existirem)
      queryClient.invalidateQueries({
        queryKey: ['module', 'homepage', 'instances'],
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
