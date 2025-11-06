import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { tokenRotationService } from '../services/tokenRotation.service.js';
import { jwtService } from '../services/jwt.service.js';
import { n8nProxyService } from '../services/n8nProxy.service.js';
import { redisService } from '../services/redis.service.js';
import { bruteForceService } from '../services/bruteForceProtection.service.js';
import bruteForceMiddleware from '../middleware/bruteForce.middleware.js';
import type { JwtPayload } from '../types/auth.types.js';

const router = Router();

/**
 * POST /api/1/auth/login
 *
 * Authenticate user with credentials and issue JWT tokens.
 * Proxies to n8n Backbone for credential validation and user data retrieval.
 *
 * SPEC References:
 * - SPEC-AU-AR-002: Backend acts as proxy for authentication routes
 * - SPEC-AU-LI-001:006: Accept username, password, realm, schema fields
 * - SPEC-AU-LI-007:011: Backend validates presence, Backbone validates credentials
 * - SPEC-AU-LI-012:018: Return success response with tokens and payload
 * - SPEC-AU-LI-019:022: Return 401 for invalid credentials with structured error
 * - SPEC-AU-LI-023:026: Security requirements (no password logging, rate limiting)
 */
router.post(
  '/login',
  bruteForceMiddleware, // NEW - check brute force protection BEFORE processing credentials
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // SPEC-AU-LI-007: Validate presence of username and password
      if (!req.body.username || req.body.username.trim() === '') {
        res.status(400).json({
          code: 'missing_field',
          field: 'username',
          message: 'Username is required',
        });
        return;
      }

      if (!req.body.password || req.body.password.trim() === '') {
        res.status(400).json({
          code: 'missing_field',
          field: 'password',
          message: 'Password is required',
        });
        return;
      }

      // Extract credentials from request body
      const credentials = {
        username: req.body.username,
        password: req.body.password,
        realm: req.body.realm,
        schema: req.body.schema,
      };

      // SPEC-AU-LI-008:010: Proxy credentials to n8n for validation
      let userData;
      try {
        userData = await n8nProxyService.login(credentials);
      } catch (error: any) {
        // Map n8n errors to client responses
        // SPEC-AU-LI-023: NEVER log password
        console.error('❌ Error in /auth/login:', {
          timestamp: new Date().toISOString(),
          error: error.message,
          username: credentials.username, // OK to log username
          ip: req.ip,
        });

        // SPEC-AU-LI-019:022: Invalid credentials return HTTP 401
        if (error.message?.includes('Invalid credentials')) {
          // Record failed attempt for brute force protection
          await bruteForceService.recordFailure(credentials.username, req.ip || '0.0.0.0');

          res.status(401).json({
            code: 'invalid_credentials',
            message: 'Invalid username or password',
          });
          return;
        }

        // Network errors - n8n unreachable
        if (error.message?.includes('n8n unreachable')) {
          res.status(500).json({
            code: 'n8n_unavailable',
            message: 'Authentication service is unavailable',
          });
          return;
        }

        // Timeout errors
        if (error.message?.includes('timeout')) {
          res.status(500).json({
            code: 'request_timeout',
            message: 'Authentication request timed out',
          });
          return;
        }

        // Other n8n errors
        res.status(500).json({
          code: 'internal_error',
          message: 'An unexpected error occurred during authentication',
        });
        return;
      }

      // SPEC-AU-LI-012:018: Generate token pair
      // Generate new access token (JWT)
      const accessTokenPayload: JwtPayload = {
        sub: userData.id,
        username: userData.username,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
      };
      const accessToken = jwtService.generateAccessToken(accessTokenPayload);

      // Generate new refresh token (opaque)
      const refreshToken = tokenRotationService.generateRefreshToken();

      // Generate NEW family ID for login (not rotation)
      const familyId = crypto.randomUUID();

      // Get TTL for access token
      const expiresIn = jwtService.getAccessTokenTTL();

      // Store refresh token in Redis with metadata
      await tokenRotationService.storeRefreshToken(refreshToken, {
        userId: userData.id,
        familyId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Clear brute force attempts after successful login
      await bruteForceService.clearAttempts(credentials.username, req.ip || '0.0.0.0');

      // SPEC-AU-LI-012:018: Success response
      res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: expiresIn,
        payload: {
          sub: userData.id,
          username: userData.username,
          email: userData.email,
          roles: userData.roles,
          permissions: userData.permissions,
        },
      });
    } catch (error) {
      console.error('❌ Unexpected error in /auth/login:', error);
      next(error);
    }
  }
);

