/**
 * DnD Kit - Drag and drop (kanbans, reordenação)
 *
 * Re-exporta componentes e hooks do @dnd-kit.
 *
 * @see https://dndkit.com/
 */

// Core
export {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,

  // Types
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type Active,
  type Over,
} from '@dnd-kit/core';

// Sortable
export {
  SortableContext,
  useSortable,
  arrayMove,
  arraySwap,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,

  // Types
  type SortableData,
} from '@dnd-kit/sortable';

// Utilities
export {
  CSS,
} from '@dnd-kit/utilities';
