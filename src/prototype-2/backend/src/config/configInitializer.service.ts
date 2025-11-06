import fs from 'fs/promises';
import path from 'path';
import type { Portal, Module, Instance } from '../types/config.types.js';

/**
 * ConfigInitializerService
 *
 * Ensures configuration files exist and are valid on startup.
 * Creates default configurations if files are missing.
 *
 * SPEC References:
 * - SPEC-CF-AS-001:004: Application Settings storage
 * - SPEC-CF-AS-009: Configuration structure
 *
 * @responsibilities
 * - Verify config directory exists
 * - Check existence of portals.json, modules.json, instances.json
 * - Create missing files with default configurations
 * - Validate JSON structure (array of objects with required fields)
 * - Log initialization status
 */
export class ConfigInitializerService {
  private readonly configDir: string;
  private readonly portalsPath: string;
  private readonly modulesPath: string;
  private readonly instancesPath: string;

  constructor() {
    this.configDir = path.join(process.cwd(), 'config');
    this.portalsPath = path.join(this.configDir, 'portals.json');
    this.modulesPath = path.join(this.configDir, 'modules.json');
    this.instancesPath = path.join(this.configDir, 'instances.json');
  }

  /**
   * Initialize configuration files
   * Called during application startup
   *
   * @throws Error if directory cannot be created or files cannot be written
   */
  async initialize(): Promise<void> {
    try {
      console.log('\n🔧 Initializing configuration files...');

      // Ensure config directory exists
      await this.ensureConfigDir();

      // Check and create files if needed
      await this.ensurePortalsFile();
      await this.ensureModulesFile();
      await this.ensureInstancesFile();

      console.log('✅ Configuration files ready\n');
    } catch (error: any) {
      console.error('\n❌ Configuration initialization failed:', error.message);
      console.error('   Stack:', error.stack);
      throw error; // Re-throw to stop server startup
    }
  }

  /**
   * Ensure config directory exists
   * Creates directory if missing
   *
   * @private
   */
  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
      console.log(`   ✓ Config directory exists: ${this.configDir}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`   📁 Creating config directory: ${this.configDir}`);
        await fs.mkdir(this.configDir, { recursive: true });
      } else {
        throw new Error(`Cannot access config directory: ${error.message}`);
      }
    }
  }

  /**
   * Ensure portals.json exists with valid structure
   *
   * @private
   */
  private async ensurePortalsFile(): Promise<void> {
    try {
      await fs.access(this.portalsPath);
      console.log('   ✓ portals.json exists');

      // Validate file structure
      await this.validatePortalsFile();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('   ⚠️  portals.json not found, creating with defaults');
        await this.createDefaultPortals();
      } else {
        throw error;
      }
    }
  }

  /**
   * Ensure modules.json exists with valid structure
   *
   * @private
   */
  private async ensureModulesFile(): Promise<void> {
    try {
      await fs.access(this.modulesPath);
      console.log('   ✓ modules.json exists');

      // Validate file structure
      await this.validateModulesFile();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('   ⚠️  modules.json not found, creating with defaults');
        await this.createDefaultModules();
      } else {
        throw error;
      }
    }
  }

  /**
   * Ensure instances.json exists with valid structure
   *
   * @private
   */
  private async ensureInstancesFile(): Promise<void> {
    try {
      await fs.access(this.instancesPath);
      console.log('   ✓ instances.json exists');

      // Validate file structure
      await this.validateInstancesFile();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('   ⚠️  instances.json not found, creating with defaults');
        await this.createDefaultInstances();
      } else {
        throw error;
      }
    }
  }

  /**
   * Validate portals.json structure
   *
   * @private
   */
  private async validatePortalsFile(): Promise<void> {
    try {
      const content = await fs.readFile(this.portalsPath, 'utf-8');
      const data = JSON.parse(content);

      if (!Array.isArray(data)) {
        console.warn('   ⚠️  portals.json is not an array (will be wrapped)');
      }

      // Validate required fields in objects
      const portals = Array.isArray(data) ? data : [data];
      for (const portal of portals) {
        if (!portal.portalId || !portal.name || !portal.path) {
          console.warn(`   ⚠️  Portal missing required fields:`, portal);
        }
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in portals.json: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate modules.json structure
   *
   * @private
   */
  private async validateModulesFile(): Promise<void> {
    try {
      const content = await fs.readFile(this.modulesPath, 'utf-8');
      const data = JSON.parse(content);

      if (!Array.isArray(data)) {
        console.warn('   ⚠️  modules.json is not an array (will be wrapped)');
      }

      // Validate required fields in objects
      const modules = Array.isArray(data) ? data : [data];
      for (const module of modules) {
        if (!module.moduleId || !module.name || !module.type) {
          console.warn(`   ⚠️  Module missing required fields:`, module);
        }
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in modules.json: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate instances.json structure
   *
   * @private
   */
  private async validateInstancesFile(): Promise<void> {
    try {
      const content = await fs.readFile(this.instancesPath, 'utf-8');
      const data = JSON.parse(content);

      if (!Array.isArray(data)) {
        console.warn('   ⚠️  instances.json is not an array (will be wrapped)');
      }

      // Validate required fields in objects
      const instances = Array.isArray(data) ? data : [data];
      for (const instance of instances) {
        if (!instance.instanceId || !instance.portalId || !instance.moduleId) {
          console.warn(`   ⚠️  Instance missing required fields:`, instance);
        }
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in instances.json: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create default portals.json
   *
   * Creates two default portals:
   * - main: Root portal at "/"
   * - setup: Setup portal at "/setup"
   *
   * @private
   */
  private async createDefaultPortals(): Promise<void> {
    const defaultPortals: Portal[] = [
      {
        portalId: 'main',
        name: 'Main Portal',
        path: '/',
        settingsKey: 'default',
        active: true,
        activeModules: ['setup'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        portalId: 'setup',
        name: 'Setup Portal',
        path: '/setup',
        settingsKey: 'default',
        active: true,
        activeModules: ['setup'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await this.writeJsonFile(this.portalsPath, defaultPortals);
    console.log('   ✅ Created portals.json with default configuration');
  }

  /**
   * Create default modules.json
   *
   * Creates setup module by default
   *
   * @private
   */
  private async createDefaultModules(): Promise<void> {
    const defaultModules: Module[] = [
      {
        moduleId: 'setup',
        name: 'Setup Module',
        type: 'functionality',
        version: '1.0.0',
        active: true,
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await this.writeJsonFile(this.modulesPath, defaultModules);
    console.log('   ✅ Created modules.json with default configuration');
  }

  /**
   * Create default instances.json
   *
   * Creates empty instances array (instances are created dynamically)
   *
   * @private
   */
  private async createDefaultInstances(): Promise<void> {
    const defaultInstances: Instance[] = [];

    await this.writeJsonFile(this.instancesPath, defaultInstances);
    console.log('   ✅ Created instances.json with empty configuration');
  }

  /**
   * Write JSON file with pretty formatting
   *
   * @param filePath - Absolute path to file
   * @param data - Data to write (will be stringified)
   * @private
   */
  private async writeJsonFile(filePath: string, data: any): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file with pretty formatting (2 spaces, UTF-8)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

/**
 * Singleton instance
 * Exported for use in app startup
 */
export const configInitializer = new ConfigInitializerService();
