/**
 * n8n Proxy Service
 * Forwards requests to n8n Backbone
 * SPEC-A-L-011 to SPEC-A-L-014
 */

import type { JResult } from '../types/jresult.types.js';

// Normalize base URL - remove trailing slashes to avoid double slashes
const N8N_BASE_URL = (process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook').replace(/\/+$/, '');
const N8N_AUTH_SECRET = process.env.N8N_AUTH_SECRET || '';
const REQUEST_TIMEOUT = 5000; // 5 seconds

class N8NProxyService {
  /**
   * Proxy request to n8n workflow
   * @param path - Workflow webhook path (e.g., '/auth/login')
   * @param body - Request body (JSON serializable)
   * @param timeout - Request timeout in ms (default 5000)
   */
  async proxyRequest<T = any>(
    path: string,
    body: any,
    timeout: number = REQUEST_TIMEOUT
  ): Promise<JResult<T>> {
    // Normalize path - ensure it starts with a single slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${N8N_BASE_URL}${normalizedPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(N8N_AUTH_SECRET && { 'X-Auth-Secret': N8N_AUTH_SECRET }),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // n8n returns JResult format
      const result = data as JResult<T>;

      if (!response.ok) {
        return {
          code: response.status,
          message: result.message || 'n8n request failed',
          ...(result.field && { field: result.field }),
          ...(result.errors && { errors: result.errors }),
        };
      }

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          code: 504,
          message: 'n8n request timeout',
        };
      }

      console.error('n8n proxy error:', error);

      return {
        code: 502,
        message: 'Failed to connect to n8n Backbone',
      };
    }
  }

  /**
   * Health check for n8n
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.proxyRequest('/health', {}, 2000);
      return result.code === 200;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const n8nProxyService = new N8NProxyService();
