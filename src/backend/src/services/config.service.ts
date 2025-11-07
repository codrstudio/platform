// Configuration Service
// Based on SPEC-configuration.md (SPEC-CF-AS-*)

import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { PortalSchema, ModuleSchema, InstanceSchema } from '../types/config.types.js'
import type { Portal, Module, Instance, ConfigType, ConfigData } from '../types/config.types.js'

/**
 * Configuration Service
 * File-based configuration management
 * SPEC-CF-AS-001 to SPEC-CF-AS-013
 */
class ConfigService {
  private configDir: string
  private cache: ConfigData | null = null

  constructor() {
    // SPEC-CF-AS-002: Files in /config directory on Backend
    this.configDir = path.join(process.cwd(), 'config')
  }

  /**
   * Initialize config directory
   * Create directory if it doesn't exist
   */
  private async ensureConfigDir(): Promise<void> {
    if (!existsSync(this.configDir)) {
      await fs.mkdir(this.configDir, { recursive: true })
    }
  }

  /**
   * Get file path for config type
   */
  private getFilePath(type: ConfigType): string {
    return path.join(this.configDir, `${type}.json`)
  }

  /**
   * Load configuration from file
   * SPEC-CF-AS-003, SPEC-CF-AS-004
   */
  private async loadFile<T>(type: ConfigType, schema: any): Promise<T[]> {
    const filePath = this.getFilePath(type)

    try {
      if (!existsSync(filePath)) {
        // SPEC-CF-AS-005: Return default if file doesn't exist
        return []
      }

      // SPEC-CF-AS-004: Files are readable and editable manually
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)

      // SPEC-CF-AS-006: Validate with Zod schema
      const validated = data.map((item: unknown) => schema.parse(item))
      return validated
    } catch (error) {
      console.error(`Error loading ${type} config:`, error)
      // SPEC-CF-AS-007: On error, return empty array (safe fallback)
      return []
    }
  }

  /**
   * Save configuration to file
   * SPEC-CF-AS-008
   */
  private async saveFile<T>(type: ConfigType, data: T[]): Promise<void> {
    await this.ensureConfigDir()

    const filePath = this.getFilePath(type)

    try {
      // SPEC-CF-AS-004: JSON format, human-readable
      const content = JSON.stringify(data, null, 2)
      await fs.writeFile(filePath, content, 'utf-8')

      // SPEC-CF-AS-009: Invalidate cache
      this.cache = null
    } catch (error) {
      console.error(`Error saving ${type} config:`, error)
      throw error
    }
  }

  /**
   * Load all configurations
   * SPEC-CF-AS-010: Lazy loading
   */
  async loadAll(): Promise<ConfigData> {
    // SPEC-CF-AS-011: Return cached if available
    if (this.cache) {
      return this.cache
    }

    const [portals, modules, instances] = await Promise.all([
      this.loadFile<Portal>('portals', PortalSchema),
      this.loadFile<Module>('modules', ModuleSchema),
      this.loadFile<Instance>('instances', InstanceSchema),
    ])

    this.cache = { portals, modules, instances }
    return this.cache
  }

  /**
   * Get all portals
   */
  async getPortals(): Promise<Portal[]> {
    const config = await this.loadAll()
    return config.portals
  }

  /**
   * Get portal by ID
   */
  async getPortalById(portalId: string): Promise<Portal | null> {
    const portals = await this.getPortals()
    return portals.find((p) => p.portalId === portalId) || null
  }

  /**
   * Save portals
   */
  async savePortals(portals: Portal[]): Promise<void> {
    await this.saveFile('portals', portals)
  }

  /**
   * Get all modules
   */
  async getModules(): Promise<Module[]> {
    const config = await this.loadAll()
    return config.modules
  }

  /**
   * Get module by ID
   */
  async getModuleById(moduleId: string): Promise<Module | null> {
    const modules = await this.getModules()
    return modules.find((m) => m.moduleId === moduleId) || null
  }

  /**
   * Save modules
   */
  async saveModules(modules: Module[]): Promise<void> {
    await this.saveFile('modules', modules)
  }

  /**
   * Get all instances
   */
  async getInstances(): Promise<Instance[]> {
    const config = await this.loadAll()
    return config.instances
  }

  /**
   * Get instances by portal ID
   */
  async getInstancesByPortal(portalId: string): Promise<Instance[]> {
    const instances = await this.getInstances()
    return instances.filter((i) => i.portalId === portalId)
  }

  /**
   * Get instance by ID
   */
  async getInstanceById(instanceId: string, portalId: string): Promise<Instance | null> {
    const instances = await this.getInstances()
    return instances.find((i) => i.instanceId === instanceId && i.portalId === portalId) || null
  }

  /**
   * Save instances
   */
  async saveInstances(instances: Instance[]): Promise<void> {
    await this.saveFile('instances', instances)
  }

  /**
   * Clear cache
   * SPEC-CF-AS-009
   */
  clearCache(): void {
    this.cache = null
  }
}

// Singleton instance
export const configService = new ConfigService()
