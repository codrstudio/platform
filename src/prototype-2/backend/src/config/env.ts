import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

export interface EnvConfig {
  // Server
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  frontendUrl: string;

  // n8n
  n8nBaseUrl: string;
  n8nSharedSecret: string;

  // Redis
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  redisDb: number;

  // JWT
  jwtSecret: string;
  jwtAccessTokenExpiresIn: string;
  jwtRefreshTokenExpiresIn: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  rateLimitSkipSuccessful: boolean;

  // Brute Force Protection
  bruteForceMaxAttempts: number;
  bruteForceLockoutDuration: number;
  bruteForceWindowDuration: number;

  // Platform
  platformSharedSecret: string;

  // JQEL
  systemSchemaTarget: 'backend' | 'n8n';

  // Optional
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  requestTimeout: number;
  sseHeartbeatInterval: number;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Helper to get required env var
  const getRequired = (key: string): string => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
    return value || '';
  };

  // Helper to get optional env var with default
  const getOptional = (key: string, defaultValue: string): string => {
    return process.env[key] || defaultValue;
  };

  // Validate NODE_ENV
  const nodeEnv = getRequired('NODE_ENV');
  if (nodeEnv && !['development', 'staging', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, staging, production');
  }

  // Determine default rate limit based on environment
  const defaultMaxRequests = nodeEnv === 'production' ? '10' : '100';

  // Validate PORT
  const port = parseInt(getOptional('PORT', '3000'), 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a number between 1 and 65535');
  }

  // Validate URLs
  const frontendUrl = getRequired('FRONTEND_URL');
  const n8nBaseUrl = getRequired('N8N_BASE_URL');

  try {
    if (frontendUrl) new URL(frontendUrl);
    if (n8nBaseUrl) new URL(n8nBaseUrl);
  } catch {
    errors.push('FRONTEND_URL and N8N_BASE_URL must be valid URLs');
  }

  // Validate secrets length
  const n8nSharedSecret = getRequired('N8N_SHARED_SECRET');
  const jwtSecret = getRequired('JWT_SECRET');
  const platformSharedSecret = getRequired('PLATFORM_SHARED_SECRET');

  if (n8nSharedSecret && n8nSharedSecret.length < 32) {
    errors.push('N8N_SHARED_SECRET must be at least 32 characters');
  }
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }
  if (platformSharedSecret && platformSharedSecret.length < 32) {
    errors.push('PLATFORM_SHARED_SECRET must be at least 32 characters');
  }

  // Validate Redis port
  const redisPort = parseInt(getOptional('REDIS_PORT', '6379'), 10);
  if (isNaN(redisPort) || redisPort < 1 || redisPort > 65535) {
    errors.push('REDIS_PORT must be a number between 1 and 65535');
  }

  // Validate log level
  const logLevel = getOptional('LOG_LEVEL', 'info');
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(logLevel)) {
    errors.push(`LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
  }

  // Brute Force Protection Configuration
  const bruteForceMaxAttempts = parseInt(
    getOptional('BRUTE_FORCE_MAX_ATTEMPTS', '5'),
    10
  );

  if (isNaN(bruteForceMaxAttempts) || bruteForceMaxAttempts < 1 || bruteForceMaxAttempts > 100) {
    errors.push('BRUTE_FORCE_MAX_ATTEMPTS must be between 1 and 100');
  }

  const bruteForceLockoutDuration = parseInt(
    getOptional('BRUTE_FORCE_LOCKOUT_DURATION', '900'), // 15 minutes
    10
  );

  if (isNaN(bruteForceLockoutDuration) || bruteForceLockoutDuration < 60 || bruteForceLockoutDuration > 86400) {
    errors.push('BRUTE_FORCE_LOCKOUT_DURATION must be between 60 and 86400 seconds (1 minute to 24 hours)');
  }

  const bruteForceWindowDuration = parseInt(
    getOptional('BRUTE_FORCE_WINDOW_DURATION', '600'), // 10 minutes
    10
  );

  if (isNaN(bruteForceWindowDuration) || bruteForceWindowDuration < 60 || bruteForceWindowDuration > 3600) {
    errors.push('BRUTE_FORCE_WINDOW_DURATION must be between 60 and 3600 seconds (1 minute to 1 hour)');
  }

  // If there are errors, log them and exit
  if (errors.length > 0) {
    console.error('\n❌ Environment validation failed:\n');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n📝 Please check your .env file against .env.example\n');
    process.exit(1);
  }

  // Validate SYSTEM_SCHEMA_TARGET
  const systemSchemaTarget = getOptional('SYSTEM_SCHEMA_TARGET', 'n8n');
  if (!['backend', 'n8n'].includes(systemSchemaTarget)) {
    errors.push('SYSTEM_SCHEMA_TARGET must be either "backend" or "n8n"');
  }

  // Return validated config
  return {
    nodeEnv: nodeEnv as 'development' | 'staging' | 'production',
    port,
    frontendUrl,
    n8nBaseUrl,
    n8nSharedSecret,
    redisHost: getOptional('REDIS_HOST', 'localhost'),
    redisPort,
    redisPassword: process.env.REDIS_PASSWORD,
    redisDb: parseInt(getOptional('REDIS_DB', '0'), 10),
    jwtSecret,
    jwtAccessTokenExpiresIn: getOptional('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
    jwtRefreshTokenExpiresIn: getOptional('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
    rateLimitWindowMs: parseInt(getOptional('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    rateLimitMaxRequests: parseInt(getOptional('RATE_LIMIT_MAX_REQUESTS', defaultMaxRequests), 10),
    rateLimitSkipSuccessful: getOptional('RATE_LIMIT_SKIP_SUCCESSFUL', 'false') === 'true',
    bruteForceMaxAttempts,
    bruteForceLockoutDuration,
    bruteForceWindowDuration,
    platformSharedSecret,
    systemSchemaTarget: systemSchemaTarget as 'backend' | 'n8n',
    logLevel: logLevel as 'debug' | 'info' | 'warn' | 'error',
    requestTimeout: parseInt(getOptional('REQUEST_TIMEOUT', '30000'), 10),
    sseHeartbeatInterval: parseInt(getOptional('SSE_HEARTBEAT_INTERVAL', '30000'), 10),
  };
}

// Validate and export config
export const config = validateEnv();

// Log startup information (non-sensitive)
console.log('\n✅ Environment configuration loaded:');
console.log(`   - Environment: ${config.nodeEnv}`);
console.log(`   - Port: ${config.port}`);
console.log(`   - Frontend URL: ${config.frontendUrl}`);
console.log(`   - n8n URL: ${config.n8nBaseUrl}`);
console.log(`   - Redis: ${config.redisHost}:${config.redisPort}\n`);
