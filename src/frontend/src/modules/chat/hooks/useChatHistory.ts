/**
 * useChatHistory Hook
 *
 * Hook JQEL para carregar e salvar mensagens de chat
 * Substitui localStorage por persistência via JQEL
 *
 * SPEC-CHAT-F-006: Persistência de histórico via JQEL
 */

import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL'
import { useQueryClient } from '@tanstack/react-query'
import type { Message } from '../types'

/**
 * Hook para carregar e gerenciar histórico de mensagens
 */
export function useChatHistory(conversationId: string) {
  const queryClient = useQueryClient()

  // Carregar histórico de mensagens
  const {
    data: result,
    isLoading,
    error,
  } = useJQELQuery<Message[]>(
    {
      schema: 'chat',
      select: 'message',
      where: { conversationId: { $eq: conversationId } },
      options: {
        orderBy: [{ field: 'timestamp', direction: 'asc' }],
        limit: 100,
      },
    },
    {
      enabled: !!conversationId,
      staleTime: 1000 * 60, // 1 minute
    }
  )

  const messages = result?.data || []

  // Mutation para salvar mensagem
  const saveMutation = useJQELMutation<Message>(
    {
      schema: 'chat',
      mutate: 'message',
      action: 'insert',
    },
    {
      onSuccess: () => {
        // Invalidar query para recarregar mensagens
        queryClient.invalidateQueries({
          queryKey: ['chat', 'message', { where: { conversationId: { $eq: conversationId } } }],
        })
      },
    }
  )

  // Mutation para atualizar mensagem (status, metadata)
  const updateMutation = useJQELMutation<Message>(
    {
      schema: 'chat',
      mutate: 'message',
      action: 'update',
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'message', { where: { conversationId: { $eq: conversationId } } }],
        })
      },
    }
  )

  // Mutation para deletar mensagem
  const deleteMutation = useJQELMutation<null>(
    {
      schema: 'chat',
      mutate: 'message',
      action: 'delete',
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'message', { where: { conversationId: { $eq: conversationId } } }],
        })
      },
    }
  )

  /**
   * Salvar mensagem no histórico
   */
  const saveMessage = async (message: Message) => {
    return saveMutation.mutateAsync({ values: message })
  }

  /**
   * Atualizar mensagem existente
   */
  const updateMessage = async (messageId: string, updates: Partial<Message>) => {
    return updateMutation.mutateAsync({
      values: updates,
      where: { id: { $eq: messageId } },
    })
  }

  /**
   * Deletar mensagem
   */
  const deleteMessage = async (messageId: string) => {
    return deleteMutation.mutateAsync({
      where: { id: { $eq: messageId } },
    })
  }

  /**
   * Update otimista - adiciona mensagem ao cache localmente
   * antes da confirmação do servidor
   */
  const addMessageOptimistic = (message: Message) => {
    queryClient.setQueryData(
      ['chat', 'message', { where: { conversationId: { $eq: conversationId } } }],
      (old: any) => {
        if (!old?.data) return { data: [message] }
        return { ...old, data: [...old.data, message] }
      }
    )
  }

  /**
   * Update otimista - atualizar mensagem no cache localmente
   */
  const updateMessageOptimistic = (messageId: string, updates: Partial<Message>) => {
    queryClient.setQueryData(
      ['chat', 'message', { where: { conversationId: { $eq: conversationId } } }],
      (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((msg: Message) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        }
      }
    )
  }

  return {
    messages,
    isLoading,
    error,
    saveMessage,
    updateMessage,
    deleteMessage,
    addMessageOptimistic,
    updateMessageOptimistic,
    isSaving: saveMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook para carregar lista de conversas
 */
export function useConversations(portalId: string) {
  const {
    data: result,
    isLoading,
    error,
  } = useJQELQuery<any[]>(
    {
      schema: 'chat',
      select: 'conversation',
      where: { portalId: { $eq: portalId } },
      options: {
        orderBy: [{ field: 'lastMessageAt', direction: 'desc' }],
        limit: 50,
      },
    },
    {
      enabled: !!portalId,
      staleTime: 1000 * 60, // 1 minute
    }
  )

  const conversations = result?.data || []

  return {
    conversations,
    isLoading,
    error,
  }
}

/**
 * Hook para criar nova conversa
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  const mutation = useJQELMutation(
    {
      schema: 'chat',
      mutate: 'conversation',
      action: 'insert',
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation'],
        })
      },
    }
  )

  const createConversation = async (conversation: {
    id: string
    portalId: string
    title?: string
    lastMessageAt: string
  }) => {
    return mutation.mutateAsync({ values: conversation })
  }

  return {
    createConversation,
    isCreating: mutation.isPending,
  }
}
