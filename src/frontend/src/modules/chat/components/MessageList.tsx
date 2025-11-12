/**
 * MessageList Component
 *
 * Scrollable list of messages with auto-scroll.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-004 to F-007: Message history
 * - SPEC-CHAT-PERF-001: Virtualization (TODO)
 *
 * Features:
 * - Auto-scroll inteligente durante streaming
 * - Botão "scroll to bottom" quando usuário sobe
 * - Empty state com mensagem de boas-vindas
 * - Loading indicator durante resposta
 */

import { useMemo } from 'react';
import { MessageCircle, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, TypingIndicator } from './Message';
import type { Message as MessageType } from '../types';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { Button } from '@/components/ui/button';

export interface MessageListProps {
  messages: MessageType[];
  showTimestamps?: boolean;
  isTyping?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * MessageList component
 *
 * Displays list of messages with intelligent auto-scroll.
 *
 * Usage:
 * ```tsx
 * <MessageList
 *   messages={messages}
 *   showTimestamps
 *   isTyping={isAgentTyping}
 * />
 * ```
 */
export function MessageList({
  messages,
  showTimestamps = true,
  isTyping = false,
  emptyMessage = 'Inicie uma conversa!',
  className
}: MessageListProps) {
  // Dependency that changes during streaming (last message content length + typing state)
  const scrollDependency = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    return `${messages.length}-${lastMessage?.content.length || 0}-${isTyping ? 1 : 0}`;
  }, [messages, isTyping]);

  const { ref: scrollRef, isAtBottom, scrollToBottom } = useAutoScroll(scrollDependency);

  return (
    <div className={cn('relative overflow-y-auto', className)}>
      <div className="min-h-full py-6 space-y-2">
        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {emptyMessage}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Faça uma pergunta ou selecione uma sugestão para começar.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            showTimestamp={showTimestamps}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={scrollRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {!isAtBottom && messages.length > 0 && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          aria-label="Rolar para o final"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
