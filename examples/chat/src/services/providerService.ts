/**
 * Provider Service - Gerencia provedores de IA e suas configurações
 */

import type { AIProvider, AIModel, ModelSelection } from '@/types/provider'

const PROVIDERS_CONFIG_URL = '/config/ai-providers.json'
const SELECTED_MODEL_KEY = 'nic-chat:selected-model'

/**
 * Carrega a configuração de provedores do arquivo JSON
 */
export async function loadProvidersConfig(): Promise<AIProvider[]> {
  try {
    const response = await fetch(PROVIDERS_CONFIG_URL)
    if (!response.ok) {
      throw new Error(`Failed to load providers config: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.providers || !Array.isArray(data.providers)) {
      throw new Error('Invalid providers configuration format')
    }

    // Enriquece os modelos com a referência ao provedor
    const providers = data.providers.map((provider: AIProvider) => ({
      ...provider,
      models: provider.models.map((model: AIModel) => ({
        ...model,
        providerId: provider.id
      }))
    }))

    return providers
  } catch (error) {
    console.error('Error loading providers config:', error)
    return []
  }
}

/**
 * Obtém os provedores habilitados
 * Backend valida as API keys, frontend apenas verifica flag enabled
 */
export async function getAvailableProviders(): Promise<AIProvider[]> {
  const providers = await loadProvidersConfig()
  return providers.filter(provider => provider.enabled)
}

/**
 * Obtém todos os modelos disponíveis de todos os provedores habilitados
 */
export async function getAvailableModels(): Promise<AIModel[]> {
  const providers = await getAvailableProviders()
  return providers.flatMap(provider => provider.models)
}

/**
 * Obtém um provedor específico por ID
 */
export async function getProviderById(providerId: string): Promise<AIProvider | null> {
  const providers = await loadProvidersConfig()
  return providers.find(p => p.id === providerId) || null
}

/**
 * Obtém um modelo específico por ID
 */
export async function getModelById(modelId: string): Promise<AIModel | null> {
  const models = await getAvailableModels()
  return models.find(m => m.id === modelId) || null
}

/**
 * Salva a seleção de modelo do usuário
 */
export function saveModelSelection(selection: ModelSelection): void {
  localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(selection))
}

/**
 * Carrega a seleção de modelo do usuário
 */
export function loadModelSelection(): ModelSelection | null {
  const stored = localStorage.getItem(SELECTED_MODEL_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Obtém o modelo selecionado atualmente ou o primeiro disponível
 */
export async function getSelectedModel(): Promise<AIModel | null> {
  const selection = loadModelSelection()

  if (selection) {
    const model = await getModelById(selection.modelId)
    if (model) return model
  }

  // Se não há seleção ou modelo não encontrado, retorna o primeiro disponível
  const models = await getAvailableModels()
  return models[0] || null
}

