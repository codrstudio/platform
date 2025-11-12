// Authentication Routes (Proxy to n8n)
// Based on SPEC-authentication.md

import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { n8nProxy } from '../services/n8nProxy.service.js';
import { env } from '../config/env.js';

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
 * POST /api/1/auth/guest
 *
 * Generate Guest JWT for anonymous users
 * This allows SSE connections and platform access before authentication
 *
 * Guest JWT characteristics:
 * - sub: 'guest_<uuid>' (SPEC-AU-JWT-005)
 * - guest: true (custom claim to identify guest sessions)
 * - iat: issued at timestamp (SPEC-AU-JWT-006)
 * - exp: 1 year expiration (symbolic - not validated by backend)
 * - iss: platform issuer (SPEC-AU-JWT-008)
 *
 * IMPORTANT: Guest tokens do NOT have expiration validation in backend
 * This ensures 0% of 401 errors for anonymous users in public sites
 *
 * After real login, Guest JWT should be replaced with user JWT
 */
router.post('/guest', async (_req: Request, res: Response) => {
  try {
    // Generate unique guest ID (SPEC-C-I-002, SPEC-C-I-003)
    const guestId = `guest_${randomUUID()}`;

    // Create JWT payload (SPEC-AU-JWT-005 to SPEC-AU-JWT-013)
    const now = Math.floor(Date.now() / 1000);
    const oneYear = 365 * 24 * 60 * 60; // 1 year in seconds
    const payload = {
      sub: guestId,           // SPEC-AU-JWT-005: subject (userId)
      guest: true,            // Custom claim to identify guest sessions
      iat: now,               // SPEC-AU-JWT-006: issued at
      exp: now + oneYear,     // 1 year expiration (symbolic - not validated)
      iss: 'platform',        // SPEC-AU-JWT-008: issuer
    };

    // Sign JWT with platform secret (SPEC-AU-JWT-001 to SPEC-AU-JWT-004, SPEC-AU-JWT-018 to SPEC-AU-JWT-021)
    const token = jwt.sign(payload, env.JWT_SECRET, { algorithm: 'HS256' });

    // Return in JResult format (matching login response structure)
    // SPEC-AU-LI-012 to SPEC-AU-LI-017
    return res.status(200).json({
      code: 'success',
      access_token: token,
      token_type: 'Bearer',
      expires_in: oneYear, // 1 year in seconds
    });
  } catch (error: any) {
    console.error('[Auth] Guest JWT Error:', error);
    return res.status(500).json({
      code: 'internal_error',
      message: 'Failed to generate guest token',
    });
  }
});

