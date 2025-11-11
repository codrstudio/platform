/**
 * usePortalsList Hook
 *
 * Hook para buscar lista de portais públicos via JQEL.
 * Usado na seção "Portals" da homepage para exibir portais disponíveis.
 *
 * @see spec/SPEC-module-homepage.md - Portals Section
 * @see spec/SPEC-concepts.md - Portal Definition
 */

import { useQuery } from '@tanstack/react-query';

/**
 * Representa um portal na plataforma
 */
export interface Portal {
  /**
   * ID único do portal
   */
  portalId: string;

  /**
   * Nome do portal
   */
  name: string;

  /**
   * Descrição do portal
   */
  description?: string;

  /**
   * URL do ícone do portal
   */
  icon?: string;

  /**
   * URL de screenshot/preview do portal
   */
  screenshot?: string;

  /**
   * Visibilidade do portal
   */
  visibility: 'public' | 'private';

  /**
   * Status do portal
   */
  status: 'active' | 'inactive' | 'coming-soon';

  /**
   * Cor de tema/brand do portal
   */
  brandColor?: string;
}

interface UsePortalsListOptions {
  /**
   * Filtrar apenas portais públicos
   * @default true
   */
  onlyPublic?: boolean;

  /**
   * Filtrar apenas portais ativos
   * @default false
   */
  onlyActive?: boolean;

  /**
   * Se false, desabilita a query
   * @default true
   */
  enabled?: boolean;
}

interface UsePortalsListReturn {
  /**
   * Lista de portais (undefined enquanto carrega)
   */
  portals: Portal[] | undefined;

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
 * Hook para buscar lista de portais via JQEL
 *
 * Por padrão, busca apenas portais públicos (visibility = 'public').
 *
 * @example
 * ```tsx
 * function PortalsSection() {
 *   const { portals, isLoading, isError } = usePortalsList({
 *     onlyPublic: true,
 *     onlyActive: true,
 *   });
 *
 *   if (isLoading) return <Skeleton count={3} />;
 *   if (isError) return <ErrorMessage />;
 *   if (!portals || portals.length === 0) return <EmptyState />;
 *
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {portals.map((portal) => (
 *         <PortalCard key={portal.portalId} portal={portal} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePortalsList({
  onlyPublic = true,
  onlyActive = false,
  enabled = true,
}: UsePortalsListOptions = {}): UsePortalsListReturn {
  const query = useQuery({
    queryKey: ['portals', 'list', { onlyPublic, onlyActive }],

    queryFn: async () => {
      // Construir where clause baseado nos filtros
      const where: Record<string, unknown> = {};

      if (onlyPublic) {
        where.visibility = { $eq: 'public' };
      }

      if (onlyActive) {
        where.status = { $eq: 'active' };
      }

      const response = await fetch('/api/jqel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: 'backend',
          select: 'portal',
          where,
          output: ['portalId', 'name', 'description', 'icon', 'screenshot', 'visibility', 'status', 'brandColor'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch portals: ${response.statusText}`);
      }

      const result = await response.json();

      return (result.data || []) as Portal[];
    },

    // Cache por 10 minutos (lista de portais não muda frequentemente)
    staleTime: 10 * 60 * 1000,

    // Manter em cache por 30 minutos após ficar stale
    gcTime: 30 * 60 * 1000,

    // Retry duas vezes em caso de erro
    retry: 2,

    // Desabilitar se enabled = false
    enabled,
  });

  return {
    portals: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
