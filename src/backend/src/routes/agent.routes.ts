/**
 * Agent Routes
 *
 * Routes for AI agent integration with streaming support.
 * Implements SPEC-CHAT-I-001: Agent integration via /api/agent/:provider/:agentId
 *
 * Flow:
 * 1. Frontend sends POST /api/agent/:provider/:agentId
 * 2. Backend proxies to n8n webhook with streaming
 * 3. SSE stream sent back to frontend
 */

import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

const router = Router();

/**
 * Agent configuration mapping
 * Maps agentId to n8n webhook URL
 */
const AGENT_WEBHOOKS: Record<string, string> = {
  // Default n8n chat webhook
  'nic-assistant': process.env.N8N_CHAT_WEBHOOK_URL || '/api/v1/chat/completions',

  // Add more agents here as needed
  // 'agent-name': 'https://n8n.codrstudio.dev/webhook/...'
};

/**
 * POST /api/agent/:provider/:agentId
 *
 * Send message to agent and stream response
 *
 * @param provider - Provider type (n8n, openai, etc) - currently only n8n supported
 * @param agentId - Agent identifier
 *
 * Request body:
 * {
 *   message: string,
 *   conversationId: string,
 *   context: Array<{role: string, content: string}>,
 *   files?: Array<{name: string, type: string, data: string}>
 * }
 *
 * Response: SSE stream with events:
 * - {"event": "token", "data": "text chunk"}
 * - {"event": "end"}
 * - {"event": "error", "error": "message"}
 */
router.post('/agent/:provider/:agentId', async (req: Request, res: Response) => {
  const { provider, agentId } = req.params;
  const { message, conversationId, context, files } = req.body;

  console.log(`[Agent] Request for ${provider}:${agentId}, conversation: ${conversationId}`);

  // Validate provider
  if (provider !== 'n8n') {
    res.status(400).json({
      code: 400,
      message: `Provider '${provider}' not supported. Currently only 'n8n' is supported.`
    });
    return;
  }

  // Get webhook URL for agent
  const webhookUrl = AGENT_WEBHOOKS[agentId];
  if (!webhookUrl) {
    res.status(404).json({
      code: 404,
      message: `Agent '${agentId}' not found. Available agents: ${Object.keys(AGENT_WEBHOOKS).join(', ')}`
    });
    return;
  }

  // Validate request
  if (!message || !conversationId) {
    res.status(400).json({
      code: 400,
      message: 'Missing required fields: message, conversationId'
    });
    return;
  }

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Prepare payload for n8n
    const n8nPayload = {
      sessionId: conversationId,
      action: 'sendMessage',
      chatInput: message,
      context: context || [],
      files: files || []
    };

    console.log(`[Agent] Calling n8n webhook: ${webhookUrl}`);

    // Stream from n8n
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    // Check if response is streaming
    if (!n8nResponse.body) {
      throw new Error('n8n response body is not readable');
    }

    // Pipe n8n stream to frontend
    let buffer = '';

    n8nResponse.body.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      buffer += text;

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            // Parse n8n event
            const event = JSON.parse(line);

            // Forward to frontend (same format)
            res.write(JSON.stringify(event) + '\n');
          } catch (e) {
            console.warn('[Agent] Failed to parse n8n event:', line);
          }
        }
      }
    });

    n8nResponse.body.on('end', () => {
      console.log(`[Agent] Stream ended for conversation: ${conversationId}`);

      // Send end event if not already sent
      res.write(JSON.stringify({ event: 'end' }) + '\n');
      res.end();
    });

    n8nResponse.body.on('error', (error: Error) => {
      console.error('[Agent] Stream error:', error);

      res.write(JSON.stringify({
        event: 'error',
        error: error.message
      }) + '\n');
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log(`[Agent] Client disconnected for conversation: ${conversationId}`);
      n8nResponse.body?.destroy();
    });

  } catch (error) {
    console.error('[Agent] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // If headers not sent yet, send error as JSON
    if (!res.headersSent) {
      res.status(500).json({
        code: 500,
        message: `Agent error: ${errorMessage}`
      });
    } else {
      // Headers already sent (SSE), send error event
      res.write(JSON.stringify({
        event: 'error',
        error: errorMessage
      }) + '\n');
      res.end();
    }
  }
});

export default router;
