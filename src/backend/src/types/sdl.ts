/**
 * SDL (Schema Definition Language) Types
 *
 * Tipos TypeScript para o formato SDL usado para definir schemas,
 * entidades e ações disponíveis em sistemas baseados em JQEL.
 *
 * @see SPEC-jqel-schema.md
 */

export interface SDLDocument {
  schemas: SDLSchema[];
  entities: SDLEntity[];
  actions: SDLAction[];
}

export interface SDLSchema {
  name: string;
}

export type SDLPropertyType = 'integer' | 'string' | 'boolean' | 'array' | 'object';
export type SDLStringFormat = 'date-time' | 'email' | 'uri';

export interface SDLProperty {
  type: SDLPropertyType;
  description?: string;
  format?: SDLStringFormat;
  items?: {
    type: SDLPropertyType;
    ref?: string;
  };
}

export interface SDLEntity {
  name: string;
  schema: string;
  properties: Record<string, SDLProperty>;
  required?: string[];
}

export type SDLOperation = 'select' | 'mutate';
export type SDLStandardMutateAction = 'insert' | 'update' | 'delete' | 'upsert';

export interface SDLSupports {
  limit?: boolean;
  orderBy?: boolean | string[];
  output?: boolean | string[];
  except?: boolean | string[];
  values?: boolean | string[];
}

export interface SDLReturns {
  type: 'array' | 'object';
  items?: {
    ref: string;
  };
  properties?: Record<string, SDLProperty>;
}

export type SDLParamType = 'string' | 'enum' | 'select' | 'boolean' | 'array';

export interface SDLParamSource {
  schema: string;
  entity: string;
  labelField: string;
  valueField?: string;
}

export interface SDLParam {
  name: string;
  type: SDLParamType;
  required: boolean;
  description?: string;
  placeholder?: string;
  default?: any;
  options?: string[];
  source?: SDLParamSource;
}

export interface SDLSearchable {
  enabled: boolean;
  title: string;
  description?: string;
  keywords?: string[];
  category?: string;
  icon?: string;
  searchFields?: string[];
  searchOperator?: string;
  trigger?: string;
  params?: SDLParam[];
}

export interface SDLSelectAction {
  name: string;
  schema: string;
  operation: 'select';
  entity: string;
  supports?: SDLSupports;
  returns: SDLReturns;
  searchable?: SDLSearchable;
}

export interface SDLMutateAction {
  name: string;
  schema: string;
  operation: 'mutate';
  entity: string;
  action: SDLStandardMutateAction | string;
  supports?: SDLSupports;
  returns: SDLReturns;
  searchable?: SDLSearchable;
}

export type SDLAction = SDLSelectAction | SDLMutateAction;
