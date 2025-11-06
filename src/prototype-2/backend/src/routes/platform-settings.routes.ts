/**
 * Platform Settings Routes
 *
 * Exposes read-only platform configuration and service health status.
 * Filters sensitive values (secrets, passwords) before returning.
 *
 * Based on Task 2.2.6 plan
 */

import { Router } from 'express';
import { config } from '../config/env.js';
import {
  checkN8nHealth,
  checkRedisHealth,
  checkBackendHealth,
} from '../services/healthCheck.service.js';

const router = Router();

/**
 * GET /api/platform-settings
 *
 * Returns platform configuration (sanitized) and service health status.
 * Requires authentication (JWT validation middleware applied globally).
 */
router.get('/platform-settings', async (_req, res, next) => {
  try {
    // Run health checks in parallel
    const [n8nHealthy, redisHealthy, backendHealthy] = await Promise.all([
      checkN8nHealth(),
      checkRedisHealth(),
      Promise.resolve(checkBackendHealth()),
    ]);

    // Build sanitized settings object
    // SECURITY: Filter out all secrets and passwords
    const settings = {
      nodeEnv: config.nodeEnv,
      port: config.port,
      frontendUrl: config.frontendUrl,
      backendUrl: config.backendUrl,
      n8nBaseUrl: config.n8nBaseUrl,
      redisHost: config.redisHost,
      redisPort: config.redisPort,
      redisDb: config.redisDb,
      redisAuthenticated: !!config.redisPassword, // Boolean flag, NOT the actual password
      logLevel: config.logLevel || 'info',
      systemSchemaTarget: config.systemSchemaTarget || 'backend',
    };

    // Build health status object
    const health = {
      n8n: n8nHealthy,
      redis: redisHealthy,
      backend: backendHealthy,
    };

    // Return response
    res.json({
      settings,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[PlatformSettings] Error retrieving settings:', error);
    next(error); // Pass to error handler middleware
  }
});

export default router;
