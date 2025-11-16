import { compositionRegistry } from '../CompositionRegistry';

/**
 * Registra composições de layout fornecidas pela plataforma
 *
 * Composições base da plataforma:
 * - 'default': Layout padrão com breadcrumb e conteúdo principal
 * - 'settings': Layout para páginas de configuração com navbar e breadcrumb
 */
export function registerPlatformCompositions() {
  // Composição 'default'
  // Layout com TODOS os slots disponíveis para configuração
  // Por padrão, apenas breadcrumb tem componente pré-selecionado
  compositionRegistry.register({
    id: 'default',
    name: 'Default Layout',
    providedBy: 'platform',
    slots: {
      navbar: true,      // Disponível para configuração
      sidebar: true,     // Disponível para configuração
      breadcrumb: true,  // Disponível (com componente pré-selecionado)
      desktop: true,     // Sempre obrigatório
      companion: true,   // Disponível para configuração
      footer: true,      // Disponível para configuração
    },
    components: {
      breadcrumb: 'portal-breadcrumb',  // Único com componente padrão
      // Outros slots sem componente (usuário configura via editor)
    },
    layout: {
      width: 'md',
    },
  });

  // Composição 'settings'
  // Layout com TODOS os slots disponíveis para configuração
  // Por padrão, apenas breadcrumb tem componente pré-selecionado
  compositionRegistry.register({
    id: 'settings',
    name: 'Settings Layout',
    providedBy: 'platform',
    slots: {
      navbar: true,      // Disponível para configuração
      sidebar: true,     // Disponível para configuração
      breadcrumb: true,  // Disponível (com componente pré-selecionado)
      desktop: true,     // Sempre obrigatório
      companion: true,   // Disponível para configuração
      footer: true,      // Disponível para configuração
    },
    components: {
      breadcrumb: 'portal-breadcrumb',  // Único com componente padrão
      // Outros slots sem componente (usuário configura via editor)
    },
    layout: {
      width: 'full',
    },
  });
}
