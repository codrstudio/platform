import { Request, Response, NextFunction } from 'express';
import { getValidationRules } from '../config/validationRules.js';
import {
  validateWhereClause,
  validateOptions,
  validateValues,
  validateFieldList,
} from '../utils/parameterValidators.js';
import type { JQELQuery } from '../types/jqel.types.js';

/**
 * JQEL Parameter Validation Middleware
 *
 * Extended validation for JQEL query parameters (WHERE, OPTIONS, VALUES, OUTPUT/EXCEPT).
 *
 * SPEC References:
 * - SPEC-DA-VAL-007:011: Backend parameter validation
 * - SPEC-DA-SEC-001:004: SQL/NoSQL injection prevention
 * - SPEC-DA-PERF-008:011: Query optimization limits
 *
 * NOTE: This middleware runs AFTER jqelValidation.middleware which validates basic structure.
 */
export const jqelParameterValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const query = req.body as JQELQuery;

  try {
    // Load validation rules for this schema
    const rules = getValidationRules(query.schema);

    // Validate WHERE clause (if present)
    if (query.where) {
      try {
        validateWhereClause(query.where, rules);
      } catch (error: any) {
        res.status(400).json({
          code: 400,
          message: `WHERE validation failed: ${error.message}`,
          field: 'where',
        });
        return;
      }
    }

    // Validate OPTIONS (if present)
    if (query.options) {
      try {
        validateOptions(query.options, rules);
      } catch (error: any) {
        res.status(400).json({
          code: 400,
          message: `OPTIONS validation failed: ${error.message}`,
          field: 'options',
        });
        return;
      }
    }

    // Validate VALUES (if mutation)
    if (query.mutate && query.values) {
      try {
        validateValues(query.values);
      } catch (error: any) {
        res.status(400).json({
          code: 400,
          message: `VALUES validation failed: ${error.message}`,
          field: 'values',
        });
        return;
      }
    }

    // Validate OUTPUT (if present)
    if (query.output) {
      try {
        validateFieldList(query.output, 'OUTPUT');
      } catch (error: any) {
        res.status(400).json({
          code: 400,
          message: `OUTPUT validation failed: ${error.message}`,
          field: 'output',
        });
        return;
      }
    }

    // Validate EXCEPT (if present)
    if (query.except) {
      try {
        validateFieldList(query.except, 'EXCEPT');
      } catch (error: any) {
        res.status(400).json({
          code: 400,
          message: `EXCEPT validation failed: ${error.message}`,
          field: 'except',
        });
        return;
      }
    }

    // All validations passed
    console.log('✅ JQEL parameter validation passed', {
      schema: query.schema,
      operation: query.select ? 'select' : 'mutate',
      hasWhere: !!query.where,
      hasOptions: !!query.options,
      hasValues: !!query.values,
    });

    next();
  } catch (error: any) {
    console.error('❌ Unexpected error in jqelParameterValidation:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal validation error',
    });
  }
};
