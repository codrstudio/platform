/**
 * Chat Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-CHAT-R-*: Module responsibilities
 * - SPEC-CHAT-F-*: Core functionalities
 * - SPEC-CHAT-E-001: Component exports
 */

import { chatManifest } from './manifest';
import { chatRoutes } from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { ChatInterface } from './pages/ChatInterface';

// Hooks
export { useChat } from './hooks/useChat';

// Types
export type {
  MessageRole,
  MessageStatus,
  ChatState,
  ExportFormat,
  MessageFile,
  MessageMetadata,
  Message,
  Conversation,
  QuickSuggestion,
  ChatInstanceConfig,
  SearchResult,
  ExportOptions,
  ChatContext,
  AgentResponse,
  ChatHookState
} from './types';

// Module Exports
export const chatModule: ModuleExports = {
  manifest: chatManifest,
  routes: chatRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(chatModule);
