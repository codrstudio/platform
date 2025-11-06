import { Request, Response, NextFunction } from 'express';
import type { JQELQuery } from '../types/jqel.types.js';

/**
 * JQEL Query Validation Middleware
 *
 * Validates JQEL query structure before processing.
 *
 * SPEC References:
 * - SPEC-JQEL-VAL-001:019: Validation rules
 * - SPEC-JQEL-STR-003:006: Required fields
 */
export const jqelValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const query = req.body as Partial<JQELQuery>;

  // SPEC-JQEL-VAL-002: schema is required
  if (!query.schema || typeof query.schema !== 'string' || query.schema.trim() === '') {
    res.status(400).json({
      code: 400,
      message: "Field 'schema' is required and must be a non-empty string",
      field: 'schema',
    });
    return;
  }

  // SPEC-JQEL-VAL-003: select OR mutate is required
  if (!query.select && !query.mutate) {
    res.status(400).json({
      code: 400,
      message: "Query must have 'select' or 'mutate'",
    });
    return;
  }

  // SPEC-JQEL-VAL-004: select and mutate are mutually exclusive
  if (query.select && query.mutate) {
    res.status(400).json({
      code: 400,
      message: "Query cannot have both 'select' and 'mutate'",
    });
    return;
  }

  // SPEC-JQEL-VAL-005: If mutate, action is required
  if (query.mutate && !query.action) {
    res.status(400).json({
      code: 400,
      message: "Field 'action' is required when using 'mutate'",
      field: 'action',
    });
    return;
  }

  // SPEC-JQEL-VAL-007: select/mutate must be string
  if (query.select && typeof query.select !== 'string') {
    res.status(400).json({
      code: 400,
      message: "Field 'select' must be a string",
      field: 'select',
    });
    return;
  }

  if (query.mutate && typeof query.mutate !== 'string') {
    res.status(400).json({
      code: 400,
      message: "Field 'mutate' must be a string",
      field: 'mutate',
    });
    return;
  }

  // SPEC-JQEL-VAL-019: output and except cannot coexist
  if (query.output && query.except) {
    res.status(400).json({
      code: 400,
      message: "Do not use 'output' and 'except' together",
    });
    return;
  }

  // Backend schema validation
  if (query.schema === 'backend') {
    const entity = query.select || query.mutate;
    const validEntities = ['portal', 'module', 'instance'];

    if (!entity || !validEntities.includes(entity)) {
      res.status(400).json({
        code: 400,
        message: `Invalid backend entity: '${entity}'. Must be one of: portal, module, instance`,
        field: query.select ? 'select' : 'mutate',
      });
      return;
    }

    // UPDATE and DELETE require WHERE clause
    if (query.mutate && ['update', 'delete'].includes(query.action as string)) {
      if (!query.where || Object.keys(query.where).length === 0) {
        res.status(400).json({
          code: 400,
          message: `Action '${query.action}' requires a WHERE clause`,
          field: 'where',
        });
        return;
      }
    }
  }

  // All validations passed
  next();
};
