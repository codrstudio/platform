/**
 * Command Palette Module Types
 *
 * SPEC Compliance:
 * - SPEC-CP-M-*: Modalidades (suspensa e expandida)
 * - SPEC-CP-S-*: Search (busca federada)
 * - SPEC-CP-C-*: Commands (comandos rápidos)
 * - SPEC-CP-A-*: Agents (invocação de agentes)
 * - SPEC-CP-J-*: JQEL Schema extension
 */

/**
 * Command Palette Mode
 * SPEC-CP-M-001 to M-009
 */
export type CommandPaletteMode = 'suspended' | 'expanded' | 'both';

/**
 * Action type
 */
export type ActionType = 'select' | 'mutate';

/**
 * Interaction type (three pillars)
 * SPEC-CP-R-001
 */
export type InteractionType = 'search' | 'command' | 'agent';

/**
 * Param mode for command execution
 * SPEC-CP-C-005
 */
export type ParamMode = 'inline' | 'interactive' | 'hybrid';

/**
 * Searchable parameter definition
 * SPEC-CP-J-003
 */
export interface SearchableParam {
  name: string;
  type: 'string' | 'enum' | 'select' | 'boolean' | 'array';
  required?: boolean;
  description?: string;
  placeholder?: string;
  default?: any;

  // For type: enum
  options?: string[];

  // For type: select
  source?: {
    schema: string;
    entity: string;
    labelField: string;
    valueField?: string;
  };
}

/**
 * Searchable action definition
 * SPEC-CP-J-001 to J-002
 */
export interface SearchableAction {
  enabled: boolean;
  title: string;
  description?: string;
  keywords?: string[];
  category?: string;
  icon?: string; // Lucide icon name
  resultComponent?: string;

  // For SELECT actions (SPEC-CP-S-*)
  searchFields?: string[];
  searchOperator?: 'LIKE' | 'ILIKE' | '=';

  // For MUTATE actions (SPEC-CP-C-*)
  trigger?: string; // e.g., "/tema"
  params?: SearchableParam[];
  mode?: ParamMode;
  async?: boolean; // Returns taskId
}

/**
 * Action definition from JQEL
 */
export interface Action {
  schema: string;
  entity: string;
  type: ActionType;
  searchable?: SearchableAction;
}

/**
 * Search result item
 * SPEC-CP-R-*
 */
export interface SearchResult {
  id: string;
  type: InteractionType;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  schema?: string;
  data?: any;
  action?: Action;
  onSelect: () => void;
}

/**
 * Search result group
 * SPEC-CP-R-004 to R-006
 */
export interface SearchResultGroup {
  category: string;
  icon?: string;
  results: SearchResult[];
  count: number;
}

/**
 * Agent definition
 * SPEC-CP-A-001 to A-002
 */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  provider: string; // e.g., "openai", "claude"
}

/**
 * History item
 * SPEC-CP-H-001 to H-007
 */
export interface HistoryItem {
  id: string;
  type: InteractionType;
  query: string;
  timestamp: string;
  frequency: number;
}

/**
 * Command Palette configuration
 * SPEC-CP-C-001
 */
export interface CommandPaletteConfig {
  mode: CommandPaletteMode;
  suspendedShortcut?: string; // Default: "Ctrl+K"
  expandedRoute?: string;
  maxResultsPerCategory?: number; // Default: 5 (suspended), 20 (expanded)
  debounceMs?: number; // Default: 300
  historyLimit?: number; // Default: 50
  defaultCategories?: string[]; // Display order
  enableSearch?: boolean;
  enableCommands?: boolean;
  enableAgents?: boolean;
}

/**
 * Command execution context
 * SPEC-CP-C-007 to C-010
 */
export interface CommandContext {
  command: string;
  params: Record<string, any>;
  action: Action;
}

/**
 * Agent invocation context
 * SPEC-CP-A-004 to A-010
 */
export interface AgentContext {
  agent: Agent;
  query: string;
  response?: {
    content: string;
    type: 'text' | 'markdown' | 'table' | 'card' | 'rich';
    inline: boolean; // true = inline, false = modal
  };
}
