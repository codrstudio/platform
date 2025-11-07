/**
 * Sidebar Module Manifest
 *
 * SPEC Compliance:
 * - SPEC-SIDEBAR-R-*: Module responsibilities
 * - SPEC-SIDEBAR-C-*: Configuration schema
 */

import type { ModuleManifest } from '@/types/module';

export const sidebarManifest: ModuleManifest = {
  id: 'sidebar',
  version: '1.0.0',
  name: 'Sidebar',
  description: 'Sistema de navegação lateral ou superior com menus aninhados',
  type: 'functionality',
  category: 'core',

  capabilities: {
    providesComponents: true
  },

  dependencies: [],
  permissions: [],

  config: {
    schema: {
      // Layout configuration (SPEC-SIDEBAR-C-001)
      layout: {
        type: 'select',
        label: 'Layout',
        description: 'Tipo de layout do sidebar',
        options: [
          { value: 'sidebar-left', label: 'Sidebar Esquerda' },
          { value: 'sidebar-right', label: 'Sidebar Direita' },
          { value: 'navbar-top', label: 'Navbar Superior' }
        ],
        required: true,
        default: 'sidebar-left'
      },

      // Menu items (REQUIRED)
      items: {
        type: 'json',
        label: 'Itens do Menu',
        description: 'Lista de itens de navegação',
        required: true,
        default: []
      },

      // Dimensions (SPEC-SIDEBAR-T-002, T-007)
      width: {
        type: 'number',
        label: 'Largura (px)',
        description: 'Largura do sidebar',
        default: 256,
        min: 200,
        max: 400
      },

      height: {
        type: 'number',
        label: 'Altura (px)',
        description: 'Altura da navbar (layout superior)',
        default: 64,
        min: 48,
        max: 100
      },

      collapsedWidth: {
        type: 'number',
        label: 'Largura Colapsada (px)',
        description: 'Largura quando colapsado',
        default: 80,
        min: 60,
        max: 120
      },

      // Behavior (SPEC-SIDEBAR-T-003, SPEC-SIDEBAR-M-009)
      collapsible: {
        type: 'boolean',
        label: 'Colapsável',
        description: 'Permitir colapsar sidebar',
        default: true
      },

      defaultCollapsed: {
        type: 'boolean',
        label: 'Iniciar Colapsado',
        description: 'Sidebar inicia no estado colapsado',
        default: false
      },

      persistState: {
        type: 'boolean',
        label: 'Persistir Estado',
        description: 'Salvar estado de expansão no localStorage',
        default: true
      },

      closeOnNavigate: {
        type: 'boolean',
        label: 'Fechar ao Navegar',
        description: 'Fechar sidebar após navegação (mobile)',
        default: true
      },

      // Features (SPEC-SIDEBAR-O-*)
      enableSearch: {
        type: 'boolean',
        label: 'Habilitar Busca',
        description: 'Exibir campo de busca no menu',
        default: false
      },

      enableUserMenu: {
        type: 'boolean',
        label: 'Habilitar User Menu',
        description: 'Exibir menu de usuário',
        default: false
      },

      enableThemeToggle: {
        type: 'boolean',
        label: 'Habilitar Toggle de Tema',
        description: 'Exibir botão de alternar tema',
        default: false
      },

      // Style
      variant: {
        type: 'select',
        label: 'Variante',
        description: 'Estilo visual do sidebar',
        options: [
          { value: 'default', label: 'Padrão' },
          { value: 'bordered', label: 'Com Borda' },
          { value: 'floating', label: 'Flutuante' }
        ],
        default: 'default'
      },

      showIcons: {
        type: 'boolean',
        label: 'Exibir Ícones',
        description: 'Mostrar ícones nos itens de menu',
        default: true
      },

      showBadges: {
        type: 'boolean',
        label: 'Exibir Badges',
        description: 'Mostrar badges nos itens de menu',
        default: true
      },

      // User Menu configuration
      userMenu: {
        type: 'json',
        label: 'Configuração do User Menu',
        description: 'Configuração detalhada do menu de usuário',
        default: {
          position: 'bottom',
          showAvatar: true,
          showName: true,
          showEmail: false,
          actions: []
        }
      },

      // Permissions
      checkPermissions: {
        type: 'boolean',
        label: 'Verificar Permissões',
        description: 'Verificar permissões dos itens de menu',
        default: false
      }
    }
  }
};
