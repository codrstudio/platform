// JqelTranspiler.ts

import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface TranspileResult {
  success: boolean
  sql?: string
  params?: any[]
  error?: string
  validationErrors?: string[]
}

export interface JqelTranspilerConfig {
  dialect: 'mysql' | 'sqlserver'
  entities: any[]           // Array de entities de entities.json
  actions: any[]            // Array de actions de actions.json
  templateDriver: TemplateDriver
  validateInput?: boolean
  strictMode?: boolean      // Validar queryableFields (default: false)
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface AnalysisContext {
  schema: string
  entity: string
  operation: 'select' | 'mutate'
  action?: string
  entityMapping: any
  actionMapping?: any      // Action correspondente (se encontrada)
  jqel: any
  requiredJoins: Array<{ entity: string; type: 'one' | 'array'; field: string }>
}

export interface AnalyzeResult {
  success: boolean
  analysis?: AnalysisContext
  error?: string
}

export interface ExecutionPlan {
  joins: Array<{ entity: string; type: 'one' | 'array'; strategy: 'join' | 'exists' | 'subquery' }>
  aggregation: boolean
  pagination: boolean
  ordering: boolean
}

export interface PlanResult {
  success: boolean
  plan?: ExecutionPlan
  error?: string
}

export interface BuildResult {
  success: boolean
  sql?: string
  params?: any[]
  error?: string
}

export interface TemplateDriver {
  getTemplate(schema: string, entity: string, operation: string, action?: string): Promise<string | null>
}

// ============================================================================
// DIALECT INTERFACE & IMPLEMENTATIONS
// ============================================================================

abstract class Dialect {
  abstract escapeIdentifier(name: string): string
  abstract parameterPlaceholder(index: number): string
  abstract buildLimit(limit: number, offset?: number): string
}

class MySQLDialect extends Dialect {
  escapeIdentifier(name: string): string {
    return `\`${name}\``
  }

  parameterPlaceholder(index: number): string {
    return '?'
  }

  buildLimit(limit: number, offset?: number): string {
    if (offset) {
      return `LIMIT ${offset}, ${limit}`
    }
    return `LIMIT ${limit}`
  }
}

class SqlServerDialect extends Dialect {
  escapeIdentifier(name: string): string {
    return `[${name}]`
  }

  parameterPlaceholder(index: number): string {
    return `@p${index}`
  }

