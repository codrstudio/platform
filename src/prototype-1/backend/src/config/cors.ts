/**
 * CORS Configuration
 * Cross-Origin Resource Sharing settings
 * SPEC-A-L-012: Backend validation
 */

import type { CorsOptions } from 'cors';

/**
 * CORS Configuration
 * Allows frontend origin with credentials
 */
export const corsConfig: CorsOptions = {
  // Allow frontend origin (configurable via env)
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Exposed headers (visible to frontend)
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
  ],

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Success status for OPTIONS requests
  optionsSuccessStatus: 204,

  // Allow preflight to pass through
  preflightContinue: false,
};

/**
 * Development CORS Configuration
 * More permissive for local development
 */
export const devCorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow localhost and common development ports
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative port
      'http://localhost:4173', // Vite preview
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.some((allowed) => origin.startsWith(allowed!))) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

/**
 * Production CORS Configuration
 * Strict settings for production
 */
export const prodCorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL,
    ].filter(Boolean) as string[];

    if (!origin) {
      // Reject requests with no origin in production
      callback(new Error('Origin header is required'));
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

/**
 * Get CORS config based on environment
 */
export function getCorsConfig(): CorsOptions {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    return prodCorsConfig;
  } else if (env === 'development') {
    return devCorsConfig;
  }

  return corsConfig;
}
