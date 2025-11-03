/**
 * Auth Routes
 * Proxy to n8n authentication workflows
 * SPEC-AU-RO-*
 */

import { Router } from 'express';
import { z } from 'zod';
import { n8nProxyService } from '../services/n8nProxy.js';
import type { Request, Response } from 'express';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  realm: z.string().optional(),
  schema: z.string().optional(),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

const logoutAllSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
});

const authorizeSchema = z.object({
  access_token: z.string().min(1, 'Access token is required'),
  permission: z.string().optional(),
});

/**
 * POST /api/1/auth/login
 * SPEC-AU-LI-*
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const body = loginSchema.parse(req.body);

    // Proxy to n8n
    const result = await n8nProxyService.proxyRequest('/auth/login', body);

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

    console.error('Login route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/1/auth/refresh
 * SPEC-AU-RF-*
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const body = refreshSchema.parse(req.body);
    const result = await n8nProxyService.proxyRequest('/auth/refresh', body);
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

    console.error('Refresh route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/1/auth/logout
 * SPEC-AU-LO-*
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const body = logoutSchema.parse(req.body);
    const result = await n8nProxyService.proxyRequest('/auth/logout', body);
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

    console.error('Logout route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/1/auth/logout-all
 * SPEC-AU-LA-*
 */
router.post('/logout-all', async (req: Request, res: Response) => {
  try {
    const body = logoutAllSchema.parse(req.body);
    const result = await n8nProxyService.proxyRequest('/auth/logout-all', body);
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

    console.error('Logout all route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/1/auth/authorize
 * SPEC-AU-AZ-*
 */
router.post('/authorize', async (req: Request, res: Response) => {
  try {
    const body = authorizeSchema.parse(req.body);
    const result = await n8nProxyService.proxyRequest('/auth/authorize', body);
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

    console.error('Authorize route error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export default router;
