/**
 * Tipos TypeScript para o módulo Chat com IA
 */

import type { AIProvider, AIModel } from './provider'
import type { Agent } from './agent'

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  /** Snapshot imutável do agente que gerou esta resposta (persiste no histórico) */
  agentSnapshot?: {
    name: string           // Identificador único (ex: "nic-avalia")
    title: string          // Nome exibido (ex: "NIC Avalia")
    icon?: string          // Nome Lucide kebab-case (ex: "sparkles") ou emoji (ex: "🤖")
    description?: string   // Descrição para tooltip
  }
}

export interface Conversation {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatContextType {
  messages: Message[]
  isLoading: boolean
  sessionId: string
  selectedProvider: AIProvider | null
  selectedModel: AIModel | null
  selectedAgent: Agent | null
  setSelectedProvider: (provider: AIProvider | null) => void
  setSelectedModel: (model: AIModel | null) => void
  setSelectedAgent: (agent: Agent | null) => void
  sendMessage: (content: string) => Promise<void>
  cancelMessage: () => void
  startNewChat: () => void
  clearHistory: () => void
  loadHistory: () => void
  unreadInsightsCount: number
  markInsightsAsRead: () => void
}

export interface ProactiveInsight {
  message: string
  suggestedQuestion?: string
}
