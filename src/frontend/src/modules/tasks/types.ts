/**
 * Tasks Module Types
 *
 * SPEC Compliance:
 * - SPEC-TASKS-D-001 to D-003: Task data structure
 * - SPEC-TASKS-ST-001 to ST-003: Task status and transitions
 * - SPEC-TASKS-C-001 to C-005: Task categories
 * - SPEC-TASKS-EXP-001 to EXP-005: Task expiration
 * - SPEC-TASKS-DEL-001 to DEL-004: Task delegation
 * - SPEC-TASKS-AUD-001 to AUD-003: Task history
 */

/**
 * Task priority levels
 * SPEC-TASKS-D-001
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Task status lifecycle
 * SPEC-TASKS-ST-001
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Task categories (SPEC-TASKS-C-001)
 */
export type TaskCategory =
  | 'email_approval'
  | 'system_error'
  | 'data_validation'
  | 'manual_review'
  | 'configuration_required'
  | string; // Allow custom categories

/**
 * Task action definition
 * SPEC-TASKS-D-002
 */
export interface TaskAction {
  id: string;
  label: string;
  icon?: string; // Lucide icon name
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  primary?: boolean; // Highlight as primary action
  inputSchema?: {
    type: 'form' | 'confirmation';
    fields?: Array<{
      name: string;
      type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date';
      label: string;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
    }>;
    confirmMessage?: string;
  };
}

/**
 * Task history entry
 * SPEC-TASKS-AUD-001
 */
export interface TaskHistoryEntry {
  timestamp: string;
  userId: string;
  action: string;
  data?: Record<string, unknown>;
}

/**
 * Main Task interface
 * SPEC-TASKS-D-001 to D-003
 */
export interface Task {
  id: string;
  userId: string | string[]; // Single or multiple assignees (SPEC-TASKS-DEL-001)
  type: 'task';
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string; // SPEC-TASKS-EXP-001
  completedAt?: string;
  cancelledAt?: string;

  // Task content
  data: {
    title: string;
    description?: string;
    icon?: string; // Lucide icon name
    url?: string; // Link to related resource
    metadata?: Record<string, unknown>; // Category-specific data
  };

  // Available actions (SPEC-TASKS-D-002)
  actions: TaskAction[];

  // History (SPEC-TASKS-AUD-001)
  history?: TaskHistoryEntry[];

  // Response tracking
  response?: {
    actionId: string;
    data: Record<string, unknown>;
    respondedBy: string;
    respondedAt: string;
  };
}

/**
 * Task filters for querying
 * SPEC-TASKS-E-001 to E-005
 */
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  category?: TaskCategory | TaskCategory[];
  search?: string;
  userId?: string;
  expiresBefor?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Task response payload
 * SPEC-TASKS-R-001 to R-005
 */
export interface TaskResponse {
  taskId: string;
  actionId: string;
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Module configuration type
 * SPEC-TASKS-CFG-001 to CFG-002
 */
export interface TaskModuleConfig {
  iconPosition: 'header' | 'navbar' | 'custom';
  taskRoute: string;
  previewSize: number;
  defaultView: 'list' | 'kanban';
  enableKanban: boolean;
  enableSound: boolean;
  soundUrl: string;
  enableToast: boolean;
  autoRefresh: number;
  categories: Record<string, {
    icon: string;
    color: string;
    label: string;
    component?: string;
  }>;
  permissions?: {
    canView: string;
    canRespond: string;
  };
}

/**
 * Category renderer props
 * SPEC-TASKS-C-002 to C-004
 */
export interface TaskCategoryRendererProps {
  task: Task;
  onAction: (actionId: string, data?: Record<string, unknown>) => Promise<void>;
  compact?: boolean;
}
