/**
 * Sistema de Composições de Layout
 *
 * Fornece infraestrutura para composições de layout baseadas em slots nomeados
 * com HTML semântico, permitindo que portais e módulos componham interfaces
 * flexíveis e reutilizáveis.
 */

// Tipos
export type {
  SlotComponent,
  Composition,
  ResolvedComposition,
  SlotType,
  LayoutWidth,
} from './types';

// Registries
export { compositionRegistry } from './CompositionRegistry';
export { slotComponentRegistry } from './SlotComponentRegistry';

// Context e Hooks
export { CompositionProvider, useComposition } from './CompositionContext';
export { useCompositionArea } from './hooks/useCompositionArea';

// Componentes
export { Page } from './Page';
export { CompositionRenderer } from './CompositionRenderer';

// Inicialização da Plataforma
export { initializePlatformCompositions } from './platform';
