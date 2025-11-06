import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import {
  validateUrl,
  validatePort,
  validateSecret,
  validateEnum,
  validateHttps,
  validateSecretsMatch,
  validateSecretStrength,
  validateRedisConfig,
  ValidationError,
} from './envValidation.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment files in priority order
 *
 * Priority (highest to lowest):
 * 1. .env.{NODE_ENV}.local (local environment overrides)
 * 2. .env.{NODE_ENV} (environment-specific)
 * 3. .env.local (local overrides)
 * 4. .env (base configuration)
 *
 * SPEC-CF-PS-017:019: Environment-based configuration loading
 */
function loadEnvironmentFiles(): void {
  const envDir = resolve(__dirname, '../..');
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Define files to load (order matters - later overrides earlier)
  const envFiles = [
    '.env',                          // Base config (always loaded)
    '.env.local',                    // Local overrides
    `.env.${nodeEnv}`,              // Environment-specific
    `.env.${nodeEnv}.local`,        // Local environment overrides
  ];

  console.log(`\n🔧 Loading environment configuration for: ${nodeEnv}\n`);

  // Load each file if it exists
  envFiles.forEach(file => {
    const filePath = resolve(envDir, file);
    if (existsSync(filePath)) {
      console.log(`   ✓ Loading ${file}`);
      dotenv.config({ path: filePath, override: true });
    } else {
      // Don't warn about missing .local files (optional)
      if (!file.includes('.local')) {
        console.log(`   ⚠ ${file} not found (using defaults)`);
      }
    }
  });

  console.log(''); // Blank line for readability
}

// Load environment files BEFORE validation
loadEnvironmentFiles();

export interface EnvConfig {
  // Server
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  frontendUrl: string;
  backendUrl: string;

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
  const errors: ValidationError[] = [];

