import pkg from 'lodash';
const { isPlainObject, isArray, isString, isNumber } = pkg;
import type { ValidationRules } from '../config/validationRules.js';

/**
 * Parameter Validators
 *
 * Reusable validation functions for JQEL query parameters.
 *
 * SPEC References:
 * - SPEC-DA-VAL-007:011: Backend validation
 * - SPEC-DA-SEC-001:004: Injection prevention
 */

/**
 * Validate field name against SQL/NoSQL injection patterns
 *
 * SPEC-DA-SEC-001: Use parameterized queries, validate field names
 *
 * @param field - Field name to validate
 * @returns True if valid
 * @throws Error if invalid with specific reason
 */
export function isValidFieldName(field: string): boolean {
  if (!isString(field) || field.trim() === '') {
    throw new Error('Field name must be a non-empty string');
  }

  // Check for MongoDB operator injection (starts with $)
  if (field.startsWith('$')) {
    throw new Error(`Field name cannot start with '$': ${field}`);
  }

  // Check for dangerous SQL/NoSQL patterns
  // Note: We block EXACT matches or field names that ARE keywords themselves,
  // NOT fields that merely contain these as substrings (e.g., "description" is OK)
  const exactBlockedNames = [
    'select', 'drop', 'delete', 'insert', 'update', 'union',
    'exec', 'execute', 'script', 'javascript', 'alert',
    'eval', 'function', 'constructor',
  ];

  const lowerField = field.toLowerCase();

  // Block exact matches (entire field name is a keyword)
  if (exactBlockedNames.includes(lowerField)) {
    throw new Error(`Field name is a blocked keyword: ${field}`);
  }

  // Block dangerous characters/patterns (SQL comment syntax, etc.)
  const dangerousPatterns = ['--', '/*', '*/', ';', 'xp_'];
  for (const pattern of dangerousPatterns) {
    if (lowerField.includes(pattern)) {
      throw new Error(`Field name contains blocked pattern: ${pattern}`);
    }
  }

  // Valid pattern: alphanumeric + underscore, optionally with dot for nested fields
  // Examples: "user_id", "user.email", "created_at"
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
  if (!validPattern.test(field)) {
    throw new Error(
      `Field name contains invalid characters: ${field}. ` +
      `Must be alphanumeric + underscore, optionally with dots for nested fields`
    );
  }

  return true;
}

/**
 * Validate operator against whitelist
 *
 * @param operator - Operator to validate (e.g., "$eq", "$in")
 * @param allowedOperators - Whitelist of allowed operators
 * @param blocklistedOperators - Blocklist of dangerous operators
 * @returns True if valid
 * @throws Error if invalid
 */
export function isValidOperator(
  operator: string,
  allowedOperators: string[],
  blocklistedOperators: string[]
): boolean {
  if (!isString(operator)) {
    throw new Error('Operator must be a string');
  }

  // Check blocklist first (security)
  if (blocklistedOperators.includes(operator)) {
    throw new Error(
      `Operator '${operator}' is blocked for security reasons`
    );
  }

  // Check whitelist
  if (!allowedOperators.includes(operator)) {
    throw new Error(
      `Operator '${operator}' is not allowed. Allowed: ${allowedOperators.join(', ')}`
    );
  }

  return true;
}

