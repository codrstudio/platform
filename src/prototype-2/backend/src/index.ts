// Import environment configuration FIRST (loads dotenv)
import { config } from './config/env.js';
import app from './app.js';
import { redisService } from './services/redis.service.js';
import http from 'http';

/**
 * Create HTTP server with configured Express app
 */
const server = http.createServer(app);

/**
 * Start server and listen on configured port
 */
server.listen(config.port, () => {
  console.log('\n🚀 Backend server started successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Environment:  ${config.nodeEnv}`);
  console.log(`🔗 Port:         ${config.port}`);
  console.log(`🌐 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🎨 Frontend:     ${config.frontendUrl}`);
  console.log(`⚡ n8n Backbone: ${config.n8nBaseUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

/**
 * Graceful shutdown handler
 * Handles SIGTERM and SIGINT signals
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}, initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ Server closed successfully');

    // Close Redis connection
    try {
      await redisService.disconnect();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }

    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout (10s)');
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
  console.error('\n❌ Unhandled Promise Rejection:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);

  // In production, exit on unhandled rejection
  if (config.nodeEnv === 'production') {
    console.error('   Exiting process (production mode)...\n');
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

/**
 * Handle uncaught exceptions
 * Always exit (application state is unstable)
 */
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:');
  console.error('   Error:', error);
  console.error('   Stack:', error.stack);
  console.error('   Exiting process (unstable state)...\n');
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle port already in use
 */
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${config.port} is already in use`);
    console.error('   Please check if another instance is running');
    console.error('   Or change PORT in .env file\n');
    process.exit(1);
  } else {
    console.error('\n❌ Server error:', error);
    process.exit(1);
  }
});
