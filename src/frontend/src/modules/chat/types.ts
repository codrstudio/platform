/**
 * Chat Module Types
 *
 * Types for chat messages, conversations, and AI agent interactions.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-P-001: Message structure
 * - SPEC-CHAT-C-001, C-002: Configuration parameters
 */

/**
 * Message role types
 */
export type MessageRole = 'user' | 'agent' | 'system';

/**
 * Message status types
 */
export type MessageStatus = 'sending' | 'sent' | 'error' | 'receiving' | 'complete';

/**
 * Chat state types
 */
export type ChatState = 'idle' | 'typing' | 'processing' | 'error';

/**
 * Export format types
 */
export type ExportFormat = 'pdf' | 'markdown' | 'json';

/**
 * Message file attachment
 */
export interface MessageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  files?: MessageFile[];
  error?: boolean;
  retryable?: boolean;
  model?: string;
  tokens?: number;
  confidence?: number;
}

/**
 * Chat message structure
 * SPEC-CHAT-P-001
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  metadata?: MessageMetadata;
}

/**
 * Conversation structure
 */
export interface Conversation {
  id: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Quick suggestion configuration
 */
export interface QuickSuggestion {
  text: string;
  icon?: string;
}

/**
 * Chat instance configuration
 * SPEC-CHAT-C-001, C-002
 */
export interface ChatInstanceConfig {
  // Required
  agentId: string;
  route: string;

  // Optional - Display
  title?: string;
  description?: string;
  placeholder?: string;
  welcomeMessage?: string;
  quickSuggestions?: string[];

  // Optional - File upload
  allowFileUpload?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;

  // Optional - Export
  enableExport?: boolean;
  exportFormats?: ExportFormat[];

  // Optional - Features
  enableSearch?: boolean;
  enableMultipleConversations?: boolean;
  enableStreaming?: boolean;

  // Optional - Input
  maxInputLength?: number;
  autoGrowInput?: boolean;
  maxInputRows?: number;

  // Optional - Display preferences
  showTimestamps?: boolean;
  showTypingIndicator?: boolean;

  // Optional - Persistence
  persistHistory?: boolean;
  contextWindow?: number;
}

/**
 * Search result structure
 */
export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  messageContent: string;
  timestamp: string;
  role: MessageRole;
}

/**
 * Export options
 */
export interface ExportOptions {
  includeTimestamps: boolean;
  includeMetadata: boolean;
  userMessagesOnly: boolean;
}

/**
 * Chat context for agent
 */
export interface ChatContext {
  message: string;
  conversationId: string;
  context: Message[];
  files?: File[];
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  message: string;
  conversationId: string;
  metadata?: MessageMetadata;
}

/**
 * Chat hook state
 */
export interface ChatHookState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: string;
  isLoading: boolean;
  isSending: boolean;
  isStreaming?: boolean;
  chatState: ChatState;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  cancelMessage?: () => void;
  createConversation: () => string;
  switchConversation: (conversationId: string) => void;
  retryMessage: (messageId: string) => Promise<void>;
}
