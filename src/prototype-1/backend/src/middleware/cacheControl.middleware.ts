/**
 * Cache Control Middleware
 * Sets appropriate Cache-Control headers for different content types
 *
 * SPEC-A-PWA-027: Backend MUST define Cache-Control: no-cache for HTML responses
 * SPEC-A-PWA-029: Assets with hash in filename CAN use Cache-Control: immutable
 *
 * Implementation based on:
 * - spec/SPEC-architecture.md (Section 3: PWA - Cache Strategy)
 * - spec/whats-new/2025-11-05-cache-strategy.md
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Cache Control Middleware
 *
 * Sets Cache-Control headers based on content type and request path:
 * - HTML: no-cache (always validate with server)
 * - Assets with hash: immutable (never expires)
 * - Other assets: public, max-age
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next function
 */
export function cacheControlMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Store original res.send to intercept responses
  const originalSend = res.send;

  // Override res.send to set cache headers before sending
  res.send = function (data: any): Response {
    // Detect content type
    const contentType = res.getHeader('Content-Type') as string || '';
    const isHtml = contentType.includes('text/html') ||
                   req.path === '/' ||
                   req.path === '/index.html' ||
                   req.accepts('html') === 'html';

    // Detect hashed assets (e.g., main.abc123.js)
    const hasContentHash = /\.[a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(req.path);

    if (isHtml) {
      // SPEC-A-PWA-027: HTML must use no-cache to ensure fresh configuration
      // no-cache = must revalidate with server (can use 304 Not Modified)
      res.setHeader('Cache-Control', 'no-cache');
    } else if (hasContentHash) {
      // SPEC-A-PWA-029: Hashed assets can be cached indefinitely
      // immutable = never check for updates (content hash guarantees uniqueness)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.path.startsWith('/api/')) {
      // API responses: no caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // Other assets: short cache with revalidation
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Static File Cache Control
 * For serving static files from Express static middleware
 *
 * This function can be passed as `setHeaders` option to express.static()
 *
 * @param {Response} res - Express response
 * @param {string} path - File path being served
 */
export function staticFileHeaders(res: Response, path: string): void {
  // Detect hashed assets
  const hasContentHash = /\.[a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(path);

  if (hasContentHash) {
    // SPEC-A-PWA-029: Immutable cache for hashed assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (path.endsWith('.html')) {
    // SPEC-A-PWA-027: No cache for HTML
    res.setHeader('Cache-Control', 'no-cache');
  } else {
    // Default: 1 hour cache with revalidation
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
}
