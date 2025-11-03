/**
 * JQEL Routes
 * Main data access endpoint
 * SPEC-DA-* compliance
 */

import { Router } from 'express';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { jqelProcessor } from '../services/jqelProcessor.js';
import { n8nProxyService } from '../services/n8nProxy.js';

const router = Router();

// Validation schema
const jqelSchema = z.object({
  schema: z.string().min(1, 'Schema is required'),
  select: z.string().optional(),
  mutate: z.string().optional(),
  action: z.string().optional(),
  where: z.any().optional(),
  values: z.record(z.any()).optional(),
  options: z
    .object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      orderBy: z.array(z.record(z.enum(['asc', 'desc']))).optional(),
    })
    .optional(),
  output: z.array(z.string()).optional(),
  except: z.array(z.string()).optional(),
});

/**
 * POST /api/jqel
 * Main JQEL query endpoint
 * SPEC-DA-W-005
 * Uses optionalAuth to allow unauthenticated access to "backend" schema (portal configs)
 */
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const query = jqelSchema.parse(req.body);

    // Route based on schema
    let result;

    if (query.schema === 'backend') {
      // Process locally
      result = await jqelProcessor.process(query);
    } else {
      // Proxy to n8n
      result = await n8nProxyService.proxyRequest('/jqel', query);
    }

    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 400,
        message: 'Validation error',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('JQEL route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export default router;
