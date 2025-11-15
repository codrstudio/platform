import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { compositionRegistry } from './CompositionRegistry';
import { slotComponentRegistry } from './SlotComponentRegistry';
import type { Composition, ResolvedComposition, SlotComponent } from './types';

/**
 * Valor do contexto de composições
 */
interface CompositionContextValue {
  /** Registry de composições */
  compositionRegistry: typeof compositionRegistry;

  /** Registry de componentes de slots */
  slotComponentRegistry: typeof slotComponentRegistry;

  /** Composição atualmente ativa */
  currentComposition: Composition | null;

  /** Define a composição atual pelo ID */
  setCurrentComposition: (compositionId: string) => void;

  /** Obtém um componente de slot pelo ID */
  getSlotComponent: (componentId: string) => SlotComponent | undefined;

  /** Resolve uma composição, obtendo os componentes React para cada slot */
  resolveComposition: (compositionId: string) => ResolvedComposition;
}

/**
 * Contexto de composições
 */
const CompositionContext = createContext<CompositionContextValue | null>(null);

/**
 * Props do CompositionProvider
 */
interface CompositionProviderProps {
  children: ReactNode;
}

/**
 * Provider do sistema de composições
 *
 * Fornece acesso aos registries de composições e componentes de slots,
 * além de utilities para resolver composições e gerenciar a composição atual.
 */
export function CompositionProvider({ children }: CompositionProviderProps) {
  const [currentComposition, setCurrentCompositionState] = useState<Composition | null>(null);

  /**
   * Define a composição atual pelo ID
   */
  const setCurrentComposition = (compositionId: string) => {
    const composition = compositionRegistry.get(compositionId);
    setCurrentCompositionState(composition || null);
  };

  /**
   * Obtém um componente de slot pelo ID
   */
  const getSlotComponent = (componentId: string) => {
    return slotComponentRegistry.get(componentId);
  };

  /**
   * Resolve uma composição, obtendo os componentes React para cada slot
   *
   * @param compositionId - ID da composição a ser resolvida
   * @returns Composição com componentes resolvidos
   * @throws Error se a composição não for encontrada
   */
  const resolveComposition = (compositionId: string): ResolvedComposition => {
    const composition = compositionRegistry.get(compositionId);
    if (!composition) {
      throw new Error(`Composition "${compositionId}" not found`);
    }

    const resolvedComponents: ResolvedComposition['resolvedComponents'] = {};

    // Resolve cada componente definido na composição
    Object.entries(composition.components).forEach(([slot, componentId]) => {
      if (componentId) {
        const slotComponent = slotComponentRegistry.get(componentId);
        if (slotComponent) {
          resolvedComponents[slot as keyof typeof resolvedComponents] = slotComponent.component;
        }
      }
    });

    return {
      ...composition,
      resolvedComponents,
    };
  };

  const value: CompositionContextValue = {
    compositionRegistry,
    slotComponentRegistry,
    currentComposition,
    setCurrentComposition,
    getSlotComponent,
    resolveComposition,
  };

  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de composições
 *
 * @returns Contexto de composições
 * @throws Error se usado fora do CompositionProvider
 */
export function useComposition() {
  const context = useContext(CompositionContext);
  if (!context) {
    throw new Error('useComposition must be used within CompositionProvider');
  }
  return context;
}
