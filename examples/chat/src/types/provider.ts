/**
 * AI Provider Types - Estruturas para provedores de IA (NIC, OpenAI, etc.)
 */

/**
 * Provedor de IA - empresa/serviço que fornece modelos de linguagem
 * Exemplos: NIC, OpenAI, Anthropic, Google
 */
export interface AIProvider {
  /** ID único do provedor (ex: "nic", "openai") */
  id: string

  /** Nome exibido na UI (ex: "NIC", "OpenAI") */
  name: string

  /** URL base da API (sempre termina com /) */
  baseUrl: string

  /** Se o provedor está habilitado */
  enabled: boolean

  /** Se o provedor requer autenticação (API key) */
  requiresAuth: boolean

  /** Modelos disponíveis neste provedor */
  models: AIModel[]
}

/**
 * Modelo de IA - modelo específico de um provedor
 * Exemplos: GPT-5, Claude Sonnet, NIC Auto
 */
export interface AIModel {
  /** ID único do modelo (ex: "gpt-5-auto", "nic-reflexivo") */
  id: string

  /** Nome exibido na UI (ex: "GPT-5 Auto", "NIC Reflexivo") */
  name: string

  /** ID do provedor ao qual pertence */
  providerId?: string

  /** ID do modelo usado na API (ex: "gpt-5", "nic") */
  apiModelId: string

  /** Descrição do modelo */
  description?: string

  /** Nível de raciocínio (reasoning effort) para modelos que suportam */
  reasoningEffort?: 'default' | 'minimal' | 'low' | 'medium' | 'high'
}

/**
 * Seleção de modelo - referência ao modelo escolhido pelo usuário
 */
export interface ModelSelection {
  /** ID do provedor */
  providerId: string

  /** ID do modelo */
  modelId: string
}

/**
 * Configuração de API keys
 */
export interface APIKeys {
  [providerId: string]: string | undefined
}
