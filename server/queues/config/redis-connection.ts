import { Redis } from 'ioredis';
import { serverLogger } from '@server/lib/configs/logger';
import { HTTPException } from 'hono/http-exception';

const redisPassword = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST;
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

// Add more detailed logging for connection details (remove in production)
serverLogger.info('Redis Connection Details:', {
  host: redisHost,
  port: redisPort,
  // Don't log the full password
  hasPassword: !!redisPassword
});

if (!redisPassword || !redisHost || !redisPort) {
  throw new HTTPException(400, {
    message: 'Redis connection details are not set',
  });
}

const redisConnection = new Redis({
  password: redisPassword,
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    serverLogger.info(`Retrying Redis connection in ${delay}ms...`);
    return delay;
  },
  connectTimeout: 10000, // 10 seconds
  enableReadyCheck: true,
});

redisConnection.on('error', (err) => serverLogger.error('Redis Connection Error:', err));

redisConnection.on('connecting', () => serverLogger.info('Connecting to Redis...'));

redisConnection.on('connect', () => serverLogger.info('Connected to Redis!'));

redisConnection.on('reconnecting', () => serverLogger.info('Reconnecting to Redis...'));

redisConnection.on('ready', () => serverLogger.info('Redis client ready!'));

export default redisConnection;