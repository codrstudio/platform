import fs from 'fs/promises';
import path from 'path';

/**
 * ConfigCacheService
 *
 * In-memory cache for configuration files.
 * Provides read-through caching with manual invalidation.
 *
 * SPEC References:
 * - SPEC-CF-AS-012:013: Configuration reload
 *
 * Task 1.7.6 - Hot reload de configurações
 */
export class ConfigCacheService {
  private cache: Map<string, any[]>;
  private readonly configDir: string;

  constructor() {
    this.cache = new Map();
    this.configDir = path.join(process.cwd(), 'config');
  }

  /**
   * Get cached configuration or load from file
   *
   * @param entity - Entity type (portal, module, instance)
   * @returns Configuration array
   */
  async get(entity: string): Promise<any[]> {
    // Check cache first
    if (this.cache.has(entity)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ConfigCache] Cache hit: ${entity}`);
      }
      return this.cache.get(entity)!;
    }

    // Cache miss - load from file
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ConfigCache] Cache miss, loading: ${entity}`);
    }
    const data = await this.loadFromFile(entity);
    this.cache.set(entity, data);
    return data;
  }

  /**
   * Update cache
   *
   * @param entity - Entity type
   * @param data - Configuration data
   */
  set(entity: string, data: any[]): void {
    this.cache.set(entity, data);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ConfigCache] Cache updated: ${entity}`);
    }
  }

  /**
   * Invalidate specific cache entry
   *
   * @param entity - Entity type to invalidate
   */
  invalidate(entity: string): void {
    this.cache.delete(entity);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ConfigCache] Invalidated: ${entity}`);
    }
  }

  /**
   * Invalidate entire cache
   */
  invalidateAll(): void {
    this.cache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('[ConfigCache] Invalidated all entries');
    }
  }

  /**
   * Load configuration from file
   */
  private async loadFromFile(entity: string): Promise<any[]> {
    const fileNames: Record<string, string> = {
      portal: 'portals.json',
      module: 'modules.json',
      instance: 'instances.json',
    };

    const fileName = fileNames[entity];
    if (!fileName) {
      throw new Error(`Unknown entity: ${entity}`);
    }

    const filePath = path.join(this.configDir, fileName);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return Array.isArray(data) ? data : [data];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return []; // File not found - return empty array
      }
      throw error;
    }
  }
}

export const configCache = new ConfigCacheService();
