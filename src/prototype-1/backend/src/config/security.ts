/**
 * Security Configuration
 * Helmet.js security headers configuration
 * SPEC-A-L-012: Backend validation and security
 */

import type { HelmetOptions } from 'helmet';

/**
 * Development Security Configuration
 * More relaxed for local development
 */
export const devSecurityConfig: Readonly<HelmetOptions> = {
  // Content Security Policy - Disabled in dev for easier debugging
  contentSecurityPolicy: false,

  // Cross-Origin Policies
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: true },

  // Frameguard - Prevent clickjacking
  frameguard: { action: 'deny' },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HSTS - HTTPS Strict Transport Security (disabled in dev, no HTTPS)
  hsts: false,

  // IE No Open - Set X-Download-Options for IE8+
  ieNoOpen: true,

  // No Sniff - Prevent MIME type sniffing
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },

  // XSS Filter
  xssFilter: true,
};

/**
 * Production Security Configuration
 * Strict security headers for production
 */
export const prodSecurityConfig: Readonly<HelmetOptions> = {
  // Content Security Policy - Strict CSP for production
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on needs
      styleSrc: ["'self'", "'unsafe-inline'"], // Adjust based on needs
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // Cross-Origin Policies - Strict
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frameguard - Prevent clickjacking
  frameguard: { action: 'deny' },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HSTS - Force HTTPS for 1 year
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy - No referrer for privacy
  referrerPolicy: { policy: 'no-referrer' },

  // XSS Filter
  xssFilter: true,
};

/**
 * Staging Security Configuration
 * Similar to production but slightly more relaxed
 */
export const stagingSecurityConfig: Readonly<HelmetOptions> = {
  ...prodSecurityConfig,

  // CSP slightly more relaxed for testing
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },

  // HSTS shorter duration for staging
  hsts: {
    maxAge: 86400, // 1 day
    includeSubDomains: false,
    preload: false,
  },
};

/**
 * Get security config based on environment
 */
export function getSecurityConfig(): Readonly<HelmetOptions> {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return prodSecurityConfig;
    case 'staging':
      return stagingSecurityConfig;
    case 'development':
    default:
      return devSecurityConfig;
  }
}

/**
 * Additional Security Middleware Configuration
 */
export const securityConfig = {
  // Maximum request body size (prevent DoS)
  maxRequestSize: '10mb',

  // Maximum URL length
  maxUrlLength: 2048,

  // Maximum parameter length
  maxParameterLength: 1000,

  // Trusted proxies (for production behind load balancer)
  trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || [],

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    name: 'platform.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' as const,
    },
  },
} as const;
