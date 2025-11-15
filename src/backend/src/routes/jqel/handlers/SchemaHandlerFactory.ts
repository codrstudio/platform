// Schema Handler Factory
// Creates appropriate handler based on schema type

import type { SchemaHandler } from './SchemaHandler.js'
import { BackendSchemaHandler } from './BackendSchemaHandler.js'
import { SystemSchemaHandler } from './SystemSchemaHandler.js'
import { N8nSchemaHandler } from './N8nSchemaHandler.js'

/**
 * SchemaHandlerFactory
 *
 * SPEC-JQEL-SCH-004: Route based on schema
 * Factory pattern to create appropriate handler for each schema type
 */
export class SchemaHandlerFactory {
  private static handlers: Map<string, SchemaHandler> = new Map()

  /**
   * Get handler for a given schema
   * @param schema - Schema name (backend, system, platform, or custom)
   */
  static getHandler(schema: string): SchemaHandler {
    // Check if handler already exists in cache
    if (this.handlers.has(schema)) {
      return this.handlers.get(schema)!
    }

    // Create handler based on schema type
    let handler: SchemaHandler

    switch (schema) {
      case 'backend':
        handler = new BackendSchemaHandler()
        break
      case 'system':
        handler = new SystemSchemaHandler()
        break
      case 'platform':
        handler = new N8nSchemaHandler()
        break
      default:
        // Application schemas route to n8n
        handler = new N8nSchemaHandler()
        break
    }

    // Cache handler for reuse
    this.handlers.set(schema, handler)
    return handler
  }

  /**
   * Clear handler cache (useful for testing)
   */
  static clearCache(): void {
    this.handlers.clear()
  }
}
