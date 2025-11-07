import app from './app.js'
import { env } from './config/env.js'

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Backend running on ${env.BACKEND_URL}`)
  console.log(`📝 Environment: ${env.NODE_ENV}`)
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`)
  console.log(`🔗 n8n URL: ${env.N8N_BASE_URL}`)
  console.log()
  console.log(`✓ Server started successfully`)
})

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log()
  console.log(`⚠️  ${signal} received, shutting down gracefully...`)

  server.close(() => {
    console.log('✓ Server closed')
    process.exit(0)
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
