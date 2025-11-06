import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Query Provider - TanStack Query Configuration
 *
 * SPEC-DA-P-005: Frontend DEVE encapsular JQEL via TanStack Query
 * SPEC-DA-PERF-001: TanStack Query gerencia cache automaticamente
 * SPEC-DA-PERF-002: Cache DEVE ter configuração apropriada
 * SPEC-DA-PERF-003: Configuração padrão sugerida
 */

// Create QueryClient instance with default configuration
// SPEC-DA-PERF-003: Configuração padrão
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados ficam "fresh" por 5min
      gcTime: 10 * 60 * 1000, // 10 minutos - dados não usados permanecem em cache
      retry: 3, // Tentar 3 vezes antes de falhar
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: true, // Refetch quando usuário volta à aba
      refetchOnReconnect: true, // Refetch quando reconecta
      refetchOnMount: true, // Refetch quando componente monta
    },
    mutations: {
      retry: 1, // Mutations retry apenas 1 vez
      retryDelay: 1000, // 1 segundo entre retries
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider Component
 *
 * Wraps app with TanStack Query client and devtools
 * SPEC-DA-TQ-001: SELECT DEVE usar useQuery do TanStack Query
 * SPEC-DA-MU-001: MUTATE DEVE usar useMutation do TanStack Query
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools can be added later with @tanstack/react-query-devtools */}
    </QueryClientProvider>
  );
}
