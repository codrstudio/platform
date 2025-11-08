/**
 * Chat Module Manifest
 *
 * Real-time chat with AI agents and human users.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-R-*: Module responsibilities
 * - SPEC-CHAT-F-*: Core functionalities
 * - SPEC-CHAT-C-*: Configuration schema
 */

import type { ModuleManifest } from '@/types/module';

export const chatManifest: ModuleManifest = {
  id: 'chat',
  moduleId: 'chat',
  name: 'Chat',
  version: '1.0.0',
  description: 'Real-time conversations with AI agents and users',

  type: 'functionality',
  category: 'communication',

  dependencies: [],
  permissions: ['chat:read', 'chat:write', 'agent:invoke'],

  config: {
    schema: {
      agentId: {
        type: 'string',
        required: true,
        description: 'ID of the AI agent to interact with'
      },
      route: {
        type: 'string',
        required: true,
        description: 'Route path for the chat page'
      },
      title: {
        type: 'string',
        default: 'Chat',
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
      allowFileUpload: {
        type: 'boolean',
        default: false,
        description: 'Allow file uploads in chat'
      },
      acceptedFileTypes: {
        type: 'array',
        items: { type: 'string' },
        default: ['image/*', 'application/pdf'],
        description: 'Accepted MIME types for file upload'
      },
      maxFileSize: {
        type: 'number',
        default: 5242880,
        description: 'Maximum file size in bytes (default: 5MB)'
      },
      enableExport: {
        type: 'boolean',
        default: false,
        description: 'Enable conversation export'
      },
      exportFormats: {
        type: 'array',
        items: { type: 'string', enum: ['pdf', 'markdown', 'json'] },
        default: ['markdown'],
        description: 'Available export formats'
      },
      enableSearch: {
        type: 'boolean',
        default: false,
        description: 'Enable message search'
      },
      enableMultipleConversations: {
        type: 'boolean',
        default: false,
        description: 'Allow multiple conversation threads'
      },
      enableStreaming: {
        type: 'boolean',
        default: false,
        description: 'Enable streaming responses via SSE'
      },
      maxInputLength: {
        type: 'number',
        default: 4000,
        description: 'Maximum message length'
      },
      autoGrowInput: {
        type: 'boolean',
        default: true,
        description: 'Auto-grow input field'
      },
      maxInputRows: {
        type: 'number',
        default: 5,
        description: 'Maximum rows for auto-grow input'
      },
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
      persistHistory: {
        type: 'boolean',
        default: true,
        description: 'Persist chat history via JQEL'
      },
      contextWindow: {
        type: 'number',
        default: 10,
        description: 'Number of previous messages to send as context'
      }
    },
    defaults: {
      agentId: '',
      route: '/chat',
      title: 'Chat',
      placeholder: 'Digite sua mensagem...',
      allowFileUpload: false,
      acceptedFileTypes: ['image/*', 'application/pdf'],
      maxFileSize: 5242880,
      enableExport: false,
      exportFormats: ['markdown'],
      enableSearch: false,
      enableMultipleConversations: false,
      enableStreaming: false,
      maxInputLength: 4000,
      autoGrowInput: true,
      maxInputRows: 5,
      showTimestamps: true,
      showTypingIndicator: true,
      persistHistory: true,
      contextWindow: 10
    }
  }
};
