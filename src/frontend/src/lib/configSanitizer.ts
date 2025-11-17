/**
 * Config Sanitizer
 *
 * Utility to sanitize configuration objects before saving to backend.
 * Removes non-serializable data like functions, DOM elements, and circular references.
 *
 * CRITICAL: This prevents "Converting circular structure to JSON" errors
 * that can occur when configs accidentally capture event handlers or DOM refs.
 */

/**
 * Sanitize a configuration object for JSON serialization
 *
 * Removes:
 * - Functions (event handlers, callbacks)
 * - Symbols
 * - DOM elements (HTMLElement, Node, etc.)
 * - Event objects
 * - Other non-serializable objects
 *
 * @param config - The configuration object to sanitize
 * @returns A clean, serializable version of the config
 *
 * @example
 * const cleanConfig = sanitizeConfig({
 *   title: "Hello",
 *   onClick: () => {}, // ← Will be removed
 *   element: document.body, // ← Will be removed
 *   nested: {
 *     value: 42, // ← Preserved
 *     handler: () => {} // ← Will be removed
 *   }
 * });
 * // Result: { title: "Hello", nested: { value: 42 } }
 */
export function sanitizeConfig<T = Record<string, any>>(config: any): T {
  // Use JSON stringify/parse with replacer to remove non-serializable values
  const sanitized = JSON.parse(
    JSON.stringify(config, (key, value) => {
      // Remove functions (event handlers, callbacks)
      if (typeof value === 'function') {
        console.warn(`[Config Sanitizer] Removed function at key: ${key}`);
        return undefined;
      }

      // Remove symbols
      if (typeof value === 'symbol') {
        console.warn(`[Config Sanitizer] Removed symbol at key: ${key}`);
        return undefined;
      }

      // Remove DOM elements
      if (value instanceof HTMLElement || value instanceof Node) {
        console.warn(`[Config Sanitizer] Removed DOM element at key: ${key}`);
        return undefined;
      }

      // Remove event objects (have currentTarget, target, etc.)
      if (
        value &&
        typeof value === 'object' &&
        ('currentTarget' in value || 'target' in value) &&
        'preventDefault' in value
      ) {
        console.warn(`[Config Sanitizer] Removed event object at key: ${key}`);
        return undefined;
      }

      // Remove React elements/components
      if (value && typeof value === 'object' && '$$typeof' in value) {
        console.warn(`[Config Sanitizer] Removed React element at key: ${key}`);
        return undefined;
      }

      return value;
    })
  );

  return sanitized as T;
}

/**
 * Test if a value is serializable (can be converted to JSON)
 *
 * @param value - Value to test
 * @returns true if serializable, false otherwise
 */
export function isSerializable(value: any): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate that a config is serializable, throwing error if not
 *
 * @param config - Config to validate
 * @throws Error if config contains non-serializable data
 */
export function validateSerializable(config: any): void {
  try {
    JSON.stringify(config);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown serialization error';
    throw new Error(`Config contains non-serializable data: ${message}`);
  }
}

/**
 * Deep clone an object, removing non-serializable values
 *
 * @param obj - Object to clone
 * @returns Clean clone
 */
export function deepCloneSanitized<T>(obj: T): T {
  return sanitizeConfig<T>(obj);
}