/**
 * POST /api/1/auth/refresh
 *
 * Refresh access token using refresh token with rotation.
 * Implements token reuse detection and family revocation.
 *
 * SPEC References:
 * - SPEC-AU-RF-001: Aceitar refresh_token no body JSON
 * - SPEC-AU-RF-002: Aceitar refresh_token em cookie HTTP-only
 * - SPEC-AU-RF-006: Validar refresh_token
 * - SPEC-AU-RF-008: Detectar reuso de token
 * - SPEC-AU-RF-009: Reuso detectado revoga família inteira
 * - SPEC-AU-RF-011: Token válido gera novo refresh token (rotação)
 * - SPEC-AU-RF-012: Refresh token antigo deve ser invalidado
 * - SPEC-AU-RF-018: Token inválido retorna HTTP 401
 * - SPEC-AU-RF-019: Reuso detectado retorna HTTP 401
 * - SPEC-AU-RF-020: Retornar code e message apropriados
 */
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // SPEC-AU-RF-001: Accept refresh_token from body
      // SPEC-AU-RF-002: Accept refresh_token from cookie
      // SPEC-AU-RF-003: Body has priority if both present
      const refreshToken = req.body.refresh_token || req.cookies?.refresh_token;

      if (!refreshToken) {
        res.status(401).json({
          code: 'missing_token',
          message: 'Refresh token is required',
        });
        return;
      }

      // SPEC-AU-RF-004: Validate token is string
      if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        res.status(401).json({
          code: 'invalid_token_format',
          message: 'Refresh token must be a non-empty string',
        });
        return;
      }

      // SPEC-AU-RF-006: Validate refresh token
      // SPEC-AU-RF-007: Check if token is not revoked
      // SPEC-AU-RF-008: Detect token reuse
      const validation = await tokenRotationService.validateRefreshToken(refreshToken);

      // Handle validation errors
      if (!validation.valid) {
        // SPEC-AU-RF-009: Token reuse revokes entire family
        if (validation.error === 'REUSED' && validation.data) {
          console.warn('⚠️ Token reuse detected', {
            userId: validation.data.user_id,
            familyId: validation.data.family_id,
            tokenHash: validation.data.token_hash.substring(0, 16) + '...',
            ip: req.ip,
            userAgent: req.get('user-agent'),
          });

          // Revoke entire token family
          await tokenRotationService.revokeTokenFamily(validation.data.family_id);

          console.error('🚨 Token family revoked due to reuse', {
            familyId: validation.data.family_id,
            userId: validation.data.user_id,
          });

          // SPEC-AU-RF-019: Reuse detected returns HTTP 401
          // SPEC-AU-RF-020: Return appropriate code and message
          res.status(401).json({
            code: 'token_reused',
            message: 'Refresh token has been reused. All sessions have been revoked for security.',
          });
          return;
        }

        // Handle other validation errors
        // SPEC-AU-RF-018: Invalid or expired token returns HTTP 401
        const errorResponses: Record<string, { code: string; message: string }> = {
          NOT_FOUND: { code: 'invalid_token', message: 'Refresh token is invalid or expired' },
          EXPIRED: { code: 'token_expired', message: 'Refresh token has expired' },
          REVOKED: { code: 'token_revoked', message: 'Refresh token has been revoked' },
          REDIS_ERROR: { code: 'internal_error', message: 'Failed to validate token' },
        };

        const error = errorResponses[validation.error!] || errorResponses['REDIS_ERROR'];
        const statusCode = validation.error === 'REDIS_ERROR' ? 500 : 401;

        res.status(statusCode).json(error);
        return;
      }

      // Token is valid - mark as consumed to detect future reuse
      // SPEC-AU-RF-012: Old refresh token must be invalidated
      const tokenHash = (validation.data as any).token_hash;
      await tokenRotationService.markTokenConsumed(tokenHash);

      // SPEC-AU-RF-011: Valid token generates new refresh token (rotation)
      // Generate new tokens
      const userId = validation.data!.user_id;
      const familyId = validation.data!.family_id;

      // Generate new access token (JWT)
      // SPEC-AU-RF-013: Return new access_token (JWT)
      const accessTokenPayload: JwtPayload = {
        sub: userId,
        // Add additional claims as needed
      };
      const accessToken = jwtService.generateAccessToken(accessTokenPayload);

      // Generate new refresh token (opaque)
      // SPEC-AU-RF-014: Return new refresh_token
      const newRefreshToken = tokenRotationService.generateRefreshToken();

      // Store new refresh token with same family ID (rotation)
      // SPEC-AU-RF-022: Rotation maintains token in same family
      await tokenRotationService.storeRefreshToken(newRefreshToken, {
        userId,
        familyId, // Keep same family for rotation chain
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Parse expiration time from config
      const expiresIn = jwtService.getAccessTokenTTL();

      // SPEC-AU-RF-013: Return new access_token (JWT)
      // SPEC-AU-RF-014: Return new refresh_token
      // SPEC-AU-RF-015: Return token_type ("Bearer")
      // SPEC-AU-RF-016: Return expires_in (seconds)
      res.status(200).json({
        access_token: accessToken,
        refresh_token: newRefreshToken,
        token_type: 'bearer',
        expires_in: expiresIn,
      });
    } catch (error) {
      console.error('❌ Error in /auth/refresh:', error);
      next(error);
    }
  }
);

