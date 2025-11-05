import cors from 'cors';
import { config } from '../config/env.js';

/**
 * CORS middleware configuration
 *
 * Implements SPEC-AU-SG-007 to SPEC-AU-SG-010:
 * - Allows Frontend origin
 * - Enables credentials (cookies, Authorization header)
 * - Configures allowed methods and headers
 */
export const corsMiddleware = cors({
  // Allow only Frontend URL (exact match)
  origin: config.frontendUrl,

  // Enable credentials (cookies, Authorization header)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed request headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Platform-Key',
  ],

  // Expose these response headers to frontend
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
  ],

  // Cache preflight requests for 24 hours
  maxAge: 86400,
});
