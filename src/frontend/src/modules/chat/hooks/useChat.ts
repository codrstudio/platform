/**
 * useChat Hook
 *
 * Hook for chat state management.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-008: Message sending flow
 * - SPEC-CHAT-P-002, P-003: JQEL operations
 * - SPEC-CHAT-I-001: Agent integration
 */

import { useState, useCallback } from 'react';
import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL';
import type { Message, Conversation, ChatInstanceConfig, ChatHookState } from '../types';

function generateUUID(): string {
  return crypto.randomUUID();
}

export function useChat(
  conversationId: string,
  _config: ChatInstanceConfig
): ChatHookState {
  const [isSending, setIsSending] = useState(false);
  const [chatState, setChatState] = useState<'idle' | 'typing' | 'processing' | 'error'>('idle');

  // Load messages for current conversation
  const { data: messagesData, isLoading } = useJQELQuery({
    schema: 'chat',
    select: 'message',
    where: { conversationId: { $eq: conversationId } },
    options: { orderBy: [{ field: 'timestamp', direction: 'asc' }], limit: 100 }
  });

  // Load all conversations (for sidebar)
  const { data: conversationsData } = useJQELQuery({
    schema: 'chat',
    select: 'conversation',
    options: { orderBy: [{ field: 'lastMessageAt', direction: 'desc' }], limit: 50 }
  });

  const saveMessageMutation = useJQELMutation({
    schema: 'chat',
    mutate: 'message',
    action: 'insert'
  });

  const messages = (messagesData?.data as Message[]) || [];
  const conversations = (conversationsData?.data as Conversation[]) || [];

  // Send message
  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    setIsSending(true);
    setChatState('processing');

    try {
      // 1. Create and save user message
      const userMessage: Message = {
        id: generateUUID(),
        conversationId,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'sending',
        metadata: files ? { files: files.map(f => ({
          id: generateUUID(),
          name: f.name,
          size: f.size,
          type: f.type
        })) } : undefined
      };

      await saveMessageMutation.mutateAsync({
        schema: 'chat',
        mutate: 'message',
        action: 'insert',
        values: userMessage as unknown as Record<string, unknown>
      });

      // 2. Send to agent (placeholder - TODO: implement agent integration)
      // TODO: Implement agent API call
      // const context = messages.slice(-config.contextWindow || -10);
      // const response = await fetch(`/api/agent/...`);

      // 3. Simulate agent response (placeholder)
      const agentMessage: Message = {
        id: generateUUID(),
        conversationId,
        role: 'agent',
        content: 'Esta é uma resposta simulada do agente. A integração com o agente será implementada posteriormente.',
        timestamp: new Date().toISOString(),
        status: 'complete'
      };

      await saveMessageMutation.mutateAsync({
        schema: 'chat',
        mutate: 'message',
        action: 'insert',
        values: agentMessage as unknown as Record<string, unknown>
      });

      setChatState('idle');
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState('error');
    } finally {
      setIsSending(false);
    }
  }, [conversationId, saveMessageMutation]);

  // Create new conversation
  const createConversation = useCallback(() => {
    return generateUUID();
  }, []);

  // Switch conversation
  const switchConversation = useCallback((_conversationId: string) => {
    // Implementation handled by parent component
  }, []);

  // Retry failed message
  const retryMessage = useCallback(async (_messageId: string) => {
    // TODO: Implement retry logic
  }, []);

  return {
    messages,
    conversations,
    currentConversation: conversationId,
    isLoading,
    isSending,
    chatState,
    sendMessage,
    createConversation,
    switchConversation,
    retryMessage
  };
}