  // Helper to get required env var
  const getRequired = (key: string): string => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      errors.push({
        field: key,
        message: `Missing required environment variable: ${key}`,
      });
    }
    return value || '';
  };

  // Helper to get optional env var with default
  const getOptional = (key: string, defaultValue: string): string => {
    return process.env[key] || defaultValue;
  };

  // ============================================
  // STEP 1: Validate NODE_ENV (affects subsequent validation)
  // ============================================

  const nodeEnv = getRequired('NODE_ENV');
  const nodeEnvError = validateEnum(
    nodeEnv,
    'NODE_ENV',
    ['development', 'staging', 'production']
  );
  if (nodeEnvError) {
    errors.push(nodeEnvError);
  }

  // ============================================
  // STEP 2: Validate Required Variables
  // ============================================

  // Server Configuration (SPEC-CF-VE-001:004)
  const port = parseInt(getOptional('PORT', '3000'), 10);
  const portError = validatePort(port, 'PORT');
  if (portError) errors.push(portError);

  const frontendUrl = getRequired('FRONTEND_URL');
  const frontendUrlError = validateUrl(frontendUrl, 'FRONTEND_URL');
  if (frontendUrlError) errors.push(frontendUrlError);

  const backendUrl = getRequired('BACKEND_URL');
  const backendUrlError = validateUrl(backendUrl, 'BACKEND_URL');
  if (backendUrlError) errors.push(backendUrlError);

  // n8n Backbone (SPEC-CF-VE-005:008)
  const n8nBaseUrl = getRequired('N8N_BASE_URL');
  const n8nUrlError = validateUrl(n8nBaseUrl, 'N8N_BASE_URL');
  if (n8nUrlError) errors.push(n8nUrlError);

  // Validate HTTPS in staging/production
  const n8nHttpsError = validateHttps(n8nBaseUrl, 'N8N_BASE_URL', nodeEnv);
  if (n8nHttpsError) errors.push(n8nHttpsError);

  const n8nSharedSecret = getRequired('N8N_SHARED_SECRET');
  const n8nSecretError = validateSecret(n8nSharedSecret, 'N8N_SHARED_SECRET', 32);
  if (n8nSecretError) errors.push(n8nSecretError);

  const n8nSecretStrengthError = validateSecretStrength(
    n8nSharedSecret,
    'N8N_SHARED_SECRET',
    nodeEnv
  );
  if (n8nSecretStrengthError) errors.push(n8nSecretStrengthError);

  // Redis Configuration (SPEC-CF-VE-009:011)
  const redisHost = getOptional('REDIS_HOST', 'localhost');
  const redisPort = parseInt(getOptional('REDIS_PORT', '6379'), 10);
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisDb = parseInt(getOptional('REDIS_DB', '0'), 10);

  const redisErrors = validateRedisConfig(redisHost, redisPort, redisPassword, nodeEnv);
  errors.push(...redisErrors);

  // JWT Configuration (SPEC-CF-VE-012:016)
  const jwtSecret = getRequired('JWT_SECRET');
  const jwtSecretError = validateSecret(jwtSecret, 'JWT_SECRET', 32);
  if (jwtSecretError) errors.push(jwtSecretError);

  const jwtSecretStrengthError = validateSecretStrength(jwtSecret, 'JWT_SECRET', nodeEnv);
  if (jwtSecretStrengthError) errors.push(jwtSecretStrengthError);

  const jwtAccessTokenExpiresIn = getOptional('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m');
  const jwtRefreshTokenExpiresIn = getOptional('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');

  // Platform Security (SPEC-CF-VE-017:019)
  const platformSharedSecret = getRequired('PLATFORM_SHARED_SECRET');
  const platformSecretError = validateSecret(platformSharedSecret, 'PLATFORM_SHARED_SECRET', 32);
  if (platformSecretError) errors.push(platformSecretError);

  // Validate that platform secret matches n8n secret (SPEC-CF-VE-018)
  const secretMatchError = validateSecretsMatch(
    n8nSharedSecret,
    platformSharedSecret,
    'N8N_SHARED_SECRET',
    'PLATFORM_SHARED_SECRET'
  );
  if (secretMatchError) errors.push(secretMatchError);

  // ============================================
  // STEP 3: Validate Optional Variables with Defaults
  // ============================================

  const logLevel = getOptional('LOG_LEVEL', 'info');
  const logLevelError = validateEnum(
    logLevel,
    'LOG_LEVEL',
    ['debug', 'info', 'warn', 'error']
  );
  if (logLevelError) errors.push(logLevelError);

  const systemSchemaTarget = getOptional('SYSTEM_SCHEMA_TARGET', 'n8n');
  const systemSchemaError = validateEnum(
    systemSchemaTarget,
    'SYSTEM_SCHEMA_TARGET',
    ['backend', 'n8n']
  );
  if (systemSchemaError) errors.push(systemSchemaError);

  // Rate Limiting (environment-aware defaults)
  const defaultMaxRequests = nodeEnv === 'production' ? '10' : '100';
  const rateLimitWindowMs = parseInt(getOptional('RATE_LIMIT_WINDOW_MS', '60000'), 10);
  const rateLimitMaxRequests = parseInt(
    getOptional('RATE_LIMIT_MAX_REQUESTS', defaultMaxRequests),
    10
  );
  const rateLimitSkipSuccessful = getOptional('RATE_LIMIT_SKIP_SUCCESSFUL', 'false') === 'true';

  // Brute Force Protection
  const bruteForceMaxAttempts = parseInt(getOptional('BRUTE_FORCE_MAX_ATTEMPTS', '5'), 10);
  if (bruteForceMaxAttempts < 1 || bruteForceMaxAttempts > 100) {
    errors.push({
      field: 'BRUTE_FORCE_MAX_ATTEMPTS',
      message: 'BRUTE_FORCE_MAX_ATTEMPTS must be between 1 and 100',
    });
  }

  const bruteForceLockoutDuration = parseInt(
    getOptional('BRUTE_FORCE_LOCKOUT_DURATION', '900'),
    10
  );
  if (bruteForceLockoutDuration < 60 || bruteForceLockoutDuration > 86400) {
    errors.push({
      field: 'BRUTE_FORCE_LOCKOUT_DURATION',
      message: 'BRUTE_FORCE_LOCKOUT_DURATION must be between 60 and 86400 seconds',
    });
  }

  const bruteForceWindowDuration = parseInt(
    getOptional('BRUTE_FORCE_WINDOW_DURATION', '600'),
    10
  );
  if (bruteForceWindowDuration < 60 || bruteForceWindowDuration > 3600) {
    errors.push({
      field: 'BRUTE_FORCE_WINDOW_DURATION',
      message: 'BRUTE_FORCE_WINDOW_DURATION must be between 60 and 3600 seconds',
    });
  }

  // Performance Settings
  const requestTimeout = parseInt(getOptional('REQUEST_TIMEOUT', '30000'), 10);
  const sseHeartbeatInterval = parseInt(getOptional('SSE_HEARTBEAT_INTERVAL', '30000'), 10);

  // ============================================
  // STEP 4: Display Errors if Any
  // ============================================

  if (errors.length > 0) {
    console.error('\n❌ Environment validation failed:\n');
    errors.forEach(err => {
      console.error(`   - ${err.field}: ${err.message}`);
    });
    console.error('\n📝 Please check your .env file against .env.example');
    console.error('📖 See README-ENV.md for detailed documentation\n');
    process.exit(1);
  }

  // ============================================
  // STEP 5: Return Validated Config
  // ============================================

  return {
    nodeEnv: nodeEnv as 'development' | 'staging' | 'production',
    port,
    frontendUrl,
    backendUrl,
    n8nBaseUrl,
    n8nSharedSecret,
    redisHost,
    redisPort,
    redisPassword,
    redisDb,
    jwtSecret,
    jwtAccessTokenExpiresIn,
    jwtRefreshTokenExpiresIn,
    rateLimitWindowMs,
    rateLimitMaxRequests,
    rateLimitSkipSuccessful,
    bruteForceMaxAttempts,
    bruteForceLockoutDuration,
    bruteForceWindowDuration,
    platformSharedSecret,
    systemSchemaTarget: systemSchemaTarget as 'backend' | 'n8n',
    logLevel: logLevel as 'debug' | 'info' | 'warn' | 'error',
    requestTimeout,
    sseHeartbeatInterval,
  };
}

// Validate and export config
export const config = validateEnv();

// Log startup information (non-sensitive values only)
// SPEC-CF-PS-013: Log configuration summary
console.log('\n✅ Environment configuration loaded successfully:');
console.log(`   - Environment: ${config.nodeEnv}`);
console.log(`   - Configuration profile: .env.${config.nodeEnv}`);
console.log(`   - Port: ${config.port}`);
console.log(`   - Frontend URL: ${config.frontendUrl}`);
console.log(`   - Backend URL: ${config.backendUrl}`);
console.log(`   - n8n URL: ${config.n8nBaseUrl}`);
console.log(`   - Redis: ${config.redisHost}:${config.redisPort}${config.redisPassword ? ' (authenticated)' : ''}`);
console.log(`   - Log Level: ${config.logLevel}`);
console.log(`   - System Schema Target: ${config.systemSchemaTarget}\n`);
 
