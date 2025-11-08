/**
 * KanbanColumn Component
 *
 * SPEC Compliance: SPEC-KANBAN-D-003 to D-004
 */

import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from '../types';
import { useState } from 'react';

export interface KanbanColumnProps {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard?: (columnId: string) => void;
  onEditCard?: (card: KanbanCardType) => void;
  onDeleteCard?: (cardId: string) => void;
  className?: string;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onEditCard,
  className
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cardCount = cards.length;
  const isOverLimit = column.limit !== undefined && cardCount > column.limit;

  return (
    <div
      className={cn(
        'flex flex-col bg-muted/50 rounded-lg min-w-[280px] max-w-[320px]',
        className
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b bg-background rounded-t-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            {column.collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-0 h-5 w-5 text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}

            {column.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            )}

            <h3 className="font-semibold text-sm">{column.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isOverLimit ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {cardCount}
              {column.limit !== undefined && ` / ${column.limit}`}
            </Badge>

            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onAddCard?.(column.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isOverLimit && (
          <div className="text-xs text-destructive">
            WIP limit exceeded
          </div>
        )}
      </div>

      {/* Column Body */}
      {!isCollapsed && (
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {cards.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum card nesta coluna
            </div>
          ) : (
            cards
              .sort((a, b) => a.order - b.order)
              .map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  onEdit={onEditCard}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
}
