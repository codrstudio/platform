/**
 * Platform Settings Types
 * Types for platform configuration and service health display
 */

export interface PlatformSettings {
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  frontendUrl: string;
  backendUrl: string;
  n8nBaseUrl: string;
  redisHost: string;
  redisPort: number;
  redisDb: number;
  redisAuthenticated: boolean;
  logLevel: string;
  systemSchemaTarget: string;
}

export interface ServiceHealth {
  n8n: boolean;
  redis: boolean;
  backend: boolean;
}

export interface PlatformSettingsResponse {
  settings: PlatformSettings;
  health: ServiceHealth;
  timestamp: string;
}
