/**
 * Backend Server
 * Express server with authentication, JQEL, and comprehensive middleware
 * SPEC-A-L-011 to SPEC-A-L-017
 */

// IMPORTANT: Load environment variables FIRST, before any other imports
// This ensures all modules have access to process.env when they are loaded
import './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Configuration
import { getCorsConfig } from './config/cors.js';
import { getSecurityConfig } from './config/security.js';

// Middleware
import { requestLogger, logger } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import {
  generalRateLimiter,
  authRateLimiter,
  jqelRateLimiter,
} from './middleware/rateLimiter.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import jqelRoutes from './routes/jqel.routes.js';
import healthRoutes from './routes/health.routes.js';
import eventsRoutes from './routes/events.routes.js';

// Services
import { connectRedis, disconnectRedis } from './services/redisService.js';
import { startListening, shutdown as shutdownSSE } from './services/sseService.js';

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

/**
 * Security Middleware
 * SPEC-A-L-012: Backend validation and security
 */
app.use(helmet(getSecurityConfig()));

/**
 * CORS Configuration
 * SPEC-A-L-012: Backend validation
 */
app.use(cors(getCorsConfig()));

/**
 * Body Parsing Middleware
 * Parse JSON and URL-encoded bodies
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 * SPEC-A-L-015: Backend control operations
 */
app.use(requestLogger);

/**
 * HTML Cache Headers Middleware
 * SPEC-A-PWA-027: Backend MUST set Cache-Control: no-cache for HTML
 * This ensures HTML always fetches fresh from network in network-first strategy
 */
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html' || req.accepts('html') === 'html') {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

/**
 * General Rate Limiting
 * Apply to all routes (except health checks)
 */
app.use(generalRateLimiter);

/**
 * Health Check Routes
 * No authentication required
 */
app.use('/health', healthRoutes);

/**
 * Authentication Routes
 * With strict rate limiting
 */
app.use('/api/1/auth', authRateLimiter, authRoutes);

/**
 * JQEL Routes
 * With moderate rate limiting
 */
app.use('/api/jqel', jqelRateLimiter, jqelRoutes);

/**
 * Events Routes (SSE)
 * SPEC-EV-SSE-005: Frontend connects to GET /api/events/stream
 * No rate limiting (long-lived connections)
 */
app.use('/api/events', eventsRoutes);

/**
 * 404 Handler
 * Must be AFTER all routes
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 * Must be LAST middleware
 */
app.use(errorHandler);

/**
 * Initialize and Start Server
 * SPEC-EV-AR-005: Connect to Redis before starting
 */
async function startServer() {
  try {
    // Connect to Redis
    // SPEC-EV-AR-005: System uses Redis as message broker
    logger.info('[Init] Connecting to Redis...');
    await connectRedis();
    logger.info('[Init] ✅ Redis connected');

    // Start SSE listening to Redis Pub/Sub
    // SPEC-EV-PS-008: Backend subscribes to appropriate channels
    logger.info('[Init] Starting SSE listener...');
    await startListening(['platform:events']);
    logger.info('[Init] ✅ SSE listener started');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info('🚀 Backend server started', {
        port: PORT,
        environment: ENV,
        nodeVersion: process.version,
        cors: process.env.FRONTEND_URL || 'http://localhost:5173',
      });

      // Log configuration
      logger.info('📋 Configuration loaded', {
        redis: process.env.REDIS_HOST || 'localhost',
        n8n: process.env.N8N_WEBHOOK_BASE_URL ? 'configured' : 'not configured',
        rateLimiting: 'enabled',
        logging: process.env.LOG_LEVEL || 'info',
        sse: 'enabled',
      });
    });

    return server;
  } catch (error) {
    logger.error('[Init] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
const serverPromise = startServer();

/**
 * Graceful Shutdown Handlers
 * SPEC-A-L-015: Backend control operations
 */
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  // Wait for server to be initialized
  const srv = await serverPromise;

  // Close HTTP server
  srv.close(async () => {
    logger.info('[Shutdown] HTTP server closed');

    // Shutdown SSE service (close all connections)
    logger.info('[Shutdown] Closing SSE connections...');
    shutdownSSE();

    // Disconnect from Redis
    logger.info('[Shutdown] Disconnecting from Redis...');
    await disconnectRedis();

    logger.info('[Shutdown] ✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('[Shutdown] ⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  shutdown('UNHANDLED_REJECTION');
});

export default app;
