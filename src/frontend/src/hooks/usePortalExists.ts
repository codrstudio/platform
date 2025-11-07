import { useQuery } from '@tanstack/react-query';
import { jqelClient } from '@/services/jqelClient';

/**
 * Hook para verificar se um portal existe na plataforma.
 *
 * Usa TanStack Query para cache automático (5 minutos) e evita
 * chamadas desnecessárias ao serviço.
 *
 * @param portalId - ID do portal a verificar
 * @returns Objeto com estado da query (data, isLoading, error)
 *
 * @example
 * ```tsx
 * const { data: setupExists } = usePortalExists('setup');
 *
 * {setupExists && (
 *   <Link to="/setup">Ir para Setup</Link>
 * )}
 * ```
 */
export function usePortalExists(portalId: string) {
  return useQuery({
    queryKey: ['portal', 'exists', portalId],
    queryFn: async () => {
      const result = await jqelClient.query({
        schema: 'backend',
        select: 'portal',
        where: { portalId: { $eq: portalId } },
      });
      return Array.isArray(result.data) && result.data.length > 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (antigo cacheTime)
    enabled: !!portalId,       // Só executa se portalId estiver definido
  });
}
