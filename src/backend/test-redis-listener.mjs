// Test script to subscribe to Redis Pub/Sub and listen for cache-invalidate events
import { createClient } from 'redis';

const client = createClient({
  url: 'redis://localhost:6379',
});

client.on('error', (err) => console.error('[RedisTest] Redis Client Error', err));

await client.connect();
console.log('[RedisTest] Connected to Redis');

const subscriber = client.duplicate();
await subscriber.connect();

console.log('[RedisTest] Subscribing to platform:events channel...');

await subscriber.subscribe('platform:events', (message) => {
  console.log('[RedisTest] ========================================');
  console.log('[RedisTest] Received event from Redis');
  console.log('[RedisTest] ========================================');
  try {
    const event = JSON.parse(message);
    console.log('[RedisTest] Event:', JSON.stringify(event, null, 2));

    if (event.type === 'cache-invalidate') {
      console.log('[RedisTest] ✅ cache-invalidate event received!');
      console.log('[RedisTest]   - oldEpoch:', event.data?.oldEpoch);
      console.log('[RedisTest]   - newEpoch:', event.data?.newEpoch);
      console.log('[RedisTest]   - scope:', event.data?.scope);
      console.log('[RedisTest]   - timestamp:', event.data?.timestamp);
    }
  } catch (error) {
    console.error('[RedisTest] Failed to parse event:', error);
  }
  console.log('[RedisTest] ========================================\n');
});

console.log('[RedisTest] 🎧 Listening for events...');
console.log('[RedisTest] Trigger with: curl -X POST http://localhost:3003/api/cache/invalidate');
console.log('[RedisTest] Press Ctrl+C to exit\n');
