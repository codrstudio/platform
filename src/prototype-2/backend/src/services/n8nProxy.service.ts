// backend/src/services/n8nProxy.service.ts
import { config } from '../config/env.js';
import type { LoginCredentials, N8nUserData, N8nLoginResponse, N8nAuthorizeResponse } from '../types/auth.types.js';

/**
 * N8nProxyService
 *
 * HTTP proxy service for communicating with n8n Backbone workflows.
 * Handles authentication, timeout, and error handling for n8n requests.
 *
 * Features:
 * - Mutual authentication via X-Platform-Key header
 * - Configurable timeout with AbortController
 * - Structured error handling for network and HTTP errors
 * - Type-safe workflow method wrappers
 *
 * SPEC References:
 * - SPEC-AU-AR-002: Backend acts as proxy for authentication routes
 * - SPEC-AU-LI-007:011: Backend validates presence, Backbone validates credentials
 */
export class N8nProxyService {
  private readonly baseUrl: string;
  private readonly platformKey: string;
  private readonly defaultTimeout: number = 10000; // 10 seconds

  constructor() {
    this.baseUrl = config.n8nBaseUrl;
    this.platformKey = config.platformSharedSecret;
  }

  /**
   * Call n8n auth-login workflow
   *
   * SPEC-AU-LI-007:011: Backend proxies credentials to n8n for validation
   *
   * @param credentials - Username, password, and optional realm/schema
   * @returns User data from n8n
   * @throws Error if n8n is unreachable, times out, or returns error
   */
  async login(credentials: LoginCredentials): Promise<N8nUserData> {
    const response = await this.callWorkflow<N8nLoginResponse>(
      '/webhook/auth/login',
      credentials
    );

    return response.data.user;
  }

  /**
   * Call n8n authorize workflow
   *
   * SPEC-AU-AZ-016:017: Backend proxies permission check to Backbone
   *
   * @param payload - Authorization payload (token, schema, permission)
   * @returns Authorization decision from n8n
   * @throws Error if n8n is unreachable, times out, or returns error
   */
  async authorize(payload: {
    access_token: string;
    schema: string;
    permission: string;
  }): Promise<N8nAuthorizeResponse> {
    const response = await this.callWorkflow<N8nAuthorizeResponse>(
      '/webhook/api/1/auth/authorize',
      payload
    );

    return response;
  }

  /**
   * Generic method to call n8n webhook
   *
   * Handles HTTP communication, authentication, timeout, and error handling.
   *
   * @param path - Webhook path relative to baseUrl (e.g., '/webhook/auth/login')
   * @param data - Request payload
   * @param options - Optional configuration (timeout)
   * @returns Parsed JSON response
   * @throws Error for network failures, timeouts, or HTTP errors
   */
  private async callWorkflow<T>(
    path: string,
    data: any,
    options?: { timeout?: number }
  ): Promise<T> {
    const timeout = options?.timeout || this.defaultTimeout;
    const url = `${this.baseUrl}${path}`;

    // Setup timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Make HTTP request to n8n
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Key': this.platformKey,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      // Parse response body
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (error) {
        throw new Error(`n8n returned invalid JSON: ${error}`);
      }

      // Check HTTP status
      if (!response.ok) {
        // Extract error message from n8n response
        const errorMessage = responseData?.message || responseData?.error || 'Unknown error';

        // Map HTTP status to error type
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Invalid credentials: ${errorMessage}`);
        }

        if (response.status >= 500) {
          throw new Error(`n8n server error: ${errorMessage}`);
        }

        throw new Error(`n8n error (${response.status}): ${errorMessage}`);
      }

      return responseData as T;
    } catch (error: any) {
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new Error('n8n request timeout');
      }

      // Handle network errors
      if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
        throw new Error('n8n unreachable');
      }

      // Re-throw other errors (already processed or unexpected)
      throw error;
    } finally {
      // Always clear timeout
      clearTimeout(timeoutId);
    }
  }
}

// Export singleton instance
export const n8nProxyService = new N8nProxyService();
