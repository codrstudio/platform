/**
 * useKanban Hook
 *
 * Hook for Kanban board state management.
 *
 * SPEC Compliance:
 * - SPEC-KANBAN-F-001: Board visualization
 * - SPEC-KANBAN-F-002: Card management
 * - SPEC-KANBAN-P-001, P-002: JQEL operations
 */

import { useState, useCallback } from 'react';
import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL';
import type { KanbanColumn, KanbanCard, KanbanFilter } from '../types';

function generateUUID(): string {
  return crypto.randomUUID();
}

export interface KanbanHookState {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  filter: KanbanFilter;
  isLoading: boolean;
  setFilter: (filter: KanbanFilter) => void;
  createCard: (card: KanbanCard) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: string, newOrder: number) => Promise<void>;
}

export function useKanban(boardId: string): KanbanHookState {
  const [filter, setFilter] = useState<KanbanFilter>({});

  // Load columns for the board
  const { data: columnsData, isLoading: columnsLoading } = useJQELQuery({
    schema: 'kanban',
    select: 'column',
    where: { boardId: { $eq: boardId } },
    options: { orderBy: [{ field: 'order', direction: 'asc' }] }
  });

  // Load cards for the board
  const { data: cardsData, isLoading: cardsLoading } = useJQELQuery({
    schema: 'kanban',
    select: 'card',
    where: { boardId: { $eq: boardId } },
    options: { orderBy: [{ field: 'order', direction: 'asc' }], limit: 500 }
  });

  const createCardMutation = useJQELMutation({
    schema: 'kanban',
    mutate: 'card',
    action: 'insert'
  });

  const updateCardMutation = useJQELMutation({
    schema: 'kanban',
    mutate: 'card',
    action: 'update'
  });

  const deleteCardMutation = useJQELMutation({
    schema: 'kanban',
    mutate: 'card',
    action: 'delete'
  });

  const columns = (columnsData?.data as KanbanColumn[]) || [];
  const cards = (cardsData?.data as KanbanCard[]) || [];

  // Create new card
  const createCard = useCallback(async (card: KanbanCard) => {
    const newCard: KanbanCard = {
      ...card,
      id: card.id || generateUUID()
    };

    await createCardMutation.mutateAsync({
      schema: 'kanban',
      mutate: 'card',
      action: 'insert',
      values: newCard as unknown as Record<string, unknown>
    });
  }, [createCardMutation]);

  // Update existing card
  const updateCard = useCallback(async (cardId: string, updates: Partial<KanbanCard>) => {
    await updateCardMutation.mutateAsync({
      schema: 'kanban',
      mutate: 'card',
      action: 'update',
      values: updates as unknown as Record<string, unknown>,
      where: { id: { $eq: cardId } }
    });
  }, [updateCardMutation]);

  // Delete card
  const deleteCard = useCallback(async (cardId: string) => {
    await deleteCardMutation.mutateAsync({
      schema: 'kanban',
      mutate: 'card',
      action: 'delete',
      where: { id: { $eq: cardId } }
    });
  }, [deleteCardMutation]);

  // Move card to different column
  const moveCard = useCallback(async (cardId: string, toColumnId: string, newOrder: number) => {
    await updateCardMutation.mutateAsync({
      schema: 'kanban',
      mutate: 'card',
      action: 'update',
      values: { columnId: toColumnId, order: newOrder } as unknown as Record<string, unknown>,
      where: { id: { $eq: cardId } }
    });
  }, [updateCardMutation]);

  return {
    columns,
    cards,
    filter,
    isLoading: columnsLoading || cardsLoading,
    setFilter,
    createCard,
    updateCard,
    deleteCard,
    moveCard
  };
}
