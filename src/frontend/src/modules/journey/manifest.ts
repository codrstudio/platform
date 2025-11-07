/**
 * Journey Module Manifest
 *
 * SPEC Compliance:
 * - SPEC-JOURNEY-C-*: Configuration schema
 */

import type { ModuleManifest } from '@/types/module';

export const journeyManifest: ModuleManifest = {
  id: 'journey',
  version: '1.0.0',
  name: 'Journey (Jornada Guiada)',
  description: 'Sistema de onboarding e navegação guiada progressiva',
  type: 'functionality',
  category: 'productivity',

  capabilities: {
    providesComponents: true
  },

  dependencies: [],
  permissions: [],

  config: {
    schema: {
      // Journeys (REQUIRED - SPEC-JOURNEY-C-001)
      journeys: {
        type: 'json',
        label: 'Jornadas',
        description: 'Definição das jornadas disponíveis',
        required: true,
        default: []
      },

      // Default journey
      defaultJourney: {
        type: 'text',
        label: 'Jornada Padrão',
        description: 'ID da jornada que inicia automaticamente',
        placeholder: 'onboarding-platform'
      },

      // Behavior (SPEC-JOURNEY-C-003)
      autoStart: {
        type: 'boolean',
        label: 'Início Automático',
        description: 'Iniciar jornada automaticamente para novos usuários',
        default: false
      },

      allowSkip: {
        type: 'boolean',
        label: 'Permitir Pular',
        description: 'Permitir usuário pular etapas',
        default: true
      },

      autoNavigate: {
        type: 'boolean',
        label: 'Navegação Automática',
        description: 'Navegar automaticamente entre etapas',
        default: false
      },

      // Storage
      storageSchema: {
        type: 'text',
        label: 'Schema de Armazenamento',
        description: 'Schema JQEL para salvar progresso',
        default: 'platform'
      },

      // Floating guide (SPEC-JOURNEY-UI-001 to UI-005)
      floatingGuide: {
        type: 'json',
        label: 'Guia Flutuante',
        description: 'Configuração do botão flutuante',
        default: {
          position: 'bottom-right',
          showProgress: true,
          collapsible: false
        }
      },

      // Completion
      completionCelebration: {
        type: 'boolean',
        label: 'Celebração de Conclusão',
        description: 'Exibir modal ao completar jornada',
        default: true
      }
    }
  }
};
