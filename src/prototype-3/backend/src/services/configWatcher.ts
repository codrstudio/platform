import { configService } from './configService.js';

/**
 * SPEC-CF-AS-012: After manual edit, reload configurations
 * SPEC-CF-AS-013: Backend must reload configurations after manual edit
 *
 * Service for watching configuration file changes with debouncing
 */

class ConfigWatcher {
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY_MS = 500; // Wait 500ms after last change
  private isWatching = false;

  /**
   * Start watching configuration files for changes
   * Uses debouncing to avoid multiple reloads on rapid file saves
   */
  public start(): void {
    if (this.isWatching) {
      console.log('[ConfigWatcher] Already watching configuration files');
      return;
    }

    console.log('[ConfigWatcher] Starting configuration file watcher...');
    configService.startWatching();
    this.isWatching = true;
  }

  /**
   * Stop watching configuration files
   */
  public stop(): void {
    if (!this.isWatching) {
      return;
    }

    console.log('[ConfigWatcher] Stopping configuration file watcher...');
    configService.stopWatching();

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isWatching = false;
  }

  /**
   * Debounced reload - waits for file changes to settle
   * This prevents multiple reloads when editor saves file multiple times
   */
  private debouncedReload(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      console.log('[ConfigWatcher] Debounce timer expired, reloading configurations...');
      configService.reloadConfigurations();
      this.debounceTimer = null;
    }, this.DEBOUNCE_DELAY_MS);
  }

  /**
   * Check if currently watching
   */
  public get watching(): boolean {
    return this.isWatching;
  }
}

// Singleton instance
export const configWatcher = new ConfigWatcher();
