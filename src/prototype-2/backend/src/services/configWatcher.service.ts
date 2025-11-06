import fs from 'fs';
import path from 'path';
import { debounce } from '../utils/debounce.js';
import { configCache } from './configCache.service.js';
import { redisService } from './redis.service.js';
import type { PlatformEvent } from '../types/events.types.js';

/**
 * ConfigWatcherService
 *
 * Watches configuration files for changes and broadcasts events.
 *
 * SPEC References:
 * - SPEC-CF-AS-012:013: Hot reload of configurations
 *
 * Task 1.7.6 - Hot reload de configurações
 */
export class ConfigWatcherService {
  private watcher: fs.FSWatcher | null = null;
  private readonly configDir: string;
  private readonly entityMap: Record<string, string> = {
    'portals.json': 'portal',
    'modules.json': 'module',
    'instances.json': 'instance',
  };

  constructor() {
    this.configDir = path.join(process.cwd(), 'config');
  }

  /**
   * Initialize file watcher
   */
  async initialize(): Promise<void> {
    try {
      console.log('\n🔍 Starting configuration file watcher...');

      // Debounced handler (300ms delay)
      const debouncedHandler = debounce(
        this.handleFileChange.bind(this),
        300
      );

      // Watch config directory
      this.watcher = fs.watch(
        this.configDir,
        { encoding: 'utf8' },
        (eventType, filename) => {
          if (!filename) return;

          // Only watch JSON files
          if (!filename.endsWith('.json')) return;

          // Only watch our config files
          if (!this.entityMap[filename]) return;

          if (process.env.NODE_ENV === 'development') {
            console.log(`[ConfigWatcher] File ${eventType}: ${filename}`);
          }

          debouncedHandler(filename);
        }
      );

      console.log('✅ Configuration file watcher started\n');
    } catch (error) {
      console.error('❌ Failed to start config watcher:', error);
      throw error;
    }
  }

  /**
   * Shutdown file watcher
   */
  async shutdown(): Promise<void> {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('✅ Configuration file watcher stopped');
    }
  }

  /**
   * Handle file change event
   */
  private async handleFileChange(filename: string): Promise<void> {
    try {
      const entity = this.entityMap[filename];
      if (!entity) return;

      console.log(`🔄 Reloading ${entity} configuration...`);

      // Invalidate cache
      configCache.invalidate(entity);

      // Reload from file (validates JSON)
      try {
        await configCache.get(entity);
      } catch (error: any) {
        console.error(`❌ Invalid JSON in ${filename}, ignoring changes`);
        return; // Don't publish event if JSON is invalid
      }

      // Publish event to Redis
      await this.publishConfigChangedEvent(entity, filename);

      console.log(`✅ ${entity} configuration reloaded`);
    } catch (error) {
      console.error('[ConfigWatcher] Error handling file change:', error);
    }
  }

  /**
   * Publish config-changed event to Redis
   */
  private async publishConfigChangedEvent(
    entity: string,
    file: string
  ): Promise<void> {
    try {
      const event: PlatformEvent = {
        type: 'notification', // Using notification type as it's informational
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        category: 'config-changed',
        data: {
          entity,
          file,
          schema: 'backend',
          timestamp: new Date().toISOString(),
        },
      };

      const message = JSON.stringify(event);
      await redisService.publish('platform:events', message);

      if (process.env.NODE_ENV === 'development') {
        console.log('[ConfigWatcher] Published event:', {
          type: event.type,
          category: event.category,
          entity,
        });
      }
    } catch (error) {
      console.error('[ConfigWatcher] Failed to publish event:', error);
      // Non-fatal - local cache is still updated
    }
  }
}

export const configWatcher = new ConfigWatcherService();
