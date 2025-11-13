import type { ModuleManifest } from '@/types/module';

/**
 * Helpdesk Module Manifest
 *
 * Módulo de helpdesk/SAC para gerenciamento de tickets, categorias, clientes e contatos.
 * Fornece interface completa para atendimento ao cliente.
 *
 * SPEC Compliance:
 * - spec/modules/sac-module/SPEC-sac-helpdesk.md
 * - Implementa 233 requisitos técnicos do sistema SAC
 */
export const helpdeskManifest: ModuleManifest = {
  id: 'helpdesk',
  version: '1.0.0',
  name: 'Helpdesk',
  description: 'Sistema de atendimento ao cliente (SAC) com gestão de tickets, categorias e clientes',

  type: 'functionality',
  category: 'business',

  author: 'Platform Team',

  dependencies: [],

  singleInstance: false,

  capabilities: {
    providesAuth: false,
    providesRoutes: true,
    providesComponents: true,
    providesWidgets: false
  },

  permissions: [
    'helpdesk.tickets.view',
    'helpdesk.tickets.create',
    'helpdesk.tickets.update',
    'helpdesk.tickets.delete',
    'helpdesk.categories.view',
    'helpdesk.categories.manage',
    'helpdesk.clients.view',
    'helpdesk.clients.manage',
    'helpdesk.contacts.view',
    'helpdesk.contacts.manage'
  ],

  config: {
    schema: {
      type: 'object',
      properties: {
        enableSLA: {
          type: 'boolean',
          label: 'Habilitar SLA',
          description: 'Ativa o sistema de SLA (Service Level Agreement) para tickets',
          default: true
        },
        enableSatisfactionSurvey: {
          type: 'boolean',
          label: 'Pesquisa de Satisfação',
          description: 'Habilita pesquisa de satisfação após fechamento de tickets',
          default: true
        }
      },
      required: []
    },
    defaults: {
      enableSLA: true,
      enableSatisfactionSurvey: true
    }
  }
};
