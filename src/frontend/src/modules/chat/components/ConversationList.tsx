/**
 * ConversationList Component
 *
 * Sidebar with list of conversations.
 *
 * SPEC Compliance: SPEC-CHAT-O-015 to O-019
 */

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Conversation } from '../types';

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  className?: string;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  className
}: ConversationListProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-3">Conversas</h2>
        <Button
          onClick={onNewConversation}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
                  isActive && 'bg-primary/10 border-l-4 border-primary'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate flex-1">
                    {conversation.title || conversation.lastMessage?.slice(0, 30) || 'Nova conversa'}
                  </h4>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
