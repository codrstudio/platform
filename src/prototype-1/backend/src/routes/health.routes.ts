/**
 * Health Check Routes
 * Provides health status endpoints for monitoring
 * SPEC-A-L-015: Backend control operations
 */

import { Router, Request, Response } from 'express';
import type { JResult } from '../types/jresult.types.js';
import { checkRedisHealth, getRedisInfo } from '../services/redisService.js';
import { getConnectionCount } from '../services/sseService.js';

const router = Router();

/**
 * Basic health check
 * GET /health
 * Returns 200 if server is running
 */
router.get('/', async (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(health);
});

/**
 * Detailed health check
 * GET /health/detailed
 * Checks all dependencies: Redis, n8n, etc.
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  const checks: Record<string, any> = {};
  let overallStatus = 'ok';

  // Check Redis connection
  try {
    const isHealthy = await checkRedisHealth();
    const redisInfo = getRedisInfo();

    if (isHealthy) {
      checks.redis = {
        status: 'ok',
        host: redisInfo.host,
        port: redisInfo.port,
        db: redisInfo.db,
        connected: true,
      };
    } else {
      checks.redis = {
        status: 'error',
        message: 'Redis not connected',
        host: redisInfo.host,
        port: redisInfo.port,
      };
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.redis = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'degraded';
  }

  // Check SSE connections
  try {
    const activeConnections = getConnectionCount();
    checks.sse = {
      status: 'ok',
      activeConnections,
      endpoint: '/api/events/stream',
    };
  } catch (error) {
    checks.sse = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check n8n connection
  try {
    if (process.env.N8N_WEBHOOK_BASE_URL) {
      checks.n8n = {
        status: 'configured',
        baseUrl: process.env.N8N_WEBHOOK_BASE_URL,
        note: 'Backbone workflows accessible',
      };

      // Optional: Try to ping n8n health endpoint
      // This would require implementing an HTTP client call
      // For now, just verify configuration exists
    } else {
      checks.n8n = {
        status: 'not_configured',
        message: 'N8N_WEBHOOK_BASE_URL not set',
      };
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.n8n = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'degraded';
  }

  // Check environment variables
  const requiredEnvVars = [
    'PORT',
    'FRONTEND_URL',
    'N8N_WEBHOOK_BASE_URL',
    'N8N_AUTH_SECRET',
    'JWT_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'incomplete',
    required: requiredEnvVars.length,
    configured: requiredEnvVars.length - missingEnvVars.length,
    missing: missingEnvVars,
  };

  if (missingEnvVars.length > 0) {
    overallStatus = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: 'ok',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
  };

  const result: JResult<typeof checks> = {
    code: overallStatus === 'ok' ? 200 : 503,
    message: overallStatus === 'ok' ? 'All systems operational' : 'Some systems degraded',
    data: checks,
  };

  const statusCode = overallStatus === 'ok' ? 200 : 503;
  res.status(statusCode).json(result);
});

/**
 * Readiness check
 * GET /health/ready
 * Returns 200 when server is ready to accept requests
 */
router.get('/ready', async (_req: Request, res: Response) => {
  // Add any readiness checks here (DB connections, etc.)
  const ready = {
    status: 'ready',
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(ready);
});

/**
 * Liveness check
 * GET /health/live
 * Returns 200 if server process is alive
 */
router.get('/live', async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
