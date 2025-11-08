/**
 * Kanban Module Types
 *
 * SPEC Compliance: SPEC-KANBAN-D-*
 */

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  order: number;
  limit?: number;
  collapsible?: boolean;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  assignee?: string;
  tags?: string[];
  dueDate?: string;
  customFields?: Record<string, unknown>;
}

export interface KanbanInstanceConfig {
  boardId: string;
  route: string;
  title?: string;
  columns: KanbanColumn[];
  enableWIPLimit?: boolean;
  enableFilters?: boolean;
  customFields?: CustomFieldDefinition[];
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface KanbanFilter {
  search?: string;
  tags?: string[];
  assignee?: string;
}
