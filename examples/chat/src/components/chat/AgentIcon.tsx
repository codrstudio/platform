/**
 * AgentIcon - Renderiza ícone do agente (emoji ou Lucide)
 * Suporta:
 * - Emoji direto (ex: "🤖", "✨")
 * - Nome Lucide em kebab-case (ex: "sparkles", "brain", "bot")
 * - Cor personalizada (fundo colorido, ícone branco ou emoji normal)
 * - Fallback para Bot se ícone não existir ou não for reconhecido
 */

import * as LucideIcons from 'lucide-react'
import { Bot } from 'lucide-react'
import { getColorClasses, isEmoji as isEmojiUtil } from '@/utils/colorUtils'

interface AgentIconProps {
  /** Nome Lucide kebab-case (ex: "sparkles") ou emoji (ex: "🤖") - opcional, fallback para Bot */
  icon?: string
  /** Cor do ícone (nome CSS ou hex) - opcional, default cinza */
  color?: string
  /** Nome do agente (para tooltip) */
  title: string
  /** Descrição do agente (para tooltip) - opcional */
  description?: string
  /** Tamanho do ícone em pixels (default: 20) */
  size?: number
  /** Tamanho do container (small=24px, default=40px) */
  variant?: 'default' | 'small' | 'tiny'
}

/**
 * Converte kebab-case para PascalCase
 * "align-end-vertical" → "AlignEndVertical"
 * "bot" → "Bot"
 */
function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Tenta obter ícone Lucide pelo nome kebab-case
 * Retorna componente do ícone ou null se não encontrado
 */
function getLucideIcon(iconName: string): React.ComponentType<any> | null {
  try {
    const pascalName = kebabToPascal(iconName)
    const IconComponent = (LucideIcons as any)[pascalName]
    return IconComponent || null
  } catch {
    return null
  }
}

export function AgentIcon({ icon, color, title, description, size = 20, variant = 'default' }: AgentIconProps) {
  // Tamanhos do container
  const containerClass = variant === 'tiny'
    ? 'w-5 h-5'
    : variant === 'small'
    ? 'w-6 h-6'
    : 'w-10 h-10'

  // Tamanho do emoji
  const emojiSize = variant === 'tiny'
    ? 'text-xs'
    : variant === 'small'
    ? 'text-sm'
    : 'text-xl'

  // Obter classes de cor
  const colorClasses = getColorClasses(color)

  // Classes base: com cor personalizada ou padrão cinza
  const bgClass = colorClasses?.bg || 'bg-gray-200 dark:bg-gray-700'
  const textClass = colorClasses?.text || 'text-gray-700 dark:text-gray-300'
  const inlineStyle = colorClasses?.style

  const baseClasses = `${containerClass} rounded-full flex items-center justify-center ${bgClass}`
  const tooltip = description ? `${title}\n${description}` : title

  // Caso 1: Sem ícone → fallback Bot
  if (!icon) {
    return (
      <div className={`${baseClasses} ${textClass}`} style={inlineStyle} title={tooltip}>
        <Bot size={size} />
      </div>
    )
  }

  // Caso 2: Emoji → renderizar direto (emoji mantém cor natural)
  if (isEmojiUtil(icon)) {
    return (
      <div className={baseClasses} style={inlineStyle} title={tooltip}>
        <span className={emojiSize}>{icon}</span>
      </div>
    )
  }

  // Caso 3: Nome Lucide → importar dinamicamente (usa text-white se cor personalizada)
  const LucideIcon = getLucideIcon(icon)

  if (LucideIcon) {
    return (
      <div className={`${baseClasses} ${textClass}`} style={inlineStyle} title={tooltip}>
        <LucideIcon size={size} />
      </div>
    )
  }

  // Caso 4: Ícone não reconhecido → fallback Bot
  return (
    <div className={`${baseClasses} ${textClass}`} style={inlineStyle} title={tooltip}>
      <Bot size={size} />
    </div>
  )
}
