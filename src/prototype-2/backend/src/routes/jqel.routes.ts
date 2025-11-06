import { Router, Request, Response, NextFunction } from 'express';
import { jqelValidationMiddleware } from '../middleware/jqelValidation.middleware.js';
import { jqelProcessor } from '../services/jqelProcessor.service.js';
import type { JQELQuery, JResult } from '../types/jqel.types.js';

const router = Router();

/**
 * POST /api/jqel
 *
 * Process JQEL queries (SELECT and MUTATE operations).
 *
 * SPEC References:
 * - SPEC-DA-EP-001:009: JQEL endpoint requirements
 * - SPEC-CH-DA-001:004: Data channel definition
 *
 * Flow:
 * 1. Validation middleware checks query structure
 * 2. Route handler extracts query from body
 * 3. Processor routes based on schema
 * 4. Result returned as JResult JSON
 *
 * Authentication:
 * - Optional (depends on schema/entity/operation)
 * - TODO (Task 1.4.2): Add JWT validation middleware conditionally
 */
router.post(
  '/',
  jqelValidationMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract validated query from body
      const query = req.body as JQELQuery;

      // Log query for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 JQEL Query:', {
          schema: query.schema,
          operation: query.select ? `SELECT ${query.select}` : `MUTATE ${query.mutate}`,
          action: query.action,
        });
      }

      // Process query via processor service
      const result: JResult = await jqelProcessor.process(query);

      // Return result with appropriate HTTP status
      // SPEC-JQEL-RES-003:005: Use code field as HTTP status
      res.status(result.code).json(result);

    } catch (error: any) {
      // Log unexpected errors
      console.error('❌ Error in /api/jqel:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        query: req.body?.schema,
        stack: error.stack,
      });

      // Pass to centralized error handler
      next(error);
    }
  }
);

export default router;
