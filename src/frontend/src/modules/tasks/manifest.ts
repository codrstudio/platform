/**
 * Tasks Module Manifest
 *
 * SPEC Compliance:
 * - SPEC-TASKS-B-001 to B-006: Badge functionality
 * - SPEC-TASKS-P-001 to P-007: Preview dropdown
 * - SPEC-TASKS-L-001 to L-004: Full page list
 * - SPEC-TASKS-CFG-001 to CFG-002: Configuration schema
 */

import type { ModuleManifest } from '@/types/module';

export const tasksManifest: ModuleManifest = {
  id: 'tasks',
  version: '1.0.0',
  name: 'Tarefas Interativas',
  description: 'Sistema de tarefas que requerem ação do usuário',
  type: 'functionality',
  category: 'productivity',

  capabilities: {
    providesRoutes: true,
    providesComponents: true,
    providesWidgets: true
  },

  dependencies: [],
  permissions: [],

  config: {
    schema: {
      // Mandatory configuration (SPEC-TASKS-CFG-001)
      iconPosition: {
        type: 'select',
        label: 'Posição do Ícone',
        description: 'Onde exibir o ícone de tarefas',
        options: [
          { value: 'header', label: 'Header' },
          { value: 'navbar', label: 'Navbar' },
          { value: 'custom', label: 'Customizado' }
        ],
        required: true,
        default: 'header'
      },

      taskRoute: {
        type: 'text',
        label: 'Rota das Tarefas',
        description: 'URL da página de tarefas',
        required: true,
        default: '/tasks'
      },

      // Optional configuration (SPEC-TASKS-CFG-002)
      previewSize: {
        type: 'number',
        label: 'Tarefas no Preview',
        description: 'Quantas tarefas exibir no dropdown',
        default: 5,
        min: 1,
        max: 20
      },

      defaultView: {
        type: 'select',
        label: 'Visualização Padrão',
        description: 'Tipo de visualização inicial',
        options: [
          { value: 'list', label: 'Lista' },
          { value: 'kanban', label: 'Kanban' }
        ],
        default: 'list'
      },

      enableKanban: {
        type: 'boolean',
        label: 'Habilitar Kanban',
        description: 'Permitir visualização em Kanban',
        default: false
      },

      enableSound: {
        type: 'boolean',
        label: 'Som de Notificação',
        description: 'Tocar som ao receber nova tarefa',
        default: true
      },

      soundUrl: {
        type: 'text',
        label: 'URL do Som',
        description: 'URL customizada do som de notificação',
        default: '/sounds/task.mp3'
      },

      enableToast: {
        type: 'boolean',
        label: 'Exibir Toast',
        description: 'Mostrar toast ao receber nova tarefa',
        default: true
      },

      autoRefresh: {
        type: 'number',
        label: 'Auto Refresh (ms)',
        description: 'Intervalo de atualização automática (0 = desabilitado)',
        default: 0,
        min: 0
      },

      // Categories configuration (SPEC-TASKS-C-001 to C-005)
      categories: {
        type: 'json',
        label: 'Categorias de Tarefas',
        description: 'Configuração de categorias customizadas',
        default: {
          email_approval: {
            icon: 'mail-check',
            color: '#3b82f6',
            label: 'Aprovação de Email'
          },
          system_error: {
            icon: 'alert-triangle',
            color: '#ef4444',
            label: 'Erro do Sistema'
          },
          data_validation: {
            icon: 'file-check',
            color: '#f59e0b',
            label: 'Validação de Dados'
          },
          manual_review: {
            icon: 'eye',
            color: '#8b5cf6',
            label: 'Revisão Manual'
          },
          configuration_required: {
            icon: 'settings',
            color: '#06b6d4',
            label: 'Configuração Necessária'
          }
        }
      },

      // Permissions
      permissions: {
        type: 'json',
        label: 'Permissões',
        description: 'Controle de acesso ao módulo',
        default: {
          canView: '*',
          canRespond: '*'
        }
      }
    }
  }
};
