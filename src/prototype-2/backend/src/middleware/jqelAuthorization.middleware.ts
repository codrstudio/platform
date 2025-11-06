import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { jwtService } from '../services/jwt.service.js';
import { redisService } from '../services/redis.service.js';
import { config } from '../config/env.js';
import { requiresAuthentication } from '../config/permissionRules.js';
import { buildPermissionFromQuery } from '../utils/permissionBuilder.js';
import type { JQELQuery, JqelContext } from '../types/jqel.types.js';
import type { JwtPayload } from '../types/auth.types.js';

// Extend Express Request to include jqelContext
declare global {
  namespace Express {
    interface Request {
      jqelContext?: JqelContext;
    }
  }
}

/**
 * JQEL Authorization Middleware
 *
 * Enforces permission checks before JQEL query execution.
 *
 * SPEC References:
 * - SPEC-DA-AUTH-001:007: Queries can require authentication and authorization
 * - SPEC-DA-PERM-001:008: Permission validation based on schema, entity, action
 * - SPEC-AU-AZ-014:036: Authorization flow with caching
 *
 * Flow:
 * 1. Check if schema requires authentication
 * 2. Extract and validate JWT from Authorization header
 * 3. Build permission string from query
 * 4. Check Redis cache for permission decision
 * 5. If cache miss, validate permission via /auth/authorize
 * 6. Cache result and return authorization decision
 * 7. Enrich request context with userId for processors
 */
export const jqelAuthorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const query = req.body as JQELQuery;

  try {
    // STEP 1: Check if schema requires authentication
    if (!requiresAuthentication(query.schema)) {
      console.log(`ℹ️  Schema '${query.schema}' does not require authentication - skipping authorization`);

      // Still enrich context with request metadata (no userId)
      req.jqelContext = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };

      return next();
    }

    // STEP 2: Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 401,
        message: 'Authentication required. Please provide a valid access token.',
      });
      return;
    }

    const jwt = authHeader.substring(7);

    // STEP 3: Validate JWT locally (fast check)
    let payload: JwtPayload;
    try {
      payload = jwtService.verifyAccessToken(jwt);

      if (!payload.sub) {
        res.status(401).json({
          code: 401,
          message: 'Invalid access token: missing user ID',
        });
        return;
      }
    } catch (error: any) {
      // JWT validation failed
      if (error.message === 'Token expired') {
        res.status(401).json({
          code: 401,
          message: 'Access token has expired. Please refresh your token.',
        });
        return;
      }

      res.status(401).json({
        code: 401,
        message: 'Invalid access token',
      });
      return;
    }

    const userId = payload.sub;

    // STEP 4: Build permission string from query
    let permission: string;
    try {
      permission = buildPermissionFromQuery(query);
    } catch (error: any) {
      res.status(400).json({
        code: 400,
        message: `Failed to build permission from query: ${error.message}`,
      });
      return;
    }

    console.log(`🔒 Checking permission:`, {
      userId,
      schema: query.schema,
      permission,
    });

    // STEP 5: Check Redis cache for permission decision
    const cacheKey = `schema:{${query.schema}}:user:${userId}:perm:${permission}`;

    try {
      const cached = await redisService.get(cacheKey);

      if (cached === 'GRANTED') {
        console.log(`✅ Permission granted (cached):`, { userId, permission });

        // Enrich context and continue
        req.jqelContext = {
          userId,
          jwt,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        };

        return next();
      }

      if (cached === 'DENIED') {
        console.log(`❌ Permission denied (cached):`, { userId, permission });

        res.status(403).json({
          code: 403,
          message: 'Permission denied',
          required_permission: permission,
        });
        return;
      }
    } catch (error) {
      // Redis error - log but continue (don't block on cache failure)
      console.warn('⚠️  Redis cache read failed in jqelAuthorization:', error);
    }

    // STEP 6: Cache miss - validate permission via /auth/authorize
    try {
      // Internal HTTP call to /auth/authorize
      // Alternative: Direct service call (more efficient, but requires refactoring)
      const backendUrl = config.backendUrl || 'http://localhost:3000';
      const authResponse = await axios.post(
        `${backendUrl}/api/1/auth/authorize`,
        {
          access_token: jwt,
          schema: query.schema,
          permission,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 second timeout
        }
      );

      const isGranted = authResponse.data.authorized === true;

      // STEP 7: Cache the result
      try {
        await redisService.set(
          cacheKey,
          isGranted ? 'GRANTED' : 'DENIED',
          300 // 5 minutes TTL (SPEC-AU-AZ-036)
        );
      } catch (error) {
        // Redis error - log but don't fail request
        console.warn('⚠️  Redis cache write failed in jqelAuthorization:', error);
      }

      // STEP 8: Return authorization decision
      if (isGranted) {
        console.log(`✅ Permission granted:`, { userId, permission });

        // Enrich context and continue
        req.jqelContext = {
          userId,
          jwt,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        };

        return next();
      } else {
        console.log(`❌ Permission denied:`, { userId, permission });

        res.status(403).json({
          code: 403,
          message: 'Permission denied',
          required_permission: permission,
        });
        return;
      }
    } catch (error: any) {
      console.error('❌ Error calling /auth/authorize:', error);

      // Authorization service errors
      if (error.code === 'ECONNREFUSED') {
        res.status(500).json({
          code: 500,
          message: 'Authorization service is unavailable',
        });
        return;
      }

      if (error.code === 'ETIMEDOUT') {
        res.status(500).json({
          code: 500,
          message: 'Authorization request timed out',
        });
        return;
      }

      // Other errors
      res.status(500).json({
        code: 500,
        message: 'An unexpected error occurred during authorization',
      });
      return;
    }
  } catch (error) {
    console.error('❌ Unexpected error in jqelAuthorization:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal authorization error',
    });
  }
};
