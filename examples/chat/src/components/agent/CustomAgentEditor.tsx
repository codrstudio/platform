/**
 * CustomAgentEditor - Editor para criar/editar agentes custom
 * Suporta todos os campos: nome, título, descrição, systemPrompt, ícone, tags, anexos
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { CustomAgent, AgentAttachment } from '@/types/agent'
import { AgentAttachmentUploader } from './AgentAttachmentUploader'
import { IconPicker } from './IconPicker'

interface CustomAgentEditorProps {
  agent?: CustomAgent // Se fornecido, modo edição
  onSave: (agent: Omit<CustomAgent, 'source' | 'isBuiltIn' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  isNameUnique: (name: string, currentName?: string) => boolean
}

export function CustomAgentEditor({ agent, onSave, onCancel, isNameUnique }: CustomAgentEditorProps) {
  const [formData, setFormData] = useState<{
    name: string
    title: string
    description: string
    systemPrompt: string
    icon: string
    tags: string
    attachments: AgentAttachment[]
    enabled: boolean
  }>({
    name: agent?.name || '',
    title: agent?.title || '',
    description: agent?.description || '',
    systemPrompt: agent?.systemPrompt || '',
    icon: agent?.icon || '🤖',
    tags: agent?.tags?.join(', ') || '',
    attachments: agent?.attachments || [],
    enabled: agent?.enabled ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validação em tempo real do nome
  useEffect(() => {
    if (formData.name) {
      const isUnique = isNameUnique(formData.name, agent?.name)
      if (!isUnique) {
        setErrors(prev => ({ ...prev, name: 'Já existe um agente com este nome' }))
      } else {
        setErrors(prev => {
          const { name, ...rest } = prev
          return rest
        })
      }
    }
  }, [formData.name, isNameUnique, agent?.name])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (!/^[a-z0-9-]+$/.test(formData.name)) {
      newErrors.name = 'Nome deve conter apenas letras minúsculas, números e hífens'
    } else if (!isNameUnique(formData.name, agent?.name)) {
      newErrors.name = 'Já existe um agente com este nome'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System Prompt é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    onSave({
      name: formData.name.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      icon: formData.icon.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
      enabled: formData.enabled
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-nic-secondary-dark rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent ? 'Editar Agente Custom' : 'Criar Agente Custom'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Nome do Agente * <span className="text-xs text-gray-500">(usado como ID único)</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              placeholder="ex: code-reviewer"
              disabled={!!agent} // Nome não pode ser editado
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark'
              } ${agent ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
            {agent && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O nome não pode ser alterado após criação
              </p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Título * <span className="text-xs text-gray-500">(exibido na UI)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Revisor de Código"
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Ícone */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Ícone <span className="text-xs text-gray-500">(emoji ou ícone Lucide)</span>
            </label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
              placeholder="🤖"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Escolha um emoji ou ícone Lucide para representar o agente
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Descrição * <span className="text-xs text-gray-500">(1-2 linhas sobre o propósito)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Especialista em revisão de código e boas práticas de desenvolvimento"
              rows={2}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              System Prompt * <span className="text-xs text-gray-500">(define o comportamento do agente)</span>
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder={`Você é um especialista em [área].\n\nSuas responsabilidades:\n- [responsabilidade 1]\n- [responsabilidade 2]\n\nSempre seja [características desejadas].`}
              rows={8}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 resize-none font-mono text-sm ${
                errors.systemPrompt
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark'
              }`}
            />
            {errors.systemPrompt && (
              <p className="text-xs text-red-500 mt-1">{errors.systemPrompt}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este prompt será injetado em todas as conversas com o agente
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Tags <span className="text-xs text-gray-500">(separadas por vírgula)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Ex: código, revisão, qualidade"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
            />
          </div>

          {/* Anexos */}
          <AgentAttachmentUploader
            attachments={formData.attachments}
            onChange={(attachments) => setFormData(prev => ({ ...prev, attachments }))}
          />

          {/* Habilitado */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 text-nic-accent-light dark:text-nic-accent-dark bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Agente habilitado (visível no seletor de agentes)
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-nic-accent-light dark:bg-nic-accent-dark hover:opacity-90 rounded-lg transition-opacity"
          >
            {agent ? 'Salvar Alterações' : 'Criar Agente'}
          </button>
        </div>
      </div>
    </div>
  )
}
