/**
 * useHomepageConfig Hook
 *
 * Busca a configuração de uma instância do módulo Homepage via JQEL
 * usando TanStack Query para caching e gerenciamento de estado assíncrono.
 *
 * @see spec/SPEC-module-homepage.md - Data Access
 * @see spec/SPEC-data-access.md - JQEL Integration
 */

import { useQuery } from '@tanstack/react-query';
import type { HomepageConfig } from '../types';

interface UseHomepageConfigOptions {
  /**
   * ID da instância do módulo Homepage
   */
  instanceId: string;

  /**
   * Se false, desabilita a query
   * @default true
   */
  enabled?: boolean;
}

interface UseHomepageConfigReturn {
  /**
   * Configuração da instância (undefined enquanto carrega)
   */
  config: HomepageConfig | undefined;

  /**
   * Indica se está fazendo fetch inicial
   */
  isLoading: boolean;

  /**
   * Indica se ocorreu um erro
   */
  isError: boolean;

  /**
   * Objeto de erro se isError for true
   */
  error: Error | null;

  /**
   * Função para refazer o fetch manualmente
   */
  refetch: () => void;
}

/**
 * Hook para buscar configuração de instância Homepage via JQEL
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   const { config, isLoading, isError, error } = useHomepageConfig({ instanceId: 'main-homepage' });
 *
 *   if (isLoading) return <LoadingSkeleton />;
 *   if (isError) return <ErrorState error={error} />;
 *   if (!config) return <EmptyState />;
 *
 *   return <HomepageRenderer config={config} />;
 * }
 * ```
 */
export function useHomepageConfig({
  instanceId,
  enabled = true,
}: UseHomepageConfigOptions): UseHomepageConfigReturn {
  const query = useQuery({
    queryKey: ['module', 'homepage', 'instance', instanceId],

    queryFn: async () => {
      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: 'platform',
          select: 'instance',
          where: {
            instanceId: { $eq: instanceId },
          },
          output: ['config'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homepage config: ${response.statusText}`);
      }

      const result = await response.json();

      // JQEL retorna array de resultados
      if (!result.data || result.data.length === 0) {
        throw new Error(`Homepage instance not found: ${instanceId}`);
      }

      return result.data[0].config as HomepageConfig;
    },

    // Cache por 5 minutos (config não muda frequentemente)
    staleTime: 5 * 60 * 1000,

    // Manter em cache por 30 minutos após ficar stale
    gcTime: 30 * 60 * 1000,

    // Retry apenas uma vez em caso de erro
    retry: 1,

    // Desabilitar se enabled = false
    enabled,
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
