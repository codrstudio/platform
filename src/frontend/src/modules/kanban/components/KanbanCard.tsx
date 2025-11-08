/**
 * KanbanCard Component
 *
 * SPEC Compliance: SPEC-KANBAN-D-005 to D-007
 */

import { MoreVertical, User, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { KanbanCard as KanbanCardType } from '../types';
import { format } from 'date-fns';

export interface KanbanCardProps {
  card: KanbanCardType;
  onEdit?: (card: KanbanCardType) => void;
  onDelete?: (cardId: string) => void;
  className?: string;
}

export function KanbanCard({ card, onEdit, className }: KanbanCardProps) {
  return (
    <div
      className={cn(
        'bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={() => onEdit?.(card)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm flex-1">{card.title}</h4>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>

      {card.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {card.tags?.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            <Tag className="h-2 w-2 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {card.assignee && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {card.assignee}
          </div>
        )}
        {card.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(card.dueDate), 'dd/MM')}
          </div>
        )}
      </div>
    </div>
  );
}
