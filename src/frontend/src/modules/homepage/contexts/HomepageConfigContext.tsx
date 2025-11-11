import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { HomepageConfig } from '../types';

interface HomepageConfigContextValue {
  config: HomepageConfig | undefined;
  instanceId: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const HomepageConfigContext = createContext<HomepageConfigContextValue | null>(
  null
);

export interface HomepageConfigProviderProps {
  children: ReactNode;
  value: HomepageConfigContextValue;
}

export function HomepageConfigProvider({
  children,
  value,
}: HomepageConfigProviderProps) {
  return (
    <HomepageConfigContext.Provider value={value}>
      {children}
    </HomepageConfigContext.Provider>
  );
}

/**
 * Hook para acessar a configuração da homepage do contexto
 * Deve ser usado dentro de componentes filhos do HomePage
 */
export function useHomepageConfigContext() {
  const context = useContext(HomepageConfigContext);

  if (!context) {
    throw new Error(
      'useHomepageConfigContext must be used within HomepageConfigProvider'
    );
  }

  return context;
}
