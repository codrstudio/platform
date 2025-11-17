import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import jqelRoutes from './routes/jqel.routes.js'
import eventsRoutes from './routes/events.routes.js'
import adminRoutes from './routes/admin.routes.js'
import cacheRoutes from './routes/cache.routes.js'
import assetsRoutes from './routes/assets.routes.js'
import manifestRoutes from './routes/manifest.routes.js'
import agentRoutes from './routes/agent.routes.js'
import modulesRoutes from './routes/modules.routes.js'
import storageRoutes from './routes/storage.routes.js'
import { cacheEpochMiddleware } from './middleware/cache-epoch.middleware.js'
import { clearSiteDataMiddleware } from './middleware/clear-site-data.middleware.js'

const app = express()

// SPEC-A-S-015: Security headers via Helmet
app.use(helmet())

// Cache Epoch Middleware - adds X-Cache-Epoch header to all responses
app.use(cacheEpochMiddleware)

// Clear-Site-Data Middleware - force cache clear when FORCE_CACHE_CLEAR=true
app.use(clearSiteDataMiddleware)

// SPEC-CF-VE-003: CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
)

// SPEC-CF-VEO-001: Body parsers with size limit
app.use(express.json({ limit: env.MAX_REQUEST_SIZE }))
app.use(express.urlencoded({ extended: true, limit: env.MAX_REQUEST_SIZE }))

// Cookie parser middleware (SPEC-AU-ST-005)
app.use(cookieParser())

// SPEC-CF-VEO-005: HTTP logging with Morgan
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Platform Backend',
    version: '0.0.0',
    environment: env.NODE_ENV,
  })
})

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  })
})

// Authentication routes (SPEC-AU-RO-001)
app.use('/api/1/auth', authRoutes)

// JQEL routes (SPEC-DA-W-005)
app.use('/api/jqel', jqelRoutes)

// Events routes (SPEC-EV-SSE-005, SPEC-CH-EV-015)
app.use('/api/events', eventsRoutes)

// Agent routes (SPEC-CHAT-I-001: AI agent integration with streaming)
app.use('/api', agentRoutes)

// Admin routes (BullBoard UI for queue management)
app.use('/admin', adminRoutes)

// Cache routes - epoch management
app.use('/api/cache', cacheRoutes)

// Assets routes - icon upload and management
app.use('/api/1/assets', assetsRoutes)

// Manifest routes - dynamic PWA manifest
app.use('/', manifestRoutes)

// Modules routes - registered modules discovery
app.use('/api/modules', modulesRoutes)

// Storage routes - external config file management
app.use('/api/storage', storageRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  })
})

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err)

  const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' ? err.statusCode : 500

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

export default app
