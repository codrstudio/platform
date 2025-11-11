/**
 * Color Utils - Utilitários para mapeamento de cores de agentes
 */

/**
 * Mapeamento de nomes de cores CSS para classes Tailwind
 * Usado para estilizar ícones de agentes com cores personalizadas
 */
export const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  // Cores principais
  purple: { bg: 'bg-purple-600', text: 'text-white' },
  blue: { bg: 'bg-blue-600', text: 'text-white' },
  green: { bg: 'bg-green-600', text: 'text-white' },
  red: { bg: 'bg-red-600', text: 'text-white' },
  orange: { bg: 'bg-orange-600', text: 'text-white' },
  pink: { bg: 'bg-pink-600', text: 'text-white' },
  teal: { bg: 'bg-teal-600', text: 'text-white' },
  indigo: { bg: 'bg-indigo-600', text: 'text-white' },
  yellow: { bg: 'bg-yellow-500', text: 'text-white' },
  cyan: { bg: 'bg-cyan-600', text: 'text-white' },

  // Cinzas
  gray: { bg: 'bg-gray-600', text: 'text-white' },
  slate: { bg: 'bg-slate-600', text: 'text-white' },

  // Variações
  violet: { bg: 'bg-violet-600', text: 'text-white' },
  fuchsia: { bg: 'bg-fuchsia-600', text: 'text-white' },
  rose: { bg: 'bg-rose-600', text: 'text-white' },
  lime: { bg: 'bg-lime-600', text: 'text-white' },
  emerald: { bg: 'bg-emerald-600', text: 'text-white' },
  sky: { bg: 'bg-sky-600', text: 'text-white' },
  amber: { bg: 'bg-amber-500', text: 'text-white' },
}

/**
 * Converte nome de cor ou hex para classes Tailwind
 *
 * @param color - Nome da cor CSS (ex: "purple") ou hex (ex: "#3D95DF")
 * @returns Objeto com classes Tailwind para bg e text
 *
 * @example
 * getColorClasses("purple") // { bg: "bg-purple-600", text: "text-white" }
 * getColorClasses("#3D95DF") // { bg: "", text: "text-white", style: { backgroundColor: "#3D95DF" } }
 * getColorClasses("invalid") // undefined
 */
export function getColorClasses(color?: string):
  | { bg: string; text: string; style?: React.CSSProperties }
  | undefined {

  if (!color) return undefined

  // Se é nome de cor mapeado, retornar classes Tailwind
  const mapped = COLOR_MAP[color.toLowerCase()]
  if (mapped) return mapped

  // Se é hex (começa com #), retornar estilo inline
  if (color.startsWith('#')) {
    return {
      bg: '', // Não usa classe bg do Tailwind
      text: 'text-white',
      style: { backgroundColor: color }
    }
  }

  // Se é rgb/rgba, retornar estilo inline
  if (color.startsWith('rgb')) {
    return {
      bg: '',
      text: 'text-white',
      style: { backgroundColor: color }
    }
  }

  // Cor desconhecida, retornar undefined (usa padrão)
  return undefined
}

/**
 * Verifica se uma string é um emoji (não é nome de ícone Lucide)
 *
 * @param icon - String do ícone
 * @returns true se é emoji, false se é nome de ícone Lucide
 *
 * @example
 * isEmoji("🤖") // true
 * isEmoji("sparkles") // false
 */
export function isEmoji(icon?: string): boolean {
  if (!icon) return false

  // Emojis geralmente têm comprimento 1-2 caracteres e contêm unicode > U+1F000
  // Ícones Lucide são palavras em inglês (a-z, -, _)
  const emojiRegex = /[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u

  return emojiRegex.test(icon)
}
