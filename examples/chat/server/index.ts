/**
 * NIC Chat Backend Server
 * Servidor Express para proxy de APIs de IA (evita cross-domain no frontend)
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import aiRoutes from './routes/ai.js'
import agentRoutes from './routes/agents.js'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Rotas
app.use('/api/ai', aiRoutes)
app.use('/api/agents', agentRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nic-chat-backend' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NIC Chat Backend running on http://localhost:${PORT}`)
  console.log(`📡 API Proxy available at http://localhost:${PORT}/api/ai`)
  console.log(`🤖 Agents API available at http://localhost:${PORT}/api/agents`)
  console.log(`💚 Health check: http://localhost:${PORT}/health`)
})
