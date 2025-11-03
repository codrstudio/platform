/**
 * JQEL Types for Backend
 */

export type JQELOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in';

export type JQELWhere =
  | {
      [field: string]: { [operator in JQELOperator]?: any } | JQELWhere | any;
    }
  | {
      and?: JQELWhere[];
      or?: JQELWhere[];
      not?: JQELWhere;
    };

export type JQELOrderBy = Record<string, 'asc' | 'desc'>;

export interface JQELOptions {
  limit?: number;
  offset?: number;
  orderBy?: JQELOrderBy[];
}

export interface JQELQuery {
  schema: string;
  select?: string;
  mutate?: string;
  action?: 'insert' | 'update' | 'delete' | string;
  where?: JQELWhere;
  values?: Record<string, any>;
  options?: JQELOptions;
  output?: string[];
  except?: string[];
}
