/**
 * Environment Configuration Loader
 *
 * Loads environment variables from .env files with environment-specific overrides.
 * This module MUST be imported before any other modules that use process.env.
 *
 * Loading order:
 * 1. Load .env (base configuration)
 * 2. Read NODE_ENV from loaded config
 * 3. Load .env.{NODE_ENV} if it exists (environment-specific overrides)
 *
 * Example:
 * - .env (base: common configs for all environments)
 * - .env.development (dev-specific: local URLs, debug settings)
 * - .env.production (prod-specific: production URLs, strict settings)
 * - .env.staging (staging-specific)
 * - .env.test (test-specific)
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve path to backend root (where .env files are located)
const backendRoot = resolve(__dirname, '../..');

/**
 * Load environment variables with environment-specific overrides
 */
function loadEnv(): void {
  // Step 1: Load base .env file
  const baseEnvPath = resolve(backendRoot, '.env');

  if (existsSync(baseEnvPath)) {
    config({ path: baseEnvPath });
    console.log('✅ Loaded base configuration from .env');
  } else {
    console.warn('⚠️  No .env file found. Using system environment variables only.');
  }

  // Step 2: Read NODE_ENV (now available from base .env or system)
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Step 3: Load environment-specific .env file (overrides base)
  const envSpecificPath = resolve(backendRoot, `.env.${nodeEnv}`);

  if (existsSync(envSpecificPath)) {
    // override: true allows environment-specific vars to override base vars
    config({ path: envSpecificPath, override: true });
    console.log(`✅ Loaded ${nodeEnv} overrides from .env.${nodeEnv}`);
  } else {
    console.log(`ℹ️  No .env.${nodeEnv} file found. Using base configuration only.`);
  }

  // Log final environment
  console.log(`🌍 Environment: ${nodeEnv}`);
}

// Execute immediately when this module is imported
loadEnv();

// Export for programmatic access if needed
export { loadEnv };
