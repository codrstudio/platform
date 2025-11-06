export interface ValidationRules {
  maxLimit: number;
  maxOffset: number;
  maxOrderByFields: number;
  allowedOperators: string[];
  blocklistedOperators: string[]; // MongoDB-specific dangerous ops
  allowedEntities?: string[]; // Optional: entity whitelist per schema
}

/**
 * Schema-specific validation rules
 *
 * SPEC References:
 * - SPEC-DA-VAL-007:011: Backend validation rules
 * - SPEC-DA-PERF-008:011: Query optimization limits
 * - SPEC-DA-SEC-001:004: Injection prevention
 */
const validationRules: Record<string, ValidationRules> = {
  /**
   * Backend schema: Strict rules for platform config
   */
  backend: {
    maxLimit: 100,
    maxOffset: 1000,
    maxOrderByFields: 3,
    allowedOperators: ['$eq', '$ne', '$in', '$nin'],
    blocklistedOperators: ['$where', '$expr', '$function', '$accumulator', '$regex'],
    allowedEntities: ['portal', 'module', 'instance'],
  },

  /**
   * Platform schema: Standard rules for n8n queries
   */
  platform: {
    maxLimit: 1000,
    maxOffset: 10000,
    maxOrderByFields: 5,
    allowedOperators: [
      '$eq', '$ne',
      '$gt', '$gte', '$lt', '$lte',
      '$in', '$nin',
      '$like', '$notLike',
      '$between', '$notBetween',
      '$null', '$notNull',
    ],
    blocklistedOperators: ['$where', '$expr', '$function', '$accumulator'],
  },

  /**
   * Default rules for application schemas
   */
  default: {
    maxLimit: 1000,
    maxOffset: 10000,
    maxOrderByFields: 5,
    allowedOperators: [
      '$eq', '$ne',
      '$gt', '$gte', '$lt', '$lte',
      '$in', '$nin',
      '$like', '$notLike',
      '$between', '$notBetween',
      '$null', '$notNull',
    ],
    blocklistedOperators: ['$where', '$expr', '$function', '$accumulator'],
  },
};

/**
 * Get validation rules for a schema
 */
export function getValidationRules(schema: string): ValidationRules {
  return validationRules[schema] || validationRules.default;
}

export default validationRules;
