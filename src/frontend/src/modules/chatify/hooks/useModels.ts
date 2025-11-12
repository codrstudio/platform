/**
 * useModels Hook
 * Gerencia estado de provedores, modelos e modelo selecionado
 */

import { useState, useEffect, useCallback } from 'react'
import type { AIProvider, AIModel } from '../types'
import * as providerService from '../services/providerService'

/**
 * Hook para gerenciar provedores, modelos e seleção
 */
export function useModels() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Carrega providers e modelos disponíveis
   */
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const availableProviders = await providerService.getAvailableProviders()
      const availableModels = await providerService.getAvailableModels()

      setProviders(availableProviders)
      setModels(availableModels)

      // Carrega modelo selecionado ou usa o primeiro disponível
      const selected = await providerService.getSelectedModel()
      if (selected) {
        setSelectedModel(selected)
        const provider = await providerService.getProviderById(selected.providerId!)
        setSelectedProvider(provider)
      } else if (availableModels.length > 0) {
        // Seleciona o primeiro modelo disponível
        const firstModel = availableModels[0]
        selectModel(firstModel)
      }
    } catch (error) {
      console.error('Error loading providers and models:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Seleciona um modelo
   */
  const selectModel = useCallback(async (model: AIModel) => {
    setSelectedModel(model)

    // Carrega o provedor do modelo
    if (model.providerId) {
      const provider = await providerService.getProviderById(model.providerId)
      setSelectedProvider(provider)

      // Salva seleção
      providerService.saveModelSelection({
        providerId: model.providerId,
        modelId: model.id
      })
    }
  }, [])

  /**
   * Obtém modelos agrupados por provedor para exibição em dropdown
   */
  const getModelsByProvider = useCallback(() => {
    const grouped: Record<string, AIModel[]> = {}

    models.forEach(model => {
      if (model.providerId) {
        if (!grouped[model.providerId]) {
          grouped[model.providerId] = []
        }
        grouped[model.providerId].push(model)
      }
    })

    return grouped
  }, [models])

  /**
   * Obtém o nome do provedor de um modelo
   */
  const getProviderName = useCallback(
    (providerId: string): string => {
      const provider = providers.find(p => p.id === providerId)
      return provider?.name || providerId
    },
    [providers]
  )

  // Carrega dados ao montar
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    // Estado
    providers,
    models,
    selectedModel,
    selectedProvider,
    loading,

    // Computed
    modelsByProvider: getModelsByProvider(),

    // Ações
    selectModel,
    getProviderName,
    reloadData: loadData
  }
}
