/**
 * MessageList Component
 *
 * Scrollable list of messages with auto-scroll.
 *
 * SPEC Compliance:
 * - SPEC-CHAT-F-004 to F-007: Message history
 * - SPEC-CHAT-PERF-001: Virtualization (TODO)
 */

import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, TypingIndicator } from './Message';
import type { Message as MessageType } from '../types';

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
 * Displays list of messages with auto-scroll to bottom.
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.id;
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }
  }, [messages]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isTyping]);

  return (
    <div className={cn('overflow-auto', className)}>
      <div className="min-h-full">
        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {emptyMessage}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Faça uma pergunta ou selecione uma sugestão abaixo para começar.
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
    </div>
  );
}