/**
 * POST /api/1/auth/logout
 *
 * Revoke a specific refresh token.
 *
 * SPEC References:
 * - SPEC-AU-LO-001: Accept refresh_token in body JSON
 * - SPEC-AU-LO-002: Accept refresh_token in HTTP-only cookie
 * - SPEC-AU-LO-003: Body has priority if both present
 * - SPEC-AU-LO-005: Revoke specific refresh_token
 * - SPEC-AU-LO-006: Revocation is immediate
 * - SPEC-AU-LO-007: Revoked token cannot be used for refresh
 */
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // SPEC-AU-LO-001: Accept refresh_token from body
      // SPEC-AU-LO-002: Accept refresh_token from cookie
      // SPEC-AU-LO-003: Body has priority if both present
      const refreshToken = req.body.refresh_token || req.cookies?.refresh_token;

      if (!refreshToken) {
        res.status(400).json({
          code: 'missing_token',
          message: 'Refresh token is required',
        });
        return;
      }

      // SPEC-AU-LO-005: Revoke specific refresh_token
      // SPEC-AU-LO-006: Revocation is immediate
      await tokenRotationService.revokeToken(refreshToken);

      res.status(200).json({
        code: 'success',
        message: 'Token revoked successfully',
      });
    } catch (error) {
      console.error('❌ Error in /auth/logout:', error);
      next(error);
    }
  }
);

/**
 * POST /api/1/auth/logout-all
 *
 * Revoke all refresh tokens for a user.
 * Extracts user ID from JWT access token.
 *
 * SPEC References:
 * - SPEC-AU-LA-001: Accept access_token in body JSON
 * - SPEC-AU-LA-002: Accept access_token in header Authorization: Bearer
 * - SPEC-AU-LA-003: Accept access_token in HTTP-only cookie
 * - SPEC-AU-LA-004: Priority order: header > body > cookie
 * - SPEC-AU-LA-005: Backend must validate access_token (JWT)
 * - SPEC-AU-LA-006: Backend must extract userId from token
 * - SPEC-AU-LA-008: Revoke ALL refresh tokens for user
 * - SPEC-AU-LA-015: Invalid token returns HTTP 401
 * - SPEC-AU-LA-016: Expired token returns HTTP 401
 */
