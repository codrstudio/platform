/**
 * TanStack Query Provider
 * Configures React Query for the application
 * SPEC-DA-P-005 to SPEC-DA-P-008
 * SPEC-A-PWA-009: Network-first strategy for data
 * SPEC-R-LD-018/019: Network-first for portal/module configs
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { JQELError } from '@/services/jqel/jqelError';

// Create QueryClient with default configuration
// Network-first strategy: always revalidate to reflect config changes immediately
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Network-first: always revalidate (SPEC-A-PWA-009)
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true, // Revalidate on window focus
      retry: (failureCount, error) => {
        // Don't retry on auth errors or client errors
        if (error instanceof JQELError) {
          if (error.code >= 400 && error.code < 500) {
            return false;
          }
        }

        // Retry server errors up to 3 times
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position={'bottom-right' as any} />
      )}
    </QueryClientProvider>
  );
}
