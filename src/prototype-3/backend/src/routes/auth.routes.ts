import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { n8nProxy } from '../services/n8nProxy.service.js';
import { jwtService } from '../services/jwt.service.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  loginBruteForceProtection,
  loginBruteForceOptions,
  handleLoginSuccess,
  handleLoginFailure,
} from '../middleware/bruteForce.middleware.js';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllRequest,
  LogoutAllResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  AuthError,
} from '../types/auth.types.js';

/**
 * SPEC-AU-RO-*: Authentication routes
 * SPEC-AU-RO-001: All routes use prefix /api/1/auth/
 * SPEC-AU-RO-002: All routes use POST method
 * SPEC-AU-RO-003: All routes accept and return JSON
 * SPEC-AU-SG-004 to SPEC-AU-SG-006: Rate limiting and brute force protection
 */

const router = Router();

// Apply rate limiting to all auth routes
// SPEC-AU-SG-004: Login MUST have rate limiting (e.g., 5 attempts/minute)
// SPEC-AU-SG-005: Rate limiting MUST be implemented in Backend or Backbone
router.use(authRateLimiter);

/**
 * SPEC-AU-LI-*: POST /api/1/auth/login
 * Authenticate user with username and password
 *
 * SPEC-AU-LI-025, SPEC-AU-LI-026: Brute force protection
 * SPEC-AU-SG-006: IP blocking after multiple failures
 */
router.post('/login', loginBruteForceProtection, async (req: Request, res: Response) => {
  try {
    // SPEC-AU-LI-001 to SPEC-AU-LI-004: Validate request body
    const loginSchema = z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
      realm: z.string().optional(),
      schema: z.string().optional(),
    });

    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      // SPEC-AU-LI-007: Backend validates presence of username and password
      return res.status(400).json({
        code: 'validation_error',
        message: 'Invalid request body',
        details: validationResult.error.format(),
      } as AuthError);
    }

    const loginData: LoginRequest = validationResult.data;

    // SPEC-AU-LI-023: Password should not be logged
    const { password, ...logData } = loginData;
    console.log('[Auth] Login attempt:', logData);

    // SPEC-AU-LI-008: Backend forwards request to Backbone (n8n)
    const response = await n8nProxy.post<LoginResponse>('/auth/login', loginData);

    // Login successful - reset failed attempts counter
    await handleLoginSuccess(req);

    // SPEC-AU-LI-012 to SPEC-AU-LI-018: Return success response
    res.json(response);
  } catch (error: any) {
    console.error('[Auth] Login error:', error.message);

    // SPEC-AU-LI-019 to SPEC-AU-LI-022: Error response
    if (error.message.includes('401')) {
      // Login failed - track failure and potentially block IP
      await handleLoginFailure(req, loginBruteForceOptions);

      return res.status(401).json({
        code: 'invalid_credentials',
        message: 'Invalid username or password',
      } as AuthError);
    }

    res.status(500).json({
      code: 'internal_error',
      message: 'Authentication service unavailable',
    } as AuthError);
  }
});

/**
 * SPEC-AU-RF-*: POST /api/1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // SPEC-AU-RF-001 to SPEC-AU-RF-003: Accept refresh_token from body or cookie
    const refresh_token = req.body.refresh_token || req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(400).json({
        code: 'missing_token',
        message: 'Refresh token is required',
      } as AuthError);
    }

    const refreshData: RefreshRequest = { refresh_token };

    // SPEC-AU-RF-005: Backend forwards to Backbone
    const response = await n8nProxy.post<RefreshResponse>('/auth/refresh', refreshData);

    // SPEC-AU-RF-013 to SPEC-AU-RF-017: Return new tokens
    res.json(response);
  } catch (error: any) {
    console.error('[Auth] Refresh error:', error.message);

    // SPEC-AU-RF-018, SPEC-AU-RF-019: Token invalid/expired/reused
    if (error.message.includes('401')) {
      return res.status(401).json({
        code: 'invalid_token',
        message: 'Invalid or expired refresh token',
      } as AuthError);
    }

    res.status(500).json({
      code: 'internal_error',
      message: 'Token refresh failed',
    } as AuthError);
  }
});

/**
 * SPEC-AU-LO-*: POST /api/1/auth/logout
 * Logout current session (revoke refresh token)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // SPEC-AU-LO-001 to SPEC-AU-LO-003: Accept refresh_token from body or cookie
    const refresh_token = req.body.refresh_token || req.cookies?.refresh_token;

    if (!refresh_token) {
      // SPEC-AU-LO-011: Invalid token can return success (idempotent)
      return res.json({
        code: 'success',
        message: 'Logged out successfully',
      } as LogoutResponse);
    }

    const logoutData: LogoutRequest = { refresh_token };

    // SPEC-AU-LO-004: Backend forwards to Backbone
    const response = await n8nProxy.post<LogoutResponse>('/auth/logout', logoutData);

    // SPEC-AU-LO-008 to SPEC-AU-LO-010: Return success
    res.json(response);
  } catch (error: any) {
    console.error('[Auth] Logout error:', error.message);

    // SPEC-AU-LO-011: Be idempotent - return success anyway
    res.json({
      code: 'success',
      message: 'Logged out successfully',
    } as LogoutResponse);
  }
});

/**
 * SPEC-AU-LA-*: POST /api/1/auth/logout-all
 * Logout all sessions (revoke all refresh tokens for user)
 */
