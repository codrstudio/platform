/**
 * Health Client
 *
 * HTTP client for health check endpoints.
 * Provides connectivity status for platform services (n8n, Redis, Backend).
 *
 * SPEC References:
 * - SPEC-MS-HE-001:009: Health check endpoints for infrastructure services
 * - SPEC-MS-PS-014:016: Platform Settings displays health indicators
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  latency?: number;
  error?: string;
  timestamp: string;
  uptime?: number;
  version?: string;
  environment?: string;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  nodeVersion?: string;
}

export class HealthClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check health of a specific service
   *
   * @param service - Service to check ('n8n', 'redis', 'backend')
   * @returns Health status information
   * @throws Error if request fails
   */
  async check(service: 'n8n' | 'redis' | 'backend'): Promise<HealthStatus> {
    const url = `${this.baseUrl}/api/health/${service}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse response body
      let data: HealthStatus;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error(`Invalid JSON response from ${service} health check`);
      }

      // Even if response is not ok, return the data (it may contain error details)
      return data;
    } catch (error: any) {
      // Network errors or fetch failures
      if (error.message?.includes('fetch failed') || error.name === 'TypeError') {
        return {
          status: 'down',
          error: `Cannot reach ${service} health endpoint`,
          timestamp: new Date().toISOString(),
        };
      }

      // Re-throw other errors
      throw error;
    }
  }
}

// Export singleton instance
export const healthClient = new HealthClient();
