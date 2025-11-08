/**
 * ChatInterface Page
 *
 * Main chat interface with messages, input, and optional sidebar.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-R-001: Real-time conversation interface
 * - SPEC-CHAT-F-001: Complete interface components
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageList, MessageInput, QuickSuggestions, ConversationList } from '../components';
import { useChat } from '../hooks/useChat';
import type { ChatInstanceConfig } from '../types';
import { Spinner } from '@/modules/loading';

export interface ChatInterfaceProps {
  config: ChatInstanceConfig;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

export function ChatInterface({ config }: ChatInterfaceProps) {
  const { conversationId: urlConversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(
    urlConversationId || generateUUID()
  );

  const {
    messages,
    conversations,
    isLoading,
    isSending,
    chatState,
    sendMessage,
    createConversation
  } = useChat(conversationId, config);

  // Update URL when conversation changes
  useEffect(() => {
    if (config.route && conversationId !== urlConversationId) {
      navigate(`${config.route}/${conversationId}`, { replace: true });
    }
  }, [conversationId, urlConversationId, config.route, navigate]);

  // Add welcome message if empty
  useEffect(() => {
    if (messages.length === 0 && config.welcomeMessage) {
      // Welcome message would be added here
    }
  }, [messages.length, config.welcomeMessage]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    await sendMessage(content, files);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleNewConversation = () => {
    const newId = createConversation();
    setConversationId(newId);
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Conversation List */}
      {config.enableMultipleConversations && (
        <aside className="w-60 border-r bg-muted/10 hidden md:block">
          <ConversationList
            conversations={conversations}
            activeConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4">
          <div>
            <h1 className="text-xl font-semibold">{config.title || 'Chat'}</h1>
            {config.description && (
              <p className="text-sm text-muted-foreground">{config.description}</p>
            )}
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" label="Carregando histórico..." showLabel />
            </div>
          ) : (
            <MessageList
              messages={messages}
              showTimestamps={config.showTimestamps}
              isTyping={chatState === 'processing' && config.showTypingIndicator}
              className="h-full"
            />
          )}
        </div>

        {/* Quick Suggestions */}
        {config.quickSuggestions && config.quickSuggestions.length > 0 && (
          <QuickSuggestions
            suggestions={config.quickSuggestions}
            onSelect={handleSuggestionClick}
            disabled={isSending}
          />
        )}

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={isSending}
          placeholder={config.placeholder}
          maxLength={config.maxInputLength}
          maxRows={config.maxInputRows}
          allowFileUpload={config.allowFileUpload}
          acceptedFileTypes={config.acceptedFileTypes}
          maxFileSize={config.maxFileSize}
        />
      </main>
    </div>
  );
}
