import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Settings, Activity, History, Download, Bot, Users } from 'lucide-react'
import { useJourneyProgress } from '../hooks/useJourneyProgress'
import { useModels } from '../hooks/useModels'
import { AgentManagement } from '../components/agent/AgentManagement'

/**
 * Página Admin - Configurações do Chatify
 * Seções: Agentes, Provedores de IA, Jornada, Chat, Histórico, Exportação
 */

export function Admin() {
  const { settings, updateSettings, visitedPages, resetJourney } = useJourneyProgress()
  const { providers, models, selectedModel } = useModels()
  const location = useLocation()

  // Scroll para seção específica se houver hash na URL
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location.hash])

  const handleToggleProgressBar = () => {
    updateSettings({ showProgressBar: !settings.showProgressBar })
  }

  const handleToggleNextStepWidget = () => {
    updateSettings({ showNextStepWidget: !settings.showNextStepWidget })
  }

  const handleResetJourney = () => {
    if (confirm('Tem certeza que deseja resetar todo o progresso da jornada?')) {
      resetJourney()
    }
  }

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de conversas?')) {
      localStorage.removeItem('chatify-messages')
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const data = {
      journeyProgress: { visitedPages, settings },
      chatHistory: localStorage.getItem('chatify-messages'),
      settings: settings,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chatify-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const completionPercentage = Math.round((visitedPages.length / 14) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Configurações
      </h1>

      <div className="space-y-6">
        {/* Seção Agentes */}
        <section id="agentes" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Agentes de IA
            </h2>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Gerencie agentes de IA personalizados. Existem 3 tipos de agentes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-2">
              <li><strong className="text-blue-600 dark:text-blue-400">Built-in:</strong> Configurados via <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-xs">.env</code> (VITE_AGENT_*)</li>
              <li><strong className="text-purple-600 dark:text-purple-400">N8N:</strong> Descobertos automaticamente de workflows N8N</li>
              <li><strong className="text-green-600 dark:text-green-400">Custom:</strong> Criados por você via interface abaixo</li>
            </ul>
          </div>

          <AgentManagement />
        </section>

        {/* Seção Provedores de IA */}
        <section id="provedores" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Provedores de IA
            </h2>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Provedores e modelos são configurados via arquivos. Para adicionar ou editar:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-2">
              <li><code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-xs">public/config/chatify-providers.json</code> - Configurar provedores e modelos</li>
              <li><code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-xs">.env</code> - Adicionar API keys (VITE_NIC_API_KEY, VITE_OPENAI_API_KEY)</li>
            </ul>
          </div>

          {/* Provedores Disponíveis */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Provedores Disponíveis ({providers.length})
            </h3>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{provider.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        {provider.models.length} modelo{provider.models.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{provider.baseUrl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modelo Selecionado */}
          {selectedModel && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modelo Atual
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {selectedModel.name}
                </span>
                {selectedModel.reasoningEffort && selectedModel.reasoningEffort !== 'default' && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    {selectedModel.reasoningEffort}
                  </span>
                )}
              </div>
              {selectedModel.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedModel.description}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Seção Jornada */}
        <section id="jornada" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sistema de Gamificação
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Barra de Progresso
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exibir barra de progresso no topo das páginas
                </p>
              </div>
              <button
                onClick={handleToggleProgressBar}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showProgressBar
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showProgressBar ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Widget de Próxima Etapa
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrar sugestão de próxima página da jornada
                </p>
              </div>
              <button
                onClick={handleToggleNextStepWidget}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showNextStepWidget
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showNextStepWidget ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Progresso Atual
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {visitedPages.length} de 14 etapas ({completionPercentage}%)
                  </p>
                </div>
                <button
                  onClick={handleResetJourney}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  Resetar Progresso
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Chat */}
        <section id="chat" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurações de Chat
            </h2>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Configurações do sistema de chat:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Streaming de respostas: Ativado</li>
              <li>Armazenamento: JQEL (schema: chatify)</li>
              <li>Limite de histórico: Ilimitado</li>
              <li>Modelos disponíveis: {models.length}</li>
            </ul>
          </div>
        </section>

        {/* Seção Histórico */}
        <section id="historico" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gerenciar Histórico
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Suas conversas são salvas via JQEL. Você pode limpar o histórico a qualquer momento.
          </p>

          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            Limpar Todo Histórico
          </button>
        </section>

        {/* Seção Exportação */}
        <section id="exportacao" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Exportar Dados
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Exporte todo o seu progresso da jornada, histórico de conversas e configurações em formato JSON.
          </p>

          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Baixar Dados (JSON)
          </button>
        </section>
      </div>
    </div>
  )
}
