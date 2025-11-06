import { Router, Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service.js';
import { sseService } from '../services/sse.service.js';
import { eventRecoveryService } from '../services/eventRecovery.service.js';

const router = Router();

/**
 * GET /api/events/stream
 *
 * Establish Server-Sent Events (SSE) connection for real-time event delivery.
 *
 * SPEC References:
 * - SPEC-EV-SSE-005: Frontend must connect to GET /api/events/stream
 * - SPEC-EV-SSE-006:010: Authentication via JWT (header or query param)
 * - SPEC-EV-SSE-011:014: Required SSE headers
 *
 * Authentication:
 * - JWT from Authorization header (preferred)
 * - JWT from query parameter ?token=<jwt> (for EventSource compatibility)
 *
 * Response:
 * - Content-Type: text/event-stream
 * - Persistent HTTP connection
 * - Events formatted as: data: <json>\n\n
 * - Heartbeat comments: :heartbeat\n\n
 */
router.get(
  '/stream',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // STEP 1: Extract access token
      // SPEC-EV-SSE-007: JWT can be in header, query param, or cookie
      let accessToken: string | undefined;

      // Priority 1: Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }

      // Priority 2: Query parameter (for EventSource which cannot set headers)
      if (!accessToken && req.query.token) {
        accessToken = req.query.token as string;
      }

      // Priority 3: Cookie
      if (!accessToken && req.cookies?.access_token) {
        accessToken = req.cookies.access_token;
      }

      // SPEC-EV-SSE-008: Backend must validate JWT before accepting connection
      if (!accessToken) {
        res.status(401).json({
          code: 'missing_token',
          message: 'Access token is required',
        });
        return;
      }

      // STEP 2: Validate JWT and extract userId
      // SPEC-EV-SSE-009: Backend must identify userId from JWT
      let userId: string;
      try {
        const payload = jwtService.verifyAccessToken(accessToken);
        userId = payload.sub;

        if (!userId) {
          res.status(401).json({
            code: 'invalid_token',
            message: 'Token does not contain user ID',
          });
          return;
        }
      } catch (error: any) {
        // SPEC-EV-SSE-010: Backend must reject connection if JWT invalid
        if (error.message === 'Token expired') {
          res.status(401).json({
            code: 'token_expired',
            message: 'Access token has expired',
          });
          return;
        }

        res.status(401).json({
          code: 'invalid_token',
          message: 'Access token is invalid',
        });
        return;
      }

      // STEP 3: Set SSE headers
      // SPEC-EV-SSE-011: Response must have header Content-Type: text/event-stream
      res.setHeader('Content-Type', 'text/event-stream');

      // SPEC-EV-SSE-012: Response must have header Cache-Control: no-cache
      res.setHeader('Cache-Control', 'no-cache');

      // SPEC-EV-SSE-013: Response must have header Connection: keep-alive
      res.setHeader('Connection', 'keep-alive');

      // SPEC-EV-SSE-014: Response may have header X-Accel-Buffering: no (for nginx)
      res.setHeader('X-Accel-Buffering', 'no');

      // Enable CORS for SSE (important for cross-origin requests)
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Flush headers immediately to establish connection
      res.flushHeaders();

      // STEP 4: Register SSE connection
      // SPEC-EV-SSE-015: Backend must maintain Map of connections
      sseService.addConnection(userId, res);

      // Send initial connection confirmation
      res.write(':connected\n\n');

      console.log(`✅ SSE stream established for user ${userId}`);

      // Connection will remain open until:
      // - Client closes (res 'close' event)
      // - Server shuts down
      // - Write error occurs
    } catch (error) {
      console.error('❌ Error in /api/events/stream:', error);
      next(error);
    }
  }
);

/**
 * GET /api/events/missed
 *
 * Fetch missed events for offline recovery
 *
 * Query params:
 * - lastEventId: Last event ID received by client (REQUIRED)
 * - maxCount: Maximum events to return (optional, max: 1000)
 *
 * Headers:
 * - Authorization: Bearer <jwt> (REQUIRED)
 *
 * SPEC References:
 * - SPEC-EV-ST-013: Frontend can query Stream on reconnect
 * - SPEC-EV-FR-004:006: Recovery mechanism
 */
router.get('/missed', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    // Extract and validate JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 401,
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7);
    let userId: string;

    try {
      const payload = jwtService.verifyAccessToken(token);
      userId = payload.sub;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: 'Invalid or expired token',
        });
        return;
      }
    } catch (error: any) {
      res.status(401).json({
        code: 401,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Validate query parameters
    const { lastEventId, maxCount } = req.query;

    if (!lastEventId || typeof lastEventId !== 'string') {
      res.status(400).json({
        code: 400,
        message: 'Missing or invalid lastEventId query parameter',
        field: 'lastEventId',
      });
      return;
    }

    const parsedMaxCount = maxCount ? parseInt(maxCount as string, 10) : undefined;

    // Fetch missed events
    const result = await eventRecoveryService.fetchMissedEvents(
      userId,
      lastEventId,
      parsedMaxCount
    );

    // Return result
    res.status(200).json({
      code: 200,
      data: [result],
    });
  } catch (error: any) {
    console.error('❌ Recovery Endpoint Error:', error);

    res.status(500).json({
      code: 500,
      message: error.message || 'Internal server error',
    });
  }
});

export default router;