router.post('/logout-all', async (req: Request, res: Response) => {
  try {
    // SPEC-AU-LA-001 to SPEC-AU-LA-004: Accept access_token from header, body, or cookie
    const access_token =
      extractBearerToken(req) || req.body.access_token || req.cookies?.access_token;

    if (!access_token) {
      return res.status(401).json({
        code: 'missing_token',
        message: 'Access token is required',
      } as AuthError);
    }

    // SPEC-AU-LA-005: Backend validates access_token (JWT)
    // SPEC-AU-LA-006: Extract userId from token
    try {
      const userId = jwtService.extractUserId(access_token);
      console.log(`[Auth] Logout all for user: ${userId}`);
    } catch (jwtError: any) {
      // SPEC-AU-LA-015, SPEC-AU-LA-016: Invalid/expired token
      return res.status(401).json({
        code: 'invalid_token',
        message: 'Invalid or expired access token',
      } as AuthError);
    }

    const logoutAllData: LogoutAllRequest = { access_token };

    // SPEC-AU-LA-007: Backend forwards to Backbone
    const response = await n8nProxy.post<LogoutAllResponse>('/auth/logout-all', logoutAllData);

    // SPEC-AU-LA-011 to SPEC-AU-LA-014: Return success
    res.json(response);
  } catch (error: any) {
    console.error('[Auth] Logout all error:', error.message);

    // SPEC-AU-LA-017: Internal error
    res.status(500).json({
      code: 'internal_error',
      message: 'Logout all failed',
    } as AuthError);
  }
});

/**
 * SPEC-AU-AZ-*: POST /api/1/auth/authorize
 * Validate access token and check permissions
 */
router.post('/authorize', async (req: Request, res: Response) => {
  try {
    // SPEC-AU-AZ-001 to SPEC-AU-AZ-004: Accept access_token from header, body, or cookie
    const access_token =
      extractBearerToken(req) || req.body.access_token || req.cookies?.access_token;

    if (!access_token) {
      return res.status(401).json({
        code: 'missing_token',
        message: 'Access token is required',
      } as AuthError);
    }

    // SPEC-AU-AZ-014: Backend validates JWT (signature, expiration)
    // SPEC-AU-AZ-015: Backend extracts payload from JWT
    let payload;
    try {
      payload = jwtService.extractPayload(access_token);
    } catch (jwtError: any) {
      // SPEC-AU-AZ-030, SPEC-AU-AZ-031: Invalid/expired token
      return res.status(401).json({
        code: 'invalid_token',
        message: jwtError.message || 'Invalid or expired access token',
      } as AuthError);
    }

    // SPEC-AU-AZ-005 to SPEC-AU-AZ-008: Check if permission validation is needed
    const { schema, permission, query } = req.body;

    if (permission || schema || query) {
      // SPEC-AU-AZ-016: If permission specified, forward to Backbone
      const authorizeData: AuthorizeRequest = {
        access_token,
        schema,
        permission,
        query,
      };

      const response = await n8nProxy.post<AuthorizeResponse>('/auth/authorize', authorizeData);

      // SPEC-AU-AZ-020 to SPEC-AU-AZ-029: Return authorization result
      if (!response.authorized) {
        return res.status(403).json(response);
      }

      return res.json(response);
    }

    // SPEC-AU-AZ-008: If just validating token (no permission check)
    // SPEC-AU-AZ-020 to SPEC-AU-AZ-024: Return authorized response
    res.json({
      code: 'authorized',
      payload,
      authorized: true,
    } as AuthorizeResponse);
  } catch (error: any) {
    console.error('[Auth] Authorize error:', error.message);

    // Check if Backbone returned 403 (forbidden)
    if (error.message.includes('403')) {
      return res.status(403).json({
        code: 'forbidden',
        message: 'Permission denied',
        authorized: false,
      } as AuthError);
    }

    res.status(500).json({
      code: 'internal_error',
      message: 'Authorization check failed',
    } as AuthError);
  }
});

/**
 * Helper: Extract Bearer token from Authorization header
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

export default router;
