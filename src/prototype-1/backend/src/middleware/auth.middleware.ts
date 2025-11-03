/**
 * Auth Middleware
 * Validates JWT tokens via n8n authorize endpoint
 * SPEC-AU-AZ-*
 */

import type { Request, Response, NextFunction } from 'express';
import { n8nProxyService } from '../services/n8nProxy.js';
import type { JWTPayload } from '../types/auth.types.js';

// Extend Express Request with user payload
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Validate JWT middleware
 * Extracts token from Authorization header and validates via n8n
 */
export async function validateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 401,
        message: 'Missing or invalid Authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate token via n8n authorize endpoint
    const result = await n8nProxyService.proxyRequest('/auth/authorize', {
      access_token: token,
    });

    if (result.code !== 200 || !result.data?.authorized) {
      res.status(401).json({
        code: 401,
        message: result.message || 'Unauthorized',
      });
      return;
    }

    // Attach user payload to request
    req.user = result.data.payload;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error during authentication',
    });
  }
}

/**
 * Optional auth middleware
 * Validates token if present, but allows unauthenticated requests
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token, continue without user
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);

    const result = await n8nProxyService.proxyRequest('/auth/authorize', {
      access_token: token,
    });

    if (result.code === 200 && result.data?.authorized) {
      req.user = result.data.payload;
    }
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without user on error
  }

  next();
}

/**
 * Check permission middleware factory
 * Validates user has specific permission
 */
export function requirePermission(permission: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
      });
      return;
    }

    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        code: 403,
        message: `Permission denied: ${permission} required`,
      });
      return;
    }

    next();
  };
}
