// JQEL Types for Backend
// Based on SPEC-jqel-syntax.md

export interface JQELWhereCondition {
  $eq?: unknown
  $ne?: unknown
  $gt?: number
  $gte?: number
  $lt?: number
  $lte?: number
  $in?: unknown[]
  $nin?: unknown[]
  $like?: string
  $ilike?: string
  $null?: boolean
  $between?: [number, number]
}

export type JQELWhere = {
  [field: string]: JQELWhereCondition | unknown
} & {
  $and?: JQELWhere[]
  $or?: JQELWhere[]
  $not?: JQELWhere
}

export interface JQELOrderBy {
  field: string
  direction: 'asc' | 'desc'
}

export interface JQELOptions {
  limit?: number
  offset?: number
  orderBy?: JQELOrderBy[]
}

export interface JQELSelectQuery {
  schema: string
  select: string
  action?: string
  where?: JQELWhere
  options?: JQELOptions
  output?: string[]
  except?: string[]
}

export interface JQELMutateQuery {
  schema: string
  mutate: string
  action: 'insert' | 'update' | 'delete' | 'custom'
  values?: Record<string, unknown>
  where?: JQELWhere
  options?: JQELOptions
  output?: string[]
  except?: string[]
}

export type JQELQuery = JQELSelectQuery | JQELMutateQuery

export interface JResult<T = unknown> {
  code: number
  message?: string
  data?: T
  field?: string
  count?: number
  metadata?: Record<string, unknown>
}