  buildLimit(limit: number, offset?: number): string {
    if (offset) {
      return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
    }
    return `OFFSET 0 ROWS FETCH NEXT ${limit} ROWS ONLY`
  }
}

// ============================================================================
// VALIDATOR
// ============================================================================

class Validator {
  validate(jqel: any): ValidationResult {
    const errors: string[] = []

    if (!jqel || typeof jqel !== 'object') {
      errors.push('JQEL must be an object')
      return { valid: false, errors }
    }

    if (!jqel.schema) {
      errors.push('Field "schema" is required')
    }
    if (typeof jqel.schema !== 'string') {
      errors.push('Field "schema" must be a string')
    }

    if (!jqel.select && !jqel.mutate) {
      errors.push('Either "select" or "mutate" is required')
    }

    if (jqel.select && jqel.mutate) {
      errors.push('Cannot use both "select" and "mutate"')
    }

    if (jqel.select && typeof jqel.select !== 'string') {
      errors.push('Field "select" must be a string')
    }

    if (jqel.mutate) {
      if (typeof jqel.mutate !== 'string') {
        errors.push('Field "mutate" must be a string')
      }
      if (!jqel.action) {
        errors.push('Field "action" is required for mutate operations')
      }
      if (jqel.action && typeof jqel.action !== 'string') {
        errors.push('Field "action" must be a string')
      }
    }

    if (jqel.where && typeof jqel.where !== 'object') {
      errors.push('Field "where" must be an object')
    }

    if (jqel.values && typeof jqel.values !== 'object') {
      errors.push('Field "values" must be an object')
    }

    if (jqel.output && !Array.isArray(jqel.output)) {
      errors.push('Field "output" must be an array')
    }

    if (jqel.except && !Array.isArray(jqel.except)) {
      errors.push('Field "except" must be an array')
    }

    if (jqel.output && jqel.except) {
      errors.push('Cannot use both "output" and "except"')
    }

    if (jqel.options && typeof jqel.options !== 'object') {
      errors.push('Field "options" must be an object')
    }

    if (jqel.options?.limit && typeof jqel.options.limit !== 'number') {
      errors.push('Field "options.limit" must be a number')
    }

    if (jqel.options?.offset && typeof jqel.options.offset !== 'number') {
      errors.push('Field "options.offset" must be a number')
    }

    if (jqel.options?.orderBy && !Array.isArray(jqel.options.orderBy)) {
      errors.push('Field "options.orderBy" must be an array')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  validateRequiredFields(jqel: any, entityMapping: any): ValidationResult {
    const errors: string[] = []

    // Valida apenas para INSERT (action === 'insert')
    if (!jqel.mutate || jqel.action !== 'insert') {
      return { valid: true, errors: [] }
    }

    const values = jqel.values || {}
    const required = entityMapping.required || []
    const columns = entityMapping.sqlMapping?.columns || {}

    for (const fieldName of required) {
      // Ignora campo se for auto-increment ou auto-generated (UUIDs)
      const col = columns[fieldName]
      const isAutoIncrement = typeof col === 'object' && col.autoIncrement === true
      const isAutoGenerated = typeof col === 'object' && col.autoGenerated === true

      if (isAutoIncrement || isAutoGenerated) {
        continue
      }

      // Verifica se o campo está presente e não é null/undefined/''
      const value = values[fieldName]
      if (value === null || value === undefined || value === '') {
        errors.push(`Required field "${fieldName}" is missing or empty`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// ============================================================================
// ANALYZER
// ============================================================================

class Analyzer {
  analyze(
    jqel: any,
    entityMappings: Record<string, any>,
    actionMappings: Record<string, any>,
    entityResolver?: (schema: string, entity: string) => any | null,
    strictMode: boolean = false
  ): AnalyzeResult {
    try {
      const schema = jqel.schema
      const entity = jqel.select || jqel.mutate
      const operation = jqel.select ? 'select' : 'mutate'
      const action = jqel.action

      // Usa o resolver se fornecido, senão busca diretamente
      let entityMapping: any
      if (entityResolver) {
        entityMapping = entityResolver(schema, entity)
      } else {
        const entityKey = `${schema}:${entity}`
        entityMapping = entityMappings[entityKey]
      }

      if (!entityMapping) {
        return {
          success: false,
          error: `Entity mapping not found: ${schema}:${entity}`
        }
      }

      if (!entityMapping.sqlMapping) {
        return {
          success: false,
          error: `No SQL mapping defined for entity: ${entityKey}`
        }
      }

      // Busca action correspondente
      // Para entities customizadas (ex: "cliente.promover_premium"), usa apenas a base entity
      const baseEntity = entity.includes('.') ? entity.split('.')[0] : entity
      let actionKey = `${schema}:${baseEntity}:${operation}`
      if (action) {
        actionKey = `${actionKey}:${action}`
      }
      const actionMapping = actionMappings[actionKey]

      if (!actionMapping) {
        return {
          success: false,
          error: `Action mapping not found: ${actionKey}`
        }
      }

      const requiredJoins = this.analyzeWhereClause(jqel.where, entityMapping)

      // Validações de queryableFields apenas em strictMode
      if (strictMode) {
        if (jqel.where) {
          const invalidFields = this.validateQueryableFields(jqel.where, entityMapping)
          if (invalidFields.length > 0) {
            return {
              success: false,
              error: `Non-queryable fields used: ${invalidFields.join(', ')}`
            }
          }
        }

        if (jqel.options?.orderBy) {
          const invalidFields = this.validateOrderByFields(jqel.options.orderBy, entityMapping)
          if (invalidFields.length > 0) {
            return {
              success: false,
              error: `Invalid ORDER BY fields: ${invalidFields.join(', ')}`
            }
          }
        }
      }

      return {
        success: true,
        analysis: {
          schema,
          entity,
          operation,
          action,
          entityMapping,
          actionMapping,
          jqel,
          requiredJoins
        }
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Analysis error: ${err.message}`
      }
    }
  }

  private analyzeWhereClause(where: any, entityMapping: any): Array<any> {
    if (!where) return []

    const joins: Array<any> = []
    const relationships = entityMapping.sqlMapping.relationships || {}

    const walkWhere = (obj: any) => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('.')) {
          const [parentEntity] = key.split('.')
          if (relationships[parentEntity]) {
            joins.push({
              entity: parentEntity,
              type: relationships[parentEntity].type,
              field: key
            })
          }
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          walkWhere(value)
        }
      }
    }

    walkWhere(where)
    return joins
  }

  private validateQueryableFields(where: any, entityMapping: any): string[] {
    const invalid: string[] = []
    const queryableFields = entityMapping.sqlMapping.queryableFields || []

    const check = (obj: any, prefix = '') => {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (!queryableFields.includes(fullKey.split('.')[0]) && key !== 'or' && key !== 'not') {
          invalid.push(fullKey)
        }
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          check(obj[key], fullKey)
        }
      }
    }

    check(where)
    return invalid
  }

  private validateOrderByFields(orderBy: any[], entityMapping: any): string[] {
    const invalid: string[] = []
    const queryableFields = entityMapping.sqlMapping.queryableFields || []

    for (const item of orderBy) {
      const fieldName = Object.keys(item)[0]
      if (!queryableFields.includes(fieldName)) {
        invalid.push(fieldName)
      }
    }

    return invalid
  }
}

// ============================================================================
// PLANNER
// ============================================================================

class Planner {
  plan(analysis: any): PlanResult {
    try {
      const plan: ExecutionPlan = {
        joins: [],
        aggregation: false,
        pagination: false,
        ordering: false
      }

      for (const join of analysis.requiredJoins) {
        plan.joins.push({
          entity: join.entity,
          type: join.type,
          strategy: this.decideJoinStrategy(join)
        })
      }

      if (analysis.jqel.options?.limit || analysis.jqel.options?.offset) {
        plan.pagination = true
      }

      if (analysis.jqel.options?.orderBy) {
        plan.ordering = true
      }

      if (analysis.jqel.output || analysis.jqel.except) {
        const hasArrayFields = this.checkArrayFields(analysis.entityMapping)
        if (hasArrayFields) {
          plan.aggregation = true
        }
      }

      return {
        success: true,
        plan
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Planning error: ${err.message}`
      }
    }
  }

  private decideJoinStrategy(join: any): 'join' | 'exists' | 'subquery' {
    if (join.type === 'one') {
      return 'join'
    }
    return 'subquery'
  }

  private checkArrayFields(entityMapping: any): boolean {
    const relationships = entityMapping.sqlMapping.relationships || {}
    for (const rel of Object.values(relationships)) {
      if ((rel as any).type === 'array') {
        return true
      }
    }
    return false
  }
}

// ============================================================================
// SQL BUILDER
// ============================================================================

class SqlBuilder {
  private dialect: Dialect
  private templateDriver: TemplateDriver
  private params: any[] = []

  constructor(dialect: Dialect, templateDriver: TemplateDriver) {
    this.dialect = dialect
    this.templateDriver = templateDriver
  }

  async build(jqel: any, analysis: AnalysisContext, plan: ExecutionPlan): Promise<BuildResult> {
    try {
      this.params = []

      const mapping = analysis.entityMapping.sqlMapping
      const schema = mapping.schema  // Schema do banco (opcional)
      const table = mapping.table
      const columns = mapping.columns
      const sqlTemplate = analysis.actionMapping?.sqlTemplate

      // Se tem sqlTemplate, usa o query-template correspondente
      if (sqlTemplate === 'select' || sqlTemplate === 'insert' || sqlTemplate === 'update' || sqlTemplate === 'delete' || sqlTemplate === 'upsert') {
        return this.buildFromTemplate(sqlTemplate, jqel, analysis, plan, schema, table, columns)
      }

      // Se não tem sqlTemplate, busca template customizado via TemplateDriver
      const customSql = await this.templateDriver.getTemplate(
        analysis.schema,
        analysis.entity,
        analysis.operation,
        analysis.action
      )

      if (!customSql) {
        return {
          success: false,
          error: `No SQL template found for ${analysis.operation}.${analysis.entity}${analysis.action ? '.' + analysis.action : ''}`
        }
      }

      return {
        success: true,
        sql: customSql,
        params: this.params
      }
    } catch (err: any) {
      return {
        success: false,
        error: `SQL build error: ${err.message}`
      }
    }
  }

  private buildFromTemplate(
    template: string,
    jqel: any,
    analysis: AnalysisContext,
    plan: ExecutionPlan,
    schema: string | undefined,
    table: string,
    columns: any
  ): BuildResult {
    let sql = ''

    if (template === 'select') {
      sql = this.buildSelectSql(jqel, schema, table, columns)
    } else if (template === 'insert') {
      sql = this.buildInsert(jqel, columns, schema, table)
    } else if (template === 'update') {
      sql = this.buildUpdate(jqel, columns, schema, table)
    } else if (template === 'delete') {
      sql = this.buildDelete(jqel, columns, schema, table)
    } else if (template === 'upsert') {
      sql = this.buildUpsert(jqel, columns, schema, table)
    }

    return {
      success: true,
      sql,
      params: this.params
    }
  }

  private getFullTableName(schema: string | undefined, table: string): string {
    if (schema) {
      // Com schema: [schema].[table] ou schema.table
      return `${this.dialect.escapeIdentifier(schema)}.${this.dialect.escapeIdentifier(table)}`
    } else {
      // Sem schema: apenas [table] ou table
      return this.dialect.escapeIdentifier(table)
    }
  }

  private buildSelectSql(jqel: any, schema: string | undefined, table: string, columns: any): string {
    let sql = 'SELECT '

    // SELECT clause
    const selectFields = this.buildSelectFields(jqel, columns)
    sql += selectFields

    // FROM clause
    sql += ` FROM ${this.getFullTableName(schema, table)}`

    // WHERE clause
    if (jqel.where) {
      const whereClause = this.buildWhere(jqel.where, columns)
      sql += ` WHERE ${whereClause}`
    }

    // ORDER BY clause
    if (jqel.options?.orderBy) {
      const orderByClause = this.buildOrderBy(jqel.options.orderBy, columns)
      sql += ` ${orderByClause}`
    }

    // LIMIT/OFFSET
    if (jqel.options?.limit) {
      sql += ` ${this.dialect.buildLimit(jqel.options.limit, jqel.options?.offset)}`
    }

    return sql
  }

  private buildInsert(jqel: any, columns: any, schema: string | undefined, table: string): string {
    const values = jqel.values || {}
    let keys = Object.keys(values)

    // Filtra campos auto-increment e auto-generated (se não foi fornecido valor explícito ou é null/undefined)
    keys = keys.filter(k => {
      const col = columns[k]
      const isAutoIncrement = typeof col === 'object' && col.autoIncrement === true
      const isAutoGenerated = typeof col === 'object' && col.autoGenerated === true

      // Remove campo se:
      // 1. É auto-increment ou auto-generated E
      // 2. O valor é null, undefined, ou não foi fornecido
      if (isAutoIncrement || isAutoGenerated) {
        const value = values[k]
        return value !== null && value !== undefined && value !== ''
      }

      return true
    })

    const colNames = keys.map(k => this.getColumnName(k, columns)).map(c => this.dialect.escapeIdentifier(c))
    const placeholders = keys.map(() => this.dialect.parameterPlaceholder(this.params.length + 1))

    for (const key of keys) {
      this.params.push(values[key])
    }

    return `INSERT INTO ${this.getFullTableName(schema, table)} (${colNames.join(', ')}) VALUES (${placeholders.join(', ')})`
  }

  private buildUpdate(jqel: any, columns: any, schema: string | undefined, table: string): string {
    const values = jqel.values || {}
    const sets = Object.entries(values)
      .map(([k, v]) => {
        const colName = this.getColumnName(k, columns)
        this.params.push(v)
        return `${this.dialect.escapeIdentifier(colName)} = ${this.dialect.parameterPlaceholder(this.params.length)}`
      })
      .join(', ')

    let sql = `UPDATE ${this.getFullTableName(schema, table)} SET ${sets}`

    if (jqel.where) {
      const whereClause = this.buildWhere(jqel.where, columns)
      sql += ` WHERE ${whereClause}`
    }

    return sql
  }

  private buildDelete(jqel: any, columns: any, schema: string | undefined, table: string): string {
    let sql = `DELETE FROM ${this.getFullTableName(schema, table)}`

    if (jqel.where) {
      const whereClause = this.buildWhere(jqel.where, columns)
      sql += ` WHERE ${whereClause}`
    }

    return sql
  }

  private buildUpsert(jqel: any, columns: any, schema: string | undefined, table: string): string {
    // Simplified: MySQL syntax
    const values = jqel.values || {}
    const keys = Object.keys(values)
    const colNames = keys.map(k => this.getColumnName(k, columns)).map(c => this.dialect.escapeIdentifier(c))
    const placeholders = keys.map(() => this.dialect.parameterPlaceholder(this.params.length + 1))

    for (const key of keys) {
      this.params.push(values[key])
    }

    return `INSERT INTO ${this.getFullTableName(schema, table)} (${colNames.join(', ')}) VALUES (${placeholders.join(', ')}) ON DUPLICATE KEY UPDATE ${colNames.map((c, i) => `${c} = VALUES(${c})`).join(', ')}`
  }

  private buildSelectFields(jqel: any, columns: any): string {
    const output = jqel.output
    const except = jqel.except

    if (output) {
      return output
        .map((f: string) => {
          const col = this.getColumnName(f, columns)
          return `${this.dialect.escapeIdentifier(col)} as ${this.dialect.escapeIdentifier(f)}`
        })
        .join(', ')
    }

    if (except) {
      const allFields = Object.keys(columns)
      const filtered = allFields.filter(f => !except.includes(f))
      return filtered
        .map(f => {
          const col = this.getColumnName(f, columns)
          return `${this.dialect.escapeIdentifier(col)} as ${this.dialect.escapeIdentifier(f)}`
        })
        .join(', ')
    }

    return Object.entries(columns)
      .map(([k, v]: any) => {
        const colName = typeof v === 'string' ? v : v.column
        return `${this.dialect.escapeIdentifier(colName)} as ${this.dialect.escapeIdentifier(k)}`
      })
      .join(', ')
  }

  private buildWhere(where: any, columns: any): string {
    const parts: string[] = []

    for (const [field, conditions] of Object.entries(where)) {
      const colName = this.getColumnName(field, columns)
      const conditionStr = this.buildCondition(colName, conditions as any)
      parts.push(conditionStr)
    }

    return parts.join(' AND ')
  }

  private buildCondition(colName: string, conditions: any): string {
    const parts: string[] = []

    for (const [op, val] of Object.entries(conditions)) {
      if (op === 'eq') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} = ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'ne') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} != ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'gt') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} > ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'gte') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} >= ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'lt') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} < ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'lte') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} <= ${this.dialect.parameterPlaceholder(this.params.length)}`)
      } else if (op === 'in' && Array.isArray(val)) {
        const placeholders = val.map(v => {
          this.params.push(v)
          return this.dialect.parameterPlaceholder(this.params.length)
        })
        parts.push(`${this.dialect.escapeIdentifier(colName)} IN (${placeholders.join(', ')})`)
      } else if (op === 'like') {
        this.params.push(val)
        parts.push(`${this.dialect.escapeIdentifier(colName)} LIKE ${this.dialect.parameterPlaceholder(this.params.length)}`)
      }
    }

    return parts.join(' AND ')
  }

  private buildOrderBy(orderBy: any[], columns: any): string {
    const parts = orderBy.map((item: any) => {
      const field = Object.keys(item)[0]
      const direction = item[field]
      const colName = this.getColumnName(field, columns)
      return `${this.dialect.escapeIdentifier(colName)} ${direction.toUpperCase()}`
    })

    return `ORDER BY ${parts.join(', ')}`
  }

  private getColumnName(field: string, columns: any): string {
    const col = columns[field]
    if (typeof col === 'string') {
      return col
    }
    if (typeof col === 'object' && col.column) {
      return col.column
    }
    return field
  }
}

// ============================================================================
// TEMPLATE DRIVER IMPLEMENTATIONS
// ============================================================================

export class FileSystemTemplateDriver implements TemplateDriver {
  private basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  async getTemplate(
    schema: string,
    entity: string,
    operation: string,
    action?: string
  ): Promise<string | null> {
    try {
      const filename = action ? `${operation}.${entity}.${action}.sql` : `${operation}.${entity}.sql`
      const filepath = path.join(this.basePath, schema, filename)

      if (!fs.existsSync(filepath)) {
        return null
      }

      const content = fs.readFileSync(filepath, 'utf-8')
      return content.trim()
    } catch (err: any) {
      console.error(`Error loading template: ${err.message}`)
      return null
    }
  }
}

// ============================================================================
// MAIN TRANSPILER
// ============================================================================

export class JqelTranspiler {
  private dialect: Dialect
  private entityMappings: Record<string, any>
  private actionMappings: Record<string, any>
  private templateDriver: TemplateDriver
  private validator: Validator
  private validateInput: boolean
  private strictMode: boolean

  constructor(config: JqelTranspilerConfig) {
    this.entityMappings = this.buildEntityMappings(config.entities)
    this.actionMappings = this.buildActionMappings(config.actions)
    this.templateDriver = config.templateDriver
    this.validateInput = config.validateInput ?? false
    this.strictMode = config.strictMode ?? false

    if (config.dialect === 'mysql') {
      this.dialect = new MySQLDialect()
    } else if (config.dialect === 'sqlserver') {
      this.dialect = new SqlServerDialect()
    } else {
      throw new Error(`Unknown dialect: ${config.dialect}`)
    }

    this.validator = new Validator()
  }

  private buildEntityMappings(entities: any[]): Record<string, any> {
    const mappings: Record<string, any> = {}
    const baseEntities: Record<string, any> = {} // Armazena base entities para herança

    // Primeiro passo: mapear todas as entities e identificar base entities
    for (const entity of entities) {
      const key = `${entity.schema}:${entity.name}`
      mappings[key] = entity

      // Se não contém '.', é uma base entity
      if (!entity.name.includes('.')) {
        const baseKey = `${entity.schema}:${entity.name}`
        baseEntities[baseKey] = entity
      }
    }

    return mappings
  }

  // Método auxiliar para resolver entity (com fallback para base entity)
  private resolveEntity(schema: string, entityName: string): any | null {
    const fullKey = `${schema}:${entityName}`

    // Tenta encontrar entity exata
    if (this.entityMappings[fullKey]) {
      return this.entityMappings[fullKey]
    }

    // Se entity contém '.', tenta encontrar a base entity
    if (entityName.includes('.')) {
      const baseName = entityName.split('.')[0]
      const baseKey = `${schema}:${baseName}`

      if (this.entityMappings[baseKey]) {
        // Cria uma cópia da base entity para a customizada
        const baseEntity = this.entityMappings[baseKey]
        const customEntity = {
          ...baseEntity,
          name: entityName, // Mantém o nome customizado
          _inheritedFrom: baseName // Marca como herdada
        }

        // Cacheia a entity customizada
        this.entityMappings[fullKey] = customEntity

        return customEntity
      }
    }

    return null
  }

  private buildActionMappings(actions: any[]): Record<string, any> {
    const mappings: Record<string, any> = {}
    for (const action of actions) {
      // Extrai a entity do name (pode incluir subaction, ex: "select.usuario.ativos")
      const nameParts = action.name.split('.')
      const operation = nameParts[0] // "select" ou "mutate"

      // Para extrair entity corretamente:
      // - Se tem action.action definido (ex: insert, update, delete), é uma action padrão
      //   e o último elemento do name NÃO faz parte da entity
      //   Ex: "mutate.usuario.insert" -> entity = "usuario"
      // - Se NÃO tem action.action, todos os elementos após operation são entity
      //   Ex: "select.usuario.ativos" -> entity = "usuario.ativos"
      let entity: string
      if (action.action) {
        // Pega tudo entre operation e o último elemento (que é a action)
        entity = nameParts.slice(1, -1).join('.')
      } else {
        // Pega tudo após operation
        entity = nameParts.slice(1).join('.')
      }

      // Chave base: schema:entity:operation
      let baseKey = `${action.schema}:${entity}:${operation}`

      // Se tem action específica (ex: insert, update), adiciona ao final
      if (action.action) {
        baseKey = `${baseKey}:${action.action}`
      }

      // Adiciona o mapping
      mappings[baseKey] = action
    }
    return mappings
  }

  async transpile(jqel: any): Promise<TranspileResult> {
    try {
      if (this.validateInput) {
        const validationResult = this.validator.validate(jqel)
        if (!validationResult.valid) {
          return {
            success: false,
            error: 'Invalid JQEL structure',
            validationErrors: validationResult.errors
          }
        }
      }

      const analyzeResult = new Analyzer().analyze(
        jqel,
        this.entityMappings,
        this.actionMappings,
        (schema, entity) => this.resolveEntity(schema, entity),
        this.strictMode
      )
      if (!analyzeResult.success) {
        if (!this.validateInput) {
          const validationResult = this.validator.validate(jqel)
          if (!validationResult.valid) {
            return {
              success: false,
              error: analyzeResult.error,
              validationErrors: validationResult.errors
            }
          }
        }
        return {
          success: false,
          error: analyzeResult.error
        }
      }

      // Valida campos obrigatórios para INSERT
      if (this.validateInput) {
        const requiredFieldsResult = this.validator.validateRequiredFields(jqel, analyzeResult.analysis!.entityMapping)
        if (!requiredFieldsResult.valid) {
          return {
            success: false,
            error: 'Required fields validation failed',
            validationErrors: requiredFieldsResult.errors
          }
        }
      }

      const planResult = new Planner().plan(analyzeResult.analysis!)
      if (!planResult.success) {
        return {
          success: false,
          error: planResult.error
        }
      }

      const buildResult = await new SqlBuilder(this.dialect, this.templateDriver).build(
        jqel,
        analyzeResult.analysis!,
        planResult.plan!
      )

      if (!buildResult.success) {
        return {
          success: false,
          error: buildResult.error
        }
      }

      return {
        success: true,
        sql: buildResult.sql,
        params: buildResult.params
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Transpiler error: ${err.message}`
      }
    }
  }
}