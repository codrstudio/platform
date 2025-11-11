/**
 * Chatify Module Manifest
 *
 * Sistema avançado de chat com IA que inclui:
 * - Múltiplos provedores de IA (NIC, OpenAI) com seleção de modelos
 * - Sistema de agentes configurável (built-in, N8N-discovered, custom)
 * - Gamificação/Jornada de descoberta com 14 etapas
 * - Streaming SSE unificado (N8N + OpenAI compatible)
 * - Renderização avançada (Markdown + Mermaid diagrams + Imagens)
 * - Widget de chat flutuante
 * - FAB Stack (Material Design)
 * - Sistema de progresso e conquistas
 *
 * Adaptado de: examples/chat (NIC Chat standalone)
 *
 * SPEC Compliance:
 * - SPEC-M-CHATIFY-001: Sistema de múltiplos provedores de IA
 * - SPEC-M-CHATIFY-002: Sistema de agentes configurável
 * - SPEC-M-CHATIFY-003: Gamificação/Jornada de descoberta
 * - SPEC-M-CHATIFY-004: Streaming SSE unificado
 * - SPEC-M-CHATIFY-005: Renderização avançada de conteúdo
 */

import type { ModuleManifest } from '@/types/module'

export const chatifyManifest: ModuleManifest = {
  id: 'chatify',
  moduleId: 'chatify',
  name: 'Chatify',
  version: '1.0.0',
  description:
    'Advanced AI chat system with multi-provider support, customizable agents, gamification, and rich content rendering',

  type: 'functionality',
  category: 'communication',

  dependencies: [],
  permissions: [
    'chat:read',
    'chat:write',
    'agent:invoke',
    'agent:create',
    'agent:update',
    'agent:delete',
    'provider:read',
    'provider:write'
  ],

  config: {
    schema: {
      // ==================== REQUIRED ====================
      agentId: {
        type: 'string',
        required: true,
        description: 'ID of the default AI agent to interact with'
      },
      route: {
        type: 'string',
        required: true,
        description: 'Route path for the chat page'
      },

      // ==================== DISPLAY ====================
      title: {
        type: 'string',
        default: 'Chatify',
        description: 'Chat interface title'
      },
      description: {
        type: 'string',
        description: 'Description shown in the header'
      },
      placeholder: {
        type: 'string',
        default: 'Digite sua mensagem...',
        description: 'Input placeholder text'
      },
      welcomeMessage: {
        type: 'string',
        description: 'Initial message from the agent'
      },
      quickSuggestions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Quick reply suggestions'
      },

      // ==================== FILE UPLOAD ====================
      allowFileUpload: {
        type: 'boolean',
        default: false,
        description: 'Allow file uploads in chat'
      },
      acceptedFileTypes: {
        type: 'array',
        items: { type: 'string' },
        default: ['image/*', 'application/pdf', 'text/*'],
        description: 'Accepted MIME types for file upload'
      },
      maxFileSize: {
        type: 'number',
        default: 10485760,
        description: 'Maximum file size in bytes (default: 10MB)'
      },

      // ==================== EXPORT ====================
      enableExport: {
        type: 'boolean',
        default: true,
        description: 'Enable conversation export'
      },
      exportFormats: {
        type: 'array',
        items: { type: 'string', enum: ['pdf', 'markdown', 'json'] },
        default: ['markdown', 'json'],
        description: 'Available export formats'
      },

      // ==================== FEATURES ====================
      enableSearch: {
        type: 'boolean',
        default: true,
        description: 'Enable message search'
      },
      enableMultipleConversations: {
        type: 'boolean',
        default: true,
        description: 'Allow multiple conversation threads'
      },
      enableStreaming: {
        type: 'boolean',
        default: true,
        description: 'Enable streaming responses via SSE'
      },

      // ==================== INPUT ====================
      maxInputLength: {
        type: 'number',
        default: 8000,
        description: 'Maximum message length'
      },
      autoGrowInput: {
        type: 'boolean',
        default: true,
        description: 'Auto-grow input field'
      },
      maxInputRows: {
        type: 'number',
        default: 6,
        description: 'Maximum rows for auto-grow input (1-6)'
      },

      // ==================== DISPLAY PREFERENCES ====================
      showTimestamps: {
        type: 'boolean',
        default: true,
        description: 'Show message timestamps'
      },
      showTypingIndicator: {
        type: 'boolean',
        default: true,
        description: 'Show typing indicator'
      },

      // ==================== PERSISTENCE ====================
      persistHistory: {
        type: 'boolean',
        default: true,
        description: 'Persist chat history via JQEL'
      },
      contextWindow: {
        type: 'number',
        default: 100,
        description: 'Number of previous messages to load and send as context'
      },

      // ==================== JOURNEY/GAMIFICATION ====================
      enableJourney: {
        type: 'boolean',
        default: true,
        description: 'Enable gamification/journey discovery system'
      },
      showProgressBar: {
        type: 'boolean',
        default: true,
        description: 'Show progress bar in header (requires enableJourney)'
      },
      showNextStepWidget: {
        type: 'boolean',
        default: true,
        description: 'Show floating next step widget (requires enableJourney)'
      },

      // ==================== ADVANCED ====================
      debugMode: {
        type: 'boolean',
        default: false,
        description: 'Enable debug mode with console logs'
      },
      performanceLogs: {
        type: 'boolean',
        default: false,
        description: 'Enable performance logging'
      },
      defaultTheme: {
        type: 'string',
        enum: ['light', 'dark', 'system'],
        default: 'system',
        description: 'Default theme (light, dark, or system preference)'
      }
    },
    defaults: {
      // Required
      agentId: '',
      route: '/chatify',

      // Display
      title: 'Chatify',
      placeholder: 'Digite sua mensagem...',

      // File Upload
      allowFileUpload: false,
      acceptedFileTypes: ['image/*', 'application/pdf', 'text/*'],
      maxFileSize: 10485760, // 10MB

      // Export
      enableExport: true,
      exportFormats: ['markdown', 'json'],

      // Features
      enableSearch: true,
      enableMultipleConversations: true,
      enableStreaming: true,

      // Input
      maxInputLength: 8000,
      autoGrowInput: true,
      maxInputRows: 6,

      // Display Preferences
      showTimestamps: true,
      showTypingIndicator: true,

      // Persistence
      persistHistory: true,
      contextWindow: 100,

      // Journey/Gamification
      enableJourney: true,
      showProgressBar: true,
      showNextStepWidget: true,

      // Advanced
      debugMode: false,
      performanceLogs: false,
      defaultTheme: 'system'
    }
  }
}
