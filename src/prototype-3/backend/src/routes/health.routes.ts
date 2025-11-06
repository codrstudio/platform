import { Router, type Request, type Response } from 'express';
import { redisService } from '../services/redis.service.js';
import { n8nProxy } from '../services/n8nProxy.service.js';
import { env } from '../config/env.js';

/**
 * Health Check Routes
 *
 * SPEC-module-setup.md (SPEC-MS-PS-010 to SPEC-MS-PS-016)
 * SPEC-MS-HE-* sections about health monitoring
 *
 * Provides endpoints to monitor system health and service status.
 */

const router = Router();

/**
 * Service status types
 */
type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

interface ServiceHealth {
  status: ServiceStatus;
  message: string;
  responseTime?: number;
  lastCheck: string;
}

interface DetailedHealthResponse {
  status: ServiceStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    backend: ServiceHealth;
    redis: ServiceHealth;
    n8n: ServiceHealth;
  };
  version?: string;
}

/**
 * GET /health
 *
 * Basic health check endpoint.
 * Returns 200 OK if backend is running.
 *
 * SPEC-MS-PS-013: Backend health indicator
 *
 * Response:
 * {
 *   status: "healthy",
 *   timestamp: "2025-11-06T...",
 *   uptime: 12345
 * }
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

/**
 * GET /health/detailed
 *
 * Detailed health check with service checks.
 * Returns status of all critical services.
 *
 * SPEC-MS-PS-010: System health indicators
 * SPEC-MS-PS-011: n8n connectivity check
 * SPEC-MS-PS-012: Redis connectivity check
 * SPEC-MS-PS-013: Backend status
 * SPEC-MS-PS-014: Health checks via Backend requests
 * SPEC-MS-PS-015: Periodic health check updates
 * SPEC-MS-PS-016: Last check timestamp
 *
 * Response:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   timestamp: "2025-11-06T...",
 *   uptime: 12345,
 *   environment: "development",
 *   services: {
 *     backend: { status, message, responseTime, lastCheck },
 *     redis: { status, message, responseTime, lastCheck },
 *     n8n: { status, message, responseTime, lastCheck }
 *   }
 * }
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const services: DetailedHealthResponse['services'] = {
    backend: {
      status: 'healthy',
      message: 'Backend is running',
      lastCheck: timestamp,
    },
    redis: {
      status: 'unhealthy',
      message: 'Not checked',
      lastCheck: timestamp,
    },
    n8n: {
      status: 'unhealthy',
      message: 'Not checked',
      lastCheck: timestamp,
    },
  };

  // Check Redis connectivity
  // SPEC-MS-PS-012: Redis indicator (connected/disconnected)
  try {
    const redisStartTime = Date.now();
    const isRedisReady = redisService.isReady();

    if (isRedisReady) {
      // Test Redis with a PING command
      const client = redisService.getClient();
      await client.ping();

      const redisResponseTime = Date.now() - redisStartTime;
      services.redis = {
        status: 'healthy',
        message: 'Connected and responding',
        responseTime: redisResponseTime,
        lastCheck: timestamp,
      };
    } else {
      services.redis = {
        status: 'unhealthy',
        message: 'Not connected',
        lastCheck: timestamp,
      };
    }
  } catch (error) {
    services.redis = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
      lastCheck: timestamp,
    };
  }

  // Check n8n connectivity
  // SPEC-MS-PS-011: n8n indicator (connected/disconnected)
  try {
    const n8nStartTime = Date.now();
    const isN8nHealthy = await n8nProxy.checkHealth();
    const n8nResponseTime = Date.now() - n8nStartTime;

    if (isN8nHealthy) {
      services.n8n = {
        status: 'healthy',
        message: 'Connected and responding',
        responseTime: n8nResponseTime,
        lastCheck: timestamp,
      };
    } else {
      services.n8n = {
        status: 'unhealthy',
        message: 'Not responding',
        responseTime: n8nResponseTime,
        lastCheck: timestamp,
      };
    }
  } catch (error) {
    services.n8n = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
      lastCheck: timestamp,
    };
  }

  // Determine overall system status
  // healthy: all services healthy
  // degraded: some services unhealthy but system still functional
  // unhealthy: critical services down
  let overallStatus: ServiceStatus = 'healthy';

  const healthyCount = Object.values(services).filter(s => s.status === 'healthy').length;
  const totalServices = Object.keys(services).length;

  if (healthyCount === totalServices) {
    overallStatus = 'healthy';
  } else if (healthyCount === 0) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const response: DetailedHealthResponse = {
    status: overallStatus,
    timestamp,
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services,
    version: process.env.npm_package_version || '1.0.0',
  };

  // Return appropriate HTTP status code
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  res.status(statusCode).json(response);
});

export default router;
