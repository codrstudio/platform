// n8n Proxy Service
// Based on SPEC-configuration.md (SPEC-CF-N8-*)

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { env } from '../config/env.js';

/**
 * n8n Proxy Service
 *
 * Provides a secure proxy to n8n workflows
 * SPEC-CF-AM-004: Includes X-Platform-Key header in all requests
 * SPEC-CF-AM-005: Uses N8N_SHARED_SECRET for authentication
 */
class N8nProxyService {
  private client: AxiosInstance;
  private readonly sharedSecret: string;

  constructor() {
    this.sharedSecret = env.N8N_SHARED_SECRET;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: env.N8N_BASE_URL,
      timeout: 30000, // SPEC-CF-VEO-002
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include shared secret
    this.client.interceptors.request.use(
      (config) => {
        // SPEC-CF-AM-004: Add X-Platform-Key header
        config.headers['X-Platform-Key'] = this.sharedSecret;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a POST request to n8n
   */
  async post<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path, data, config);
  }

  /**
   * Make a GET request to n8n
   */
  async get<T = any>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path, config);
  }

  /**
   * Make a PUT request to n8n
   */
  async put<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(path, data, config);
  }

  /**
   * Make a DELETE request to n8n
   */
  async delete<T = any>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(path, config);
  }

  /**
   * Check n8n health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get('/webhook/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const n8nProxy = new N8nProxyService();
