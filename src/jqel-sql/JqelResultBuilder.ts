// builder/JqelResultBuilder.ts

export interface JResult {
  code: number
  message?: string
  field?: string
  data?: any[]
  warnings?: JResult[]
}

export type DbDriver = 'mysql' | 'postgres' | 'sqlserver' | 'sqlite'

export class JqelResultBuilder {
  private driver: DbDriver

  constructor(driver: DbDriver) {
    this.driver = driver
  }

  /**
   * Converts raw database result to JResult envelope
   * Detects metadata columns (status.*) and structures accordingly
   */
  build(rawResult: any): JResult {
    try {
      // Normalize result based on driver
      const rows = this.normalizeResult(rawResult)

      // Check if result contains metadata
      if (rows.length > 0 && this.hasMetadata(rows[0])) {
        return this.buildWithMetadata(rows)
      }

      // Standard data result
      return this.buildDataResult(rows)
    } catch (err: any) {
      return {
        code: 500,
        message: `Result builder error: ${err.message}`
      }
    }
  }

  /**
   * Normalize result based on database driver
   */
  private normalizeResult(rawResult: any): any[] {
    switch (this.driver) {
      case 'mysql':
        // mysql2 returns array directly
        return Array.isArray(rawResult) ? rawResult : []

      case 'postgres':
        // pg returns { rows: [...] }
        return rawResult?.rows || []

      case 'sqlserver':
        // mssql returns { recordset: [...] }
        return rawResult?.recordset || []

      case 'sqlite':
        // better-sqlite3 returns array directly
        return Array.isArray(rawResult) ? rawResult : []

      default:
        return Array.isArray(rawResult) ? rawResult : []
    }
  }

  /**
   * Check if row contains metadata columns (status.*)
   */
  private hasMetadata(row: any): boolean {
    if (!row || typeof row !== 'object') {
      return false
    }

    const keys = Object.keys(row)
    return keys.some(key => key.startsWith('status.'))
  }

  /**
   * Build JResult with metadata (status.code, status.message, etc)
   */
  private buildWithMetadata(rows: any[]): JResult {
    if (rows.length === 0) {
      return { code: 200 }
    }

    const firstRow = rows[0]

    // Extract metadata
    const statusCode = this.extractMetadataValue(firstRow, 'status.code')
    const statusMessage = this.extractMetadataValue(firstRow, 'status.message')
    const statusField = this.extractMetadataValue(firstRow, 'status.field')
    const statusData = this.extractMetadataValue(firstRow, 'status.data')
    const statusWarnings = this.extractMetadataValue(firstRow, 'status.warnings')

    const code = statusCode ? Number(statusCode) : 200

    const result: JResult = {
      code,
      ...(statusMessage && { message: statusMessage }),
      ...(statusField && { field: statusField })
    }

    // Handle data
    if (statusData) {
      try {
        const parsed = typeof statusData === 'string' ? JSON.parse(statusData) : statusData
        result.data = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        result.data = [statusData]
      }
    }

    // Handle warnings
    if (statusWarnings) {
      try {
        const parsed = typeof statusWarnings === 'string' ? JSON.parse(statusWarnings) : statusWarnings
        result.warnings = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        result.warnings = [{ code: 299, message: String(statusWarnings) }]
      }
    }

    return result
  }

  /**
   * Build standard data result (no metadata)
   */
  private buildDataResult(rows: any[]): JResult {
    return {
      code: 200,
      data: rows
    }
  }

  /**
   * Extract metadata value from status.* columns and remove from row
   */
  private extractMetadataValue(row: any, key: string): any {
    const keys = Object.keys(row)
    const matchingKey = keys.find(k => k === key)

    if (matchingKey) {
      const value = row[matchingKey]
      delete row[matchingKey]
      return value
    }

    return null
  }

  /**
   * Clean row by removing all status.* columns
   */
  private cleanRow(row: any): any {
    const cleaned = { ...row }
    Object.keys(cleaned).forEach(key => {
      if (key.startsWith('status.')) {
        delete cleaned[key]
      }
    })
    return cleaned
  }
}