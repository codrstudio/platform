// Configuration Service
// Based on SPEC-configuration.md (SPEC-CF-AS-*)

import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { RealmSchema, PortalSchema, ModuleSchema, InstanceSchema } from '../types/config.types.js'
import type { Realm, Portal, Module, Instance, ConfigType, ConfigData } from '../types/config.types.js'

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
   * Load realms from file
   * Realms are stored as an object, not array
   * SPEC-RM-PS-001 to SPEC-RM-PS-004
   */
  private async loadRealms(): Promise<Realm[]> {
    const filePath = this.getFilePath('realms')

    try {
      if (!existsSync(filePath)) {
        // SPEC-RM-PS-003: Create file with default realm
        await this.ensureDefaultRealm()
      }

      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)

      // Realms stored as object: { "realms": { "default": {...}, ... } }
      const realmsObj = data.realms || {}
      const realms = Object.values(realmsObj).map((item: unknown) => RealmSchema.parse(item))

      return realms
    } catch (error) {
      console.error('Error loading realms config:', error)
      // Fallback: return default realm
      return [
        {
          realmId: 'default',
          name: 'Padrão',
          removable: false,
          config: {},
        },
      ]
    }
  }

  /**
   * Save realms to file
   * Convert array back to object format for storage
   */
  private async saveRealms(realms: Realm[]): Promise<void> {
    await this.ensureConfigDir()

    const filePath = this.getFilePath('realms')

    try {
      // Convert array to object: { "realms": { "default": {...}, ... } }
      const realmsObj = realms.reduce(
        (acc, realm) => {
          acc[realm.realmId] = realm
          return acc
        },
        {} as Record<string, Realm>
      )

      const content = JSON.stringify({ realms: realmsObj }, null, 2)
      await fs.writeFile(filePath, content, 'utf-8')

      // Invalidate cache
      this.cache = null
    } catch (error) {
      console.error('Error saving realms config:', error)
      throw error
    }
  }

  /**
   * Ensure default realm exists
   * SPEC-RM-DF-001 to SPEC-RM-DF-003
   */
  private async ensureDefaultRealm(): Promise<void> {
    const defaultRealm: Realm = {
      realmId: 'default',
      name: 'Padrão',
      description: 'Ambiente padrão da plataforma',
      removable: false,
      config: {
        theme: {
          mode: 'system',
          brandColor: '221 83% 53%',
        },
      },
    }

    await this.saveRealms([defaultRealm])
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

    const [realms, portals, modules, instances] = await Promise.all([
      this.loadRealms(),
      this.loadFile<Portal>('portals', PortalSchema),
      this.loadFile<Module>('modules', ModuleSchema),
      this.loadFile<Instance>('instances', InstanceSchema),
    ])

    this.cache = { realms, portals, modules, instances }
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

  // ============================================================
  // REALM METHODS
  // SPEC-RM-CR-001 to SPEC-RM-CR-025
  // ============================================================

  /**
   * Get all realms
   * SPEC-RM-CR-001 to SPEC-RM-CR-004
   */
  async getRealms(): Promise<Realm[]> {
    const config = await this.loadAll()
    // SPEC-RM-CR-004: Order with "default" first, then alphabetical
    return config.realms.sort((a, b) => {
      if (a.realmId === 'default') return -1
      if (b.realmId === 'default') return 1
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Get realm by ID
   * SPEC-RM-CR-005 to SPEC-RM-CR-007
   */
  async getRealmById(realmId: string): Promise<Realm | null> {
    const realms = await this.getRealms()
    return realms.find((r) => r.realmId === realmId) || null
  }

  /**
   * Get portal count for realm
   * Used for SPEC-RM-CR-007
   */
  async getRealmPortalCount(realmId: string): Promise<number> {
    const portals = await this.getPortals()
    return portals.filter((p) => p.realmId === realmId).length
  }

  /**
   * Create new realm
   * SPEC-RM-CR-008 to SPEC-RM-CR-014
   */
  async createRealm(realm: Realm): Promise<void> {
    const realms = await this.getRealms()

    // SPEC-RM-CR-011: Validate uniqueness
    if (realms.some((r) => r.realmId === realm.realmId)) {
      throw new Error(`Realm with ID "${realm.realmId}" already exists`)
    }

    // SPEC-RM-CR-014: Cannot create realm with ID "default"
    if (realm.realmId === 'default') {
      throw new Error('Cannot create realm with ID "default" (reserved)')
    }

    // SPEC-RM-CR-012: Validate format (already done by Zod schema)
    // SPEC-RM-CR-013: removable defaults to true (handled by schema)

    realms.push(realm)
    await this.saveRealms(realms)
  }

  /**
   * Update realm
   * SPEC-RM-CR-015 to SPEC-RM-CR-019
   */
  async updateRealm(realmId: string, updates: Partial<Omit<Realm, 'realmId' | 'removable'>>): Promise<void> {
    const realms = await this.getRealms()
    const index = realms.findIndex((r) => r.realmId === realmId)

    if (index === -1) {
      throw new Error(`Realm "${realmId}" not found`)
    }

    // SPEC-RM-CR-017: Cannot update realmId or removable
    // SPEC-RM-CR-018: Cannot rename default realm
    if (realmId === 'default' && updates.name && updates.name !== realms[index].name) {
      throw new Error('Cannot rename realm "default"')
    }

    // Merge updates
    realms[index] = {
      ...realms[index],
      ...updates,
      realmId, // Ensure realmId stays the same
      removable: realms[index].removable, // Ensure removable stays the same
    }

    await this.saveRealms(realms)
  }

  /**
   * Delete realm
   * SPEC-RM-CR-020 to SPEC-RM-CR-025
   */
  async deleteRealm(realmId: string): Promise<void> {
    const realms = await this.getRealms()
    const realm = realms.find((r) => r.realmId === realmId)

    if (!realm) {
      throw new Error(`Realm "${realmId}" not found`)
    }

    // SPEC-RM-CR-021: Cannot delete non-removable realms
    if (!realm.removable) {
      throw new Error(`Realm "${realmId}" is not removable`)
    }

    // SPEC-RM-CR-022 to SPEC-RM-CR-025: Reassign portals to "default"
    const portals = await this.getPortals()
    const affectedPortals = portals.filter((p) => p.realmId === realmId)

    if (affectedPortals.length > 0) {
      affectedPortals.forEach((portal) => {
        portal.realmId = 'default'
      })
      await this.savePortals(portals)
    }

    // Remove realm
    const updatedRealms = realms.filter((r) => r.realmId !== realmId)
    await this.saveRealms(updatedRealms)
  }

  /**
   * Get realm configuration
   * Used for theme resolution
   */
  async getRealmConfig(realmId: string): Promise<Realm['config'] | null> {
    const realm = await this.getRealmById(realmId)
    return realm?.config || null
  }

  /**
   * Set realm configuration
   * Updates only the config field
   */
  async setRealmConfig(realmId: string, config: Realm['config']): Promise<void> {
    await this.updateRealm(realmId, { config })
  }
}

// Singleton instance
export const configService = new ConfigService()
