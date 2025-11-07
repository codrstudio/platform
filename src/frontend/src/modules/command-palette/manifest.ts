/**
 * Command Palette Module Manifest
 *
 * SPEC Compliance:
 * - SPEC-CP-M-*: Modalidades (suspensa e expandida)
 * - SPEC-CP-R-001: Three pillars (search, commands, agents)
 * - SPEC-CP-C-001: Instance configuration
 */

import type { ModuleManifest } from '@/types/module';

export const commandPaletteManifest: ModuleManifest = {
  id: 'command-palette',
  version: '1.0.0',
  name: 'Command Palette',
  description: 'Interface unificada para busca, comandos e invocação de agentes',
  type: 'functionality',
  category: 'productivity',

  capabilities: {
    providesRoutes: true,
    providesComponents: true
  },

  dependencies: [],
  permissions: [],

  config: {
    schema: {
      // Mode configuration (SPEC-CP-M-001 to M-009)
      mode: {
        type: 'select',
        label: 'Modo',
        description: 'Modalidade de operação do Command Palette',
        options: [
          { value: 'suspended', label: 'Suspenso (Overlay)' },
          { value: 'expanded', label: 'Expandido (Página)' },
          { value: 'both', label: 'Ambos' }
        ],
        required: true,
        default: 'both'
      },

      // Suspended mode settings (SPEC-CP-M-002 to M-005)
      suspendedShortcut: {
        type: 'text',
        label: 'Atalho do Teclado',
        description: 'Atalho para abrir o Command Palette suspenso',
        default: 'Ctrl+K',
        placeholder: 'Ctrl+K ou Cmd+K'
      },

      // Expanded mode settings (SPEC-CP-M-006 to M-008)
      expandedRoute: {
        type: 'text',
        label: 'Rota Expandida',
        description: 'Caminho da página do Command Palette expandido',
        default: '/search'
      },

      // Results configuration
      maxResultsPerCategory: {
        type: 'number',
        label: 'Resultados por Categoria',
        description: 'Número máximo de resultados por categoria (suspenso: 5, expandido: 20)',
        default: 5,
        min: 1,
        max: 50
      },

      // Performance settings (SPEC-CP-PERF-*)
      debounceMs: {
        type: 'number',
        label: 'Debounce (ms)',
        description: 'Atraso antes de executar busca',
        default: 300,
        min: 0,
        max: 1000
      },

      // History settings (SPEC-CP-H-*)
      historyLimit: {
        type: 'number',
        label: 'Limite de Histórico',
        description: 'Número máximo de itens no histórico',
        default: 50,
        min: 10,
        max: 200
      },

      // Category order
      defaultCategories: {
        type: 'json',
        label: 'Ordem de Categorias',
        description: 'Ordem de exibição das categorias',
        default: [
          'navigation',
          'commands',
          'agents',
          'data',
          'recent'
        ]
      },

      // Feature toggles (SPEC-CP-R-001)
      enableSearch: {
        type: 'boolean',
        label: 'Habilitar Busca',
        description: 'Permitir busca federada de conteúdo',
        default: true
      },

      enableCommands: {
        type: 'boolean',
        label: 'Habilitar Comandos',
        description: 'Permitir execução de comandos rápidos',
        default: true
      },

      enableAgents: {
        type: 'boolean',
        label: 'Habilitar Agentes',
        description: 'Permitir invocação de agentes de IA',
        default: true
      }
    }
  }
};
