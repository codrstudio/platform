/**
 * AgentAttachmentUploader - Upload e gerenciamento de anexos de agentes
 * Suporta: URLs, texto livre e upload de arquivos (base64)
 */

import { useState } from 'react'
import { Link, FileText, Upload, X } from 'lucide-react'
import type { AgentAttachment } from '@/types/agent'

interface AgentAttachmentUploaderProps {
  attachments: AgentAttachment[]
  onChange: (attachments: AgentAttachment[]) => void
}

type AttachmentType = 'url' | 'text' | 'file'

export function AgentAttachmentUploader({ attachments, onChange }: AgentAttachmentUploaderProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newAttachment, setNewAttachment] = useState<{
    type: AttachmentType
    name: string
    content: string
    description: string
  }>({
    type: 'url',
    name: '',
    content: '',
    description: ''
  })

  const handleAdd = () => {
    if (!newAttachment.name || !newAttachment.content) {
      alert('Nome e conteúdo são obrigatórios')
      return
    }

    const attachment: AgentAttachment = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newAttachment.name,
      type: newAttachment.type,
      content: newAttachment.content,
      metadata: {
        description: newAttachment.description || undefined
      }
    }

    onChange([...attachments, attachment])

    // Reset form
    setNewAttachment({
      type: 'url',
      name: '',
      content: '',
      description: ''
    })
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    onChange(attachments.filter(a => a.id !== id))
  }

  const handleFileUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limite de 1MB
    if (file.size > 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 1MB')
      return
    }

    try {
      const base64 = await handleFileUpload(file)
      setNewAttachment(prev => ({
        ...prev,
        name: prev.name || file.name,
        content: base64,
        type: 'file'
      }))
    } catch (error) {
      console.error('Erro ao ler arquivo:', error)
      alert('Erro ao ler arquivo')
    }
  }

  const getIcon = (type: AttachmentType) => {
    switch (type) {
      case 'url': return <Link className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'file': return <Upload className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Anexos ({attachments.length})
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-sm text-nic-accent-light dark:text-nic-accent-dark hover:underline"
          >
            + Adicionar anexo
          </button>
        )}
      </div>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5 text-gray-500 dark:text-gray-400">
                  {getIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </div>
                  {attachment.metadata?.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {attachment.metadata.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                    {attachment.type === 'file' ? 'Arquivo (base64)' : attachment.content}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(attachment.id)}
                className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de novo anexo */}
      {isAdding && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3 bg-white dark:bg-nic-secondary-dark">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Tipo de Anexo
            </label>
            <div className="flex gap-2">
              {(['url', 'text', 'file'] as AttachmentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewAttachment(prev => ({ ...prev, type }))}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    newAttachment.type === type
                      ? 'bg-nic-accent-light text-white dark:bg-nic-accent-dark'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'url' && 'URL'}
                  {type === 'text' && 'Texto'}
                  {type === 'file' && 'Arquivo'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Nome do Anexo *
            </label>
            <input
              type="text"
              value={newAttachment.name}
              onChange={(e) => setNewAttachment(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Guidelines de código"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
            />
          </div>

          {newAttachment.type === 'url' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                URL *
              </label>
              <input
                type="url"
                value={newAttachment.content}
                onChange={(e) => setNewAttachment(prev => ({ ...prev, content: e.target.value }))}
                placeholder="https://example.com/document.md"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
              />
            </div>
          )}

          {newAttachment.type === 'text' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Texto *
              </label>
              <textarea
                value={newAttachment.content}
                onChange={(e) => setNewAttachment(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Cole aqui o conteúdo do documento..."
                rows={6}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark font-mono text-sm"
              />
            </div>
          )}

          {newAttachment.type === 'file' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Arquivo * (máx. 1MB)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.md,.json,.pdf,.doc,.docx"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-sm file:font-medium file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={newAttachment.description}
              onChange={(e) => setNewAttachment(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Padrões de código para revisão"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-nic-accent-light dark:bg-nic-accent-dark hover:opacity-90 rounded-lg transition-opacity"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
