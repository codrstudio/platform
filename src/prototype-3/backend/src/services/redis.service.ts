import { createClient, type RedisClientType } from 'redis';
import { env, getRedisUrl } from '../config/env.js';

/**
 * Redis Service
 *
 * SPEC-A-S-019, SPEC-A-S-020: Redis for Pub/Sub, Streams, and cache
 * SPEC-AU-SG-004 to SPEC-AU-SG-006: Rate limiting using Redis
 * SPEC-AU-AZ-033 to SPEC-AU-AZ-036: Authorization caching
 */

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const redisUrl = getRedisUrl();
      this.client = createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        console.error('[Redis] Connection error:', err);
      });

      this.client.on('connect', () => {
        console.log('[Redis] Connected successfully');
      });

      this.client.on('ready', () => {
        console.log('[Redis] Ready to accept commands');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        console.log('[Redis] Reconnecting...');
      });

      this.client.on('end', () => {
        console.log('[Redis] Connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Get Redis client instance
   */
  getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Rate Limiting: Increment request count for a key
   *
   * SPEC-AU-SG-004: Rate limiting implementation
   *
   * @param key - Rate limit key (e.g., "rate:login:192.168.1.1")
   * @param limit - Maximum number of requests allowed
   * @param windowSeconds - Time window in seconds
   * @returns Object with { count, remaining, resetTime, blocked }
   */
  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ count: number; remaining: number; resetTime: number; blocked: boolean }> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();

    // Increment counter
    const count = await client.incr(key);

    // Set expiration on first request
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }

    // Get TTL to calculate reset time
    const ttl = await client.ttl(key);
    const resetTime = Date.now() + ttl * 1000;

    const remaining = Math.max(0, limit - count);
    const blocked = count > limit;

    return {
      count,
      remaining,
      resetTime,
      blocked,
    };
  }

  /**
   * Brute Force Protection: Track failed login attempts
   *
   * SPEC-AU-LI-025, SPEC-AU-LI-026: Brute force protection
   * SPEC-AU-SG-006: IP blocking after multiple failures
   *
   * @param ip - IP address
   * @returns Object with { attempts, blockedUntil }
   */
  async trackFailedLogin(ip: string): Promise<{ attempts: number; blockedUntil: number | null }> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const key = `brute:login:${ip}`;
    const blockKey = `brute:block:${ip}`;

    // Check if IP is currently blocked
    const blockExpiry = await client.get(blockKey);
    if (blockExpiry) {
      return {
        attempts: 0,
        blockedUntil: parseInt(blockExpiry, 10),
      };
    }

    // Increment failed attempts counter
    const attempts = await client.incr(key);

    // Set expiration on first attempt (e.g., 15 minutes window)
    if (attempts === 1) {
      await client.expire(key, env.BRUTE_FORCE_WINDOW_SECONDS);
    }

    return {
      attempts,
      blockedUntil: null,
    };
  }

  /**
   * Brute Force Protection: Block IP temporarily
   *
   * SPEC-AU-SG-006: Temporary IP blocking
   *
   * @param ip - IP address to block
   * @param durationSeconds - Block duration in seconds
   */
  async blockIP(ip: string, durationSeconds: number): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const blockKey = `brute:block:${ip}`;
    const blockedUntil = Date.now() + durationSeconds * 1000;

    // Set block with expiration
    await client.setEx(blockKey, durationSeconds, blockedUntil.toString());

    console.log(`[Redis] IP ${ip} blocked for ${durationSeconds} seconds`);
  }

  /**
   * Brute Force Protection: Reset failed login attempts on successful login
   *
   * @param ip - IP address
   */
  async resetFailedLogin(ip: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const key = `brute:login:${ip}`;
    await client.del(key);
  }

  /**
   * Authorization Cache: Store authorization decision
   *
   * SPEC-AU-AZ-033 to SPEC-AU-AZ-036: Authorization caching
   *
   * @param userId - User ID
   * @param permission - Permission string
   * @param authorized - Authorization result
   * @param ttlSeconds - Cache TTL in seconds (default: 5 minutes)
   */
  async cacheAuthorizationDecision(
    userId: string,
    permission: string,
    authorized: boolean,
    ttlSeconds: number = 300
  ): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const key = `authz:${userId}:${permission}`;

    await client.setEx(key, ttlSeconds, authorized ? '1' : '0');
  }

  /**
   * Authorization Cache: Get cached authorization decision
   *
   * SPEC-AU-AZ-033: Authorization caching
   *
   * @param userId - User ID
   * @param permission - Permission string
   * @returns Cached authorization result or null if not cached
   */
  async getCachedAuthorizationDecision(userId: string, permission: string): Promise<boolean | null> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const key = `authz:${userId}:${permission}`;

    const cached = await client.get(key);

    if (cached === null) {
      return null;
    }

    return cached === '1';
  }

  /**
   * Authorization Cache: Invalidate all permissions for a user
   *
   * SPEC-AU-AZ-035: Cache invalidation when permissions change
   *
   * @param userId - User ID
   */
  async invalidateUserAuthorizations(userId: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const pattern = `authz:${userId}:*`;

    // Scan and delete all matching keys
    const keys: string[] = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await client.del(keys);
      console.log(`[Redis] Invalidated ${keys.length} authorization cache entries for user ${userId}`);
    }
  }

  /**
   * Generic cache: Set value with TTL
   *
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttlSeconds - TTL in seconds
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const serialized = JSON.stringify(value);

    if (ttlSeconds !== undefined) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  /**
   * Generic cache: Get value
   *
   * @param key - Cache key
   * @returns Parsed value or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const value = await client.get(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Generic cache: Delete key
   *
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    await client.del(key);
  }

  /**
   * Pub/Sub: Publish message to channel
   *
   * SPEC-A-S-019: Redis Pub/Sub for real-time events
   *
   * @param channel - Channel name
   * @param message - Message to publish (will be JSON stringified)
   */
  async publish(channel: string, message: any): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis is not ready');
    }

    const client = this.getClient();
    const serialized = JSON.stringify(message);
    await client.publish(channel, serialized);
  }
}

// Singleton instance
export const redisService = new RedisService();
