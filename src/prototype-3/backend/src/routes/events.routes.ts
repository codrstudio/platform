import { Router, type Request, type Response } from 'express';
import { sseService } from '../services/sse.service.js';
import { jwtService } from '../services/jwt.service.js';

/**
 * Events Routes - SSE Streaming
 *
 * SPEC-EV-SSE-005: GET /api/events/stream endpoint
 * SPEC-EV-SSE-006 to SPEC-EV-SSE-010: Authentication requirements
 */

const router = Router();

/**
 * SSE Stream Endpoint
 *
 * GET /api/events/stream
 *
 * SPEC-EV-SSE-005: Frontend connects via SSE
 * SPEC-EV-SSE-006: Connection must include JWT
 * SPEC-EV-SSE-007: JWT can be in header, query param, or cookie
 * SPEC-EV-SSE-008: Backend must validate JWT
 * SPEC-EV-SSE-009: Backend must identify userId from JWT
 * SPEC-EV-SSE-010: Reject if JWT invalid (HTTP 401)
 */
router.get('/stream', async (req: Request, res: Response) => {
  try {
    // Extract JWT from multiple sources - SPEC-EV-SSE-007
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Check query parameter (for EventSource compatibility)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    // 3. Check cookie (optional)
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    // Validate JWT is present
    if (!token) {
      console.warn('[SSE] No JWT provided');
      res.status(401).json({
        code: 401,
        message: 'Authentication required',
      });
      return;
    }

    // Validate JWT and extract payload - SPEC-EV-SSE-008, SPEC-EV-SSE-009
    const payload = jwtService.extractPayload(token);

    if (!payload || !payload.userId) {
      console.warn('[SSE] Invalid JWT');
      res.status(401).json({
        code: 401,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Extract userId - SPEC-EV-SSE-009
    const userId = payload.userId;

    console.log(`[SSE] New connection request from user: ${userId}`);

    // Establish SSE connection
    sseService.addConnection(userId, res);

    // Keep connection alive until client disconnects
    // Response will be managed by SSE service
  } catch (error) {
    console.error('[SSE] Error establishing connection:', error);

    // SPEC-EV-SSE-010: Reject on error
    if (!res.headersSent) {
      res.status(401).json({
        code: 401,
        message: 'Authentication failed',
      });
    }
  }
});

/**
 * SSE Stats Endpoint (for monitoring)
 *
 * GET /api/events/stats
 *
 * Returns statistics about active SSE connections
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = sseService.getStats();
    res.json({
      code: 200,
      data: stats,
    });
  } catch (error) {
    console.error('[SSE] Error getting stats:', error);
    res.status(500).json({
      code: 500,
      message: 'Failed to get stats',
    });
  }
});

export default router;
