/**
 * ChatInterface Page
 *
 * Main chat interface with messages, input, and optional sidebar.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-R-001: Real-time conversation interface
 * - SPEC-CHAT-F-001: Complete interface components
 *
 * Features:
 * - Uses instanceId from URL (/:portal/chats/:instanceId)
 * - Streaming support with cancel button
 * - Quick suggestions sidebar
 * - Welcome message on empty state
 * - Responsive layout
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MessageList, MessageInput, QuickSuggestions } from '../components';
import { useChat } from '../hooks/useChat';
import type { ChatInstanceConfig } from '../types';
import { Spinner } from '@/modules/loading';
import { useJQELQuery } from '@/hooks/useJQEL';

export interface ChatInterfaceProps {
  config?: ChatInstanceConfig;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

const defaultConfig: ChatInstanceConfig = {
  agentId: 'nic-assistant',
  provider: 'n8n',
  enableStreaming: true,
  persistHistory: true,
  contextWindow: 10,
  showTimestamps: true,
  showTypingIndicator: true,
  placeholder: 'Digite sua mensagem...',
  maxInputLength: 4000,
  maxInputRows: 5,
  allowFileUpload: false,
};

export function ChatInterface({ config: providedConfig }: ChatInterfaceProps) {
  // Get instanceId from URL - this is the conversationId
  const { instanceId, portalId } = useParams<{ instanceId: string; portalId: string }>();

  // Use instanceId as conversationId, or generate one if not provided
  const conversationId = useMemo(() => instanceId || generateUUID(), [instanceId]);

  // Fetch instance configuration from backend if not provided
  const { data: instanceResult, isLoading: isLoadingInstance } = useJQELQuery(
    {
      schema: 'backend',
      select: 'instance',
      where: {
        instanceId: { $eq: instanceId || '' },
        portalId: { $eq: portalId || 'main' },
        moduleId: { $eq: 'chat' },
      },
    },
    {
      enabled: !providedConfig && !!instanceId,
    }
  );

  // Use provided config or fetched config or default config
  const config: ChatInstanceConfig = useMemo(() => {
    if (providedConfig) {
      return providedConfig;
    }

    if (instanceResult?.data?.[0]?.config) {
      return { ...defaultConfig, ...instanceResult.data[0].config };
    }

    return defaultConfig;
  }, [providedConfig, instanceResult]);

  const {
    messages,
    isLoading,
    isSending,
    isStreaming,
    chatState,
    sendMessage,
    cancelMessage,
  } = useChat(conversationId, config);

  // Show loading while fetching instance config
  if (isLoadingInstance && !providedConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Carregando configuração..." showLabel />
      </div>
    );
  }

  const handleSendMessage = async (content: string, files?: File[]) => {
    await sendMessage(content, files);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleCancel = () => {
    if (cancelMessage) {
      cancelMessage();
    }
  };

  // Determine empty message
  const emptyMessage = config.welcomeMessage || 'Inicie uma conversa!';

  return (
    <div className="flex h-full max-h-screen">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto w-full">
        {/* Header */}
        {(config.title || config.description) && (
          <header className="border-b p-4 flex-shrink-0">
            <div>
              <h1 className="text-xl font-semibold">{config.title || 'Chat'}</h1>
              {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
              )}
            </div>
          </header>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-hidden min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" label="Carregando histórico..." showLabel />
            </div>
          ) : (
            <MessageList
              messages={messages}
              showTimestamps={config.showTimestamps}
              isTyping={isStreaming || (chatState === 'processing' && config.showTypingIndicator)}
              emptyMessage={emptyMessage}
              className="h-full"
            />
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          onCancel={handleCancel}
          disabled={isSending && !isStreaming}
          isStreaming={isStreaming}
          placeholder={config.placeholder}
          maxLength={config.maxInputLength}
          maxRows={config.maxInputRows}
          allowFileUpload={config.allowFileUpload}
          acceptedFileTypes={config.acceptedFileTypes}
          maxFileSize={config.maxFileSize}
        />
      </main>

      {/* Sidebar - Quick Suggestions */}
      {config.quickSuggestions && config.quickSuggestions.length > 0 && (
        <aside className="w-64 border-l bg-muted/5 hidden lg:block flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Sugestões</h3>
            <QuickSuggestions
              suggestions={config.quickSuggestions}
              onSelect={handleSuggestionClick}
              disabled={isSending || isStreaming}
            />
          </div>
        </aside>
      )}
    </div>
  );
}
