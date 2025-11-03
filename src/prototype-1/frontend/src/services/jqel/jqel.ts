/**
 * JQEL Query Function
 * Core function for executing JQEL queries
 * SPEC-DA-W-* compliance
 */

import { tokenManager } from '../auth/tokenManager';
import { authService } from '../auth/authService';
import type { JQELQuery, JResult } from './types';
import { JQELError } from './jqelError';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const JQEL_ENDPOINT = '/jqel'; // API_BASE already contains /api prefix

class JQELService {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  /**
   * Execute JQEL query
   * Handles authentication and token refresh automatically
   */
  async query<T = any>(queryObject: JQELQuery): Promise<JResult<T>> {
    try {
      return await this.executeQuery<T>(queryObject);
    } catch (error) {
      // If 401, try to refresh token once
      if (error instanceof JQELError && error.isAuthError()) {
        await this.handleTokenRefresh();
        // Retry original request
        return await this.executeQuery<T>(queryObject);
      }

      throw error;
    }
  }

  /**
   * Execute query with current token
   */
  private async executeQuery<T>(queryObject: JQELQuery): Promise<JResult<T>> {
    const token = tokenManager.getAccessToken();

    console.log('🔍 [JQEL] Executing query:', {
      schema: queryObject.schema,
      entity: queryObject.select || queryObject.mutate,
      hasToken: !!token,
      endpoint: `${API_BASE}${JQEL_ENDPOINT}`
    });

    const response = await fetch(`${API_BASE}${JQEL_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(queryObject),
    });

    const data: JResult<T> = await response.json();

    console.log('📦 [JQEL] Response:', {
      success: data.success,
      status: response.status,
      hasData: !!data.data,
    });

    if (!response.ok) {
      console.error('❌ [JQEL] Query failed:', data);
      throw new JQELError(data);
    }

    return data;
  }

  /**
   * Handle token refresh
   * Prevents multiple simultaneous refresh attempts
   */
  private async handleTokenRefresh(): Promise<void> {
    // If already refreshing, wait for it
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performRefresh(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const tokens = await authService.refresh(refreshToken);
      tokenManager.setTokens(tokens);
    } catch (error) {
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw error;
    }
  }
}

// Export singleton instance
export const jqel = new JQELService();
