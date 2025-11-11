import { useChat } from '@/hooks/useChat'

/**
 * Badge de insights não lidos para o ícone de Chat no Header
 */

export function ChatBadge() {
  const { unreadInsightsCount } = useChat()

  if (unreadInsightsCount === 0) return null

  return (
    <span
      className="
        absolute -top-1 -right-1
        min-w-[20px] h-5 px-1.5
        bg-nic-accent-light dark:bg-nic-accent-dark
        text-white text-xs font-semibold
        rounded-full
        flex items-center justify-center
        animate-pulse
        shadow-md
      "
      aria-label={`${unreadInsightsCount} insights não lidos`}
    >
      {unreadInsightsCount > 9 ? '9+' : unreadInsightsCount}
    </span>
  )
}
