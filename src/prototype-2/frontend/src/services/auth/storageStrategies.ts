/**
 * Storage strategy interface for token persistence
 * Allows different storage backends (sessionStorage, localStorage, cookies)
 */
export interface StorageStrategy {
  /**
   * Save a value to storage
   * @param key - Storage key
   * @param value - Value to store
   */
  save(key: string, value: string): void;

  /**
   * Load a value from storage
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  load(key: string): string | null;

  /**
   * Remove a value from storage
   * @param key - Storage key
   */
  remove(key: string): void;

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   * @returns True if key exists
   */
  has(key: string): boolean;
}

/**
 * SessionStorage strategy - Tab-scoped, cleared on tab close
 * Used for access tokens (short-lived)
 */
export class SessionStorageStrategy implements StorageStrategy {
  save(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('sessionStorage.setItem failed:', error);
      // Fail silently - in-memory only mode
    }
  }

  load(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('sessionStorage.getItem failed:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('sessionStorage.removeItem failed:', error);
    }
  }

  has(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }
}

/**
 * LocalStorage strategy - Persistent across tabs and sessions
 * Used for refresh tokens (fallback when cookies unavailable)
 */
export class LocalStorageStrategy implements StorageStrategy {
  save(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage.setItem failed:', error);
      // Fail silently - in-memory only mode
    }
  }

  load(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem failed:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.removeItem failed:', error);
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }
}
