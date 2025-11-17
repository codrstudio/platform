import type { ModuleManifest } from '@/types/module';

export const manifest: ModuleManifest = {
  id: 'homepage',
  name: 'Home Page',
  version: '2.0.0',
  type: 'functionality',
  description: 'Beautiful, customizable landing pages with visual editor. Create homepages with Hero sections, Cards, Stats, FAQ, Newsletter, and more. Features JQEL datasource support, flexible navigation, and hybrid config storage.',
  author: 'Platform Team',
  dependencies: [],
  category: 'core',
  permissions: [],
  capabilities: {
    providesRoutes: true,
    providesComponents: true,
  },
  config: {
    schema: {
      route: {
        type: 'string',
        label: 'Rota da Página',
        description: 'Caminho da URL para acessar esta página (ex: "/", "/home")',
        required: true,
      },
      title: {
        type: 'string',
        label: 'Título da Página',
        description: 'Título exibido na aba do navegador e para SEO',
        required: false,
      },
      enabled: {
        type: 'boolean',
        label: 'Página Ativa',
        description: 'Ativar ou desativar esta página',
        required: true,
      },
      compositionId: {
        type: 'string',
        label: 'Composição',
        description: 'Layout/composição para envolver a página (deixe vazio para página sem layout)',
        required: false,
      },
    },
    defaults: {
      route: '/',
      enabled: true,
      compositionId: null,
    },
  },
};
