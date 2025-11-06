import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { env } from '../config/env.js';

/**
 * SPEC-AU-AR-001: Authentication is Backbone (n8n) responsibility
 * SPEC-AU-AR-002: Backend acts as proxy for auth routes
 * SPEC-CF-AM-004: Backend must include X-Platform-Key when calling n8n
 * SPEC-CF-AM-005: Value must come from N8N_SHARED_SECRET
 *
 * Service for proxying requests to n8n workflows
 */

class N8nProxyService {
  private client: AxiosInstance;

  constructor() {
    // SPEC-CF-AM-004: Backend must include X-Platform-Key when calling n8n
    // SPEC-CF-AM-005: Value must come from N8N_SHARED_SECRET
    const sharedSecret = env.N8N_SHARED_SECRET;

    if (!sharedSecret) {
      console.error('[n8n Proxy] N8N_SHARED_SECRET is not configured');
      throw new Error('N8N_SHARED_SECRET is required for n8n communication');
    }

    this.client = axios.create({
      baseURL: env.N8N_WEBHOOK_BASE_URL,
      timeout: 30000, // 30 seconds (SPEC-CF-VEO-002)
      headers: {
        'Content-Type': 'application/json',
        'X-Platform-Key': sharedSecret, // SPEC-CF-AM-001, SPEC-CF-AM-004
        ...(env.N8N_API_KEY && { 'X-N8N-API-KEY': env.N8N_API_KEY }),
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        if (env.LOG_LEVEL === 'debug') {
          console.log(`[n8n Proxy] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        console.error('[n8n Proxy] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        if (env.LOG_LEVEL === 'debug') {
          console.log(`[n8n Proxy] Response ${response.status} from ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`[n8n Proxy] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          console.error('[n8n Proxy] No response received:', error.message);
        } else {
          console.error('[n8n Proxy] Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Proxy POST request to n8n webhook
   */
  async post<T = any>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data, config);
      return response.data;
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response) {
        throw new Error(
          `n8n error (${error.response.status}): ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        throw new Error('n8n connection failed: No response received');
      } else {
        throw new Error(`n8n request failed: ${error.message}`);
      }
    }
  }

  /**
   * Proxy GET request to n8n webhook
   */
  async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(path, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `n8n error (${error.response.status}): ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        throw new Error('n8n connection failed: No response received');
      } else {
        throw new Error(`n8n request failed: ${error.message}`);
      }
    }
  }

  /**
   * Check n8n health/connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try to reach n8n base URL
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const n8nProxy = new N8nProxyService();
