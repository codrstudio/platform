/**
 * SuggestedQuestions - Sugestões de perguntas clicáveis
 * Acelera interação do usuário com perguntas estratégicas
 */

import { MessageSquare, Sparkles } from 'lucide-react'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
  isDisabled?: boolean
}

export function SuggestedQuestions({ questions, onSelect, isDisabled = false }: SuggestedQuestionsProps) {
  return (
    <div className="p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-nic-accent-light dark:text-nic-accent-dark" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sugestões de Perguntas
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Clique em uma pergunta para começar a conversa:
      </p>

      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => !isDisabled && onSelect(question)}
            disabled={isDisabled}
            className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700
                       hover:border-nic-accent-light dark:hover:border-nic-accent-dark
                       hover:bg-nic-accent-light/5 dark:hover:bg-nic-accent-dark/5
                       transition-all group
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-nic-accent-light dark:group-hover:text-nic-accent-dark flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {question}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-br from-nic-accent-light/10 to-nic-accent-light/5 dark:from-nic-accent-dark/10 dark:to-nic-accent-dark/5 rounded-lg border border-nic-accent-light/20 dark:border-nic-accent-dark/20">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Dica:</strong> Você também pode digitar suas próprias perguntas sobre o NIC Chat e suas funcionalidades.
        </p>
      </div>
    </div>
  )
}
