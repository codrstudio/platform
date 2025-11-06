/**
 * Health Check Service
 *
 * Provides health check functions for platform services:
 * - n8n (Backbone)
 * - Redis (Infrastructure)
 * - Backend (Self-check - always true if responding)
 *
 * Based on Task 2.2.6 plan
 */

import { config } from '../config/env.js';
import { redisService } from './redis.service.js';

/**
 * Check n8n service health
 * Attempts HTTP GET to n8n base URL with 5 second timeout
 *
 * @returns true if n8n is reachable and responding, false otherwise
 */
export async function checkN8nHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(config.n8nBaseUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Any 2xx or 3xx response indicates n8n is alive
    // Even 404 is OK - it means n8n is responding
    return response.status < 500;
  } catch (error) {
    console.error('[HealthCheck] n8n health check failed:', error);
    return false;
  }
}

/**
 * Check Redis service health
 * Attempts PING command with timeout
 *
 * @returns true if Redis responds to PING, false otherwise
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = await redisService.getClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('[HealthCheck] Redis health check failed:', error);
    return false;
  }
}

/**
 * Check Backend service health
 * Always returns true - if this function is called, backend is running
 *
 * @returns true
 */
export function checkBackendHealth(): boolean {
  return true;
}
