import type { Composition } from '@/core/composition/types';

/**
 * Composições de layout fornecidas pelo módulo Blueprint
 *
 * Demonstra como criar composições que utilizam os slots
 * customizados (BlueprintHeader e BlueprintSidebar).
 */
export const compositions: Composition[] = [
  {
    id: 'blueprint-with-header',
    name: 'Blueprint com Header',
    providedBy: 'blueprint',
    slots: {
      navbar: true,
      breadcrumb: true,
      desktop: true,
    },
    components: {
      navbar: 'blueprint-header',
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'full',
    },
    metadata: {
      description: 'Layout com header horizontal sticky no topo',
      recommended: 'web-apps',
    },
  },
  {
    id: 'blueprint-with-sidebar',
    name: 'Blueprint com Sidebar',
    providedBy: 'blueprint',
    slots: {
      sidebar: true,
      breadcrumb: true,
      desktop: true,
    },
    components: {
      sidebar: 'blueprint-sidebar',
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'full',
    },
    metadata: {
      description: 'Layout com sidebar vertical fixa à esquerda',
      recommended: 'dashboards',
    },
  },
  {
    id: 'blueprint-full',
    name: 'Blueprint Full (Header + Companion)',
    providedBy: 'blueprint',
    slots: {
      navbar: true,
      companion: true,
      breadcrumb: true,
      desktop: true,
    },
    components: {
      navbar: 'blueprint-header',
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'full',
    },
    metadata: {
      description: 'Layout completo com header e área companion à direita',
      recommended: 'complex-apps',
    },
  },
];
