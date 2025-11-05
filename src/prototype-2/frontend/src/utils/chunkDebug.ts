/**
 * Development utilities for debugging code splitting
 * Only active in development mode
 */

export function logChunkLoad(chunkName: string, size?: number) {
  if (import.meta.env.DEV) {
    console.log(
      `[Chunk Loaded] ${chunkName}${size ? ` (${(size / 1024).toFixed(2)} KB)` : ''}`
    );
  }
}

export function logChunkError(chunkName: string, error: Error) {
  if (import.meta.env.DEV) {
    console.error(`[Chunk Error] Failed to load ${chunkName}:`, error);
  }
}

/**
 * Expose module registry for debugging in console
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__LAZY_CHUNKS__ = {
    loaded: new Set<string>(),
    failed: new Set<string>(),

    logStatus() {
      console.log('Loaded chunks:', Array.from(this.loaded));
      console.log('Failed chunks:', Array.from(this.failed));
    }
  };
}
