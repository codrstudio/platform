// manifest.ts
import type { ModuleManifest } from '@/types/module';

export const blueprintManifest: ModuleManifest = {
  id: 'blueprint',
  version: '1.0.0',
  name: 'Blueprint',
  description: 'Módulo de referência demonstrando padrões corretos de desenvolvimento',
  type: 'functionality',
  category: 'system',
  dependencies: [],
  singleInstance: true,

  capabilities: {
    providesRoutes: true,
    providesComponents: true,
  },

  routes: [
    { path: '/ola', index: false }
  ],

  config: {
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Blueprint Module',
          description: 'Título exibido na página'
        },
        description: {
          type: 'string',
          default: 'Exemplo de módulo bem estruturado',
          description: 'Descrição do módulo'
        }
      }
    },
    defaults: {
      title: 'Blueprint Module',
      description: 'Exemplo de módulo bem estruturado'
    }
  },

  permissions: []
};
