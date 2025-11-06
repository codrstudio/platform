/**
 * Health Client
 *
 * Service for checking platform health status.
 *
 * SPEC-module-setup.md (SPEC-MS-PS-010 to SPEC-MS-PS-016)
 * SPEC-MS-HE-* sections about health monitoring
 */

/**
 * Service status types
 */
export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Individual service health
 */
export interface ServiceHealth {
  status: ServiceStatus;
  message: string;
  responseTime?: number;
  lastCheck: string;
}

/**
 * Basic health response
 */
export interface BasicHealth {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

/**
 * Detailed health response
 */
export interface DetailedHealth {
  status: ServiceStatus;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    backend: ServiceHealth;
    redis: ServiceHealth;
    n8n: ServiceHealth;
  };
  version?: string;
}

/**
 * Get the API URL from environment
 */
function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
}

/**
 * Fetch basic health check
 *
 * SPEC-MS-PS-013: Backend health indicator
 *
 * Returns basic health status to confirm backend is running.
 *
 * @returns Promise with basic health data
 * @throws Error if backend is unreachable
 */
export async function fetchBasicHealth(): Promise<BasicHealth> {
  try {
    const response = await fetch(`${getApiUrl()}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No auth required for health checks
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Backend unreachable: ${error.message}`);
    }
    throw new Error('Backend unreachable: Unknown error');
  }
}

/**
 * Fetch detailed health check
 *
 * SPEC-MS-PS-010: System health indicators
 * SPEC-MS-PS-011: n8n connectivity check
 * SPEC-MS-PS-012: Redis connectivity check
 * SPEC-MS-PS-014: Health checks via Backend requests
 * SPEC-MS-PS-016: Last check timestamp
 *
 * Returns detailed health with all service checks.
 *
 * @returns Promise with detailed health data
 * @throws Error if backend is unreachable or returns error
 */
export async function fetchDetailedHealth(): Promise<DetailedHealth> {
  try {
    const response = await fetch(`${getApiUrl()}/health/detailed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No auth required for health checks
    });

    if (!response.ok) {
      throw new Error(`Detailed health check failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Backend unreachable: ${error.message}`);
    }
    throw new Error('Backend unreachable: Unknown error');
  }
}

/**
 * Health client object with methods
 */
export const healthClient = {
  /**
   * Fetch basic health
   */
  fetchBasic: fetchBasicHealth,

  /**
   * Fetch detailed health
   */
  fetchDetailed: fetchDetailedHealth,
};
