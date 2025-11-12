/**
 * ChatInput - Input de mensagens com textarea expansível
 * Suporta Enter para enviar e Shift+Enter para quebra de linha
 * Botão toggle: "Enviar" vira "Parar" durante streaming
 */

import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Send, X } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onCancel: () => void
  isDisabled: boolean
  compact?: boolean
}

export function ChatInput({ onSend, onCancel, isDisabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !isDisabled) {
      onSend(input)
      setInput('')
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div>
      {/* Container principal - estilo ChatGPT */}
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-white dark:bg-nic-secondary-dark border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm focus-within:shadow-md transition-shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isDisabled}
            className="w-full resize-none px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{
              minHeight: '52px',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          />
        </div>

        {/* Botão de enviar/parar */}
        <button
          onClick={isDisabled ? handleCancel : handleSend}
          disabled={!isDisabled && !input.trim()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-nic-accent-light hover:bg-opacity-90 dark:bg-nic-accent-dark dark:hover:bg-opacity-90 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          aria-label={isDisabled ? 'Parar resposta' : 'Enviar mensagem'}
        >
          {isDisabled ? (
            <X className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dica de uso - mais discreta */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
        Enter para enviar • Shift+Enter para nova linha
      </p>
    </div>
  )
}
