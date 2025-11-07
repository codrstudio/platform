import type { ModuleManifest } from '@/types/module';

/**
 * Auth Module Manifest
 *
 * Módulo de autenticação que fornece interfaces para login, logout,
 * registro e gerenciamento de sessão.
 *
 * SPEC Compliance:
 * - SPEC-AUTH-R-001: Fornece componentes de interface para autenticação
 * - SPEC-AUTH-R-002: Não implementa lógica de autenticação (usa Canal de Autenticação)
 * - SPEC-AUTH-R-003: Wrapper sobre /api/1/auth/*
 * - SPEC-AUTH-R-004: Suporta múltiplas instâncias
 */
export const authManifest: ModuleManifest = {
  id: 'auth',
  version: '1.0.0',
  name: 'Autenticação',
  description: 'Sistema de autenticação com login, logout e gerenciamento de sessão',

  type: 'functionality',
  category: 'core',

  author: 'Platform Team',

  dependencies: [],

  capabilities: {
    providesAuth: true,
    providesRoutes: true,
    providesComponents: true,
    providesWidgets: false
  },

  permissions: [],

  config: {
    schema: {
      type: 'object',
      properties: {
        // Rotas
        loginRoute: {
          type: 'string',
          default: '/login',
          description: 'Rota da página de login'
        },
        logoutRedirect: {
          type: 'string',
          default: '/login',
          description: 'Rota para redirecionar após logout'
        },
        signupRoute: {
          type: 'string',
          default: '/signup',
          description: 'Rota da página de registro'
        },
        recoveryRoute: {
          type: 'string',
          default: '/forgot-password',
          description: 'Rota de recuperação de senha'
        },

        // Realm/Schema
        realm: {
          type: 'string',
          default: 'default',
          description: 'Realm padrão para autenticação'
        },
        schema: {
          type: 'string',
          default: 'app',
          description: 'Schema padrão para autenticação'
        },
        allowRealmSelection: {
          type: 'boolean',
          default: false,
          description: 'Permitir usuário selecionar realm'
        },
        allowSchemaSelection: {
          type: 'boolean',
          default: false,
          description: 'Permitir usuário selecionar schema'
        },
        realms: {
          type: 'array',
          items: { type: 'string' },
          default: ['default'],
          description: 'Lista de realms disponíveis'
        },
        schemas: {
          type: 'array',
          items: { type: 'string' },
          default: ['app'],
          description: 'Lista de schemas disponíveis'
        },

        // Features
        enableSignup: {
          type: 'boolean',
          default: false,
          description: 'Habilitar página de registro'
        },
        enablePasswordRecovery: {
          type: 'boolean',
          default: false,
          description: 'Habilitar recuperação de senha'
        },
        enableRememberMe: {
          type: 'boolean',
          default: true,
          description: 'Habilitar opção "Lembrar de mim"'
        },
        enableSocialLogin: {
          type: 'boolean',
          default: false,
          description: 'Habilitar login social (OAuth)'
        },
        socialProviders: {
          type: 'array',
          items: { type: 'string' },
          default: [],
          description: 'Provedores OAuth (google, microsoft, github)'
        },

        // Sessão
        sessionTimeout: {
          type: 'number',
          default: 1800000, // 30 min
          description: 'Timeout de inatividade em milissegundos'
        },
        autoRefresh: {
          type: 'boolean',
          default: true,
          description: 'Renovar tokens automaticamente'
        },

        // UI
        layout: {
          type: 'string',
          enum: ['centered', 'split', 'minimal', 'card'],
          default: 'centered',
          description: 'Layout da página de login'
        },
        logo: {
          type: 'string',
          default: '',
          description: 'URL da logo'
        },
        backgroundImage: {
          type: 'string',
          default: '',
          description: 'Imagem de fundo (layouts split/card)'
        },
        brandColor: {
          type: 'string',
          default: '#3B82F6',
          description: 'Cor principal'
        },

        // Textos customizáveis
        texts: {
          type: 'object',
          properties: {
            loginTitle: {
              type: 'string',
              default: 'Bem-vindo de volta',
              description: 'Título da página de login'
            },
            loginSubtitle: {
              type: 'string',
              default: 'Entre com suas credenciais',
              description: 'Subtítulo da página de login'
            },
            signupTitle: {
              type: 'string',
              default: 'Criar conta',
              description: 'Título da página de registro'
            },
            recoveryTitle: {
              type: 'string',
              default: 'Recuperar senha',
              description: 'Título da página de recuperação'
            }
          },
          default: {}
        }
      },
      required: ['loginRoute']
    },
    defaults: {
      loginRoute: '/login',
      logoutRedirect: '/login',
      realm: 'default',
      schema: 'app',
      allowRealmSelection: false,
      allowSchemaSelection: false,
      realms: ['default'],
      schemas: ['app'],
      enableSignup: false,
      enablePasswordRecovery: false,
      enableRememberMe: true,
      enableSocialLogin: false,
      socialProviders: [],
      sessionTimeout: 1800000,
      autoRefresh: true,
      layout: 'centered',
      logo: '',
      backgroundImage: '',
      brandColor: '#3B82F6',
      texts: {
        loginTitle: 'Bem-vindo de volta',
        loginSubtitle: 'Entre com suas credenciais',
        signupTitle: 'Criar conta',
        recoveryTitle: 'Recuperar senha'
      }
    }
  }
};
