/**
 * JQEL Routes
 *
 * Main endpoint for all JQEL queries (SELECT and MUTATE operations).
 *
 * Based on:
 * - SPEC-data-access.md (SPEC-DA-W-*, SPEC-DA-VAL-*)
 * - SPEC-jqel-syntax.md
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { jqelRouter } from '../services/jqelRouter.service.js';
import type { JQELQuery, JResult } from '../types/jqel.types.js';
import { schemaIsolationMiddleware } from '../middleware/schemaIsolation.middleware.js';
import { authorizationService } from '../services/authorization.service.js';

const router = Router();

/**
 * POST /api/jqel
 *
 * Execute JQEL query (SELECT or MUTATE)
 *
 * SPEC-DA-W-005: POST to /api/jqel
 * SPEC-DA-W-006: Content-Type: application/json
 * SPEC-DA-W-007: JWT in Authorization header
 */
router.post('/', schemaIsolationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: JQELQuery = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    // Basic validation (SPEC-DA-VAL-007 to SPEC-DA-VAL-010)
    const validationError = validateJQELQuery(query);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Authorization check via n8n /auth/authorize
    const authContext = {
      portalId: req.headers['x-portal-id'] as string | undefined,
      moduleId: req.headers['x-module-id'] as string | undefined,
      instanceId: req.headers['x-instance-id'] as string | undefined,
    };

    const authResult = await authorizationService.authorizeJQELQuery(token, query, authContext);

    if (!authResult.success || !authResult.authorized) {
      return res.status(403).json({
        code: 403,
        message: authResult.error?.message || 'Access denied',
      });
    }

    // Attach user info to request for downstream processing
    (req as any).user = authResult.user;
    (req as any).permissions = authResult.permissions;

    // Route query to appropriate processor
    const result = await jqelRouter.route(query, req);

    // Return result with appropriate status code
    return res.status(result.code).json(result);
  } catch (error) {
    // Pass to error handler
    next(error);
  }
});

/**
 * Validate JQEL query structure
 *
 * SPEC-DA-VAL-007: Backend validates structure
 * SPEC-DA-VAL-008: Backend validates schema exists
 * SPEC-DA-VAL-009: Backend validates operation is allowed
 *
 * @param query - JQEL query object
 * @returns Validation error result or null if valid
 */
function validateJQELQuery(query: any): JResult | null {
  // SPEC-JQEL-VAL-001: Must be valid JSON (already parsed by express.json())
  if (!query || typeof query !== 'object') {
    return {
      code: 400,
      message: 'Query must be a valid JSON object',
    };
  }

  // SPEC-JQEL-VAL-002: schema is required
  if (!query.schema || typeof query.schema !== 'string') {
    return {
      code: 400,
      message: "Campo 'schema' é obrigatório",
      field: 'schema',
    };
  }

  // SPEC-JQEL-VAL-003: select OR mutate is required
  const hasSelect = 'select' in query;
  const hasMutate = 'mutate' in query;

  if (!hasSelect && !hasMutate) {
    return {
      code: 400,
      message: "Query deve ter 'select' ou 'mutate'",
    };
  }

  // SPEC-JQEL-VAL-004: select and mutate are mutually exclusive
  if (hasSelect && hasMutate) {
    return {
      code: 400,
      message: "Query não pode ter 'select' e 'mutate' ao mesmo tempo",
    };
  }

  // SPEC-JQEL-VAL-005: If mutate, action is required
  if (hasMutate && !query.action) {
    return {
      code: 400,
      message: "Campo 'action' é obrigatório quando usar 'mutate'",
      field: 'action',
    };
  }

  // Type validation
  if (hasSelect && typeof query.select !== 'string') {
    return {
      code: 400,
      message: "Campo 'select' deve ser string",
      field: 'select',
    };
  }

  if (hasMutate && typeof query.mutate !== 'string') {
    return {
      code: 400,
      message: "Campo 'mutate' deve ser string",
      field: 'mutate',
    };
  }

  // SPEC-JQEL-VAL-013: output and except cannot coexist
  if (query.output && query.except) {
    return {
      code: 400,
      message: "Não use 'output' e 'except' juntos",
    };
  }

  // Valid query
  return null;
}

export default router;
