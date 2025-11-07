import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'

const app = express()

// SPEC-A-S-015: Security headers via Helmet
app.use(helmet())

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
