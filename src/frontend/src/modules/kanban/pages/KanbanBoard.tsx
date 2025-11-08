/**
 * KanbanBoard Page
 *
 * SPEC Compliance: SPEC-KANBAN-F-*
 */

import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KanbanColumn } from '../components/KanbanColumn';
import { useKanban } from '../hooks/useKanban';
import type { KanbanInstanceConfig, KanbanCard as KanbanCardType } from '../types';

export interface KanbanBoardProps {
  config: KanbanInstanceConfig;
}

export function KanbanBoard({ config }: KanbanBoardProps) {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCardType | null>(null);
  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);

  const {
    columns,
    cards,
    filter,
    setFilter,
    createCard,
    updateCard,
    deleteCard,
    isLoading
  } = useKanban(config.boardId);

  const handleAddCard = (columnId: string) => {
    setNewCardColumnId(columnId);
    setEditingCard(null);
    setCardDialogOpen(true);
  };

  const handleEditCard = (card: KanbanCardType) => {
    setEditingCard(card);
    setNewCardColumnId(null);
    setCardDialogOpen(true);
  };

  const handleSaveCard = async (cardData: Partial<KanbanCardType>) => {
    if (editingCard) {
      await updateCard(editingCard.id, cardData);
    } else if (newCardColumnId) {
      await createCard({
        ...cardData,
        columnId: newCardColumnId,
        order: cards.filter(c => c.columnId === newCardColumnId).length
      } as KanbanCardType);
    }
    setCardDialogOpen(false);
  };

  const filteredCards = cards.filter(card => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (!card.title.toLowerCase().includes(searchLower) &&
          !card.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filter.tags && filter.tags.length > 0) {
      if (!card.tags?.some(tag => filter.tags?.includes(tag))) {
        return false;
      }
    }
    if (filter.assignee && card.assignee !== filter.assignee) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Carregando quadro...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{config.title || 'Kanban Board'}</h1>
          </div>

          <div className="flex items-center gap-2">
            {config.enableFilters && (
              <>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cards..."
                    value={filter.search || ''}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="pl-8 w-64"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 h-full">
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={filteredCards.filter(card => card.columnId === column.id)}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={deleteCard}
              />
            ))}

          {/* Add Column Button */}
          <button
            className="flex items-center justify-center min-w-[280px] h-fit p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            onClick={() => {/* TODO: Implement add column */}}
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Coluna
          </button>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtros Avançados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Responsável</label>
              <Input
                placeholder="Nome do responsável"
                value={filter.assignee || ''}
                onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setFilterDialogOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Dialog */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Card' : 'Novo Card'}
            </DialogTitle>
          </DialogHeader>
          <CardForm
            card={editingCard}
            onSave={handleSaveCard}
            onCancel={() => setCardDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple card form component
interface CardFormProps {
  card: KanbanCardType | null;
  onSave: (card: Partial<KanbanCardType>) => void;
  onCancel: () => void;
}

function CardForm({ card, onSave, onCancel }: CardFormProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [tags, setTags] = useState(card?.tags?.join(', ') || '');
  const [dueDate, setDueDate] = useState(card?.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      assignee: assignee || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      dueDate: dueDate || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Título*</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do card"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição detalhada"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Responsável</label>
        <Input
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Nome do responsável"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tags</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Data de Vencimento</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}
