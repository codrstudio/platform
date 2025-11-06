import Redis, { type RedisOptions, type ChainableCommander } from 'ioredis';
import { config } from '../config/env.js';

/**
 * RedisService
 *
 * Wrapper around ioredis providing connection management and common operations.
 * Implements singleton pattern to ensure single Redis connection pool.
 *
 * Features:
 * - Lazy connection initialization
 * - Automatic retry with exponential backoff
 * - Connection pooling
 * - Transaction support via multi/exec
 * - Set operations for token family tracking
 */
export class RedisService {
  private client: Redis | null = null;
  private connecting: Promise<void> | null = null;

  /**
   * Get Redis configuration from environment
   */
  private getRedisConfig(): RedisOptions {
    return {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      db: config.redisDb,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };
  }

  /**
   * Connect to Redis (lazy initialization)
   *
   * Establishes connection to Redis server with automatic retry.
   * Safe to call multiple times - subsequent calls wait for initial connection.
   *
   * @throws Error if connection fails after retries
   */
  async connect(): Promise<void> {
    if (this.client) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      try {
        this.client = new Redis(this.getRedisConfig());

        this.client.on('error', (err) => {
          console.error('❌ Redis Client Error:', err);
        });

        this.client.on('connect', () => {
          console.log('✅ Redis connected');
        });

        this.client.on('ready', () => {
          console.log('✅ Redis ready');
        });

        this.client.on('close', () => {
          console.log('⚠️ Redis connection closed');
        });

        // Test connection
        await this.client.ping();
        this.connecting = null;
      } catch (error) {
        this.connecting = null;
        throw error;
      }
    })();

    return this.connecting;
  }

  /**
   * Get value by key
   *
   * @param key - Redis key
   * @returns Value or null if not found
   */
  async get(key: string): Promise<string | null> {
    await this.connect();
    return this.client!.get(key);
  }

  /**
   * Set value with TTL (in seconds)
   *
   * Uses SETEX to atomically set value and expiration.
   * This prevents race conditions between SET and EXPIRE.
   *
   * @param key - Redis key
   * @param value - Value to store
   * @param ttlSeconds - Time to live in seconds
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.connect();
    await this.client!.setex(key, ttlSeconds, value);
  }

  /**
   * Delete key
   *
   * @param key - Redis key to delete
   */
  async delete(key: string): Promise<void> {
    await this.connect();
    await this.client!.del(key);
  }

  /**
   * Find keys by pattern
   *
   * WARNING: Use with caution in production - KEYS command blocks Redis.
   * For production, consider using SCAN instead.
   *
   * @param pattern - Pattern to match (e.g., "user_tokens:*")
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return this.client!.keys(pattern);
  }

  /**
   * Add value(s) to set
   *
   * @param key - Set key
   * @param members - Member(s) to add
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.connect();
    await this.client!.sadd(key, ...members);
  }

  /**
   * Get all members of set
   *
   * @param key - Set key
   * @returns Array of set members
   */
  async smembers(key: string): Promise<string[]> {
    await this.connect();
    return this.client!.smembers(key);
  }

  /**
   * Remove member(s) from set
   *
   * @param key - Set key
   * @param members - Member(s) to remove
   */
  async srem(key: string, ...members: string[]): Promise<void> {
    await this.connect();
    await this.client!.srem(key, ...members);
  }

  /**
   * Set expiration on key
   *
   * @param key - Redis key
   * @param ttlSeconds - Time to live in seconds
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.connect();
    await this.client!.expire(key, ttlSeconds);
  }

  /**
   * Get TTL of key
   *
   * @param key - Redis key
   * @returns TTL in seconds, or -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    await this.connect();
    return this.client!.ttl(key);
  }

  /**
   * Create transaction pipeline
   *
   * Use for atomic operations across multiple commands.
   * Call exec() on the returned pipeline to execute.
   *
   * @returns ChainableCommander for transaction
   * @throws Error if not connected
   *
   * @example
   * const pipeline = redisService.multi();
   * pipeline.set('key1', 'value1');
   * pipeline.set('key2', 'value2');
   * await pipeline.exec();
   */
  multi(): ChainableCommander {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client.multi();
  }

  /**
   * Get direct access to Redis client
   *
   * Use with caution - prefer using service methods.
   * Exposed for advanced operations like TTL checking.
   *
   * @returns Redis client instance
   * @throws Error if not connected
   */
  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Disconnect from Redis
   *
   * Gracefully closes the connection.
   * Call before application shutdown.
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
