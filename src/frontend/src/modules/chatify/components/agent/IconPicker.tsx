/**
 * IconPicker - Buscador otimizado de ícones Lucide e emojis
 * Suporta:
 * - Abas: Ícones Lucide (padrão) e Emojis
 * - Busca com debounce (300ms)
 * - Renderização limitada (100 iniciais + lazy loading)
 * - Preview do ícone selecionado
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { AgentIcon } from '../chat/AgentIcon'
import { LUCIDE_ICONS } from '../../data/lucideIcons'
import { EMOJI_CATEGORIES, getAllEmojis } from '../../data/emojiCategories'

interface IconPickerProps {
  value: string              // Valor atual (emoji ou kebab-case)
  onChange: (icon: string) => void
  placeholder?: string
}

type TabType = 'icons' | 'emojis'

const INITIAL_LOAD = 100  // Carregar apenas 100 ícones inicialmente
const LOAD_MORE_SIZE = 50 // Carregar mais 50 de cada vez

export function IconPicker({ value, onChange, placeholder = '🤖' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('icons')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce na busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setLoadedCount(INITIAL_LOAD) // Reset ao buscar
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Auto-focus no input de busca
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filtrar ícones Lucide
  const filteredIcons = useMemo(() => {
    if (!debouncedSearch) {
      return LUCIDE_ICONS.slice(0, loadedCount)
    }
    const filtered = LUCIDE_ICONS.filter(icon =>
      icon.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    return filtered.slice(0, Math.min(200, loadedCount)) // Máximo 200 resultados
  }, [debouncedSearch, loadedCount])

  // Filtrar emojis
  const filteredEmojis = useMemo(() => {
    if (!debouncedSearch) {
      return getAllEmojis().slice(0, loadedCount)
    }
    // Buscar por nome de categoria
    const matchedCategories = EMOJI_CATEGORIES.filter(cat =>
      cat.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    const emojis = matchedCategories.flatMap(cat => cat.emojis)
    return emojis.slice(0, Math.min(200, loadedCount))
  }, [debouncedSearch, loadedCount])

  const handleSelectIcon = (icon: string) => {
    onChange(icon)
    setIsOpen(false)
    setSearchTerm('')
    setLoadedCount(INITIAL_LOAD)
  }

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + LOAD_MORE_SIZE)
  }

  const currentItems = activeTab === 'icons' ? filteredIcons : filteredEmojis
  const totalAvailable = activeTab === 'icons'
    ? (debouncedSearch ? LUCIDE_ICONS.filter(i => i.toLowerCase().includes(debouncedSearch.toLowerCase())).length : LUCIDE_ICONS.length)
    : (debouncedSearch ? EMOJI_CATEGORIES.filter(c => c.label.toLowerCase().includes(debouncedSearch.toLowerCase())).reduce((acc, c) => acc + c.emojis.length, 0) : getAllEmojis().length)
  const hasMore = currentItems.length < totalAvailable && currentItems.length < 200

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
      >
        {/* Preview do ícone atual */}
        <div className="flex-shrink-0">
          <AgentIcon
            icon={value || placeholder}
            title="Ícone selecionado"
            size={16}
            variant="small"
          />
        </div>

        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1" />

        <Search className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full max-w-[400px] bg-white dark:bg-nic-secondary-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar ícone ou emoji..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nic-accent-light dark:focus:ring-nic-accent-dark"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('icons')
                setLoadedCount(INITIAL_LOAD)
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'icons'
                  ? 'text-nic-accent-light dark:text-nic-accent-dark border-b-2 border-nic-accent-light dark:border-nic-accent-dark'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Ícones ({LUCIDE_ICONS.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('emojis')
                setLoadedCount(INITIAL_LOAD)
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'emojis'
                  ? 'text-nic-accent-light dark:text-nic-accent-dark border-b-2 border-nic-accent-light dark:border-nic-accent-dark'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Emojis ({getAllEmojis().length})
            </button>
          </div>

          {/* Icon/Emoji Grid */}
          <div className="p-3 max-h-[400px] overflow-y-auto">
            {currentItems.length === 0 ? (
              // Empty State
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Nenhum {activeTab === 'icons' ? 'ícone' : 'emoji'} encontrado
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Tente termos como: {activeTab === 'icons' ? 'home, search, settings' : 'rostos, animais, símbolos'}
                </p>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-8 gap-2">
                  {currentItems.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      onClick={() => handleSelectIcon(item)}
                      title={activeTab === 'icons' ? item : undefined}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all hover:border-nic-accent-light dark:hover:border-nic-accent-dark hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        value === item
                          ? 'border-nic-accent-light dark:border-nic-accent-dark bg-nic-accent-light/10 dark:bg-nic-accent-dark/10'
                          : 'border-transparent'
                      }`}
                    >
                      {activeTab === 'icons' ? (
                        <AgentIcon
                          icon={item}
                          title={item}
                          size={18}
                          variant="small"
                        />
                      ) : (
                        <span className="text-xl">{item}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-4 py-2 text-xs font-medium text-nic-accent-light dark:text-nic-accent-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Carregar mais... ({currentItems.length} de {totalAvailable > 200 ? '200+' : totalAvailable})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
