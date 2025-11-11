// Fetch Client with Interceptors
// Based on PLAN_AUTH.md Phase 2.2 - Replace axios with fetch
// Implements automatic token injection and refresh on 401

import { authService } from './auth.service';

/**
 * Request configuration
 */
export interface FetchConfig extends RequestInit {
  skipAuth?: boolean; // Skip automatic Authorization header
  skipRefresh?: boolean; // Skip automatic token refresh on 401
}

/**
 * Response wrapper
 */
export interface FetchResponse<T = unknown> extends Response {
  data?: T;
}

/**
 * Fetch client with interceptors
 * Similar to axios but using native fetch API
 */
class FetchClient {
  private refreshing = false;
  private refreshQueue: Array<() => void> = [];

  /**
   * Execute fetch request with automatic token injection
   *
   * @param url - Request URL
   * @param config - Fetch configuration
   * @returns Response with data
   */
  async request<T = unknown>(
    url: string,
    config: FetchConfig = {}
  ): Promise<FetchResponse<T>> {
    // Prepare headers
    const headers = new Headers(config.headers);

    // Add Authorization header automatically (unless skipAuth)
    if (!config.skipAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add credentials: 'include' by default (for cookies)
    const requestConfig: RequestInit = {
      ...config,
      headers,
      credentials: config.credentials || 'include',
    };

    try {
      const response = await fetch(url, requestConfig);

      // Parse JSON if Content-Type is application/json
      const contentType = response.headers.get('Content-Type');
      let data: T | undefined;

      if (contentType?.includes('application/json')) {
        data = await response.clone().json();
      }

      // Handle 401 - Try to refresh token and retry
      if (response.status === 401 && !config.skipRefresh) {
        const retried = await this.handleUnauthorized(url, config);
        if (retried) {
          return retried as FetchResponse<T>;
        }
      }

      // Return response with data
      const fetchResponse = response as FetchResponse<T>;
      fetchResponse.data = data;

      return fetchResponse;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  /**
   * Handle 401 Unauthorized - Refresh token and retry
   *
   * @param url - Original request URL
   * @param config - Original request config
   * @returns Retried response or null if refresh failed
   */
  private async handleUnauthorized(
    url: string,
    config: FetchConfig
  ): Promise<FetchResponse | null> {
    // If already refreshing, queue this request
    if (this.refreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(() => {
          this.request(url, { ...config, skipRefresh: true })
            .then(resolve)
            .catch(() => resolve(null));
        });
      });
    }

    // Start refresh process
    this.refreshing = true;

    try {
      // Try to refresh token
      const refreshed = await authService.refresh();

      if (refreshed) {
        // Refresh succeeded - process queued requests
        this.refreshQueue.forEach((callback) => callback());
        this.refreshQueue = [];

        // Retry original request with new token
        return await this.request(url, { ...config, skipRefresh: true });
      }

      // Refresh failed - clear queue
      this.refreshQueue = [];
      return null;
    } finally {
      this.refreshing = false;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: FetchConfig): Promise<FetchResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: FetchConfig
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: FetchConfig
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: FetchConfig
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config?: FetchConfig
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

// Singleton instance
export const fetchClient = new FetchClient();

// Export as default for convenience
export default fetchClient;
