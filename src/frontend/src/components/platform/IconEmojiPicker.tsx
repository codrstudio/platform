/**
 * IconEmojiPicker - Seletor de ícones e emojis reutilizável
 *
 * Componente genérico da plataforma para seleção de ícones/emojis.
 * Suporta três modos:
 * - 'both' (padrão): Permite escolher entre ícones ou emojis
 * - 'icon': Somente ícones
 * - 'emoji': Somente emojis
 *
 * Features:
 * - Busca com debounce (300ms)
 * - Lazy loading para performance (100 iniciais + 50 por carregamento)
 * - Renderização otimizada
 * - Interface limpa sem menção a bibliotecas técnicas
 *
 * @module components/platform
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

/**
 * Lista de ícones disponíveis (nomes em kebab-case)
 * Extraída dinamicamente de lucide-react
 */
const AVAILABLE_ICONS = (() => {
  // Filtrar ícones (mesmo approach do IconSelector que funciona)
  const icons = Object.keys(LucideIcons)
    .filter(key => {
      // Excluir apenas exports utilitários específicos
      return (
        key !== 'createLucideIcon' &&
        key !== 'default' &&
        typeof (LucideIcons as any)[key] === 'function'
      )
    })
    .map(key => {
      // Converter PascalCase para kebab-case
      return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    })
    .sort()

  // Debug: Log total de ícones carregados
  console.log(`[IconEmojiPicker] Loaded ${icons.length} icons from Lucide React`)

  return icons
})()

/**
 * Categorias de emojis
 */
interface EmojiCategory {
  name: string
  label: string
  emojis: string[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'faces',
    label: 'Rostos',
    emojis: [
      '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
      '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
      '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖',
      '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
      '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
    ]
  },
  {
    name: 'animals',
    label: 'Animais',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
      '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
    ]
  },
  {
    name: 'objects',
    label: 'Objetos',
    emojis: [
      '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '💾', '💿', '📀', '📱',
      '📲', '☎️', '📞', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛',
      '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌',
      '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶',
    ]
  },
  {
    name: 'symbols',
    label: 'Símbolos',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '⭐',
      '🌟', '💫', '✅', '❌', '⚠️', '🚫', '💯', '🔥', '💢', '💥',
      '💦', '💨', '🕳', '💬', '🗨', '🗯', '💭', '💤', '🎵', '🎶',
    ]
  },
  {
    name: 'tech',
    label: 'Tecnologia',
    emojis: [
      '💻', '🖥', '⌨️', '🖱', '🖲', '💾', '💿', '📀', '🧮', '🎮',
      '🕹', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡',
      '🔦', '📡', '🛰', '🌐', '🧲', '🔭', '🔬', '⚙️', '🔧', '🔨',
    ]
  },
  {
    name: 'nature',
    label: 'Natureza',
    emojis: [
      '🌸', '💮', '🏵', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱',
      '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁',
      '🍂', '🍃', '🍄', '🌰', '🌍', '🌎', '🌏', '🌐', '🌑', '🌕',
      '🌙', '☀️', '⭐', '🌟', '🌠', '⛅', '🌤', '🌈', '☁️', '💧',
    ]
  }
]

/**
 * Retorna todos os emojis em lista plana
 */
function getAllEmojis(): string[] {
  return EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
}

/**
 * Renderiza um ícone dinamicamente
 */
function DynamicIcon({ name, size = 16 }: { name: string; size?: number }) {
  // Converter kebab-case para PascalCase
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  const IconComponent = (LucideIcons as any)[pascalName]

  if (!IconComponent) {
    // Debug: Log ícone não encontrado
    console.warn(`[IconEmojiPicker] Icon not found: "${name}" (converted to "${pascalName}")`)
    return <Search size={size} />
  }

  return <IconComponent size={size} />
}

export interface IconEmojiPickerProps {
  /** Valor atual (emoji ou nome do ícone em kebab-case) */
  value: string

  /** Callback quando valor é alterado */
  onChange: (value: string) => void

  /** Modo do picker: 'both' (padrão), 'icon', 'emoji' */
  mode?: 'both' | 'icon' | 'emoji'

  /** Placeholder quando vazio */
  placeholder?: string

  /** Texto do label (opcional) */
  label?: string

  /** ID do campo (opcional) */
  id?: string
}

type TabType = 'icons' | 'emojis'

const INITIAL_LOAD = 100
const LOAD_MORE_SIZE = 50

/**
 * IconEmojiPicker Component
 *
 * Seletor genérico de ícones/emojis para uso em toda a plataforma.
 */
