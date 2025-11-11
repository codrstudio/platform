/**
 * Agent Routes - Rotas para gerenciamento de agentes
 * GET  /api/agents/n8n         - Lista agentes N8N disponíveis
 * GET  /api/agents/n8n/refresh - Força atualização do cache
 * GET  /api/agents/n8n/cache   - Informações sobre o cache
 */

import express from 'express'
import { fetchN8NAgents, clearN8NAgentsCache, getN8NAgentsCacheInfo } from '../services/n8nAgentService.js'

const router = express.Router()

/**
 * GET /api/agents/n8n
 * Lista todos os agentes disponíveis no N8N
 * Usa cache de 5 minutos para otimizar performance
 */
router.get('/n8n', async (req, res) => {
  try {
    console.log('[Agents API] Buscando agentes N8N')

    const agents = await fetchN8NAgents()

    res.json(agents)
  } catch (error: any) {
    console.error('[Agents API] Erro ao buscar agentes N8N:', error.message)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/agents/n8n/refresh
 * Força atualização do cache de agentes N8N
 */
router.get('/n8n/refresh', async (req, res) => {
  try {
    console.log('[Agents API] Forçando refresh do cache de agentes N8N')

    // Limpar cache
    clearN8NAgentsCache()

    // Buscar novamente
    const agents = await fetchN8NAgents()

    res.json({
      message: 'Cache atualizado com sucesso',
      count: agents.length,
      agents
    })
  } catch (error: any) {
    console.error('[Agents API] Erro ao atualizar cache:', error.message)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/agents/n8n/cache
 * Retorna informações sobre o cache de agentes N8N
 */
router.get('/n8n/cache', (req, res) => {
  try {
    const info = getN8NAgentsCacheInfo()

    res.json({
      ...info,
      status: info.age < info.ttl ? 'valid' : 'expired'
    })
  } catch (error: any) {
    console.error('[Agents API] Erro ao obter info do cache:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
