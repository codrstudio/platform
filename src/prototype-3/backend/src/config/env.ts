import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

/**
 * Environment variables schema validation
 * SPEC-A-S-014 to SPEC-A-S-021: Backend and infrastructure requirements
 */
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS - Frontend URL
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Redis Configuration (SPEC-A-S-019, SPEC-A-S-020)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform(Number),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

  // n8n Backbone Configuration (SPEC-A-S-017, SPEC-A-S-018)
  N8N_WEBHOOK_BASE_URL: z.string().url(),
  N8N_API_KEY: z.string().optional(),

  // n8n Mutual Authentication (SPEC-CF-AM-*, SPEC-CF-VE-006:010, SPEC-CF-VE-017:019)
  N8N_SHARED_SECRET: z.string().min(32, 'N8N_SHARED_SECRET must be at least 32 characters'),
  PLATFORM_SHARED_SECRET: z.string().min(32, 'PLATFORM_SHARED_SECRET must be at least 32 characters').optional(),

  // BullMQ Configuration (SPEC-A-S-022, SPEC-A-S-023)
  QUEUE_CONCURRENCY: z.string().default('5').transform(Number),
  QUEUE_MAX_RETRIES: z.string().default('3').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Rate Limiting Configuration (SPEC-AU-SG-004 to SPEC-AU-SG-006)
  RATE_LIMIT_API_MAX_REQUESTS: z.string().default('100').transform(Number),
  RATE_LIMIT_API_WINDOW_SECONDS: z.string().default('60').transform(Number),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.string().default('5').transform(Number),
  RATE_LIMIT_AUTH_WINDOW_SECONDS: z.string().default('60').transform(Number),

  // Brute Force Protection Configuration (SPEC-AU-LI-025, SPEC-AU-LI-026, SPEC-AU-SG-006)
  BRUTE_FORCE_MAX_ATTEMPTS: z.string().default('5').transform(Number),
  BRUTE_FORCE_WINDOW_SECONDS: z.string().default('900').transform(Number), // 15 minutes
  BRUTE_FORCE_BLOCK_DURATION_SECONDS: z.string().default('1800').transform(Number), // 30 minutes
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

/**
 * Validated environment configuration
 */
export const env = parseEnv();

/**
 * Get Redis connection URL
 */
export function getRedisUrl(): string {
  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = env;

  if (REDIS_PASSWORD) {
    return `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;
  }

  return `redis://${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;
}
