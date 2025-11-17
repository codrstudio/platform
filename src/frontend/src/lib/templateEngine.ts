/**
 * Template Engine - Safe expression evaluator
 *
 * Safely evaluates template expressions like "${name}" against data objects.
 *
 * Security features:
 * - NO eval() or Function() constructor
 * - Simple variable substitution only
 * - XSS protection via HTML escaping
 * - Supports nested paths (e.g., ${user.name})
 *
 * @example
 * const template = "Hello ${name}, your role is ${role}";
 * const data = { name: "John", role: "Admin" };
 * const result = evaluateTemplate(template, data);
 * // Returns: "Hello John, your role is Admin"
 */

/**
 * HTML escape map for XSS protection
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (m) => HTML_ESCAPE_MAP[m]);
}

/**
 * Gets nested value from object using dot notation path
 *
 * @example
 * getNestedValue({ user: { name: "John" } }, "user.name") // "John"
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: any, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Validates if a path is safe (only alphanumeric, underscore, and dots)
 */
function isValidPath(path: string): boolean {
  return /^[a-zA-Z0-9_\.]+$/.test(path);
}

/**
 * Evaluates a template string with variable substitution
 *
 * @param template - Template string with ${variable} placeholders
 * @param data - Data object with values to substitute
 * @param options - Optional configuration
 * @returns Evaluated string with variables replaced
 *
 * @example
 * evaluateTemplate("Hello ${name}", { name: "World" }) // "Hello World"
 * evaluateTemplate("${user.email}", { user: { email: "test@example.com" } }) // "test@example.com"
 */
export function evaluateTemplate(
  template: string,
  data: Record<string, unknown>,
  options?: {
    escapeHtml?: boolean; // Default: true
    throwOnMissing?: boolean; // Default: false
  }
): string {
  const { escapeHtml: shouldEscape = true, throwOnMissing = false } = options || {};

  // Pattern: ${variableName} or ${path.to.value}
  const pattern = /\$\{([a-zA-Z0-9_\.]+)\}/g;

  return template.replace(pattern, (match, path) => {
    // Validate path for security
    if (!isValidPath(path)) {
      if (throwOnMissing) {
        throw new Error(`Invalid template path: ${path}`);
      }
      return match; // Return original if invalid
    }

    const value = getNestedValue(data, path);

    if (value === undefined || value === null) {
      if (throwOnMissing) {
        throw new Error(`Template variable not found: ${path}`);
      }
      return ''; // Return empty string for missing values
    }

    const stringValue = String(value);
    return shouldEscape ? escapeHtml(stringValue) : stringValue;
  });
}

/**
 * Evaluates multiple templates against the same data
 * Useful for batch processing
 *
 * @example
 * const templates = {
 *   title: "${name}",
 *   subtitle: "Role: ${role}"
 * };
 * const data = { name: "John", role: "Admin" };
 * const result = evaluateTemplates(templates, data);
 * // Returns: { title: "John", subtitle: "Role: Admin" }
 */
export function evaluateTemplates<T extends Record<string, string>>(
  templates: T,
  data: Record<string, unknown>,
  options?: {
    escapeHtml?: boolean;
    throwOnMissing?: boolean;
  }
): T {
  const result = {} as T;

  for (const [key, template] of Object.entries(templates)) {
    if (typeof template === 'string') {
      result[key as keyof T] = evaluateTemplate(template, data, options) as T[keyof T];
    } else {
      result[key as keyof T] = template as T[keyof T];
    }
  }

  return result;
}

/**
 * Checks if a string contains template expressions
 *
 * @example
 * hasTemplateExpressions("Hello ${name}") // true
 * hasTemplateExpressions("Hello World") // false
 */
export function hasTemplateExpressions(str: string): boolean {
  return /\$\{[a-zA-Z0-9_\.]+\}/.test(str);
}

/**
 * Extracts all template variable names from a template string
 *
 * @example
 * extractTemplateVariables("${name} - ${role}") // ["name", "role"]
 * extractTemplateVariables("${user.name} ${user.email}") // ["user.name", "user.email"]
 */
export function extractTemplateVariables(template: string): string[] {
  const pattern = /\$\{([a-zA-Z0-9_\.]+)\}/g;
  const variables: string[] = [];
  let match;

  while ((match = pattern.exec(template)) !== null) {
    if (isValidPath(match[1])) {
      variables.push(match[1]);
    }
  }

  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Creates a template function for repeated evaluations
 * More efficient when evaluating the same template multiple times
 *
 * @example
 * const templateFn = createTemplateFunction("Hello ${name}");
 * templateFn({ name: "John" }) // "Hello John"
 * templateFn({ name: "Jane" }) // "Hello Jane"
 */
export function createTemplateFunction(
  template: string,
  options?: {
    escapeHtml?: boolean;
    throwOnMissing?: boolean;
  }
): (data: Record<string, unknown>) => string {
  // Pre-extract variables for efficiency
  const variables = extractTemplateVariables(template);

  return (data: Record<string, unknown>) => {
    // Pre-validate that all required variables exist if throwOnMissing is true
    if (options?.throwOnMissing) {
      for (const variable of variables) {
        const value = getNestedValue(data, variable);
        if (value === undefined || value === null) {
          throw new Error(`Template variable not found: ${variable}`);
        }
      }
    }

    return evaluateTemplate(template, data, options);
  };
}

/**
 * Safe template literal tag function
 * Can be used as a template tag for safe interpolation
 *
 * @example
 * const name = "John";
 * const result = safe`Hello ${name}`; // "Hello John" (escaped)
 */
export function safe(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const stringValue = value !== undefined && value !== null ? String(value) : '';
    result += escapeHtml(stringValue) + strings[i + 1];
  }

  return result;
}

// Export types
export type TemplateOptions = {
  escapeHtml?: boolean;
  throwOnMissing?: boolean;
};

export type TemplateFunction = (data: Record<string, unknown>) => string;