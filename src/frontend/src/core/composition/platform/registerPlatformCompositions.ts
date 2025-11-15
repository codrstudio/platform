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
  // Layout mais simples, apenas breadcrumb e conteúdo
  compositionRegistry.register({
    id: 'default',
    name: 'Default Layout',
    providedBy: 'platform',
    slots: {
      breadcrumb: true,
      desktop: true,
    },
    components: {
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'md',
    },
  });

  // Composição 'settings'
  // Layout para configurações com navbar adicional
  compositionRegistry.register({
    id: 'settings',
    name: 'Settings Layout',
    providedBy: 'platform',
    slots: {
      navbar: true,
      breadcrumb: true,
      desktop: true,
    },
    components: {
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'full',
    },
  });
}
