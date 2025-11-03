/**
 * Events Routes (SSE)
 *
 * Server-Sent Events endpoint for real-time event streaming.
 *
 * SPEC References:
 * - SPEC-EV-SSE-005: Frontend connects to GET /api/events/stream
 * - SPEC-EV-SSE-006: Connection includes authentication (JWT)
 * - SPEC-EV-SSE-007: JWT in header, query param, or cookie
 * - SPEC-EV-SSE-008: Backend validates JWT before accepting connection
 * - SPEC-EV-SSE-009: Backend identifies userId from JWT
 * - SPEC-EV-SSE-010: Backend rejects if JWT invalid (HTTP 401)
 * - SPEC-EV-SSE-011 to SPEC-EV-SSE-014: Response headers
 */

import express, { type Request, type Response } from 'express';
import { addConnection } from '../services/sseService.js';
import { validateJWT } from '../middleware/auth.middleware.js';
import { logger } from '../middleware/logger.middleware.js';

const router = express.Router();

/**
 * GET /api/events/stream
 *
 * Establishes SSE connection for real-time events.
 *
 * SPEC-EV-SSE-005: Route is GET /api/events/stream
 * SPEC-EV-SSE-006 to SPEC-EV-SSE-010: Authentication and validation
 * SPEC-EV-SSE-011 to SPEC-EV-SSE-014: Response headers
 */
router.get('/stream', validateJWT, (req: Request, res: Response): void => {
  const user = (req as any).user; // Set by validateJWT middleware

  if (!user || !user.sub) {
    logger.warn('[SSE] Connection rejected: no user ID in JWT');
    res.status(401).json({
      code: 401,
      message: 'Unauthorized: Invalid JWT token',
    });
    return;
  }

  const userId = user.sub;

  logger.info(`[SSE] New connection request from user: ${userId}`);

  // Set SSE headers
  // SPEC-EV-SSE-011: Content-Type: text/event-stream
  // SPEC-EV-SSE-012: Cache-Control: no-cache
  // SPEC-EV-SSE-013: Connection: keep-alive
  // SPEC-EV-SSE-014: X-Accel-Buffering: no (for nginx)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Enable compression if available
  res.setHeader('Content-Encoding', 'none');

  // Send initial connection confirmation
  res.write(': connected\n\n');

  // Register connection with SSE service
  addConnection(userId, res);

  // The connection will stay open until:
  // - Client closes it
  // - Server closes it (via removeConnection in sseService)
  // - Network error occurs

  logger.info(`[SSE] Connection established for user: ${userId}`);
});

/**
 * Export router
 */
export default router;
