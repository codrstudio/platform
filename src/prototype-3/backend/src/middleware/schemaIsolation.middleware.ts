/**
 * Schema Isolation Middleware
 *
 * Validates that JQEL queries only access schemas allowed by user's permissions.
 * Implements SPEC-data-access.md requirements for schema-level access control.
 */

import { Request, Response, NextFunction } from 'express';
import { JQELQuery } from '../types/jqel.types';

/**
 * List of restricted schemas that require special permissions
 */
const RESTRICTED_SCHEMAS = ['system', 'platform', 'backend'] as const;

/**
 * Schema isolation middleware
 * Validates schema access based on user permissions
 */
export const schemaIsolationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const query = req.body as JQELQuery;
    const userPermissions = (req as any).user?.permissions || [];
    const schema = query.schema;

    // If schema is not restricted, allow access
    if (!RESTRICTED_SCHEMAS.includes(schema as any)) {
      return next();
    }

    // Check if user has permission to access this schema
    const hasSchemaPermission = userPermissions.some((permission: string) => {
      return (
        permission === `schema:${schema}:*` ||
        permission === `schema:${schema}:read` ||
        permission === 'schema:*:*' ||
        permission === 'admin'
      );
    });

    if (!hasSchemaPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'SCHEMA_ACCESS_DENIED',
          message: `Access to schema '${schema}' is not permitted`,
          details: {
            schema,
            requiredPermissions: [
              `schema:${schema}:read`,
              `schema:${schema}:*`,
              'schema:*:*'
            ]
          }
        }
      });
      return;
    }

    // User has permission, continue to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SCHEMA_VALIDATION_ERROR',
        message: 'Error validating schema access',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};
