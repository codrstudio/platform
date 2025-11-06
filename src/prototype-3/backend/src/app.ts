import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import portalsRoutes from './routes/portals.routes.js';
import jqelRoutes from './routes/jqel.routes.js';
import eventsRoutes from './routes/events.routes.js';
import healthRoutes from './routes/health.routes.js';

/**
 * SPEC-A-S-014 to SPEC-A-S-016: Backend stack (Node.js + Express + TypeScript)
 * SPEC-A-L-011 to SPEC-A-L-017: Backend responsibilities (proxy, validation, auth, routing)
 */

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware (helmet)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS middleware
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logging (morgan)
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // SPEC-A-PWA-027: Cache-Control header for HTML responses
  app.use((req, res, next) => {
    // Set Cache-Control for HTML navigation requests
    if (req.method === 'GET' && req.accepts('html')) {
      res.set('Cache-Control', 'no-cache');
    }
    next();
  });
  // Health check routes (basic + detailed)
  // SPEC-MS-PS-010 to SPEC-MS-PS-016: Health monitoring endpoints
  app.use('/health', healthRoutes);

  // Authentication routes (SPEC-AU-RO-001)
  app.use('/api/1/auth', authRoutes);

  // SSE events routes (SPEC-EV-SSE-005)
  app.use('/api/events', eventsRoutes);

  // Portal configuration routes
  // JQEL endpoint (SPEC-DA-W-005)
  app.use('/api/jqel', jqelRoutes);
  app.use('/api/portals', portalsRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    const statusCode = (err as any).statusCode || 500;
    const message = env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message;

    res.status(statusCode).json({
      error: err.name || 'Error',
      message,
      timestamp: new Date().toISOString(),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  return app;
}
