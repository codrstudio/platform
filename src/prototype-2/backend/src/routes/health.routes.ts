import { Router, Request, Response } from 'express';
import { n8nProxyService } from '../services/n8nProxy.service.js';
import { redisService } from '../services/redis.service.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 *
 * Returns basic service health information
 * Can be extended to check dependencies (Redis, n8n)
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
  });
});

/**
 * n8n Backbone health check endpoint
 * GET /api/health/n8n
 *
 * SPEC-MS-HE-001:003: Health check for n8n connectivity
 *
 * Returns:
 * - 200: n8n is reachable and operational
 * - 503: n8n is down or unreachable
 */
router.get('/health/n8n', async (_req: Request, res: Response) => {
  try {
    const result = await n8nProxyService.healthCheck();

    // Map status to HTTP status code
    const statusCode = result.status === 'ok' ? 200 : 503;

    return res.status(statusCode).json(result);
  } catch (error: any) {
    return res.status(503).json({
      status: 'down',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Redis health check endpoint
 * GET /api/health/redis
 *
 * SPEC-MS-HE-004:006: Health check for Redis connectivity
 *
 * Returns:
 * - 200: Redis is reachable and operational
 * - 503: Redis is down or unreachable
 */
router.get('/health/redis', async (_req: Request, res: Response) => {
  try {
    const result = await redisService.healthCheck();

    // Map status to HTTP status code
    const statusCode = result.status === 'ok' ? 200 : 503;

    return res.status(statusCode).json(result);
  } catch (error: any) {
    return res.status(503).json({
      status: 'down',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Backend self-health check endpoint
 * GET /api/health/backend
 *
 * SPEC-MS-HE-007:009: Backend service health and system metrics
 *
 * Returns:
 * - 200: Backend is operational (always, if this responds)
 * - Includes system metrics: uptime, memory, Node.js version
 */
router.get('/health/backend', (_req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      nodeVersion: process.version,
    });
  } catch (error: any) {
    // Extremely unlikely, but handle gracefully
    return res.status(500).json({
      status: 'down',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