router.post(
  '/logout-all',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // SPEC-AU-LA-001:004 - Extract access_token with priority: header > body > cookie
      let accessToken: string | undefined;

      // Priority 1: Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      // Priority 2: Body
      if (!accessToken && req.body.access_token) {
        accessToken = req.body.access_token;
      }

      // Priority 3: Cookie
      if (!accessToken && req.cookies?.access_token) {
        accessToken = req.cookies.access_token;
      }

      // Validate presence of token
      if (!accessToken) {
        res.status(401).json({
          code: 'missing_token',
          message: 'Access token is required',
        });
        return;
      }

      // SPEC-AU-LA-005: Validate access_token (JWT)
      // SPEC-AU-LA-006: Extract userId from token
      let userId: string;
      try {
        const payload = jwtService.verifyAccessToken(accessToken);
        userId = payload.sub;

        if (!userId) {
          res.status(401).json({
            code: 'invalid_token',
            message: 'Token does not contain user ID',
          });
          return;
        }
      } catch (error: any) {
        // SPEC-AU-LA-015: Invalid token returns HTTP 401
        // SPEC-AU-LA-016: Expired token returns HTTP 401
        if (error.message === 'Token expired') {
          res.status(401).json({
            code: 'token_expired',
            message: 'Access token has expired',
          });
          return;
        }

        res.status(401).json({
          code: 'invalid_token',
          message: 'Access token is invalid',
        });
        return;
      }

      // SPEC-AU-LA-008: Revoke ALL refresh tokens for user
      // SPEC-AU-LA-009: Revocation is immediate
      // SPEC-AU-LA-010: All sessions terminated
      const count = await tokenRotationService.revokeAllUserTokens(userId);

      // SPEC-AU-LA-011: Return HTTP 200
      // SPEC-AU-LA-012: Return code "success"
      // SPEC-AU-LA-013: Return message
      // SPEC-AU-LA-014: Return number of sessions revoked
      res.status(200).json({
        code: 'success',
        message: `All sessions logged out successfully`,
        tokens_revoked: count,
      });
    } catch (error) {
      console.error('❌ Error in /auth/logout-all:', error);
      // SPEC-AU-LA-017: Internal error returns HTTP 500
      next(error);
    }
  }
);

/**
 * POST /api/1/auth/authorize
 *
 * Validate JWT access token and check user permissions.
 * Supports validating token only, or token + specific permission.
 *
 * SPEC References:
 * - SPEC-AU-AZ-001:004: Accept access_token from header, body, or cookie
 * - SPEC-AU-AZ-005:008: Accept schema and permission parameters
 * - SPEC-AU-AZ-009:013: Permission format {operation}.{entity}[.{action}]
 * - SPEC-AU-AZ-014:019: Validate JWT, proxy to n8n, cache result
 * - SPEC-AU-AZ-033:036: Cache authorization decisions in Redis
 */