/**
 * Validate WHERE clause structure
 *
 * SPEC-DA-VAL-007: Backend validates structure
 * SPEC-DA-SEC-002: Sanitize WHERE values
 *
 * @param where - WHERE clause object
 * @param rules - Validation rules for schema
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateWhereClause(
  where: Record<string, any>,
  rules: ValidationRules
): boolean {
  if (!isPlainObject(where)) {
    throw new Error('WHERE clause must be an object');
  }

  if (Object.keys(where).length === 0) {
    throw new Error('WHERE clause cannot be empty');
  }

  // Validate each field and its conditions
  for (const [field, conditions] of Object.entries(where)) {
    // Validate field name
    try {
      isValidFieldName(field);
    } catch (error: any) {
      throw new Error(`Invalid field in WHERE: ${error.message}`);
    }

    // Conditions must be an object with operators
    if (!isPlainObject(conditions)) {
      throw new Error(
        `WHERE conditions for '${field}' must be an object with operators (e.g., { $eq: "value" })`
      );
    }

    // Validate each operator
    for (const [operator, value] of Object.entries(conditions)) {
      try {
        isValidOperator(operator, rules.allowedOperators, rules.blocklistedOperators);
      } catch (error: any) {
        throw new Error(`Invalid operator for field '${field}': ${error.message}`);
      }

      // Check for injection patterns in string values
      if (isString(value)) {
        checkForInjectionPatterns(value as string, `WHERE.${field}.${operator}`);
      }

      // Validate $in/$nin arrays
      if (['$in', '$nin'].includes(operator)) {
        if (!isArray(value)) {
          throw new Error(`Operator '${operator}' requires an array value`);
        }

        if ((value as any[]).length === 0) {
          throw new Error(`Operator '${operator}' array cannot be empty`);
        }

        if ((value as any[]).length > 100) {
          throw new Error(`Operator '${operator}' array cannot exceed 100 items`);
        }

        // Check each array item for injection
        (value as any[]).forEach((item: any, index: number) => {
          if (isString(item)) {
            checkForInjectionPatterns(item as string, `WHERE.${field}.${operator}[${index}]`);
          }
        });
      }
    }
  }

  return true;
}

/**
 * Validate OPTIONS clause
 *
 * SPEC-DA-PERF-008:011: Enforce pagination and ordering limits
 *
 * @param options - OPTIONS object
 * @param rules - Validation rules for schema
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateOptions(
  options: {
    limit?: number;
    offset?: number;
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
  },
  rules: ValidationRules
): boolean {
  if (!isPlainObject(options)) {
    throw new Error('OPTIONS must be an object');
  }

  // Validate limit
  if (options.limit !== undefined) {
    if (!isNumber(options.limit) || !Number.isInteger(options.limit)) {
      throw new Error('OPTIONS.limit must be an integer');
    }

    if (options.limit < 1) {
      throw new Error('OPTIONS.limit must be at least 1');
    }

    if (options.limit > rules.maxLimit) {
      throw new Error(
        `OPTIONS.limit cannot exceed ${rules.maxLimit} (requested: ${options.limit})`
      );
    }
  }

  // Validate offset
  if (options.offset !== undefined) {
    if (!isNumber(options.offset) || !Number.isInteger(options.offset)) {
      throw new Error('OPTIONS.offset must be an integer');
    }

    if (options.offset < 0) {
      throw new Error('OPTIONS.offset must be non-negative');
    }

    if (options.offset > rules.maxOffset) {
      throw new Error(
        `OPTIONS.offset cannot exceed ${rules.maxOffset} (requested: ${options.offset})`
      );
    }
  }

  // Validate orderBy
  if (options.orderBy !== undefined) {
    if (!isArray(options.orderBy)) {
      throw new Error('OPTIONS.orderBy must be an array');
    }

    if (options.orderBy.length === 0) {
      throw new Error('OPTIONS.orderBy cannot be empty');
    }

    if (options.orderBy.length > rules.maxOrderByFields) {
      throw new Error(
        `OPTIONS.orderBy cannot exceed ${rules.maxOrderByFields} fields (requested: ${options.orderBy.length})`
      );
    }

    // Validate each orderBy entry
    options.orderBy.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        throw new Error(`OPTIONS.orderBy[${index}] must be an object`);
      }

      const fields = Object.keys(entry);
      if (fields.length !== 1) {
        throw new Error(
          `OPTIONS.orderBy[${index}] must have exactly one field (has ${fields.length})`
        );
      }

      const [field, direction] = Object.entries(entry)[0];

      // Validate field name
      try {
        isValidFieldName(field);
      } catch (error: any) {
        throw new Error(`Invalid field in OPTIONS.orderBy[${index}]: ${error.message}`);
      }

      // Validate direction
      if (direction !== 'asc' && direction !== 'desc') {
        throw new Error(
          `OPTIONS.orderBy[${index}] direction must be 'asc' or 'desc' (got: '${direction}')`
        );
      }
    });
  }

  return true;
}

/**
 * Validate VALUES clause for mutations
 *
 * SPEC-DA-VAL-007: Backend validates structure
 *
 * @param values - VALUES object
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateValues(values: Record<string, any>): boolean {
  if (!isPlainObject(values)) {
    throw new Error('VALUES must be an object');
  }

  if (Object.keys(values).length === 0) {
    throw new Error('VALUES cannot be empty for mutation');
  }

  // Validate each field name
  for (const [field, value] of Object.entries(values)) {
    try {
      isValidFieldName(field);
    } catch (error: any) {
      throw new Error(`Invalid field in VALUES: ${error.message}`);
    }

    // Check for injection patterns in string values
    if (isString(value)) {
      checkForInjectionPatterns(value, `VALUES.${field}`);
    }
  }

  return true;
}

/**
 * Validate field list (OUTPUT/EXCEPT)
 *
 * @param fields - Array of field names
 * @param fieldType - "OUTPUT" or "EXCEPT" for error messages
 * @returns True if valid
 * @throws Error if invalid
 */
export function validateFieldList(fields: string[], fieldType: string): boolean {
  if (!isArray(fields)) {
    throw new Error(`${fieldType} must be an array`);
  }

  if (fields.length === 0) {
    throw new Error(`${fieldType} cannot be empty`);
  }

  // Validate each field name
  fields.forEach((field, index) => {
    if (!isString(field)) {
      throw new Error(`${fieldType}[${index}] must be a string`);
    }

    try {
      isValidFieldName(field);
    } catch (error: any) {
      throw new Error(`Invalid field in ${fieldType}[${index}]: ${error.message}`);
    }
  });

  return true;
}

/**
 * Check string value for SQL/NoSQL injection patterns
 *
 * SPEC-DA-SEC-002: Sanitize values
 *
 * @param value - String value to check
 * @param context - Context for error message (e.g., "WHERE.username.$eq")
 * @throws Error if injection pattern detected
 */
function checkForInjectionPatterns(value: string, context: string): void {
  // SQL injection patterns
  const sqlPatterns = [
    /(\b(select|insert|update|delete|drop|union|exec|execute)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bor\b\s+\d+\s*=\s*\d+)/i,
    /(\band\b\s+\d+\s*=\s*\d+)/i,
    /xp_/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(value)) {
      throw new Error(
        `Potential SQL injection detected in ${context}: pattern '${pattern.source}'`
      );
    }
  }

  // NoSQL injection patterns (JavaScript execution)
  const nosqlPatterns = [
    /\$where/i,
    /\bfunction\s*\(/i,
    /\beval\s*\(/i,
    /\bthis\./i,
    /Object\.keys/i,
  ];

  for (const pattern of nosqlPatterns) {
    if (pattern.test(value)) {
      throw new Error(
        `Potential NoSQL injection detected in ${context}: pattern '${pattern.source}'`
      );
    }
  }
}
