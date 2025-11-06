import express, { Application } from 'express';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { getSecurityMiddleware } from './middleware/security.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import { redisService } from './services/redis.service.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';

/**
 * Create and configure Express application
 *
 * Middleware order is critical:
 * 1. Security headers (first)
 * 2. CORS (before routes)
 * 3. Logging (after CORS)
 * 4. Body parsing (before routes)
 * 5. Compression
 * 6. Routes
 * 7. 404 handler (after routes)
 * 8. Error handler (last, with 4 parameters)
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
  console.error('❌ Failed to connect to Redis:', error);
  console.warn('⚠️  Token rotation and reuse detection will not work without Redis');
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.use('/api', healthRoutes);

// Authentication routes (Task 1.3)
app.use('/api/1/auth', authRoutes);

// Future routes will be mounted here:
// app.use('/api/jqel', jqelRoutes);         // Task 1.4 - JQEL processor
// app.use('/api/events', eventsRoutes);     // Task 1.5 - SSE events

// ============================================
// ERROR HANDLING (Must be last!)
// ============================================

// 404 handler - after all routes
app.use(notFoundHandler);

// Global error handler - absolutely last (4 parameters!)
app.use(errorHandler);

export default app;
