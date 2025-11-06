import { createApp } from './app.js';
import { env } from './config/env.js';
import { redisService } from './services/redis.service.js';
import { sseService } from './services/sse.service.js';
import { configWatcher } from './services/configWatcher.js';

/**
 * Start the Express server
 * SPEC-A-S-014 to SPEC-A-S-016: Backend using Node.js + Express + TypeScript
 */

const app = createApp();

// Initialize Redis connection
// SPEC-A-S-019, SPEC-A-S-020: Redis for Pub/Sub, Streams, and cache
redisService.connect().catch((error) => {
  console.error('Failed to connect to Redis:', error);
  console.error('Rate limiting and brute force protection will be disabled');
});

// Initialize SSE service
// SPEC-EV-SSE-001: Frontend connects via SSE for real-time events
sseService.initialize().catch((error) => {
  console.error('Failed to initialize SSE service:', error);
  console.error('Real-time events will be disabled');
});

// Start configuration file watcher
// SPEC-CF-AS-012, SPEC-CF-AS-013: Hot reload of configuration files
configWatcher.start();

const server = app.listen(env.PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Codr Platform Backend - Prototype 3`);
  console.log('='.repeat(50));
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Server: http://localhost:${env.PORT}`);
  console.log(`Health: http://localhost:${env.PORT}/health`);
  console.log(`Frontend: ${env.FRONTEND_URL}`);
  console.log(`n8n Backbone: ${env.N8N_WEBHOOK_BASE_URL}`);
  console.log(`Redis: ${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`);
  console.log('='.repeat(50));
});

/**
 * Graceful shutdown
 */
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close SSE connections
  await sseService.shutdown();

  // Close Redis connection
  await redisService.disconnect();

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Unhandled errors
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});
