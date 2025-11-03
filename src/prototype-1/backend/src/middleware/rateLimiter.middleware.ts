/**
 * Rate Limiter Middleware
 * Protects against abuse and DDoS attacks
 * SPEC-A-L-012: Backend validation
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import type { JResult } from '../types/jresult.types.js';

/**
 * Rate limit handler
 * Returns JResult formatted error
 */
const rateLimitHandler = (_req: Request, res: Response): void => {
  const result: JResult = {
    code: 429,
    message: 'Too many requests, please try again later',
  };

  res.status(429).json(result);
};

/**
 * General API Rate Limiter
 * 100 requests per minute per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.startsWith('/health');
  },
});

/**
 * Strict Rate Limiter for Auth Routes
 * 5 requests per minute per IP
 * Prevents brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  skipFailedRequests: false,
});

/**
 * JQEL Rate Limiter
 * 100 requests per minute per user
 * More lenient for authenticated API calls
 */
export const jqelRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many JQEL queries, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Use user ID for authenticated requests, IP for anonymous
  keyGenerator: (req) => {
    const user = (req as any).user;
    return user?.sub || req.ip || 'anonymous';
  },
});

/**
 * Create custom rate limiter
 * Utility function for creating custom rate limiters
 */
export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipPaths?: string[];
}) {
  return rateLimit({
    windowMs: options.windowMs || 60000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skip: options.skipPaths
      ? (req) => options.skipPaths!.some((path) => req.path.startsWith(path))
      : undefined,
  });
}
