/**
 * SDL (Schema Definition Language) Types
 *
 * Tipos TypeScript para o formato SDL usado para definir schemas,
 * entidades e ações disponíveis em sistemas baseados em JQEL.
 *
 * @see SPEC-jqel-schema.md
 */

/**
 * Documento SDL completo
 * SPEC-SDL-R-001, SPEC-SDL-R-002
 */
export interface SDLDocument {
  schemas: SDLSchema[];
  entities: SDLEntity[];
  actions: SDLAction[];
}

/**
 * Definição de Schema
 * SPEC-SDL-S-002, SPEC-SDL-S-003
 */
export interface SDLSchema {
  name: string;
}

/**
 * Schemas reservados pela plataforma
 * SPEC-SDL-S-006
 */
export type ReservedSchema = 'platform' | 'backend' | 'system' | 'frontend';

/**
 * Tipos suportados no JSON Schema
 * SPEC-SDL-E-008
 */
export type SDLPropertyType = 'integer' | 'string' | 'boolean' | 'array' | 'object';

/**
 * Formatos de string
 * SPEC-SDL-E-011
 */
export type SDLStringFormat = 'date-time' | 'email' | 'uri';

/**
 * Definição de propriedade de entidade
 * SPEC-SDL-E-007, SPEC-SDL-E-009
 */
export interface SDLProperty {
  type: SDLPropertyType;
  description?: string;
  format?: SDLStringFormat;
  items?: {
    type: SDLPropertyType;
    ref?: string;
  };
}

/**
 * Definição de entidade
 * SPEC-SDL-E-002, SPEC-SDL-E-003
 */
export interface SDLEntity {
  name: string;
  schema: string;
  properties: Record<string, SDLProperty>;
  required?: string[];
}

/**
 * Tipo de operação
 * SPEC-SDL-A-008
 */
export type SDLOperation = 'select' | 'mutate';

/**
 * Ações padrão para mutate
 * SPEC-SDL-A-012
 */
export type SDLStandardMutateAction = 'insert' | 'update' | 'delete' | 'upsert';

/**
 * Capacidades suportadas por uma action
 * SPEC-SDL-SUP-001 a SPEC-SDL-SUP-024
 */
export interface SDLSupports {
  /** Suporte a limitação de registros */
  limit?: boolean;
  /** Suporte a ordenação (true = todos os campos, array = campos específicos) */
  orderBy?: boolean | string[];
  /** Suporte a projeção de campos (inclusão) */
  output?: boolean | string[];
  /** Suporte a projeção de campos (exclusão) */
  except?: boolean | string[];
  /** Campos modificáveis (apenas para mutate) */
  values?: boolean | string[];
}

/**
 * Tipo de retorno de uma action
 * SPEC-SDL-RET-001 a SPEC-SDL-RET-012
 */
export interface SDLReturns {
  type: 'array' | 'object';
  items?: {
    ref: string; // Formato: "entity" ou "schema:entity"
  };
  properties?: Record<string, SDLProperty>;
}

/**
 * Tipos de parâmetro para comandos
 * SPEC-SDL-SEARCH-012
 */
export type SDLParamType = 'string' | 'enum' | 'select' | 'boolean' | 'array';

/**
 * Source dinâmica para parâmetro select
 * SPEC-SDL-SEARCH-011
 */
export interface SDLParamSource {
  schema: string;
  entity: string;
  labelField: string;
  valueField?: string;
}

/**
 * Definição de parâmetro de comando
 * SPEC-SDL-SEARCH-010, SPEC-SDL-SEARCH-011
 */
export interface SDLParam {
  name: string;
  type: SDLParamType;
  required: boolean;
  description?: string;
  placeholder?: string;
  default?: any;
  options?: string[]; // Para type: 'enum'
  source?: SDLParamSource; // Para type: 'select'
}

/**
 * Configuração de searchable para Command Palette
 * SPEC-SDL-SEARCH-001 a SPEC-SDL-SEARCH-013
 */
export interface SDLSearchable {
  enabled: boolean;
  title: string;
  description?: string;
  keywords?: string[];
  category?: string;
  icon?: string;
  /** Campos usados na busca (para SELECT) */
  searchFields?: string[];
  /** Operador de busca (default: "LIKE") */
  searchOperator?: string;
  /** Trigger do comando (para MUTATE, ex: /criar-portal) */
  trigger?: string;
  /** Parâmetros do comando (para MUTATE) */
  params?: SDLParam[];
}

/**
 * Definição de action (SELECT)
 * SPEC-SDL-A-002, SPEC-SDL-A-003, SPEC-SDL-A-004
 */
export interface SDLSelectAction {
  name: string; // Formato: "select.{entity}"
  schema: string;
  operation: 'select';
  entity: string;
  supports?: SDLSupports;
  returns: SDLReturns;
  searchable?: SDLSearchable;
}

/**
 * Definição de action (MUTATE)
 * SPEC-SDL-A-002, SPEC-SDL-A-003, SPEC-SDL-A-004
 */
export interface SDLMutateAction {
  name: string; // Formato: "mutate.{entity}.{action}"
  schema: string;
  operation: 'mutate';
  entity: string;
  action: SDLStandardMutateAction | string; // Permite ações customizadas
  supports?: SDLSupports;
  returns: SDLReturns;
  searchable?: SDLSearchable;
}

/**
 * Action (SELECT ou MUTATE)
 */
export type SDLAction = SDLSelectAction | SDLMutateAction;

/**
 * Helper: verificar se action é SELECT
 */
export function isSelectAction(action: SDLAction): action is SDLSelectAction {
  return action.operation === 'select';
}

/**
 * Helper: verificar se action é MUTATE
 */
export function isMutateAction(action: SDLAction): action is SDLMutateAction {
  return action.operation === 'mutate';
}

/**
 * Helper: verificar se schema é reservado
 */
export function isReservedSchema(schema: string): schema is ReservedSchema {
  return ['platform', 'backend', 'system', 'frontend'].includes(schema);
}

/**
 * Helper: extrair schema de ref cross-schema
 * "cia:permission" -> { schema: "cia", entity: "permission" }
 * "permission" -> { schema: undefined, entity: "permission" }
 */
export function parseRef(ref: string): { schema?: string; entity: string } {
  const parts = ref.split(':');
  if (parts.length === 2) {
    return { schema: parts[0], entity: parts[1] };
  }
  return { entity: ref };
}

/**
 * Helper: formatar ref cross-schema
 * { schema: "cia", entity: "permission" } -> "cia:permission"
 */
export function formatRef(schema: string, entity: string): string {
  return `${schema}:${entity}`;
}
