// Authentication Routes (Proxy to n8n)
// Based on SPEC-authentication.md

import { Router, Request, Response } from 'express';
import { n8nProxy } from '../services/n8nProxy.service.js';

const router = Router();

/**
 * Helper function to handle n8n errors gracefully
 */
function handleN8nError(error: any, res: Response, defaultMessage: string) {
  const status = error.response?.status || 500;

  // Check if n8n is unreachable (graceful degradation)
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    console.error('[Auth] n8n backend unavailable:', error.message);
    return res.status(503).json({
      code: 'service_unavailable',
      message: 'Authentication service temporarily unavailable',
    });
  }

  const data = error.response?.data || {
    code: 'internal_error',
    message: defaultMessage,
  };

  return res.status(status).json(data);
}

/**
 * POST /api/1/auth/login
 * SPEC-AU-RO-005, SPEC-AU-LI-001 to SPEC-AU-LI-026
 *
 * Login with credentials
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, realm, schema } = req.body;

    // Validate required fields (SPEC-AU-LI-007)
    if (!username || !password) {
      return res.status(400).json({
        code: 'missing_fields',
        message: 'Username and password are required',
      });
    }

    // Forward to n8n (SPEC-AU-LI-008)
    const response = await n8nProxy.post('/webhook/auth/login', {
      username,
      password,
      realm,
      schema,
    });

    // Return response from n8n
    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Internal server error');
  }
});

/**
 * POST /api/1/auth/refresh
 * SPEC-AU-RO-006, SPEC-AU-RF-001 to SPEC-AU-RF-024
 *
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    // Check cookies if not in body (SPEC-AU-RF-002, SPEC-AU-RF-003)
    const refreshToken = refresh_token || req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(400).json({
        code: 'missing_token',
        message: 'Refresh token is required',
      });
    }

    // Forward to n8n (SPEC-AU-RF-005)
    const response = await n8nProxy.post('/webhook/auth/refresh', {
      refresh_token: refreshToken,
    });

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Token refresh failed');
  }
});

/**
 * POST /api/1/auth/logout
 * SPEC-AU-RO-007, SPEC-AU-LO-001 to SPEC-AU-LO-012
 *
 * Logout (revoke current refresh token)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    // Check cookies if not in body (SPEC-AU-LO-002, SPEC-AU-LO-003)
    const refreshToken = refresh_token || req.cookies?.refresh_token;

    if (!refreshToken) {
      // Idempotent - return success even without token (SPEC-AU-LO-011)
      return res.status(200).json({
        code: 'success',
        message: 'Logged out successfully',
      });
    }

    // Forward to n8n (SPEC-AU-LO-004)
    const response = await n8nProxy.post('/webhook/auth/logout', {
      refresh_token: refreshToken,
    });

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Logout failed');
  }
});

/**
 * POST /api/1/auth/logout-all
 * SPEC-AU-RO-008, SPEC-AU-LA-001 to SPEC-AU-LA-017
 *
 * Logout from all devices
 */
router.post('/logout-all', async (req: Request, res: Response) => {
  try {
    // Get token from header, body, or cookie (SPEC-AU-LA-001 to SPEC-AU-LA-004)
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.replace('Bearer ', '');
    const tokenFromBody = req.body.access_token;
    const tokenFromCookie = req.cookies?.access_token;

    const accessToken = tokenFromHeader || tokenFromBody || tokenFromCookie;

    if (!accessToken) {
      return res.status(401).json({
        code: 'missing_token',
        message: 'Access token is required',
      });
    }

    // Forward to n8n (SPEC-AU-LA-007)
    const response = await n8nProxy.post(
      '/webhook/auth/logout-all',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Logout all failed');
  }
});

/**
 * POST /api/1/auth/authorize
 * SPEC-AU-RO-009, SPEC-AU-AZ-001 to SPEC-AU-AZ-036
 *
 * Validate token and check permissions
 */
router.post('/authorize', async (req: Request, res: Response) => {
  try {
    // Get token from header, body, or cookie (SPEC-AU-AZ-001 to SPEC-AU-AZ-004)
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.replace('Bearer ', '');
    const tokenFromBody = req.body.access_token;
    const tokenFromCookie = req.cookies?.access_token;

    const accessToken = tokenFromHeader || tokenFromBody || tokenFromCookie;

    if (!accessToken) {
      return res.status(401).json({
        code: 'missing_token',
        message: 'Access token is required',
      });
    }

    const { schema, permission, query } = req.body;

    // Forward to n8n (SPEC-AU-AZ-016)
    const response = await n8nProxy.post(
      '/webhook/auth/authorize',
      {
        schema,
        permission,
        query,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Authorization failed');
  }
});

export default router;
