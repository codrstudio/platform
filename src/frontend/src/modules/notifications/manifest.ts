import type { ModuleManifest } from '@/types/module';

/**
 * Notifications Module Manifest
 *
 * Módulo de notificações que fornece interface para visualização e
 * gerenciamento de notificações do sistema recebidas via SSE.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-R-001: Interface para visualização de notificações
 * - SPEC-NOTIF-R-002: Consumo de eventos do Canal de Eventos (SSE)
 * - SPEC-NOTIF-R-003: Não lida com tasks (módulo Tasks)
 * - SPEC-NOTIF-R-004: Persistência via JQEL
 */
export const notificationsManifest: ModuleManifest = {
  id: 'notifications',
  moduleId: 'notifications',
  version: '1.0.0',
  name: 'Notificações',
  description: 'Centro de notificações com visualização, filtros e gerenciamento de notificações do sistema',

  type: 'functionality',
  category: 'core',

  author: 'Platform Team',

  dependencies: [],

  capabilities: {
    providesAuth: false,
    providesRoutes: true,
    providesComponents: true,
    providesWidgets: true
  },

  permissions: [],

  config: {
    schema: {
      type: 'object',
      properties: {
        // Data Source
        dataSource: {
          type: 'object',
          properties: {
            schema: {
              type: 'string',
              default: 'platform',
              description: 'Schema JQEL para armazenamento'
            },
            entity: {
              type: 'string',
              default: 'notifications',
              description: 'Entidade JQEL'
            }
          },
          required: ['schema', 'entity'],
          default: {
            schema: 'platform',
            entity: 'notifications'
          }
        },

        // UI Configuration
        ui: {
          type: 'object',
          properties: {
            dropdownLimit: {
              type: 'number',
              default: 5,
              description: 'Quantidade de notificações no dropdown'
            },
            pageSize: {
              type: 'number',
              default: 20,
              description: 'Quantidade de notificações por página'
            },
            showToast: {
              type: 'boolean',
              default: true,
              description: 'Exibir toast ao receber notificação'
            },
            toastDuration: {
              type: 'number',
              default: 5000,
              description: 'Duração do toast em ms'
            },
            playSound: {
              type: 'boolean',
              default: false,
              description: 'Tocar som ao receber notificação'
            },
            soundFile: {
              type: 'string',
              default: '/sounds/notification.mp3',
              description: 'Arquivo de som'
            },
            enableBrowserNotifications: {
              type: 'boolean',
              default: false,
              description: 'Usar Notification API do browser'
            }
          },
          default: {
            dropdownLimit: 5,
            pageSize: 20,
            showToast: true,
            toastDuration: 5000,
            playSound: false,
            soundFile: '/sounds/notification.mp3',
            enableBrowserNotifications: false
          }
        },

        // Features
        features: {
          type: 'object',
          properties: {
            enableSearch: {
              type: 'boolean',
              default: true,
              description: 'Habilitar busca na página'
            },
            enableFilters: {
              type: 'boolean',
              default: true,
              description: 'Habilitar filtros na página'
            },
            enableGrouping: {
              type: 'boolean',
              default: false,
              description: 'Agrupar notificações similares'
            },
            enableArchive: {
              type: 'boolean',
              default: false,
              description: 'Habilitar arquivamento'
            },
            enableInlineActions: {
              type: 'boolean',
              default: false,
              description: 'Habilitar ações inline'
            }
          },
          default: {
            enableSearch: true,
            enableFilters: true,
            enableGrouping: false,
            enableArchive: false,
            enableInlineActions: false
          }
        }
      },
      required: ['dataSource']
    },
    defaults: {
      dataSource: {
        schema: 'platform',
        entity: 'notifications'
      },
      ui: {
        dropdownLimit: 5,
        pageSize: 20,
        showToast: true,
        toastDuration: 5000,
        playSound: false,
        soundFile: '/sounds/notification.mp3',
        enableBrowserNotifications: false
      },
      features: {
        enableSearch: true,
        enableFilters: true,
        enableGrouping: false,
        enableArchive: false,
        enableInlineActions: false
      }
    }
  }
};
