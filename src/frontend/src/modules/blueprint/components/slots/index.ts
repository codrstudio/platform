import type { SlotComponent } from '@/core/composition/types';
import { BlueprintHeader } from './BlueprintHeader';
import { BlueprintSidebar } from './BlueprintSidebar';

/**
 * Componentes de slots fornecidos pelo módulo Blueprint
 *
 * Demonstra como criar componentes para navbar e sidebar
 * que podem ser reutilizados em composições.
 */
export const slotComponents: SlotComponent[] = [
  {
    slot: 'navbar',
    componentId: 'blueprint-header',
    component: BlueprintHeader,
    providedBy: 'blueprint',
    name: 'Blueprint Header',
    metadata: {
      description: 'Header horizontal com logo, menu, theme toggle e user menu',
      features: ['responsive', 'sticky', 'theme-toggle', 'user-menu'],
    },
  },
  {
    slot: 'sidebar',
    componentId: 'blueprint-sidebar',
    component: BlueprintSidebar,
    providedBy: 'blueprint',
    name: 'Blueprint Sidebar',
    metadata: {
      description: 'Sidebar vertical com logo, menu scrollable e footer fixo',
      features: ['fixed-position', 'scrollable-content', 'theme-toggle', 'user-menu'],
    },
  },
];
