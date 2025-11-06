import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { redisService } from './redis.service.js';

/**
 * SPEC-CF-AS-001: Application Settings stored in JSON files
 * SPEC-CF-AS-002: Files in /config directory
 * SPEC-CF-AS-004: Files must be readable and editable manually
 * SPEC-CF-AS-013: After manual edit, backend must reload configurations
 *
 * Service for managing application configuration files with hot reload
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portal configuration schema validation (SPEC-C-P-*)
const portalSchema = z.object({
  portalId: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean(),
  activeModules: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
});

// Module configuration schema validation (SPEC-C-M-*)
const moduleSchema = z.object({
  moduleId: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  type: z.enum(['component', 'functionality']),
  version: z.string(),
  enabled: z.boolean(),
  dependencies: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Instance configuration schema validation (SPEC-C-I-*)
const instanceSchema = z.object({
  instanceId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  portalId: z.string(),
  moduleId: z.string(),
  config: z.record(z.any()),
  active: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

type Portal = z.infer<typeof portalSchema>;
type Module = z.infer<typeof moduleSchema>;
type Instance = z.infer<typeof instanceSchema>;

interface ConfigCache {
  portals: Portal[];
  modules: Module[];
  instances: Instance[];
}

class ConfigService {
  private cache: ConfigCache | null = null;
  private configDir: string;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private readonly REDIS_CONFIG_CHANNEL = 'platform:config:changed';

  constructor() {
    // Config directory is at backend/config/
    this.configDir = path.resolve(__dirname, '../../config');
    this.ensureConfigDirectory();
  }

  /**
   * SPEC-CF-AS-004: Files must be readable and editable manually
   * Ensure config directory exists
   */
  private ensureConfigDirectory(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      console.log(`[ConfigService] Created config directory: ${this.configDir}`);
    }
  }

  /**
   * Get path to config file
   */
  private getConfigPath(filename: string): string {
    return path.join(this.configDir, filename);
  }

  /**
   * SPEC-CF-AS-001: Load configuration from JSON files
   * Load and validate a config file
   */
  private loadConfigFile<T>(
    filename: string,
    schema: z.ZodSchema<T>,
    defaultValue: T[] = []
  ): T[] {
    const filePath = this.getConfigPath(filename);

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`[ConfigService] Config file not found, using defaults: ${filename}`);
        return defaultValue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Validate each item in array
      if (!Array.isArray(data)) {
        console.error(`[ConfigService] Config file is not an array: ${filename}`);
        return defaultValue;
      }

      const validated = data.map((item, index) => {
        const result = schema.safeParse(item);
        if (!result.success) {
          console.error(
            `[ConfigService] Validation failed for ${filename}[${index}]:`,
            result.error.format()
          );
          return null;
        }
        return result.data;
      }).filter((item): item is T => item !== null);

      console.log(`[ConfigService] Loaded ${validated.length} items from ${filename}`);
      return validated;
    } catch (error: any) {
      console.error(`[ConfigService] Error loading ${filename}:`, error.message);
      return defaultValue;
    }
  }

  /**
   * SPEC-CF-AS-001: Load all configuration files
   * Load all configurations into cache
   */
  private loadConfigurations(): ConfigCache {
    console.log('[ConfigService] Loading configurations...');

    const portals = this.loadConfigFile('portals.json', portalSchema, []);
    const modules = this.loadConfigFile('modules.json', moduleSchema, []);
    const instances = this.loadConfigFile('instances.json', instanceSchema, []);

    return { portals, modules, instances };
  }

  /**
   * SPEC-CF-AS-013: After manual edit, backend must reload configurations
   * Reload configurations from disk
   */
  public reloadConfigurations(): void {
    console.log('[ConfigService] Reloading configurations...');
    this.cache = this.loadConfigurations();

    // SPEC-CF-AS-013: Broadcast change via Redis Pub/Sub
    this.broadcastConfigChange('all');
  }

  /**
   * Get current configurations (with lazy load)
   */
  public getConfigurations(): ConfigCache {
    if (!this.cache) {
      this.cache = this.loadConfigurations();
    }
    return this.cache;
  }

  /**
   * Get portals configuration
   */
  public getPortals(): Portal[] {
    return this.getConfigurations().portals;
  }

  /**
   * Get modules configuration
   */
  public getModules(): Module[] {
    return this.getConfigurations().modules;
  }

  /**
   * Get instances configuration
   */
  public getInstances(): Instance[] {
    return this.getConfigurations().instances;
  }

  /**
   * Save portals configuration to file
   */
  public savePortals(portals: Portal[]): void {
    const filePath = this.getConfigPath('portals.json');
    fs.writeFileSync(filePath, JSON.stringify(portals, null, 2), 'utf-8');
    this.cache = null; // Invalidate cache
    this.broadcastConfigChange('portals');
  }

  /**
   * Save modules configuration to file
   */
  public saveModules(modules: Module[]): void {
    const filePath = this.getConfigPath('modules.json');
    fs.writeFileSync(filePath, JSON.stringify(modules, null, 2), 'utf-8');
    this.cache = null; // Invalidate cache
    this.broadcastConfigChange('modules');
  }

  /**
   * Save instances configuration to file
   */
  public saveInstances(instances: Instance[]): void {
    const filePath = this.getConfigPath('instances.json');
    fs.writeFileSync(filePath, JSON.stringify(instances, null, 2), 'utf-8');
    this.cache = null; // Invalidate cache
    this.broadcastConfigChange('instances');
  }

  /**
   * SPEC-CF-AS-013: Broadcast configuration changes via Redis Pub/Sub
   * Notify clients about configuration changes via SSE
   */
  private async broadcastConfigChange(configType: 'portals' | 'modules' | 'instances' | 'all'): Promise<void> {
    try {
      const event = {
        type: 'config_changed',
        configType,
        timestamp: new Date().toISOString(),
      };

      await redisService.publish(this.REDIS_CONFIG_CHANNEL, JSON.stringify(event));
      console.log(`[ConfigService] Broadcasted config change: ${configType}`);
    } catch (error: any) {
      console.error('[ConfigService] Failed to broadcast config change:', error.message);
    }
  }

  /**
   * Start watching configuration files for changes
   * Called by ConfigWatcher
   */
  public startWatching(): void {
    const filenames = ['portals.json', 'modules.json', 'instances.json'];

    for (const filename of filenames) {
      const filePath = this.getConfigPath(filename);

      if (fs.existsSync(filePath)) {
        try {
          const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
              console.log(`[ConfigService] Detected change in ${filename}`);
              this.reloadConfigurations();
            }
          });

          this.watchers.set(filename, watcher);
          console.log(`[ConfigService] Watching ${filename}`);
        } catch (error: any) {
          console.error(`[ConfigService] Failed to watch ${filename}:`, error.message);
        }
      }
    }
  }

  /**
   * Stop watching configuration files
   */
  public stopWatching(): void {
    for (const [filename, watcher] of this.watchers.entries()) {
      watcher.close();
      console.log(`[ConfigService] Stopped watching ${filename}`);
    }
    this.watchers.clear();
  }
}

// Singleton instance
export const configService = new ConfigService();

// Export types
export type { Portal, Module, Instance, ConfigCache };