router.post(
  '/authorize',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // STEP 1: Extract access_token with priority: header > body > cookie
      // SPEC-AU-AZ-001:004
      let accessToken: string | undefined;

      // Priority 1: Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      // Priority 2: Body
      if (!accessToken && req.body.access_token) {
        accessToken = req.body.access_token;
      }

      // Priority 3: Cookie
      if (!accessToken && req.cookies?.access_token) {
        accessToken = req.cookies.access_token;
      }

      // Validate presence of token
      if (!accessToken) {
        res.status(401).json({
          authorized: false,
          code: 'missing_token',
          message: 'Access token is required',
        });
        return;
      }

      // STEP 2: Parse schema and permission from request
      // SPEC-AU-AZ-005:008
      let schema = req.body.schema || '*';
      let permission: string;

      // Check if permission is directly specified
      if (req.body.permission) {
        permission = req.body.permission;
      } else {
        // Parse from JQEL query (select/mutate)
        const operation = req.body.select ? 'select' : req.body.mutate ? 'mutate' : null;
        const entity = req.body.select || req.body.mutate;
        const action = req.body.action;

        if (!operation || !entity) {
          res.status(400).json({
            authorized: false,
            code: 'missing_permission',
            message: 'Permission, select, or mutate must be specified',
          });
          return;
        }

        // Build permission string: {operation}.{entity}[.{action}]
        // SPEC-AU-AZ-009:013
        permission = action
          ? `${operation}.${entity}.${action}`
          : `${operation}.${entity}`;
      }

      // STEP 3: Validate JWT locally (fast, synchronous check)
      // SPEC-AU-AZ-014:015
      let payload: JwtPayload;
      try {
        payload = jwtService.verifyAccessToken(accessToken);

        if (!payload.sub) {
          res.status(401).json({
            authorized: false,
            code: 'invalid_token',
            message: 'Token does not contain user ID',
          });
          return;
        }
      } catch (error: any) {
        // SPEC-AU-AZ-030:032: Invalid or expired token returns 401
        if (error.message === 'Token expired') {
          res.status(401).json({
            authorized: false,
            code: 'token_expired',
            message: 'Access token has expired',
          });
          return;
        }

        res.status(401).json({
          authorized: false,
          code: 'invalid_token',
          message: 'Access token is invalid',
        });
        return;
      }

      // STEP 4: If permission is "*", only validate token (no permission check)
      // SPEC-AU-AZ-008
      if (permission === '*') {
        res.status(200).json({
          authorized: true,
          payload,
        });
        return;
      }

      // STEP 5: Check Redis cache for permission decision
      // SPEC-AU-AZ-033:036
      const userId = payload.sub;
      const cacheKey = `schema:{${schema}}:user:${userId}:perm:${permission}`;

      try {
        const cached = await redisService.get(cacheKey);

        if (cached === 'GRANTED') {
          // Cache hit - authorized
          res.status(200).json({
            authorized: true,
            payload,
          });
          return;
        }

        if (cached === 'DENIED') {
          // Cache hit - forbidden
          res.status(403).json({
            authorized: false,
            code: 'forbidden',
            message: 'Permission denied',
            required_permission: permission,
          });
          return;
        }
      } catch (error) {
        // Redis error - log but continue (don't block on cache failure)
        console.warn('⚠️ Redis cache read failed in /authorize:', error);
      }

      // STEP 6: Cache miss - proxy to n8n for permission validation
      // SPEC-AU-AZ-016:017
      try {
        const n8nResponse = await n8nProxyService.authorize({
          access_token: accessToken,
          schema,
          permission,
        });

        // Extract authorization decision from n8n response
        const isGranted = n8nResponse.data?.isGranted || false;

        // STEP 7: Cache the result in Redis
        // SPEC-AU-AZ-018:019
        try {
          await redisService.set(
            cacheKey,
            isGranted ? 'GRANTED' : 'DENIED',
            300 // 5 minutes TTL (SPEC-AU-AZ-036)
          );
        } catch (error) {
          // Redis error - log but don't fail request
          console.warn('⚠️ Redis cache write failed in /authorize:', error);
        }

        // STEP 8: Return authorization decision
        if (isGranted) {
          // SPEC-AU-AZ-020:024 - Authorized
          res.status(200).json({
            authorized: true,
            payload,
            permissions: n8nResponse.data?.permissions,
          });
        } else {
          // SPEC-AU-AZ-025:029 - Forbidden
          res.status(403).json({
            authorized: false,
            code: 'forbidden',
            message: 'Permission denied',
            required_permission: permission,
          });
        }
      } catch (error: any) {
        // n8n proxy errors
        console.error('❌ Error proxying to n8n in /authorize:', error);

        // Network errors - n8n unreachable
        if (error.message?.includes('n8n unreachable')) {
          res.status(500).json({
            authorized: false,
            code: 'n8n_unavailable',
            message: 'Authorization service is unavailable',
          });
          return;
        }

        // Timeout errors
        if (error.message?.includes('timeout')) {
          res.status(500).json({
            authorized: false,
            code: 'request_timeout',
            message: 'Authorization request timed out',
          });
          return;
        }

        // Other n8n errors
        res.status(500).json({
          authorized: false,
          code: 'internal_error',
          message: 'An unexpected error occurred during authorization',
        });
      }
    } catch (error) {
      console.error('❌ Unexpected error in /auth/authorize:', error);
      next(error);
    }
  }
);

export default router;
