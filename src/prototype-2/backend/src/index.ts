// Import environment configuration FIRST (loads dotenv)
import { config } from './config/env.js';
import { configInitializer } from './config/configInitializer.service.js';
import { logger } from './services/logger.service.js';
import app from './app.js';
import { redisService } from './services/redis.service.js';
import http from 'http';

/**
 * Initialize application
 * Ensures configuration files exist before starting server
 */
async function initializeApp(): Promise<void> {
  // Initialize configuration files (portals, modules, instances)
  await configInitializer.initialize();
}

/**
 * Create HTTP server with configured Express app
 */
const server = http.createServer(app);

/**
 * Start server and listen on configured port
 */
async function startServer(): Promise<void> {
  // Initialize configuration before starting server
  await initializeApp();

  server.listen(config.port, () => {
    logger.info('Backend server started successfully', {
      category: 'startup',
      nodeEnv: config.nodeEnv,
      port: config.port,
      frontendUrl: config.frontendUrl,
      n8nBaseUrl: config.n8nBaseUrl,
    });

    // Still show startup banner to console for visibility
    console.log('\n🚀 Backend server started successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Environment:  ${config.nodeEnv}`);
    console.log(`🔗 Port:         ${config.port}`);
    console.log(`🌐 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🎨 Frontend:     ${config.frontendUrl}`);
    console.log(`⚡ n8n Backbone: ${config.n8nBaseUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server', {
    category: 'startup',
    error: { message: error.message, stack: error.stack },
  });
  process.exit(1);
});

/**
 * Graceful shutdown handler
 * Handles SIGTERM and SIGINT signals
 */
const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}, initiating graceful shutdown`, {
    category: 'shutdown',
    signal,
  });

  // Stop accepting new connections
  server.close(async () => {
    logger.info('Server closed successfully', { category: 'shutdown' });

    // Close Redis connection
    try {
      await redisService.disconnect();
      logger.info('Redis connection closed', { category: 'shutdown' });
    } catch (error: any) {
      logger.error('Error closing Redis connection', {
        category: 'shutdown',
        error: { message: error.message, stack: error.stack },
      });
    }

    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout (10s)', {
      category: 'shutdown',
      signal,
    });
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle unhandled promise rejections
 * Log error and exit in production
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    category: 'unhandled-rejection',
    error: {
      message: String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    },
    promise: String(promise),
  });

  // In production, exit on unhandled rejection
  if (config.nodeEnv === 'production') {
    logger.error('Exiting process due to unhandled rejection (production mode)', {
      category: 'unhandled-rejection',
    });
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

/**
 * Handle uncaught exceptions
 * Always exit (application state is unstable)
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception - Exiting process (unstable state)', {
    category: 'uncaught-exception',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle port already in use
 */
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use`, {
      category: 'server-error',
      port: config.port,
      error: {
        code: error.code,
        message: 'Please check if another instance is running or change PORT in .env file',
      },
    });
    process.exit(1);
  } else {
    logger.error('Server error', {
      category: 'server-error',
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
    });
    process.exit(1);
  }
});
