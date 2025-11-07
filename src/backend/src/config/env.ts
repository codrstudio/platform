import { z } from 'zod'
import 'dotenv/config'

// SPEC-CF-VE-001 a SPEC-CF-VE-019: Variáveis de ambiente obrigatórias
const envSchema = z.object({
  // Backend
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),

  // n8n Backbone
  N8N_BASE_URL: z.string().url(),
  N8N_SHARED_SECRET: z.string().min(32, 'N8N_SHARED_SECRET must be at least 32 characters'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).max(15).default(0),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters (256 bits)'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Platform Security
  PLATFORM_SHARED_SECRET: z.string().min(32, 'PLATFORM_SHARED_SECRET must be at least 32 characters'),

  // Optional: Performance
  MAX_REQUEST_SIZE: z.string().default('10mb'),
  REQUEST_TIMEOUT: z.string().default('30s'),
  SSE_HEARTBEAT_INTERVAL: z.string().default('30s'),

  // Optional: Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),

  // Optional: Cache TTL
  CACHE_TTL_AUTH: z.string().default('5m'),
  CACHE_TTL_JQEL: z.string().default('1m'),

  // Optional: Rate Limiting
  RATE_LIMIT_LOGIN: z.coerce.number().default(5),
  RATE_LIMIT_API: z.coerce.number().default(100),
})

// SPEC-CF-VA-001 a SPEC-CF-VA-004: Validação na inicialização
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)

    // SPEC-CF-VE-018: Validar que PLATFORM_SHARED_SECRET é igual a N8N_SHARED_SECRET
    if (parsed.PLATFORM_SHARED_SECRET !== parsed.N8N_SHARED_SECRET) {
      console.warn(
        '⚠️  Warning: PLATFORM_SHARED_SECRET should match N8N_SHARED_SECRET for mutual authentication'
      )
    }

    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      console.error()

      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.')
        console.error(`  • ${path}: ${err.message}`)
      })

      console.error()
      console.error('💡 Tip: Check your .env file against .env.example')
      console.error()

      process.exit(1)
    }
    throw error
  }
}

export type Env = z.infer<typeof envSchema>
export const env = validateEnv()
