/**
 * useChat Hook
 *
 * Hook for chat state management with streaming SSE and JQEL persistence.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-008: Message sending flow
 * - SPEC-CHAT-P-002, P-003: JQEL operations
 * - SPEC-CHAT-I-001: Agent integration via /api/agent/:provider/:agentId
 * - SPEC-CHAT-I-005-007: Streaming SSE
 *
 * Features:
 * - Streaming SSE for real-time responses
 * - JQEL persistence with optimistic updates
 * - AbortController for cancellation
 * - Context window management
 */

import { useState, useCallback, useRef } from 'react';
import type { Message, ChatInstanceConfig, ChatHookState } from '../types';
import { useChatHistory } from './useChatHistory';

function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Stream event from agent
 */
interface StreamEvent {
  event: 'token' | 'end' | 'error';
  data?: string;
  error?: string;
}

/**
 * useChat Hook
 *
 * @param conversationId - ID da conversa atual
 * @param config - Configuração da instância do chat
 */
export function useChat(
  conversationId: string,
  config: ChatInstanceConfig
): ChatHookState {
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatState, setChatState] = useState<'idle' | 'typing' | 'processing' | 'error'>('idle');

  // AbortController for cancelling streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Current streaming message ID
  const streamingMessageIdRef = useRef<string | null>(null);

  // Load messages using JQEL
  const {
    messages,
    isLoading,
    saveMessage,
    updateMessage,
    addMessageOptimistic,
    updateMessageOptimistic,
    isSaving,
  } = useChatHistory(conversationId);

  /**
   * Send message to agent with streaming
   */
  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim() || isSending || isStreaming) return;

    setIsSending(true);
    setChatState('processing');

    // Create user message
    const userMessage: Message = {
      id: generateUUID(),
      conversationId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'sending',
      metadata: files ? {
        files: files.map(f => ({
          id: generateUUID(),
          name: f.name,
          size: f.size,
          type: f.type
        }))
      } : undefined
    };

    try {
      // Optimistic update - add user message to UI immediately
      addMessageOptimistic(userMessage);

      // Save user message to JQEL
      await saveMessage(userMessage);

      // Update status to sent
      updateMessageOptimistic(userMessage.id, { status: 'sent' });

      // Prepare context for agent (last N messages)
      const contextWindow = config.contextWindow || 10;
      const contextMessages = messages.slice(-contextWindow);

      // Create agent message placeholder
      const agentMessageId = generateUUID();
      streamingMessageIdRef.current = agentMessageId;

      const agentMessage: Message = {
        id: agentMessageId,
        conversationId,
        role: 'agent',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'receiving'
      };

      // Add agent message placeholder
      addMessageOptimistic(agentMessage);

      // Start streaming
      setIsStreaming(true);
      setIsSending(false);
      setChatState('typing');

      // Create AbortController for this stream
      abortControllerRef.current = new AbortController();

      // Stream from agent via /api/agent/:provider/:agentId
      // Provider é extraído do agentId (formato: provider:agentName)
      const [provider, agentName] = config.agentId.includes(':')
        ? config.agentId.split(':')
        : ['n8n', config.agentId];

      const response = await fetch(`/api/agent/${provider}/${agentName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          context: contextMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          files: files ? await Promise.all(
            files.map(async f => ({
              name: f.name,
              type: f.type,
              data: await fileToBase64(f)
            }))
          ) : undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.status} ${response.statusText}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line) as StreamEvent;

              if (event.event === 'token' && event.data) {
                fullContent += event.data;
                // Update message content optimistically
                updateMessageOptimistic(agentMessageId, {
                  content: fullContent,
                  status: 'receiving'
                });
              } else if (event.event === 'end') {
                // Stream completed
                break;
              } else if (event.event === 'error') {
                throw new Error(event.error || 'Stream error');
              }
            } catch (e) {
              console.warn('Failed to parse SSE event:', line, e);
            }
          }
        }
      }

      // Finalize agent message
      const finalAgentMessage: Message = {
        ...agentMessage,
        content: fullContent,
        status: 'complete'
      };

      // Save to JQEL
      await saveMessage(finalAgentMessage);

      setChatState('idle');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream cancelled by user');

        // Mark message as cancelled
        if (streamingMessageIdRef.current) {
          updateMessageOptimistic(streamingMessageIdRef.current, {
            status: 'error',
            metadata: { error: true, retryable: false }
          });
        }
      } else {
        console.error('Error sending message:', error);
        setChatState('error');

        // Mark message as error
        if (streamingMessageIdRef.current) {
          updateMessageOptimistic(streamingMessageIdRef.current, {
            status: 'error',
            metadata: { error: true, retryable: true }
          });
        }
      }
    } finally {
      setIsSending(false);
      setIsStreaming(false);
      setChatState('idle');
      abortControllerRef.current = null;
      streamingMessageIdRef.current = null;
    }
  }, [
    conversationId,
    config.agentId,
    config.contextWindow,
    messages,
    isSending,
    isStreaming,
    saveMessage,
    addMessageOptimistic,
    updateMessageOptimistic
  ]);

  /**
   * Cancel current streaming
   */
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Create new conversation
   */
  const createConversation = useCallback(() => {
    return generateUUID();
  }, []);

  /**
   * Switch conversation (handled by parent)
   */
  const switchConversation = useCallback((_conversationId: string) => {
    // Implementation handled by parent component
  }, []);

  /**
   * Retry failed message
   */
  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      await sendMessage(message.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    conversations: [], // TODO: Implement conversation list if needed
    currentConversation: conversationId,
    isLoading: isLoading || isSaving,
    isSending,
    isStreaming,
    chatState,
    sendMessage,
    cancelMessage,
    createConversation,
    switchConversation,
    retryMessage
  };
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:type/subtype;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