/**
 * POST /api/1/auth/login
 * SPEC-AU-RO-005, SPEC-AU-LI-001 to SPEC-AU-LI-026
 * SPEC-AU-ST-005: Store refresh_token in httpOnly cookie
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
    const response = await n8nProxy.post('/auth/login', {
      username,
      password,
      realm,
      schema,
    });

    // Unwrap nested n8n response structure
    // n8n returns: { code: 200, data: { access_token, refresh_token, ... } }
    const n8nResponse = response.data;
    const isSuccess = n8nResponse.code === 200 && n8nResponse.data;

    if (isSuccess) {
      const loginData = n8nResponse.data;

      // Set httpOnly cookie for refresh_token (SPEC-AU-ST-005 to SPEC-AU-ST-008)
      if (loginData.refresh_token) {
        res.cookie('refresh_token', loginData.refresh_token, {
          httpOnly: true,                            // SPEC-AU-ST-006: Protect against XSS
          secure: env.NODE_ENV === 'production',     // SPEC-AU-ST-007: HTTPS only in production
          sameSite: 'strict',                        // SPEC-AU-ST-008: Protect against CSRF
          maxAge: 7 * 24 * 60 * 60 * 1000,          // 7 days (SPEC-AU-RF-020)
          path: '/api/1/auth',                       // Restrict cookie scope
        });
      }

      // Remove refresh_token from response body (SPEC-AU-ST-005)
      const { refresh_token, ...dataWithoutRefreshToken } = loginData;

      // Return flat structure with string code (frontend expectation)
      return res.status(200).json({
        code: '200',
        ...dataWithoutRefreshToken
      });
    }

    // Return error response from n8n
    return res.status(response.status || 400).json(n8nResponse);
  } catch (error: any) {
    return handleN8nError(error, res, 'Internal server error');
  }
});

/**
 * POST /api/1/auth/refresh
 * SPEC-AU-RO-006, SPEC-AU-RF-001 to SPEC-AU-RF-024
 * SPEC-AU-ST-005: Use refresh_token from httpOnly cookie
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

    // Forward to n8n with Cookie header (SPEC-AU-RF-005)
    // n8n workflow will extract refresh_token from Cookie header automatically
    const response = await n8nProxy.post(
      '/auth/refresh',
      { refresh_token: refreshToken },
      {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      }
    );

    // Unwrap nested n8n response structure
    const n8nResponse = response.data;
    const isSuccess = n8nResponse.code === 200 && n8nResponse.data;

    if (isSuccess) {
      const refreshData = n8nResponse.data;

      // Renew httpOnly cookie with new refresh_token
      if (refreshData.refresh_token) {
        res.cookie('refresh_token', refreshData.refresh_token, {
          httpOnly: true,                            // SPEC-AU-ST-006: Protect against XSS
          secure: env.NODE_ENV === 'production',     // SPEC-AU-ST-007: HTTPS only in production
          sameSite: 'strict',                        // SPEC-AU-ST-008: Protect against CSRF
          maxAge: 7 * 24 * 60 * 60 * 1000,          // 7 days (SPEC-AU-RF-020)
          path: '/api/1/auth',                       // Restrict cookie scope
        });
      }

      // Remove refresh_token from response body (SPEC-AU-ST-005)
      const { refresh_token, ...dataWithoutRefreshToken } = refreshData;

      // Return flat structure with string code
      return res.status(200).json({
        code: '200',
        ...dataWithoutRefreshToken
      });
    }

    return res.status(response.status || 400).json(n8nResponse);
  } catch (error: any) {
    return handleN8nError(error, res, 'Token refresh failed');
  }
});

/**
 * POST /api/1/auth/logout
 * SPEC-AU-RO-007, SPEC-AU-LO-001 to SPEC-AU-LO-012
 * SPEC-AU-ST-005: Clear refresh_token httpOnly cookie
 *
 * Logout (revoke current refresh token)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    // Check cookies if not in body (SPEC-AU-LO-002, SPEC-AU-LO-003)
    const refreshToken = refresh_token || req.cookies?.refresh_token;

    // Clear cookie immediately (SPEC-AU-ST-005)
    res.clearCookie('refresh_token', { path: '/api/1/auth' });

    if (!refreshToken) {
      // Idempotent - return success even without token (SPEC-AU-LO-011)
      return res.status(200).json({
        code: 'success',
        message: 'Logged out successfully',
      });
    }

    // Forward to n8n to revoke token in database (SPEC-AU-LO-004)
    const response = await n8nProxy.post(
      '/auth/logout',
      { refresh_token: refreshToken },
      {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    return handleN8nError(error, res, 'Logout failed');
  }
});

/**
 * POST /api/1/auth/logout-all
 * SPEC-AU-RO-008, SPEC-AU-LA-001 to SPEC-AU-LA-017
 * SPEC-AU-ST-005: Clear refresh_token httpOnly cookie
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

    // Clear local cookie immediately (SPEC-AU-ST-005)
    res.clearCookie('refresh_token', { path: '/api/1/auth' });

    // Forward to n8n to revoke ALL refresh tokens for this user (SPEC-AU-LA-007)
    const response = await n8nProxy.post(
      '/auth/logout-all',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: req.headers.cookie || '',
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
      '/auth/authorize',
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
