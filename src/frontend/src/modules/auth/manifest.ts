import type { ModuleManifest } from '@/types/module';

/**
 * Auth Module Manifest
 *
 * Módulo de autenticação que funciona como mecanismo de proteção de rotas.
 * Quando ativo em um portal, exige autenticação para acessar as rotas.
 * Quando inativo, as rotas são públicas.
 *
 * IMPORTANTE: Este módulo NÃO fornece UI de autenticação (login pages, logout buttons, etc).
 * A UI de login é fornecida globalmente pela aplicação.
 *
 * SPEC Compliance:
 * - SPEC-AUTH-R-001: Controla se rotas são protegidas ou públicas
 * - SPEC-AUTH-R-002: NÃO fornece UI de autenticação
 * - SPEC-AUTH-R-003: NÃO implementa lógica de autenticação (usa AuthContext global)
 * - SPEC-AUTH-R-004: DEVE ter exatamente UMA instância por portal (single-instance)
 * - SPEC-AUTH-R-005: Instância DEVE ser criada automaticamente com instanceId="default"
 * - SPEC-AUTH-RP-001 a RP-006: Comportamento de proteção de rotas
 * - SPEC-AUTH-M-001 a M-008: Comportamento single-instance e isolamento
 */
export const authManifest: ModuleManifest = {
  id: 'auth',
  version: '2.0.0', // Version bump devido à mudança conceitual
  name: 'Proteção de Rotas',
  description: 'Ativa/desativa proteção de rotas por autenticação em portais',

  type: 'functionality',
  category: 'core',

  author: 'Platform Team',

  dependencies: [],

  // SPEC-AUTH-R-004: Auth é single-instance (apenas UMA instância por portal)
  singleInstance: true,

  capabilities: {
    providesAuth: true,        // Ainda marca como "providesAuth" para indicar proteção
    providesRoutes: false,     // Não fornece mais rotas próprias
    providesComponents: true,  // Fornece ProtectedRoute (opcional, global já existe)
    providesWidgets: false
  },

  permissions: [],

  // SPEC-AUTH-C-001 a C-004: Configuração mínima ou vazia
  config: {
    schema: {
      type: 'object',
      properties: {
        allowedRoles: {
          type: 'array',
          items: { type: 'string' },
          label: 'Papéis Permitidos',
          description: 'Liste os papéis que podem acessar este portal. Deixe vazio para permitir qualquer usuário autenticado.',
          ui: 'tag-input',
          default: []
        }
      },
      required: []
    },
    defaults: {
      allowedRoles: []
    }
  }
};