export function IconEmojiPicker({
  value,
  onChange,
  mode = 'both',
  placeholder = '🤖',
  label,
  id
}: IconEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>(mode === 'emoji' ? 'emojis' : 'icons')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD)
  const [openUpwards, setOpenUpwards] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce na busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setLoadedCount(INITIAL_LOAD)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Calcular posição do dropdown (abrir para cima ou para baixo)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const dropdownHeight = 500 // Altura aproximada do dropdown (header + tabs + max-height)
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // Abrir para cima se não houver espaço suficiente abaixo E houver mais espaço acima
      setOpenUpwards(spaceBelow < dropdownHeight && spaceAbove > spaceBelow)
    }
  }, [isOpen])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filtrar ícones
  const filteredIcons = useMemo(() => {
    if (!debouncedSearch) {
      return AVAILABLE_ICONS.slice(0, loadedCount)
    }
    const filtered = AVAILABLE_ICONS.filter(icon =>
      icon.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    return filtered.slice(0, Math.min(200, loadedCount))
  }, [debouncedSearch, loadedCount])

  // Filtrar emojis
  const filteredEmojis = useMemo(() => {
    if (!debouncedSearch) {
      return getAllEmojis().slice(0, loadedCount)
    }
    const matchedCategories = EMOJI_CATEGORIES.filter(cat =>
      cat.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    const emojis = matchedCategories.flatMap(cat => cat.emojis)
    return emojis.slice(0, Math.min(200, loadedCount))
  }, [debouncedSearch, loadedCount])

  const handleSelectItem = (item: string) => {
    onChange(item)
    setIsOpen(false)
    setSearchTerm('')
    setLoadedCount(INITIAL_LOAD)
  }

  const handleLoadMore = () => {
    setLoadedCount(prev => prev + LOAD_MORE_SIZE)
  }

  const currentItems = activeTab === 'icons' ? filteredIcons : filteredEmojis
  const totalAvailable = activeTab === 'icons'
    ? (debouncedSearch ? AVAILABLE_ICONS.filter(i => i.toLowerCase().includes(debouncedSearch.toLowerCase())).length : AVAILABLE_ICONS.length)
    : (debouncedSearch ? EMOJI_CATEGORIES.filter(c => c.label.toLowerCase().includes(debouncedSearch.toLowerCase())).reduce((acc, c) => acc + c.emojis.length, 0) : getAllEmojis().length)
  const hasMore = currentItems.length < totalAvailable && currentItems.length < 200

  // Detectar se value é emoji ou ícone
  const isEmoji = value && !/^[a-z0-9-]+$/.test(value)

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          id={id}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 flex items-center gap-2 bg-background border border-input rounded-md hover:bg-accent/50 transition-colors text-left"
        >
          {/* Preview do item atual */}
          <div className="flex-shrink-0">
            {value ? (
              isEmoji ? (
                <span className="text-base">{value}</span>
              ) : (
                <DynamicIcon name={value} size={16} />
              )
            ) : (
              <span className="text-base">{placeholder}</span>
            )}
          </div>

          <span className="text-sm text-muted-foreground flex-1">
            {value || 'Selecionar'}
          </span>

          <Search className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={`absolute left-0 w-full max-w-[400px] bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}>
            {/* Search Bar */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs (somente se mode='both') */}
            {mode === 'both' && (
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('icons')
                    setLoadedCount(INITIAL_LOAD)
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'icons'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Ícones ({AVAILABLE_ICONS.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('emojis')
                    setLoadedCount(INITIAL_LOAD)
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'emojis'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Emojis ({getAllEmojis().length})
                </button>
              </div>
            )}

            {/* Grid de ícones/emojis */}
            <div className="p-3 max-h-[400px] overflow-y-auto">
              {currentItems.length === 0 ? (
                // Empty State
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum {activeTab === 'icons' ? 'ícone' : 'emoji'} encontrado
                  </p>
                  <p className="text-xs text-muted-foreground/70">
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
                        onClick={() => handleSelectItem(item)}
                        title={activeTab === 'icons' ? item : undefined}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border-2 transition-all hover:border-primary hover:bg-accent ${
                          value === item
                            ? 'border-primary bg-accent'
                            : 'border-transparent'
                        }`}
                      >
                        {activeTab === 'icons' ? (
                          <DynamicIcon name={item} size={18} />
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
                        className="px-4 py-2 text-xs font-medium text-primary hover:bg-accent rounded-md transition-colors"
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
    </div>
  )
}
