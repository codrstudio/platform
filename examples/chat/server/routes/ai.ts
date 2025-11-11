/**
 * AI Routes - Rotas de proxy para provedores de IA
 * GET  /api/ai/:provider/models
 * POST /api/ai/:provider/chat/completions
 */

import express from 'express'
import { proxyModels, proxyChatCompletions } from '../services/aiProxyService.js'

const router = express.Router()

/**
 * GET /api/ai/:provider/models
 * Lista modelos disponíveis de um provedor
 */
router.get('/:provider/models', async (req, res) => {
  try {
    const { provider } = req.params
    console.log(`[AI Proxy] Fetching models for provider: ${provider}`)

    const data = await proxyModels(provider)
    res.json(data)
  } catch (error: any) {
    console.error(`[AI Proxy] Error fetching models for ${req.params.provider}:`, error.message)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/ai/:provider/chat/completions
 * Envia mensagem para chat completion (suporta streaming)
 */
router.post('/:provider/chat/completions', async (req, res) => {
  try {
    const { provider } = req.params
    const payload = req.body

    console.log(`[AI Proxy] Chat completions for provider: ${provider}, stream: ${payload.stream}`)

    // Se stream=true, configurar SSE
    if (payload.stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      await proxyChatCompletions(provider, payload, res)
    } else {
      const data = await proxyChatCompletions(provider, payload)
      res.json(data)
    }
  } catch (error: any) {
    console.error(`[AI Proxy] Error in chat completions for ${req.params.provider}:`, error.message)

    // Só enviar erro se headers ainda não foram enviados (não streaming)
    if (!res.headersSent) {
      res.status(500).json({ error: error.message })
    }
  }
})

export default router
