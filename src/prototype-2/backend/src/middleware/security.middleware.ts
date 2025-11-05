import helmet from 'helmet';
import { config } from '../config/env.js';

/**
 * Security headers middleware (production configuration)
 *
 * Implements SPEC-AU-SG-011 to SPEC-AU-SG-013:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - HSTS (production only)
 * - CSP configuration
 */
const productionSecurityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind/shadcn
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Prevent MIME sniffing
  noSniff: true,

  // Enable XSS filter
  xssFilter: true,

  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * Security headers middleware (development configuration)
 *
 * Relaxed settings for easier development:
 * - No CSP (avoids blocking Vite HMR)
 * - No HSTS (not using HTTPS in dev)
 */
const developmentSecurityMiddleware = helmet({
  contentSecurityPolicy: false, // Disable CSP in development
  hsts: false, // No HSTS in development
});

/**
 * Returns appropriate security middleware based on environment
 */
export const getSecurityMiddleware = () => {
  return config.nodeEnv === 'production'
    ? productionSecurityMiddleware
    : developmentSecurityMiddleware;
};
