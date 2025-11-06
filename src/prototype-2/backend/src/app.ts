import express, { Application } from 'express';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { getSecurityMiddleware } from './middleware/security.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { authRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import { redisService } from './services/redis.service.js';
import { sseService } from './services/sse.service.js';
import { configWatcher } from './services/configWatcher.service.js';
import { logger } from './services/logger.service.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import jqelRoutes from './routes/jqel.routes.js';
import eventsRoutes from './routes/events.routes.js';
import portalsRoutes from './routes/portals.routes.js';
import platformSettingsRoutes from './routes/platform-settings.routes.js';

/**
 * Create and configure Express application
 *
 * Middleware order is critical:
 * 1. Security headers (first)
 * 2. CORS (before routes)
 * 3. Logging (after CORS)
 * 4. Body parsing (before routes)
 * 5. Compression
 * 6. Rate limiting (before protected routes)
 * 7. Routes
 * 8. 404 handler (after routes)
 * 9. Error handler (last, with 4 parameters)
 */
const app: Application = express();

// ============================================
// MIDDLEWARE (Order matters!)
// ============================================

// 1. Security headers - must be first
app.use(getSecurityMiddleware());

// 2. CORS - must be before routes
app.use(corsMiddleware);

// 3. Request logging - after CORS
app.use(loggerMiddleware);

// 4. Body parsing - before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Response compression
app.use(compression());

// ============================================
// SERVICES INITIALIZATION
// ============================================

// Initialize Redis connection (lazy - will connect on first use)
redisService.connect().catch((error) => {
  logger.error('Failed to connect to Redis', {
    category: 'redis',
    error: { message: error.message, stack: error.stack },
  });
  logger.warn('Token rotation and reuse detection will not work without Redis');
});

// Initialize SSE service (Redis Pub/Sub for real-time events)
sseService.initialize().catch((error) => {
  logger.error('Failed to initialize SSEService', {
    category: 'sse',
    error: { message: error.message, stack: error.stack },
  });
  logger.warn('Real-time events will not work without SSEService');
});

// Initialize configuration file watcher (Task 1.7.6)
configWatcher.initialize().catch((error) => {
  logger.error('Failed to initialize ConfigWatcher', {
    category: 'config',
    error: { message: error.message, stack: error.stack },
  });
  logger.warn('Config hot reload disabled - manual server restart required for config changes');
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.use('/api', healthRoutes);

// Rate limiting for authentication endpoints (Task 1.3.13)
app.use('/api/1/auth', authRateLimiter);

// Authentication routes (Task 1.3)
app.use('/api/1/auth', authRoutes);

// JQEL data access endpoint (Task 1.4.1)
app.use('/api/jqel', jqelRoutes);

// SSE events endpoint (Task 1.5.1)
app.use('/api/events', eventsRoutes);

// Portal configuration endpoints (Task 2.1)
app.use('/api/1/portals', portalsRoutes);

// Platform settings endpoint (Task 2.2.6)
app.use('/api', platformSettingsRoutes);

// ============================================
// FUTURE: Internal Routes (n8n → Backend)
// ============================================
// When implementing routes for n8n to call, apply platformAuthMiddleware:
//
// import { platformAuthMiddleware } from './middleware/platformAuth.middleware.js';
//
// app.use('/api/internal', platformAuthMiddleware);
// app.use('/api/internal', internalRoutes);
//
// This ensures only authorized n8n instances can call internal APIs.
// Task 1.7.8 - Platform key validation middleware is ready for use.
// ============================================

// ============================================
// ERROR HANDLING (Must be last!)
// ============================================

// 404 handler - after all routes
app.use(notFoundHandler);

// Global error handler - absolutely last (4 parameters!)
app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Graceful shutdown handler
 *
 * Cleanup connections before process exit:
 * - Close file watcher
 * - Close SSE connections
 * - Close Redis Pub/Sub subscriber
 * - Disconnect main Redis client
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.warn(`Received ${signal}, starting graceful shutdown`, {
    category: 'shutdown',
    signal,
  });

  try {
    // Shutdown config watcher (Task 1.7.6)
    await configWatcher.shutdown();

    // Shutdown SSE service (closes subscriber and all connections)
    await sseService.shutdown();

    // Disconnect main Redis client
    await redisService.disconnect();

    logger.info('Graceful shutdown complete', { category: 'shutdown' });
    process.exit(0);
  } catch (error: any) {
    logger.error('Error during shutdown', {
      category: 'shutdown',
      error: { message: error.message, stack: error.stack },
    });
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kill command

export default app;
